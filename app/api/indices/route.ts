import {refreshKoreanIndices} from '@/lib/live-indices';
export async function GET(){
  try{return Response.json(await refreshKoreanIndices(),{headers:{'Cache-Control':'no-store'}})}
  catch{return Response.json({error:'국내 지수 갱신에 실패했습니다.'},{status:503,headers:{'Cache-Control':'no-store'}})}
}

