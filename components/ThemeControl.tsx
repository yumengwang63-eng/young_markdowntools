'use client';
import {useEffect,useState} from 'react';
type Theme='system'|'light'|'dark';
export default function ThemeControl(){
 const [theme,setTheme]=useState<Theme>('system'),[ready,setReady]=useState(false);
 useEffect(()=>{try{const value=localStorage.getItem('markdowntools:theme');if(value==='light'||value==='dark')setTheme(value)}catch{}setReady(true)},[]);
 useEffect(()=>{if(!ready)return;const media=matchMedia('(prefers-color-scheme: dark)');const update=()=>{document.documentElement.dataset.theme=theme==='system'?(media.matches?'dark':'light'):theme};update();media.addEventListener('change',update);const sync=(event:StorageEvent)=>{if(event.key==='markdowntools:theme')setTheme(event.newValue==='dark'?'dark':event.newValue==='light'?'light':'system')};window.addEventListener('storage',sync);return()=>{media.removeEventListener('change',update);window.removeEventListener('storage',sync)}},[theme,ready]);
 return <label className="theme-control"><span className="sr-only">Color theme</span><select aria-label="Color theme" value={theme} onChange={event=>{const value=event.target.value as Theme;setTheme(value);try{localStorage.setItem('markdowntools:theme',value)}catch{}}}><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>;
}
