import {refreshPublicMarket} from '@/lib/public-market';
export async function POST(){try{const snapshot=await refreshPublicMarket(true);return snapshot?Response.json(snapshot):Response.json({error:'시세 수집 대기 또는 공급처 연결 실패입니다. 기존 자료는 유지됩니다.'},{status:503})}catch{return Response.json({error:'시세 갱신에 실패했습니다. 기존 자료는 유지됩니다.'},{status:503})}}
