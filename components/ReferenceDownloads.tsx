const references:Record<string,[string,string][]>= {
 'github-markdown-cheat-sheet':[['GitHub Markdown cheat sheet (PDF)','/pdf/github-markdown-cheat-sheet.pdf']],
 'jupyter-markdown-cheat-sheet':[['Jupyter Notebook Markdown cheat sheet (PDF)','/pdf/jupyter-notebook-markdown-cheat-sheet.pdf']],
 'obsidian-cheat-sheet':[['Obsidian cheat sheet (PDF)','/pdf/obsidian-markdown-cheat-sheet.pdf'],['Obsidian cheat sheet (Markdown)','/downloads/obsidian-markdown-cheat-sheet.md']],
 'r-markdown-cheat-sheet':[['R Markdown cheat sheet (PDF)','/pdf/r-markdown-cheat-sheet.pdf']],
};
export default function ReferenceDownloads({slug}:{slug:string}){const entries=references[slug];return entries?<section aria-label="Reference downloads"><h2>Download this reference</h2><div className="local-actions">{entries.map(([label,href])=><a className="secondary" href={href} download key={href}>{label}</a>)}</div></section>:null}
