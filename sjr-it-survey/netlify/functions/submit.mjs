import { getDatabase } from '@netlify/database';
import { QUESTION_IDS, SUPPORT_OPTIONS, PRIORITIES } from '../../public/assets/questions.js';

const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json = (data,status=200) => new Response(JSON.stringify(data),{status,headers});
const clean = (v,max=100) => typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').trim().slice(0,max) : '';

export default async function handler(request) {
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
  if(!department || !location || !Number.isInteger(overall) || overall<1 || overall>5 || !SUPPORT_OPTIONS.includes(support) || !PRIORITIES.includes(priority)) {
    return json({error:'Mohon lengkapi identitas kerja dan penilaian akhir.'},400);
  }
  const input=body.ratings;
  if(!input || typeof input!=='object' || Array.isArray(input) || Object.keys(input).length!==QUESTION_IDS.length || !QUESTION_IDS.every(id=>Number.isInteger(input[id]) && input[id]>=0 && input[id]<=5)){
    return json({error:'Semua pertanyaan penilaian harus diisi (pilih N/A bila tidak relevan).'},400);
  }
  const ratings=Object.fromEntries(QUESTION_IDS.map(id=>[id,input[id]]));
  try{
    const db=getDatabase();
    await db.sql`INSERT INTO it_sjr_responses (respondent_name, department, location, ratings, overall, support_level, issues, improvement_priority, suggestion)
      VALUES (${name||null}, ${department}, ${location}, ${JSON.stringify(ratings)}::jsonb, ${overall}, ${support}, ${issues||null}, ${priority}, ${suggestion||null})`;
    return json({ok:true,message:'Jawaban berhasil disimpan.'},201);
  }catch(error){
    console.error('survey submit database error:',error);
    return json({error:'Penyimpanan belum tersedia. Periksa status database pada dashboard Netlify atau coba lagi.'},503);
  }
}
