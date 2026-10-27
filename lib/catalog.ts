import inventory from '../components/v4-inventory.json';
import references from '../components/reference-tools.json';

export const categories = [
  {slug:'cheat-sheets', name:'Cheat Sheets', source:'语法参考'},
  {slug:'converters', name:'Converters', source:'格式转换'},
  {slug:'generators', name:'Generators', source:'语法生成'},
  {slug:'table-tools', name:'Table Tools', source:'表格工具'},
  {slug:'text-tools', name:'Text Tools', source:'文本工具'},
  {slug:'editors', name:'Editors', source:'编辑与预览'},
];
export const catalog = inventory.rows.map(row => ({
  slug:row.slug, name:row.name, category:row.category,
  description:references.find(item=>item.slug===row.slug)?.description || row.name,
}));
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000').replace(/\/$/,'');
