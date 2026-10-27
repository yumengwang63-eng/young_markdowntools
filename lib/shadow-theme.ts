/** Keep isolated reference templates in sync without changing their saved HTML. */
export function syncShadowTheme(host:HTMLElement){
 const style=document.createElement('style');
 style.textContent=`:host{font-family:var(--font-geist),Arial,sans-serif!important}.font-mono,pre,code,textarea{font-family:var(--font-geist-mono),monospace!important}
 :host([data-theme=dark]){color-scheme:dark;color:#f4f4f5;--background:#18181b;--surface:#232327;--text-primary:#f4f4f5;--text-secondary:#b4b4c0;--text-muted:#a1a1aa;--border:#3f3f46;--code-bg:#232327;--code-border:#3f3f46;--primary:#bda6ff;--warning-bg:#352810;--warning-border:#73561d;--warning-text:#fcd98a;--warning-text-muted:#fcd98a;--success-bg:#102c22;--success-text:#8de4bb}
 :host([data-theme=dark]) :is(textarea,input,select){background:#18181b!important;color:#f4f4f5!important;border-color:#3f3f46!important}
 :host([data-theme=dark]) :is(section,section>div){border-color:#3f3f46!important}
 :host([data-theme=dark]) .bg-warning-bg{background:#352810}:host([data-theme=dark]) .text-warning-text,:host([data-theme=dark]) .text-warning-text-muted{color:#fcd98a}
 :host([data-theme=dark]) .bg-info-bg{background:#22234a}:host([data-theme=dark]) .text-info-text,:host([data-theme=dark]) .text-info-text-muted{color:#c6c8ff}
 @media print{:host([data-theme]){color-scheme:light;color:#18181b;--background:#fff;--surface:#f6f6f8;--text-primary:#18181b;--text-secondary:#52525b;--border:#ddd;--code-bg:#f6f6f8;--code-border:#ddd}:host([data-theme]) textarea{background:#fff!important;color:#18181b!important}}`;
 host.shadowRoot!.append(style);
 const update=()=>{host.dataset.theme=document.documentElement.dataset.theme||'light'};update();
 const observer=new MutationObserver(update);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 return()=>observer.disconnect();
}
