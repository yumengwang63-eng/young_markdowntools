import { unzipSync } from 'fflate';

const ENTITY: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function decodeXml(value: string) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (all, entity) => {
    if (entity[0] === '#') {
      const code = entity[1] === 'x' || entity[1] === 'X' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : all;
    }
    return ENTITY[entity.toLowerCase()] ?? all;
  });
}

function columnIndex(cell: string) {
  const letters = cell.replace(/[^A-Z]/gi, '').toUpperCase();
  let index = 0;
  for (const char of letters) index = index * 26 + char.charCodeAt(0) - 64;
  return index - 1;
}

function textNodes(xml: string, pattern: RegExp) {
  return [...xml.matchAll(pattern)].map(match => decodeXml(match[1] ?? ''));
}

function sharedStrings(xml: string) {
  return [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map(item => textNodes(item[1], /<t\b[^>]*>([\s\S]*?)<\/t>/g).join(''));
}

function sheetRows(xml: string, strings: string[]) {
  const rows: string[][] = [];
  for (const row of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells: string[] = [];
    for (const cell of row[1].matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const ref = cell[1].match(/\br="([A-Z]+)\d+"/i)?.[1] ?? '';
      const index = ref ? columnIndex(ref) : cells.length;
      const type = cell[1].match(/\bt="([^"]+)"/)?.[1] ?? '';
      const value = cell[2].match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1] ?? '';
      const inline = textNodes(cell[2], /<t\b[^>]*>([\s\S]*?)<\/t>/g).join('');
      let text = inline;
      if (type === 's') text = strings[Number(value)] ?? '';
      else if (type !== 'inlineStr') text = decodeXml(value);
      cells[index] = text;
    }
    rows.push(Array.from({ length: Math.max(cells.length, 0) }, (_, index) => cells[index] ?? ''));
  }
  return rows.filter(row => row.some(cell => cell !== ''));
}

function targetPath(base: string, target: string) {
  const parts = base.split('/').slice(0, -1);
  for (const part of target.split('/')) {
    if (part === '..') parts.pop();
    else if (part && part !== '.') parts.push(part);
  }
  return parts.join('/');
}

export function workbookToTables(bytes: Uint8Array) {
  if (bytes.length > 20 * 1024 * 1024) throw Error('Please choose a file smaller than 20 MB.');
  if (bytes[0] === 0xD0 && bytes[1] === 0xCF) return [{ name: 'Workbook', rows: readBiffWorkbook(bytes) }];
  let files: Record<string, Uint8Array>;
  try { files = unzipSync(bytes); } catch { throw Error('This Excel file could not be opened. Save the workbook as .xlsx and try again.'); }
  const read = (name: string) => new TextDecoder().decode(files[name] ?? new Uint8Array());
  const workbook = read('xl/workbook.xml');
  const relations = read('xl/_rels/workbook.xml.rels');
  const relation = new Map([...relations.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)].map(item => [item[1], item[2]]));
  const strings = sharedStrings(read('xl/sharedStrings.xml'));
  const sheets = [...workbook.matchAll(/<sheet\b[^>]*name="([^"]*)"[^>]*r:id="([^"]+)"/g)];
  if (!sheets.length) throw Error('No worksheets were found in this workbook.');
  return sheets.map(sheet => {
    const target = relation.get(sheet[2]);
    if (!target) throw Error('A worksheet link is missing from the workbook.');
    return { name: decodeXml(sheet[1]), rows: sheetRows(read(targetPath('xl/workbook.xml', target)), strings) };
  });
}

export function rowsToMarkdown(rows: string[][], header = true) {
  const width = Math.max(0, ...rows.map(row => row.length));
  const normalized = rows.map(row => Array.from({ length: width }, (_, index) => (row[index] ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>')));
  if (!normalized.length || !width) return '';
  const body = header ? normalized.slice(1) : normalized;
  const head = header ? normalized[0] : Array(width).fill('');
  return [head, Array(width).fill('---'), ...body].map(row => '| ' + row.join(' | ') + ' |').join('\n');
}

export function excelMarkdown(bytes: Uint8Array, header = true) {
  return workbookToTables(bytes).map(sheet => (sheet.name ? `## ${sheet.name}\n\n` : '') + rowsToMarkdown(sheet.rows, header)).filter(Boolean).join('\n\n');
}

const BIFF_SST = 0x00FC;
const BIFF_LABELSST = 0x00FD;
const BIFF_NUMBER = 0x0203;
const BIFF_RK = 0x027E;
const BIFF_CONTINUE = 0x003C;

function readChain(view: DataView, fat: number[], start: number, size: number, sectorSize: number) {
  const out = new Uint8Array(size);
  let sector = start;
  let written = 0;
  const seen = new Set<number>();
  while (sector < 0xFFFFFFFE && written < size) {
    if (seen.has(sector)) throw Error('The Excel file has a circular sector chain.');
    seen.add(sector);
    const offset = (sector + 1) * sectorSize;
    const take = Math.min(sectorSize, size - written);
    out.set(new Uint8Array(view.buffer, view.byteOffset + offset, take), written);
    written += take;
    sector = fat[sector];
  }
  return out;
}

function readBiffWorkbook(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, true) !== 0xE011CFD0 || view.getUint32(4, true) !== 0xE11AB1A1) throw Error('This is not a readable Excel .xls workbook.');
  const sectorSize = 1 << view.getUint16(0x1E, true);
  const fatSectorCount = view.getUint32(0x2C, true);
  const directoryStart = view.getUint32(0x30, true);
  const fatSectors: number[] = [];
  for (let index = 0; index < Math.min(fatSectorCount, 109); index++) fatSectors.push(view.getUint32(0x4C + index * 4, true));
  const fat: number[] = [];
  for (const sector of fatSectors) {
    const offset = (sector + 1) * sectorSize;
    for (let cursor = 0; cursor < sectorSize; cursor += 4) fat.push(view.getUint32(offset + cursor, true));
  }
  const directory = readChain(view, fat, directoryStart, sectorSize * 8, sectorSize);
  const directoryView = new DataView(directory.buffer);
  let stream: Uint8Array | null = null;
  for (let offset = 0; offset + 128 <= directory.length; offset += 128) {
    const length = directoryView.getUint16(offset + 64, true);
    const name = new TextDecoder('utf-16le').decode(directory.subarray(offset, offset + Math.max(0, length - 2)));
    if (name !== 'Workbook' && name !== 'Book') continue;
    const start = directoryView.getUint32(offset + 116, true);
    const size = directoryView.getUint32(offset + 120, true);
    stream = readChain(view, fat, start, size, sectorSize);
  }
  if (!stream) throw Error('The .xls file does not contain a worksheet stream. Save it as .xlsx and import that file.');
  return parseBiff(stream);
}

export function parseBiff(stream: Uint8Array) {
  const records: { type: number; data: Uint8Array }[] = [];
  const view = new DataView(stream.buffer, stream.byteOffset, stream.byteLength);
  for (let offset = 0; offset + 4 <= stream.length;) {
    const type = view.getUint16(offset, true);
    const length = view.getUint16(offset + 2, true);
    offset += 4;
    records.push({ type, data: stream.subarray(offset, offset + length) });
    offset += length;
  }
  const strings: string[] = [];
  for (let index = 0; index < records.length; index++) {
    if (records[index].type !== BIFF_SST) continue;
    const parts = [records[index].data];
    while (records[index + 1]?.type === BIFF_CONTINUE) parts.push(records[++index].data);
    strings.push(...readSst(parts));
  }
  const rows: string[][] = [];
  const put = (row: number, column: number, value: string) => {
    rows[row] ??= [];
    rows[row][column] = value;
  };
  for (const record of records) {
    const data = new DataView(record.data.buffer, record.data.byteOffset, record.data.byteLength);
    if (record.type === BIFF_LABELSST && record.data.length >= 10) put(data.getUint16(0, true), data.getUint16(2, true), strings[data.getUint32(6, true)] ?? '');
    if (record.type === BIFF_NUMBER && record.data.length >= 14) put(data.getUint16(0, true), data.getUint16(2, true), String(data.getFloat64(6, true)));
    if (record.type === BIFF_RK && record.data.length >= 10) put(data.getUint16(0, true), data.getUint16(2, true), String(decodeRk(data.getUint32(6, true))));
  }
  return rows.filter(row => row?.some(Boolean)).map(row => Array.from({ length: row.length }, (_, index) => row[index] ?? ''));
}

function decodeRk(value: number) {
  const divided = value & 1 ? 100 : 1;
  if (value & 2) return ((value >> 2) | (value & 0x80000000 ? ~0x3FFFFFFF : 0)) / divided;
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(4, value & 0xFFFFFFFC, true);
  return view.getFloat64(0, true) / divided;
}

function readSst(parts: Uint8Array[]) {
  const bytes = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let cursor = 0;
  for (const part of parts) { bytes.set(part, cursor); cursor += part.length; }
  const view = new DataView(bytes.buffer);
  const total = view.getUint32(4, true);
  const strings: string[] = [];
  let offset = 8;
  for (let index = 0; index < total && offset + 3 <= bytes.length; index++) {
    const charCount = view.getUint16(offset, true);
    const flags = bytes[offset + 2];
    offset += 3;
    let runs = 0;
    let extension = 0;
    if (flags & 8) { runs = view.getUint16(offset, true); offset += 2; }
    if (flags & 4) { extension = view.getUint32(offset, true); offset += 4; }
    const wide = flags & 1;
    const byteCount = charCount * (wide ? 2 : 1);
    strings.push(wide ? new TextDecoder('utf-16le').decode(bytes.subarray(offset, offset + byteCount)) : new TextDecoder('latin1').decode(bytes.subarray(offset, offset + byteCount)));
    offset += byteCount + runs * 4 + extension;
  }
  return strings;
}
