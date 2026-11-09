"use client";
import {useEffect,useRef,useState} from 'react';
const CLIENT='ca-pub-2520258098503069';
function PublicAd({slot}:{slot:string}) {
 const [active,setActive]=useState(false);
 const ref=useRef<HTMLModElement>(null);
 useEffect(()=>{setActive(location.hostname.endsWith('.labelpos.com'));},[]);
 useEffect(()=>{
  const el=ref.current;if(!active||!el)return;
  if(!document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')){
   const s=document.createElement('script');s.async=true;s.crossOrigin='anonymous';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+CLIENT;document.head.appendChild(s);
  }
  const request=()=>{if(!el.isConnected||el.clientWidth===0||el.dataset.requested)return;el.dataset.requested='true';const w=window as Window & {adsbygoogle?:Record<string,unknown>[]};(w.adsbygoogle=w.adsbygoogle||[]).push({});};
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){request();if(el.dataset.requested)observer.disconnect();}},{rootMargin:'150px'});observer.observe(el);return()=>observer.disconnect();
 },[active,slot]);
 if(!active)return null;
 return <aside aria-label="광고" style={{width:'100%',maxWidth:1180,margin:'24px auto',padding:'12px 0',minWidth:0}}><span style={{display:'block',fontSize:11,color:'#81908b',marginBottom:8}}>광고</span><ins ref={ref} className="adsbygoogle" style={{display:'block',width:'100%',minHeight:90}} data-ad-client={CLIENT} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true"/></aside>;
}

type AdSlotProps={placement:'dashboard-banner'|'market-sidebar'|'expert-inline';variant?:'banner'|'rectangle'};
export default function AdSlot({placement}:AdSlotProps){return <PublicAd slot={placement==='dashboard-banner'?'2009598465':'4595574216'}/>;}
