import { GROUPS, DEPARTMENTS, LOCATIONS } from './questions.js';
const $=id=>document.getElementById(id);
const escapeHtml=str=>String(str??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const dateFormat=(dt)=>{try{return new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Makassar',day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(dt))+' WITA';}catch{return '—';}};
const monthFormat=(date)=>new Intl.DateTimeFormat('id-ID',{month:'short',year:'2-digit',timeZone:'Asia/Makassar'}).format(new Date(date));
const percent=(a,b)=>b?Math.round(100*a/b):0;
let rows=[];
let truncated=false;
let loading=false;

function showLogin(message=''){
  $('loginPanel').hidden=false;$('dashboardPanel').hidden=true;
  $('loginError').hidden=!message;$('loginError').textContent=message;
}
function showDashboard(){$('loginPanel').hidden=true;$('dashboardPanel').hidden=false;}
function notice(message){$('dashboardNotice').textContent=message;$('dashboardNotice').hidden=!message;}
async function requestAdmin(url,opts={}){
  const response=await fetch(url,{credentials:'same-origin',cache:'no-store',...opts});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){const e=new Error(data.error||'Terjadi kesalahan saat mengakses server.');e.status=response.status;throw e;}
  return data;
}
function setupFilters(){
  $('filterDepartment').innerHTML='<option value="">Semua departemen</option>'+DEPARTMENTS.filter(d=>d!=='Lainnya').map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');
  $('filterLocation').innerHTML='<option value="">Semua lokasi</option>'+LOCATIONS.filter(d=>d!=='Lainnya').map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');
  ['filterDepartment','filterLocation','filterMonth'].forEach(id=>$(id).addEventListener('change',loadData));
  $('clearFilters').addEventListener('click',()=>{['filterDepartment','filterLocation','filterMonth'].forEach(id=>$(id).value='');loadData();});
  $('refreshBtn').addEventListener('click',loadData);
}
async function loadData(){
  if(loading)return;
  loading=true;$('refreshBtn').disabled=true;notice('Memuat data survei…');
  try{
    const params=new URLSearchParams();
    ['Department','Location','Month'].forEach(word=>{const v=$('filter'+word).value.trim();if(v)params.set(word.toLowerCase(),v);});
    const result=await requestAdmin('/api/admin'+(params.size?'?'+params.toString():''));
    rows=result.rows||[];truncated=Boolean(result.truncated);
    notice(truncated?'Menampilkan 3.000 respons terbaru sesuai filter. Gunakan filter untuk mempersempit data saat ekspor.':'');
    renderDashboard();
  }catch(error){
    if(error.status===401){showLogin('Sesi admin telah berakhir. Silakan masuk kembali.');}
    else notice(error.message);
  }finally{loading=false;$('refreshBtn').disabled=false;}
}
function empty(message='Belum ada data untuk filter ini.') {return `<div class="feedback-empty">${escapeHtml(message)}</div>`;}
function renderDashboard(){
  const n=rows.length, happy=rows.filter(r=>r.overall>=4).length;
  const average=n?rows.reduce((sum,r)=>sum+Number(r.overall),0)/n:0;
  $('statTotal').textContent=n.toLocaleString('id-ID')+(truncated?'+':'');
  $('statCsat').textContent=n?`${percent(happy,n)}%`:'—';
  $('statAvg').textContent=n?`${average.toFixed(2).replace('.',',')} / 6`:'—';
  $('statHappy').textContent=happy.toLocaleString('id-ID');
  $('responseCount').textContent=`${n.toLocaleString('id-ID')} jawaban${truncated?' (dibatasi)':''}`;
  renderAspects();renderDistribution();renderPriorities();renderTrend();renderQuestions();renderFeedback();renderTable();
}
function ratingValues(ids){return rows.flatMap(r=>ids.map(id=>Number(r.ratings?.[id]||0)).filter(v=>Number.isInteger(v)&&v>=1&&v<=6));}
function avg(nums){return nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:0;}
function renderAspects(){
  $('aspectBars').innerHTML=GROUPS.map(g=>{
    const vals=ratingValues(g.questions.map(x=>x[0])),v=avg(vals);
    return `<div class="aspect-row"><div class="aspect-row-heading"><span>${escapeHtml(g.title)}</span><b>${vals.length?v.toFixed(2).replace('.',','):'N/A'}</b></div><div class="meter-track"><span style="width:${v*20}%"></span></div></div>`;
  }).join('');
}
function renderDistribution(){
  const c=[1,2,3,4,5].map(num=>rows.filter(r=>r.overall===num).length),max=Math.max(...c,1);
  $('ratingDistribution').innerHTML=c.map((count,i)=>`<div class="distribution-row"><span class="distribution-label">${i+1} ★</span><div class="distribution-track"><span style="width:${(count/max*100).toFixed(1)}%"></span></div><span class="distribution-number">${count}</span></div>`).join('');
}
function renderPriorities(){
  if(!rows.length){$('priorityList').innerHTML=empty();return;}
  const counts={};rows.forEach(r=>{if(r.priority)counts[r.priority]=(counts[r.priority]||0)+1;});
  const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6),max=sorted[0]?.[1]||1;
  $('priorityList').innerHTML=sorted.map(([name,num],index)=>`<div class="priority-row"><span class="priority-rank">${String(index+1).padStart(2,'0')}</span><div class="priority-info"><span class="priority-label" title="${escapeHtml(name)}">${escapeHtml(name)}</span><div class="priority-track"><span style="width:${num/max*100}%"></span></div></div><span class="priority-count">${num}</span></div>`).join('');
}
function renderTrend(){
  const months=new Map();for(const r of rows){
    const key=new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',timeZone:'Asia/Makassar'}).format(new Date(r.created_at)).slice(0,7);
    if(!months.has(key))months.set(key,[]);months.get(key).push(r.overall);
  }
  const series=Array.from(months.entries()).sort((a,b)=>a[0].localeCompare(b[0])).slice(-6).map(([key,list])=>({key,val:percent(list.filter(v=>v>=4).length,list.length)}));
  if(!series.length){$('trendChart').innerHTML='<div class="trend-empty">Grafik akan muncul setelah ada tanggapan.</div>';return;}
  const W=480,H=206,left=35,right=25,top=22,bottom=36;
  const X=i=>left+(series.length===1?(W-left-right)/2:i*(W-left-right)/(series.length-1));
  const Y=v=>top+(100-v)*(H-top-bottom)/100;
  const pts=series.map((p,i)=>[X(i),Y(p.val)]);
  const line=pts.map((p,i)=>`${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const filled=`${line} L${X(series.length-1).toFixed(1)},${H-bottom} L${X(0).toFixed(1)},${H-bottom} Z`;
  let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik tren CSAT per bulan"><defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#37b99a" stop-opacity=".22"/><stop offset="1" stop-color="#37b99a" stop-opacity="0"/></linearGradient></defs>`;
  [0,25,50,75,100].forEach(v=>{svg+=`<line x1="${left}" x2="${W-right}" y1="${Y(v)}" y2="${Y(v)}" stroke="#edf2f3" stroke-dasharray="3 4"/><text x="${left-9}" y="${Y(v)+4}" text-anchor="end" fill="#a1afb6" font-size="10">${v}</text>`;});
  svg+=`<path d="${filled}" fill="url(#trendFill)"/><path d="${line}" fill="none" stroke="#1ca489" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  series.forEach((item,i)=>{svg+=`<circle cx="${X(i)}" cy="${Y(item.val)}" r="5" fill="white" stroke="#16a184" stroke-width="3"/><text x="${X(i)}" y="${Y(item.val)-13}" text-anchor="middle" font-size="11" font-weight="700" fill="#159a85">${item.val}%</text><text x="${X(i)}" y="${H-12}" text-anchor="middle" font-size="10" fill="#8499a6">${escapeHtml(monthFormat(item.key+'-01T12:00:00+08:00'))}</text>`;});
  svg+='</svg>';$('trendChart').innerHTML=svg;
}
function renderQuestions(){
  $('questionRows').innerHTML=GROUPS.flatMap(g=>g.questions.map(([id,label])=>{
    const values=ratingValues([id]),v=avg(values);
    return `<div class="question-insight"><div class="question-insight-top"><span>${escapeHtml(label)}</span><b>${values.length?v.toFixed(2).replace('.',','):'—'}</b></div><div class="meter-track"><span style="width:${v*100/6}%"></span></div><small>${values.length} penilaian valid · N/A dikecualikan</small></div>`;
  })).join('');
}
function renderFeedback(){
  const feedback=rows.filter(r=>r.issues||r.suggestion).slice(0,30);
  $('feedbackCount').textContent=`${rows.filter(r=>r.issues||r.suggestion).length} tanggapan`;
  $('feedbackList').innerHTML=feedback.length?feedback.map(r=>`<article class="feedback-item"><p class="feedback-quote">${escapeHtml(r.suggestion||r.issues)}</p>${r.suggestion&&r.issues?`<p class="feedback-quote" style="color:#81919b">Kendala: ${escapeHtml(r.issues)}</p>`:''}<div class="feedback-meta"><strong>${escapeHtml(r.department)}</strong><span>· ${escapeHtml(r.location)}</span><span>· ${escapeHtml(dateFormat(r.created_at))}</span></div></article>`).join(''):empty('Belum ada saran atau masukan yang ditulis.');
}
function renderTable(){
  $('responseRows').innerHTML=rows.length?rows.slice(0,60).map(r=>`<tr><td>${escapeHtml(dateFormat(r.created_at))}</td><td>${escapeHtml(r.name||'Anonim')}</td><td>${escapeHtml(r.department)}</td><td>${escapeHtml(r.location)}</td><td><span class="score-badge ${r.overall<3?'low':r.overall===3?'mid':''}">${r.overall} / 5</span></td><td title="${escapeHtml(r.priority||'')}">${escapeHtml(r.priority||'—')}</td></tr>`).join(''):`<tr><td colspan="6" class="empty-table">Belum ada jawaban yang tercatat.</td></tr>`;
  const foot=document.querySelector('.table-footnote');foot.textContent=`Menampilkan ${Math.min(rows.length,60)} baris pertama. Ekspor CSV memuat ${rows.length} jawaban hasil filter${truncated?' (batas maksimum 3.000)':''}.`;
}
function csvSafe(value){let s=String(value??'');if(/^\s*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function exportCsv(){
  if(!rows.length){notice('Tidak ada data untuk diekspor.');return;}
  const cols=[['Tanggal WITA',r=>dateFormat(r.created_at)],['Nama',r=>r.name||'Anonim'],['Departemen',r=>r.department],['Lokasi',r=>r.location],
    ...GROUPS.flatMap(g=>g.questions.map(([id,label])=>[`${g.title}: ${label}`,r=>r.ratings?.[id]===0?'N/A':(r.ratings?.[id]??'')])),
    ['Nilai Kepuasan Keseluruhan (1-6)',r=>r.overall],['Dukungan IT',r=>r.support],['Kendala',r=>r.issues],['Prioritas Perbaikan',r=>r.priority],['Saran',r=>r.suggestion]];
  const data=[cols.map(c=>csvSafe(c[0])).join(','),...rows.map(r=>cols.map(c=>csvSafe(c[1](r))).join(','))].join('\r\n');
  const blob=new Blob(['\uFEFF'+data],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`SJR_IT_Survey_${new Date().toISOString().slice(0,10)}.csv`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
$('loginForm').addEventListener('submit',async e=>{
  e.preventDefault();$('loginBtn').disabled=true;$('loginError').hidden=true;
  try{
    await requestAdmin('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',password:$('adminPassword').value})});
    $('adminPassword').value='';showDashboard();await loadData();
  }catch(error){showLogin(error.message);}
  finally{$('loginBtn').disabled=false;}
});
$('logoutBtn').addEventListener('click',async()=>{try{await requestAdmin('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});}catch{}rows=[];showLogin();});
$('exportBtn').addEventListener('click',exportCsv);
setupFilters();
(async()=>{try{await requestAdmin('/api/admin');showDashboard();await loadData();}catch(error){showLogin(error.status===401?'':error.message);}})();
