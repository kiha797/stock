'use client';
import {useEffect,useState} from 'react';
import {indices} from '@/lib/market';
import type {IndexQuote} from '@/lib/index-quotes';
const number=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?v.toLocaleString('ko-KR',{maximumFractionDigits:2}):'—';
export default function MarketStrip({dailyRows}:{dailyRows:any[]}){
  const [live,setLive]=useState<{rows:IndexQuote[];errors:{symbol:string}[]}>({rows:[],errors:[]});
  const [failed,setFailed]=useState(false);
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{
    let active=true,controller:AbortController|null=null;
    const load=async()=>{
      if(document.visibilityState==='hidden')return;
      controller?.abort(); const current=new AbortController();controller=current;
      try{
        const response=await fetch('/api/indices',{cache:'no-store',signal:current.signal});
        if(!response.ok)throw Error('지수 조회 실패');
        const data=await response.json() as any;
        if(active&&!current.signal.aborted){setLive({rows:Array.isArray(data.rows)?data.rows:[],errors:data.errors||[]});setFailed(false);setNow(Date.now())}
      }catch{if(active&&!current.signal.aborted){setFailed(true);setNow(Date.now())}}
    };
    load();const timer=setInterval(load,60000);
    document.addEventListener('visibilitychange',load);window.addEventListener('knee:refresh-indices',load);
    return()=>{active=false;controller?.abort();clearInterval(timer);document.removeEventListener('visibilitychange',load);window.removeEventListener('knee:refresh-indices',load)};
  },[]);
  return <div className="markets">{indices.map(([symbol,name])=>{
    const korean=symbol==='^KS11'||symbol==='^KQ11';
    const current=live.rows.find(r=>r.symbol===symbol);
    const row=current||dailyRows.find(r=>r.symbol===symbol);
    const error=korean&&(failed||live.errors.some(e=>e.symbol===symbol));
    const age=current?now-Date.parse(current.asOf):0;
    const stale=!!current&&current.marketStatus==='OPEN'&&age>10*60000;
    const state=current?.marketStatus==='OPEN'?'장중':current?.marketStatus==='CLOSE'?'장 마감':'최근 시세';
    return <div key={symbol}>
      <span>{name}{current&&<em className="index-state">{state}</em>}</span>
      <strong>{number(row?.price)}</strong>
      <small className={row?.change>=0?'up':'down'}>{row?`${row.change>=0?'+':''}${number(row.change)}%`:'수집 대기'}</small>
      <small className="index-asof">{current?new Date(current.asOf).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})+' KST':row?.date?row.date+' 종가':'자료 대기'}</small>
      {current?<a className="index-source" href={current.sourceUrl} target="_blank" rel="noreferrer">{current.source} · {current.delayMinutes>0?current.delayMinutes+'분 지연':'1분마다 확인'}</a>:<small className="index-source">{korean?'당일 지수 확인 중':'Yahoo Finance'}</small>}
      {(error||stale)&&<small className="index-warning">{error?'조회 지연 · 마지막 확인값':'공급 시세 지연 · 기준시각 확인'}</small>}
    </div>
  })}</div>;
}

