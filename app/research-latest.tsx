'use client';
import {Clock, ExternalLink, Info, ArrowUpRight} from 'lucide-react';

export const recentUpdates=(research:any,id?:string)=>(research?.updates||[])
  .filter((u:any)=>!id||u.managerId===id||u.managerId==='all')
  .slice().sort((a:any,b:any)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
const kindLabel=(kind:string)=>kind==='daily-holdings'?'일별 ETF 보유자료':kind==='filing'?'공시':'공식 발표 · 뉴스';

export function LatestManagerUpdate({research,id}:any){
  const update=recentUpdates(research,id).find((u:any)=>u.kind!=='filing');
  return <div className="manager-latest"><span><i/>{update?`${kindLabel(update.kind)} · ${update.date}`:'최신 자료 확인 대기'}</span>{update?<a href={update.sourceUrl} target="_blank" rel="noreferrer">{update.title}<ArrowUpRight size={14}/></a>:<p>공개된 새 자료를 확인하면 반영합니다.</p>}</div>;
}

export default function ResearchLatest({research,managerId,compact=false}:any){
  const updates=recentUpdates(research,managerId).filter((u:any)=>u.kind!=='filing');
  const daily=updates.find((u:any)=>u.kind==='daily-holdings');
  const news=updates.filter((u:any)=>u.id!==daily?.id).slice(0,compact?2:3);
  const status=research?.syncStatus;
  const checked=research?.checkedAt;
  const stale=!!checked&&Date.now()-Date.parse(checked)>48*3600000;
  return <section className="research-latest panel">
    <div className="panelhead"><div><div className="eyebrow">LATEST PUBLIC UPDATES</div><h2>최신 보유자료와 투자 소식</h2><p>일별 보유자료 · 수시 공시 · 운용사 발표를 먼저 확인하세요.</p></div><span className="latest-date"><Clock size={14}/>{updates[0]?.date||'확인 대기'} 자료</span></div>
    <div className="research-freshness"><span>{checked?`공식 출처 확인 ${new Date(checked).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})} KST`:'공식 출처 확인 대기'}</span>{research?.syncedAt&&<span>사이트 반영 {new Date(research.syncedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})} KST</span>}</div>
    {(status?.status==='error'||stale||research?.check?.status==='error')&&<div className="research-sync-warning" role="status">{status?.status==='error'?status.message:stale?'최근 출처 확인이 48시간 이상 지났습니다. 아래 자료의 기준일을 확인하세요.':research.check.message}</div>}
    {research?.check?.status==='partial'&&<p className="research-partial">일부 출처 조회가 보류되었습니다. 확인된 자료만 표시합니다.</p>}
    <div className={'latest-research-grid '+(!daily?'news-only':'')}>
      {daily&&<a className="latest-holdings" href={daily.sourceUrl} target="_blank" rel="noreferrer"><span className="news-kind daily-holdings">일별 ETF 보유자료 · {daily.date} 기준</span><h3>{daily.title}</h3><p>{daily.summary}</p><small>{daily.sourceName} · 기준일 {daily.date}</small><b>공식 보유표 보기 <ExternalLink size={14}/></b></a>}
      <div className="latest-research-news">{news.map((u:any)=><a key={u.id} href={u.sourceUrl} target="_blank" rel="noreferrer"><span className={'news-kind '+u.kind}>{kindLabel(u.kind)} · {u.date}</span><h3>{u.title}</h3>{!compact&&<p>{u.summary}</p>}<small>{u.sourceName} <ExternalLink size={12}/></small></a>)}{!updates.length&&<p>확인된 신규 자료가 없습니다.</p>}</div>
    </div>
    <div className="quarterly-context"><Info size={17}/><p><b>아래 보유수량 표는 분기 13F 공시입니다.</b> 분기 종료 후 최대 45일 뒤 공개되어 최신 소식과 기준일이 다를 수 있습니다. 새 분기·수정 공시가 확인되면 반영합니다. 일별 ETF 자료는 해당 ETF의 기준일 보유내역입니다.</p><a href="https://www.sec.gov/rules-regulations/staff-guidance/frequently-asked-questions-about-form-13f" target="_blank" rel="noreferrer">공시 주기 안내 <ExternalLink size={13}/></a></div>
  </section>;
}
