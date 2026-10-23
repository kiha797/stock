import handler from 'vinext/server/fetch-handler';
import {refreshPublicMarket} from '../lib/public-market';
import {refreshPublicResearch} from '../lib/public-research';
import {canUpdate} from '../lib/server-auth';
type Env=Cloudflare.Env & {RESEARCH_UPDATE_TOKEN?:string;OWNER_PASSWORD?:string};
export default {
  async fetch(request:Request,env:Env,ctx:ExecutionContext){
    let path:string;
    try{path=decodeURIComponent(new URL(request.url).pathname).replace(/\/{2,}/g,'/').replace(/\/$/,'')||'/';}catch{return new Response('Bad path',{status:400});}
    if(path==='/owner')return new Response('Not found',{status:404});
    if(path.startsWith('/api/')){
      if(!['/api/data','/api/research','/api/refresh','/api/indices'].includes(path))return new Response('Not found',{status:404});
      if(request.method!=='GET'){
        if(request.method!=='POST'||path==='/api/data'||path==='/api/indices')return new Response('Method not allowed',{status:405});
        if(!await canUpdate(request,env.RESEARCH_UPDATE_TOKEN||env.OWNER_PASSWORD))return Response.json({error:'서버 갱신 전용 요청입니다.'},{status:401});
      }
      if(path==='/api/data'&&request.method==='GET')ctx.waitUntil(refreshPublicMarket().catch(()=>console.error('Public market refresh failed')));
      const response=await handler.fetch(request,env,ctx);
      const safe=new Response(response.body,response);safe.headers.set('Cache-Control','no-store');return safe;
    }
    return handler.fetch(request,env,ctx);
  },
  async scheduled(event:ScheduledController,_env:Env,ctx:ExecutionContext){const jobs=[refreshPublicResearch()];if(event.cron==='0 23 * * *')jobs.push(refreshPublicMarket(true));ctx.waitUntil(Promise.allSettled(jobs).then(()=>{}));},
};
