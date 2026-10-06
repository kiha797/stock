import seed from '@/lib/research-seed.json';
import {read} from '@/lib/store';
export async function GET(){try{return Response.json({snapshot:await read('snapshot'),history:await read('history',[]),research:await read('research',seed),refreshStatus:await read('publicRefreshStatus')},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'공개 시황을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.'},{status:503})}}
