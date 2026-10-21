import {z} from 'zod';
import {reportSchema,updateSchema,payloadSchema} from './research';

const researchSchema=z.object({
  reports:z.array(reportSchema).min(1).max(100),updates:z.array(updateSchema).max(1000),
  check:payloadSchema.shape.check,checkedAt:z.string().datetime(),updatedAt:z.string().datetime(),
});

// Merge only verified published records. Missing upstream records never delete history.
export function mergePublishedResearch(old:any,input:unknown,syncedAt:string){
  const incoming=researchSchema.parse(input);
  if(Date.parse(incoming.updatedAt)>Date.now()+5*60000)throw Error('Invalid source timestamp');
  if(old?.updatedAt&&Date.parse(incoming.updatedAt)<Date.parse(old.updatedAt))throw Error('Source is older than saved research');
  const reports=new Map<string,any>((old?.reports||[]).map((r:any)=>[r.managerId+':'+r.period,r]));
  for(const report of incoming.reports){
    const key=report.managerId+':'+report.period,prior=reports.get(key);
    if(prior&&(report.filed<prior.filed||prior.complete&&!report.complete))continue;
    reports.set(key,report);
  }
  const updates=new Map<string,any>((old?.updates||[]).map((u:any)=>[u.id,u]));
  for(const update of incoming.updates)updates.set(update.id,update);
  return {...incoming,reports:[...reports.values()],updates:[...updates.values()].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,120),syncedAt};
}
