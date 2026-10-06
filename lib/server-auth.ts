export async function canUpdate(request:Request,secret?:string){
  if(!secret||secret.length<24)return false;
  const header=request.headers.get('authorization');
  if(!header?.startsWith('Bearer '))return false;
  const enc=new TextEncoder();
  const [a,b]=await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(header.slice(7))),crypto.subtle.digest('SHA-256',enc.encode(secret))]);
  let diff=0;const x=new Uint8Array(a),y=new Uint8Array(b);for(let i=0;i<x.length;i++)diff|=x[i]^y[i];return diff===0;
}
