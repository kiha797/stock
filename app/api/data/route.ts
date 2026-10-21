import {read} from '@/lib/store';
import {refreshPublicResearch} from '@/lib/public-research';
export async function GET(){try{const [snapshot,history,research,refreshStatus]=await Promise.all([read('snapshot'),read('history',[]),refreshPublicResearch(),read('publicRefreshStatus')]);return Response.json({snapshot,history,research,refreshStatus},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'공개 시황을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.'},{status:503})}}
