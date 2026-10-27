export type CaseForms = {
  upper: string;
  lower: string;
  title: string;
  sentence: string;
  camel: string;
  pascal: string;
  snake: string;
  kebab: string;
  constant: string;
  dot: string;
  inverse: string;
  alternating: string;
};

const minorWords = 'a an the and but or for nor on at to by of in as'.split(' ');

export function splitName(text: string, unicode=false) {
  if(!unicode)return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const spaced=text.normalize('NFC')
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu,'$1 $2')
    .replace(/([\p{Ll}\p{Nd}])(\p{Lu})/gu,'$1 $2')
    .replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])([\p{Script=Latin}\p{Nd}])/gu,'$1 $2')
    .replace(/([\p{Script=Latin}\p{Nd}])([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}])/gu,'$1 $2');
  return (spaced.match(/[\p{L}\p{M}\p{N}]+/gu)||[]).map(word=>word.toLowerCase());
}

function capitalize(word: string) {
  return word ? word.charAt(0).toUpperCase()+word.slice(1) : '';
}
function unicodeCapitalize(word:string){const first=Array.from(word)[0];return first?first.toUpperCase()+word.slice(first.length):'';
}

export function titleCase(text: string, style = 'default') {
  const minor = new Set(style === 'apa' ? minorWords : [...minorWords, 'is', 'if']);
  const words = text.toLowerCase().split(/\s+/).filter(word => word.length);
  return words.map((word, index) => index === 0 || index === words.length - 1 || (style === 'apa' && word.length >= 4) || !minor.has(word) ? capitalize(word) : word).join(' ');
}

export function caseForms(text: string, style = 'default',unicode=false): CaseForms {
  const words = splitName(text,unicode);
  const cap=unicode?unicodeCapitalize:capitalize;
  let letter = 0;
  return {
    upper: text.toUpperCase(),
    lower: text.toLowerCase(),
    title: titleCase(text, style),
    sentence: text.toLowerCase().replace(/(^|[.!?]\s+)\p{L}/gu, char => char.toUpperCase()),
    camel: words.map((word, index) => index ? cap(word) : word).join(''),
    pascal: words.map(cap).join(''),
    snake: words.join('_'),
    kebab: words.join('-'),
    constant: words.join('_').toUpperCase(),
    dot: words.join('.'),
    inverse: text.replace(unicode?/\p{L}/gu:/[a-z]/gi, char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()),
    alternating: text.replace(unicode?/\p{L}/gu:/[a-z]/gi, char => char.toUpperCase()===char.toLowerCase()?char:letter++ % 2 ? char.toUpperCase() : char.toLowerCase())
  };
}

export function primaryCase(text: string, kind: string, style = 'default',unicode=false) {
  const forms = caseForms(text, style,unicode);
  if (kind.startsWith('snake')) return forms.snake;
  if (kind.startsWith('kebab')) return forms.kebab;
  if (kind.startsWith('alternating')) return forms.alternating;
  if (kind.startsWith('title') || kind === 'title') return forms.title;
  if (kind === 'upper') return forms.upper;
  if (kind === 'lower') return forms.lower;
  if (kind === 'sentence') return forms.sentence;
  return forms.title;
}
