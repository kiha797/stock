import seed from './research-seed.json';
import {read,write} from './store';
import {mergePublishedResearch} from './research-sync-core';
import {env} from 'cloudflare:workers';

// Fixed public research feed maintained by the existing daily source-verification job.
// It contains public disclosures only. No Site credential is required or forwarded.
export const RESEARCH_SOURCE='https://knee-invest.workspace-948358.chatgpt.site/api/research';
export async function refreshPublicResearch(){
  const old=await read('research',seed);
  const status=await read('publicResearchStatus');
  const interval=status?.status==='error'?60000:15*60000;
  if(status?.checkedAt&&Date.now()-Date.parse(status.checkedAt)<interval)return {...old,syncStatus:status};
  const db=(env as unknown as {DB:D1Database}).DB,now=Date.now();
  const lock=await db.prepare("INSERT INTO records(key,value) VALUES('public_research_lock',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value WHERE CAST(records.value AS INTEGER) < ?").bind(String(now+60000),now).run();
  if(!lock.meta.changes)return {...old,syncStatus:status};
  const checkedAt=new Date().toISOString();
  try{
    const response=await fetch(RESEARCH_SOURCE,{headers:{Accept:'application/json'},cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(25000)});
    if(!response.ok)throw Error(`Research source returned ${response.status}`);
    const body=await response.text();
    if(body.length>2000000)throw Error('Research source too large');
    const value=JSON.parse(body);
    // Re-read after network IO so a concurrent writer's newer record is preserved.
    const current=await read('research',seed);
    const next=mergePublishedResearch(current,value.research,checkedAt);
    await write('research',next);
    const saved={checkedAt,status:'success',sourceUpdatedAt:next.updatedAt,message:'전문가 최신 자료를 반영했습니다.'};
    await write('publicResearchStatus',saved);
    return {...next,syncStatus:saved};
  }catch(error){
    console.error('Public research sync failed',error instanceof Error?error.message:'unknown');
    const failed={checkedAt,status:'error',message:'전문가 자료를 갱신하지 못했습니다. 마지막 확인 자료를 유지합니다.',reason:error instanceof Error?error.message.slice(0,180):'unknown'};
    await write('publicResearchStatus',failed);
    return {...await read('research',seed),syncStatus:failed};
  }
}
