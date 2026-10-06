import {env} from 'cloudflare:workers';
import {read,write} from './store';
import {universe,indices,quote} from './market';

// Shared server job: public visitors never choose symbols or write market values.
export async function refreshPublicMarket(scheduled=false){
  const old=await read('snapshot');
  const maxAge=scheduled?120000:26*3600000;
  if(old&&Date.now()-Date.parse(old.updated)<maxAge)return old;
  const db=(env as unknown as {DB:D1Database}).DB;
  const now=Date.now();
  const lock=await db.prepare("INSERT INTO records(key,value) VALUES('public_refresh_lock',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value WHERE CAST(records.value AS INTEGER) < ?").bind(String(now+10*60000),now).run();
  if(!lock.meta.changes)return old;
  const entries=[...universe,...indices];
  const rows:any[]=[],errors:any[]=[];
  for(let i=0;i<entries.length;i+=8){
    await Promise.all(entries.slice(i,i+8).map(async([symbol,name])=>{
      try{rows.push(await quote(symbol,name));}
      catch(e){errors.push({symbol,name,error:e instanceof Error?e.message:'조회 실패'});}
    }));
  }
  const updated=new Date().toISOString();
  if(!rows.length){
    await write('publicRefreshStatus',{checkedAt:updated,status:'error',message:'시세 공급처에 연결하지 못했습니다. 기존 데이터를 유지하며 잠시 후 다시 확인합니다.',errors});
    return old;
  }
  rows.sort((a,b)=>entries.findIndex(([s])=>s===a.symbol)-entries.findIndex(([s])=>s===b.symbol));
  const snapshot={updated,rows,errors,total:entries.length,stockCount:universe.length};
  const history=await read('history',[]);
  const day=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'});
  const stocks=rows.filter(x=>x.cross&&!indices.some(([s])=>s===x.symbol)).map(x=>({symbol:x.symbol,name:x.name,date:x.date,price:x.price}));
  const nextHistory=[{day,updated,count:stocks.length,stocks},...history.filter((x:any)=>x.day!==day)].slice(0,60);
  await db.batch([
    db.prepare('INSERT INTO records(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('snapshot',JSON.stringify(snapshot)),
    db.prepare('INSERT INTO records(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('history',JSON.stringify(nextHistory)),
    db.prepare('INSERT INTO records(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('publicRefreshStatus',JSON.stringify({checkedAt:updated,status:errors.length?'partial':'success',message:errors.length?`${rows.length}개 수집 · ${errors.length}개 조회 제외`:'시세 수집 완료',errors})),
  ]);
  return snapshot;
}
