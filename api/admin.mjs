import { list, get } from '@vercel/blob';
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

const H={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const COOKIE='sjr_it_session';
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{...H,...extra}});
const authReady=()=>Boolean(process.env.ADMIN_PASSWORD?.length>=12 && process.env.ADMIN_SESSION_SECRET?.length>=32);
const same=(a,b)=>timingSafeEqual(createHash('sha256').update(a).digest(),createHash('sha256').update(b).digest());
const mac=payload=>createHmac('sha256',process.env.ADMIN_SESSION_SECRET).update(payload).digest('base64url');
function sessionCookie(request){
  const match=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(`${COOKIE}=`));
  if(!match)return false;
  const token=match.slice(COOKIE.length+1),split=token.lastIndexOf('.');
  if(split<0)return false;
  const data=token.slice(0,split),sig=token.slice(split+1);
  if(!same(mac(data),sig))return false;
  try{const content=JSON.parse(Buffer.from(data,'base64url').toString());return content.v===1 && Number.isFinite(content.exp) && content.exp>Date.now() && content.exp<Date.now()+86400000;}
  catch{return false;}
}
function createCookie(){
  const value=Buffer.from(JSON.stringify({v:1,exp:Date.now()+8*3600*1000})).toString('base64url');
  return `${COOKIE}=${value}.${mac(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
}
const clearCookie=()=>`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
const validFilter=(v,max=80)=>typeof v==='string' && v.length<=max ? v.trim() : '';
async function handle(request){
  if(!authReady())return json({error:'Admin belum dikonfigurasi. Atur ADMIN_PASSWORD (minimal 12 karakter) dan ADMIN_SESSION_SECRET (minimal 32 karakter) pada Environment Variables Vercel.'},503);
  if(request.method==='POST'){
    const raw=await request.text();if(raw.length>3000)return json({error:'Permintaan terlalu besar.'},413);
    let body;try{body=JSON.parse(raw);}catch{return json({error:'Format permintaan tidak valid.'},400);}
    if(body?.action==='logout')return json({ok:true},200,{'Set-Cookie':clearCookie()});
    if(body?.action!=='login' || typeof body.password!=='string' || body.password.length>256)return json({error:'Permintaan tidak valid.'},400);
    if(!same(body.password,process.env.ADMIN_PASSWORD))return json({error:'Kata sandi admin salah.'},401);
    return json({ok:true},200,{'Set-Cookie':createCookie()});
  }
  if(request.method!=='GET')return json({error:'Metode tidak diperbolehkan.'},405);
  if(!sessionCookie(request))return json({error:'Silakan login sebagai admin.'},401);
  const url=new URL(request.url);
  const department=validFilter(url.searchParams.get('department')||'');
  const location=validFilter(url.searchParams.get('location')||'');
  const month=validFilter(url.searchParams.get('month')||'',7);
  if(month&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))return json({error:'Format periode harus YYYY-MM.'},400);
  try{
    const prefix=month?`answer/${month}/`:'answer/';
    let cursor; const keys=[];
    do{
      const page=await list({prefix,limit:1000,cursor});
      keys.push(...page.blobs.map(x=>x.pathname));
      cursor=page.hasMore?page.cursor:undefined;
    }while(cursor && keys.length<5000);
    const sorted=keys.sort((a,b)=>b.localeCompare(a));
    const rows=[];
    for(let i=0;i<sorted.length;i+=15){
      const batch=sorted.slice(i,i+15);
      const values=await Promise.all(batch.map(async pathname=>{
        const blob=await get(pathname,{access:'private'});
        if(!blob?.stream)return null;
        return JSON.parse(await new Response(blob.stream).text());
      }));
      for(const row of values){
        if(!row?.created_at)continue;
        if(department && row.department!==department)continue;
        if(location && row.location!==location)continue;
        rows.push(row);
      }
      if(rows.length>=3000)break;
    }
    rows.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
    return json({ok:true,rows:rows.slice(0,3000),truncated:rows.length>3000});
  }catch(error){console.error('survey admin blobs error:',error);return json({error:'Gagal membaca jawaban. Periksa Vercel Blob Store dan Function Logs.'},503);}
}

export default async function handler(req,res){
  const request=new Request(`https://${req.headers.host||'localhost'}${req.url}`,{
    method:req.method,headers:req.headers,body:req.method==='GET'||req.method==='HEAD'?undefined:JSON.stringify(req.body||{})
  });
  const response=await handle(request);
  res.status(response.status);
  response.headers.forEach((value,key)=>res.setHeader(key,value));
  res.send(await response.text());
}
