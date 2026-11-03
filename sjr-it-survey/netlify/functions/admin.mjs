import { getDatabase } from '@netlify/database';
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
export default async function handler(request){
  if(!authReady())return json({error:'Admin belum dikonfigurasi. Atur ADMIN_PASSWORD (minimal 12 karakter) dan ADMIN_SESSION_SECRET (minimal 32 karakter) pada Environment Variables Netlify.'},503);
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
    const db=getDatabase();
    const rows=await db.sql`SELECT id,created_at,respondent_name AS name,department,location,ratings,overall,support_level AS support,issues,improvement_priority AS priority,suggestion
      FROM it_sjr_responses
      WHERE (${department} = '' OR department = ${department})
      AND (${location} = '' OR location = ${location})
      AND (${month} = '' OR to_char(created_at AT TIME ZONE 'Asia/Makassar','YYYY-MM') = ${month})
      ORDER BY created_at DESC LIMIT 3001`;
    return json({ok:true,rows:rows.slice(0,3000),truncated:rows.length>3000});
  }catch(error){console.error('survey admin database error:',error);return json({error:'Gagal mengambil data dari database. Periksa migrasi database di Netlify.'},503);}
}
