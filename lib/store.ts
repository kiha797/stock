import { env } from 'cloudflare:workers';
const db = () => (env as unknown as {DB:D1Database}).DB;
export async function read(key:string, fallback:any=null){const row=await db().prepare('SELECT value FROM records WHERE key = ?').bind(key).first<{value:string}>();return row?JSON.parse(row.value):fallback;}
export async function write(key:string,value:any){await db().prepare('INSERT INTO records(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(key,JSON.stringify(value)).run();}
