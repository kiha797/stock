import handler from 'vinext/server/fetch-handler';
import {isOwner,ownerRoute} from '../lib/owner-auth';
type Env = Cloudflare.Env & { OWNER_PASSWORD?: string };
export default {
  async fetch(request:Request,env:Env,ctx:ExecutionContext) {
    let path:string;
    try{path=decodeURIComponent(new URL(request.url).pathname).replace(/\/{2,}/g,'/').replace(/\/$/,'')||'/';}catch{return new Response('Bad path',{status:400});}
    if(path==='/owner')return ownerRoute(request,env.OWNER_PASSWORD);
    if(path.startsWith('/api/')){
      if(!['/api/data','/api/research','/api/refresh'].includes(path))return new Response('Not found',{status:404});
      if(request.method==='HEAD')return new Response(null,{status:405});
      const owner=await isOwner(request,env.OWNER_PASSWORD);
      if(request.method!=='GET'&&request.method!=='HEAD'){
        const origin=request.headers.get('origin');
        if(origin&&origin!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
        if(!owner)return Response.json({error:'관리자 로그인 후 사용할 수 있습니다.'},{status:401});
      }
      const response=await handler.fetch(request,env,ctx);
      if(path==='/api/data'&&response.ok&&!owner){
        const data=await response.json() as any;
        return Response.json({portfolio:[],watch:[],settings:{cash:0,fx:0,knee:30},snapshot:data.snapshot,history:data.history,schedule:data.schedule,research:data.research},{headers:{'Cache-Control':'no-store'}});
      }
      const safe=new Response(response.body,response);safe.headers.set('Cache-Control','no-store');return safe;
    }
    return handler.fetch(request,env,ctx);
  },
};
