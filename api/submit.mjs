import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { QUESTION_IDS, SUPPORT_OPTIONS, PRIORITIES } from '../public/assets/questions.js';

const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json = (data,status=200) => new Response(JSON.stringify(data),{status,headers});
const clean = (v,max=100) => typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').trim().slice(0,max) : '';

async function handle(request) {
  if(request.method!=='POST')return json({error:'Metode tidak diperbolehkan.'},405);
  const type=request.headers.get('content-type') || '';
  if(!type.includes('application/json'))return json({error:'Format permintaan tidak valid.'},415);
  const raw=await request.text();
  if(raw.length>12000)return json({error:'Ukuran jawaban terlalu besar.'},413);
  let body;try{body=JSON.parse(raw);}catch{return json({error:'Data formulir tidak valid.'},400);}
  if(!body || typeof body!=='object' || Array.isArray(body))return json({error:'Data formulir tidak valid.'},400);
  if(clean(body.companyWebsite,200))return json({ok:true,message:'Terima kasih atas masukan Anda.'}); // anti-spam honeypot
  const department=clean(body.department,60), location=clean(body.location,60), name=clean(body.name,80);
  const support=clean(body.support,40), priority=clean(body.priority,100);
  const issues=clean(body.issues,1000), suggestion=clean(body.suggestion,1500);
  const overall=body.overall;
  if(!department || !location || !Number.isInteger(overall) || overall<1 || overall>6 || !SUPPORT_OPTIONS.includes(support) || !PRIORITIES.includes(priority)) {
    return json({error:'Mohon lengkapi identitas kerja dan penilaian akhir.'},400);
  }
  const input=body.ratings;
  if(!input || typeof input!=='object' || Array.isArray(input) || Object.keys(input).length!==QUESTION_IDS.length || !QUESTION_IDS.every(id=>Number.isInteger(input[id]) && input[id]>=0 && input[id]<=6)){
    return json({error:'Semua pertanyaan penilaian harus diisi (pilih N/A bila tidak relevan).'},400);
  }
  const ratings=Object.fromEntries(QUESTION_IDS.map(id=>[id,input[id]]));
  try{
    const now=new Date();
    const monthWita=new Date(now.getTime()+8*60*60*1000).toISOString().slice(0,7);
    const id=randomUUID();
    await put(`answer/${monthWita}/${now.toISOString()}-${id}.json`,JSON.stringify({
      id,created_at:now.toISOString(),name:name||null,department,location,ratings,
      overall,support,issues:issues||null,priority,suggestion:suggestion||null
    }),{access:'private',contentType:'application/json',addRandomSuffix:false});
    return json({ok:true,message:'Jawaban berhasil disimpan.'},201);
  }catch(error){
    console.error('survey submit storage error:',error);
    return json({error:'Penyimpanan belum siap. Periksa Vercel Blob Store dan BLOB_READ_WRITE_TOKEN.'},503);
  }
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
