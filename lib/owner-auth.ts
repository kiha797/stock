const COOKIE='__Host-knee-owner';
const encoder=new TextEncoder();
const ready=(secret?:string):secret is string=>!!secret&&secret.length>=24;
async function key(secret:string){return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function signature(secret:string,value:string){const bytes=new Uint8Array(await crypto.subtle.sign('HMAC',await key(secret),encoder.encode(value)));return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');}
async function equal(a:string,b:string){const [x,y]=await Promise.all([crypto.subtle.digest('SHA-256',encoder.encode(a)),crypto.subtle.digest('SHA-256',encoder.encode(b))]);const xx=new Uint8Array(x),yy=new Uint8Array(y);let diff=0;for(let i=0;i<xx.length;i++)diff|=xx[i]^yy[i];return diff===0;}
export async function isOwner(request:Request,secret?:string){
  if(!ready(secret))return false;
  const bearer=request.headers.get('authorization');
  if(bearer?.startsWith('Bearer ')&&await equal(bearer.slice(7),secret))return true;
  const token=request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
  if(!token)return false;
  const [expiry,sig,...rest]=token.split('.');
  if(rest.length||!/^\d+$/.test(expiry)||!sig||Number(expiry)<Date.now()||Number(expiry)>Date.now()+8*3600000)return false;
  return equal(sig,await signature(secret,expiry));
}
export async function ownerRoute(request:Request,secret?:string){
  const headers={'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Frame-Options':'DENY','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"};
  const page=(body:string,status=200)=>new Response(`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>KNEE 관리자</title><style>body{font:16px system-ui;background:#f4f6f5;color:#253b35;max-width:420px;margin:12vh auto;padding:24px}form{display:grid;gap:18px}input,button{font:inherit;padding:14px;border:1px solid #bdcec3;border-radius:8px}button{background:#214e40;color:white;cursor:pointer}a{color:#214e40}p{line-height:1.7}</style><h1>KNEE 관리자</h1>${body}<p><a href="/">대시보드로 돌아가기</a></p></html>`,{status,headers});
  if(!ready(secret))return page('<p>관리자 접근 설정이 아직 완료되지 않았습니다.</p>',503);
  if(request.method==='POST'){
    if(request.headers.get('origin')!==new URL(request.url).origin)return page('<p>허용되지 않은 요청입니다.</p>',403);
    if(Number(request.headers.get('content-length')||0)>4096)return page('<p>입력이 너무 깁니다.</p>',413);
    const form=await request.formData();
    if(form.get('action')==='logout')return new Response(null,{status:303,headers:{Location:'/', 'Set-Cookie':`${COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0`,'Cache-Control':'no-store'}});
    const password=form.get('password');
    if(typeof password!=='string'||password.length>512||!await equal(password,secret))return page('<p>비밀번호가 일치하지 않습니다.</p><a href="/owner">다시 로그인</a>',401);
    const expiry=String(Date.now()+8*3600000);const token=expiry+'.'+await signature(secret,expiry);
    return new Response(null,{status:303,headers:{Location:'/', 'Set-Cookie':`${COOKIE}=${token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=28800`,'Cache-Control':'no-store'}});
  }
  if(request.method!=='GET')return new Response('Method not allowed',{status:405});
  if(await isOwner(request,secret))return page('<p>관리자로 로그인되어 있습니다. 로그인은 8시간 동안 유지됩니다.</p><form method="post"><input type="hidden" name="action" value="logout"><button>로그아웃</button></form>');
  return page('<p>개인 보유자산과 관리 기능은 로그인 후 사용할 수 있습니다.</p><form method="post"><label for="password">관리자 비밀번호</label><input id="password" name="password" type="password" autocomplete="current-password" maxlength="512" required><button>로그인</button></form>');
}
