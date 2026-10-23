import {env} from 'cloudflare:workers';
import {read,write} from './store';
import {koreanIndexCodes,parseIndexQuote,type IndexQuote} from './index-quotes';

type IndexSnapshot = {checkedAt:string; rows:IndexQuote[]; errors:{symbol:string;error:string}[]};
export async function refreshKoreanIndices(): Promise<IndexSnapshot> {
  const old = await read('koreanIndices', null) as IndexSnapshot | null;
  const now = Date.now();
  if (old && now - Date.parse(old.checkedAt) < 60000) return old;
  const db = (env as unknown as {DB:D1Database}).DB;
  const lock = await db.prepare("INSERT INTO records(key,value) VALUES('index_refresh_lock',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value WHERE CAST(records.value AS INTEGER) < ?")
    .bind(String(now+20000),now).run();
  if (!lock.meta.changes) return old || {checkedAt:'',rows:[],errors:[]};
  const rows = new Map((old?.rows || []).map(r => [r.symbol,r]));
  const errors: IndexSnapshot['errors'] = [];
  await Promise.all(koreanIndexCodes.map(async code => {
    const symbol = code === 'KOSPI' ? '^KS11' : '^KQ11';
    try {
      const response = await fetch('https://m.stock.naver.com/api/index/'+code+'/basic', {
        headers:{Accept:'application/json'}, cache:'no-store', redirect:'manual', signal:AbortSignal.timeout(10000)
      });
      if (!response.ok) throw Error('지수 공급 응답 '+response.status);
      const row = parseIndexQuote(code,await response.json());
      const previous = rows.get(symbol);
      if (previous && Date.parse(row.asOf) < Date.parse(previous.asOf)) throw Error('공급처가 이전 시각 자료를 반환했습니다');
      rows.set(symbol,row);
    } catch (e) {
      errors.push({symbol,error:e instanceof Error?e.message:'지수 조회 실패'});
    }
  }));
  const snapshot = {checkedAt:new Date().toISOString(),rows:[...rows.values()],errors};
  await write('koreanIndices',snapshot);
  return snapshot;
}

