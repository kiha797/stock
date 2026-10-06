import {readFileSync,writeFileSync} from 'node:fs';
const path=new URL('../wrangler.jsonc',import.meta.url);
const config=JSON.parse(readFileSync(path,'utf8'));
const id=process.env.D1_DATABASE_ID;
if(id){
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw Error('D1_DATABASE_ID must be a database UUID.');
  config.d1_databases[0].database_id=id;
  writeFileSync(path,JSON.stringify(config,null,2)+'\n');
}
if(process.argv.includes('--require-db')&&config.d1_databases[0].database_id==='00000000-0000-4000-8000-000000000000')throw Error('Create stock-db in Cloudflare D1 and set build variable D1_DATABASE_ID before deployment.');
