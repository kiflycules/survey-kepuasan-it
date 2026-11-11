
import { GROUPS, OPEN_QUESTION_IDS, DEPARTMENTS, LOCATIONS, PRIORITIES, SUPPORT_OPTIONS, RATING_LABELS, icon } from './questions.js';

const state = { step: 0, name: '', departmentChoice:'', departmentOther:'', locationChoice:'', locationOther:'', ratings:{}, openAnswers:{}, overall:null, support:'', issues:'', priority:'', priorityOther:'', optimizationService:'', suggestion:'', companyWebsite:'' };
const steps = [
  ['Profil responden','Tentang Anda'],
  ['Pelayanan IT','Kualitas layanan'],
  ['Sistem & infrastruktur','Fasilitas IT'],
  ['Teknologi & optimasi','Pengembangan & delivery data'],
  ['Ulasan akhir','Saran & masukan']
];
const stepDescriptions = [
  'Kenalan singkat dulu, agar kami dapat memahami kebutuhan di setiap area kerja.',
  'Nilai pengalaman Anda saat mendapat bantuan dari tim IT dalam 3 bulan terakhir.',
  'Bagaimana kualitas infrastruktur, perangkat, dan aplikasi yang Anda gunakan?',
  'Beri penilaian teknologi serta dukungan optimalisasi dari Departemen IOT.',
  'Hampir selesai! Ceritakan apa yang sudah baik dan apa yang bisa kami tingkatkan.'
];
const $ = id => document.getElementById(id);
const escapeHtml = str => String(str ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function optionsHtml(items, selected, placeholder) {
  return `<option value="">${escapeHtml(placeholder)}</option>` + items.map(item => `<option value="${escapeHtml(item)}" ${selected===item?'selected':''}>${escapeHtml(item)}</option>`).join('');
}
function navHtml(){
  return steps.map(([name,sub], i) => `<div class="step-nav-item ${i===state.step?'active':i<state.step?'done':''}" ${i===state.step?'aria-current="step"':''}><span class="step-number">${i<state.step?'\u2713':String(i+1).padStart(2,'0')}</span><span><strong>${name}</strong><small>${sub}</small></span></div>`).join('');
}
function profileHtml(){
  return `<div class="field-grid">
    <div class="field full"><label for="respondentName">Nama responden <span class="optional">(opsional)</span></label><input type="text" maxlength="80" id="respondentName" placeholder="Nama boleh dikosongkan untuk survei anonim" value="${escapeHtml(state.name)}"><small>Identitas tidak wajib. Jawaban digunakan untuk perbaikan layanan, bukan penilaian individu.</small></div>
    <div class="field"><label for="department">Departemen <span class="required-star">*</span></label><select id="department">${optionsHtml(DEPARTMENTS,state.departmentChoice,'Pilih departemen')}</select></div>
    <div class="field"><label for="location">Lokasi kerja <span class="required-star">*</span></label><select id="location">${optionsHtml(LOCATIONS,state.locationChoice,'Pilih lokasi kerja')}</select></div>
    <div class="field full" id="otherDepartmentBox" ${state.departmentChoice==='Lainnya'?'':'hidden'}><label for="otherDepartment">Nama departemen lainnya <span class="required-star">*</span></label><input id="otherDepartment" maxlength="60" placeholder="Tuliskan departemen" value="${escapeHtml(state.departmentOther)}"></div>
    <div class="field full" id="otherLocationBox" ${state.locationChoice==='Lainnya'?'':'hidden'}><label for="otherLocation">Lokasi kerja lainnya <span class="required-star">*</span></label><input id="otherLocation" maxlength="60" placeholder="Tuliskan lokasi kerja" value="${escapeHtml(state.locationOther)}"></div>
  </div>
  <div class="tip-card"><div class="tip-icon">&#10035;</div><div><strong>Penilaian yang jujur adalah langkah awal perubahan.</strong><p>Survei ini tidak meminta NRP maupun nomor kontak. Pilih N/A pada layanan yang belum pernah Anda gunakan. Mohon mengisi survei satu kali per periode.</p></div></div>`;
}
function ratingHtml(id,index, label){
  const selected=state.ratings[id];
  return `<article class="question-card" data-question="${id}"><div class="question-top"><span class="question-index">${String(index+1).padStart(2,'0')}</span><span class="question-text">${escapeHtml(label)}</span></div><div class="rating-options" role="radiogroup" aria-label="${escapeHtml(label)}">
    ${[1,2,3,4,5,6,0].map(value=>`<label class="rating-choice ${selected===value?'selected':''}"><input type="radio" name="rating_${id}" value="${value}" ${selected===value?'checked':''} aria-label="${value===0?'Tidak relevan':RATING_LABELS[value-1]}"><span>${value===0?'—':value}</span><small>${value===0?'Tidak relevan':escapeHtml(RATING_LABELS[value-1])}</small></label>`).join('')}
  </div><div class="rating-help"><span>1 = Sangat Tidak Puas</span><span>6 = Sangat Puas · N/A = Tidak relevan</span></div></article>`;
}
function openQuestionHtml(id,index,label){
  const answer=state.openAnswers[id] || '';
  return `<article class="question-card open-response-card" data-question="${id}">
    <div class="question-top"><span class="question-index">${String(index+1).padStart(2,'0')}</span><span class="question-text">${escapeHtml(label)}</span></div>
    <div class="field"><label for="open_${id}" class="optional">Jawaban bebas (opsional)</label><textarea id="open_${id}" maxlength="1200" rows="4" placeholder="Tuliskan usulan atau kebutuhan departemen Anda...">${escapeHtml(answer)}</textarea></div>
  </article>`;
}
function questionsHtml(groups){
  const all=GROUPS.flatMap(g=>g.questions);
  return `<div class="tip-card" style="margin:0 0 25px"><span class="tip-icon">&#9678;</span><div><strong>Gunakan skala 1 sampai 6</strong><p>Pilih nilai sesuai pengalaman Anda. Bila tidak pernah menggunakan layanan tersebut, pilih N/A (tidak relevan).</p></div></div>`+groups.map(group=>`<div class="group-block"><div class="group-head"><span class="group-icon">${icon(group.icon,21)}</span><div><span class="eyebrow-small">ASPEK ${group.number}</span><h3>${group.title}</h3><p>${group.subtitle}</p></div></div>${group.questions.map(([id,text,type])=>type==='text'?openQuestionHtml(id,all.findIndex(q=>q[0]===id),text):ratingHtml(id,all.findIndex(q=>q[0]===id),text)).join('')}</div>`).join('');
}
function feedbackHtml(){
  return `<div class="overall-question"><h3>Secara keseluruhan, seberapa puas Anda terhadap layanan IT SJR?</h3><p>Nilai ini menjadi dasar utama penghitungan Customer Satisfaction Score (CSAT).</p><div class="overall-rating" role="radiogroup" aria-label="Kepuasan keseluruhan">${[1,2,3,4,5,6].map(num=>`<label class="overall-item ${state.overall===num?'selected':''}"><input type="radio" name="overall" value="${num}" ${state.overall===num?'checked':''}><span class="star">&#9733;</span><b>${num}</b><small>${RATING_LABELS[num-1]}</small></label>`).join('')}</div></div>
    <div class="feedback-grid"><div class="field"><span class="field-title">Seberapa jauh layanan IOT mendukung pekerjaan Anda? <span class="required-star">*</span></span><div class="support-choices">${SUPPORT_OPTIONS.map(o=>`<label><input type="radio" name="support" value="${escapeHtml(o)}" ${state.support===o?'checked':''}> ${escapeHtml(o)}</label>`).join('')}</div></div>
    <div class="field"><label for="issues">Kendala IT yang paling sering Anda alami <span class="optional">(opsional)</span></label><textarea id="issues" maxlength="1000" placeholder="Contoh: koneksi Wi-Fi sering terputus di area kerja...">${escapeHtml(state.issues)}</textarea></div>
    <div class="field"><span class="field-title">Layanan yang paling perlu ditingkatkan <span class="required-star">*</span></span><div class="priority-choices">${PRIORITIES.map(p=>`<label class="priority-item"><input type="radio" name="priority" value="${escapeHtml(p)}" ${state.priority===p?'checked':''}> ${escapeHtml(p)}</label>`).join('')}</div></div>
    <div class="field" id="otherPriorityBox" ${state.priority==='Lainnya'?'':'hidden'}><label for="priorityOther">Jelaskan layanan lainnya yang perlu ditingkatkan <span class="required-star">*</span></label><textarea id="priorityOther" maxlength="1000" rows="3" placeholder="Tuliskan layanan yang ingin ditingkatkan...">${escapeHtml(state.priorityOther)}</textarea></div>
    <div class="field"><label for="optimizationService">Pelayanan optimalisasi apa yang bisa dibantu oleh Departemen IOT? <span class="optional">(jawaban bebas, opsional)</span></label><textarea id="optimizationService" maxlength="1200" rows="4" placeholder="Contoh: otomatisasi rekap data, dashboard kerja, atau integrasi aplikasi...">${escapeHtml(state.optimizationService)}</textarea></div>
    <div class="field"><label for="suggestion">Saran atau masukan untuk tim IOT <span class="optional">(opsional)</span></label><textarea id="suggestion" maxlength="1500" placeholder="Kami ingin mendengar ide Anda agar layanan IOT semakin baik...">${escapeHtml(state.suggestion)}</textarea></div>
    <div class="tip-card" style="margin-top:0"><span class="tip-icon">&#9825;</span><div><strong>Terima kasih atas masukan Anda.</strong><p>Semua tanggapan akan dirangkum untuk evaluasi dan prioritas improvement tim IOT SJR.</p></div></div></div>
    <div aria-hidden="true" hidden><label for="companyWebsite">Website perusahaan</label><input id="companyWebsite" autocomplete="off" tabindex="-1" value="${escapeHtml(state.companyWebsite)}"></div>`;
}
function bindFields(){
  const bindInput=(id,key)=>{ const el=$(id); if(el)el.addEventListener('input',()=>{state[key]=el.value;clearError();});};
  bindInput('respondentName','name');bindInput('otherDepartment','departmentOther');bindInput('otherLocation','locationOther');bindInput('issues','issues');bindInput('optimizationService','optimizationService');bindInput('priorityOther','priorityOther');bindInput('suggestion','suggestion');bindInput('companyWebsite','companyWebsite');
  OPEN_QUESTION_IDS.forEach(id => {const el=$(`open_${id}`);if(el)el.addEventListener('input',()=>{state.openAnswers[id]=el.value;clearError();});});
  ['department','location'].forEach(id=>{const el=$(id);if(!el)return;el.addEventListener('change',()=>{const key=id==='department'?'departmentChoice':'locationChoice';state[key]=el.value;$(id==='department'?'otherDepartmentBox':'otherLocationBox').hidden=el.value!=='Lainnya';clearError();});});
  document.querySelectorAll('input[type="radio"]').forEach(el=>el.addEventListener('change',()=>{
    if(el.name.startsWith('rating_')){state.ratings[el.name.slice(7)]=Number(el.value);const card=el.closest('.question-card');card.classList.remove('invalid');card.querySelectorAll('.rating-choice').forEach(node=>node.classList.toggle('selected',node.contains(el)));}
    if(el.name==='overall'){state.overall=Number(el.value);document.querySelectorAll('.overall-item').forEach(node=>node.classList.toggle('selected',node.contains(el)));}
    if(el.name==='support')state.support=el.value;
    if(el.name==='priority'){state.priority=el.value;const box=$('otherPriorityBox');if(box)box.hidden=state.priority!=='Lainnya';}
    clearError();
  }));
}
function clearError(){ $('formError').hidden=true; }
function showError(message){ const el=$('formError');el.textContent=message;el.hidden=false;el.scrollIntoView({behavior:'smooth',block:'nearest'}); }
function validate(){
  if(state.step===0){
    if(!state.departmentChoice || !state.locationChoice){showError('Pilih departemen dan lokasi kerja terlebih dahulu.');return false;}
    if(state.departmentChoice==='Lainnya' && !state.departmentOther.trim()){showError('Isi nama departemen lainnya.');return false;}
    if(state.locationChoice==='Lainnya' && !state.locationOther.trim()){showError('Isi lokasi kerja lainnya.');return false;}
    return true;
  }
  if(state.step>=1 && state.step<=3){
    const groups=state.step===1?GROUPS.slice(0,3):state.step===2?GROUPS.slice(3,5):GROUPS.slice(5,7);
    const missing=groups.flatMap(g=>g.questions).filter(([id,,type])=>type!=='text' && state.ratings[id]===undefined);
    if(missing.length){missing.forEach(([id])=>document.querySelector(`[data-question="${id}"]`)?.classList.add('invalid'));showError(`Masih ada ${missing.length} pertanyaan yang belum dipilih. Gunakan N/A bila tidak relevan.`);return false;}
    return true;
  }
  if(!state.overall){showError('Pilih penilaian kepuasan secara keseluruhan.');return false;}
  if(!state.support){showError('Pilih apakah pelayanan IOT mendukung pekerjaan Anda.');return false;}
  if(!state.priority){showError('Pilih satu layanan yang perlu diprioritaskan untuk ditingkatkan.');return false;}
  if(state.priority==='Lainnya' && !state.priorityOther.trim()){showError('Tuliskan layanan lainnya yang perlu ditingkatkan.');return false;}
  return true;
}
function render(){
  $('stepsNav').innerHTML=navHtml();const progress=Math.round((state.step+1)/steps.length*100);$('progressPercent').textContent=`${progress}%`;$('progressBar').style.width=`${progress}%`;
  $('sidebarShield').innerHTML=icon('shield',18);
  $('stepEyebrow').textContent=`TAHAP ${String(state.step+1).padStart(2,'0')} / ${String(steps.length).padStart(2,'0')}`;
  $('stepTitle').textContent=steps[state.step][0];$('stepDesc').textContent=stepDescriptions[state.step];
  $('stepContainer').innerHTML=state.step===0?profileHtml():state.step===1?questionsHtml(GROUPS.slice(0,3)):state.step===2?questionsHtml(GROUPS.slice(3,5)):state.step===3?questionsHtml(GROUPS.slice(5,7)):feedbackHtml();
  $('backBtn').hidden=state.step===0;
  $('nextBtn').innerHTML=state.step===steps.length-1?`Kirim Penilaian ${icon('check',17)}`:`Lanjutkan ${icon('arrow',16)}`;
  clearError();bindFields();
}
async function submit(){
  const button=$('nextBtn');button.disabled=true;button.textContent='Mengirim penilaian…';
  const payload={name:state.name.trim(),department:state.departmentChoice==='Lainnya'?state.departmentOther.trim():state.departmentChoice,location:state.locationChoice==='Lainnya'?state.locationOther.trim():state.locationChoice,ratings:state.ratings,openAnswers:state.openAnswers,overall:state.overall,support:state.support,issues:state.issues.trim(),priority:state.priority,priorityOther:state.priority==='Lainnya'?state.priorityOther.trim():'',optimizationService:state.optimizationService.trim(),suggestion:state.suggestion.trim(),companyWebsite:state.companyWebsite};
  try{
    const response=await fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    let body;try{body=await response.json();}catch{body={};}
    if(!response.ok)throw new Error(body.error || 'Server belum siap. Pastikan Vercel Blob terhubung ke proyek.');
    $('surveyShell').hidden=true;
    $('successPanel').hidden=false;
    $('successPanel').innerHTML=`<div class="success-icon">&#10003;</div><span class="eyebrow-small">SUBMISSION SUCCESSFUL</span><h2>Terima kasih banyak!</h2><p>Penilaian Anda berhasil tercatat. Setiap suara membantu tim IOT SJR bekerja lebih baik untuk semua karyawan.</p><button type="button" class="btn btn-primary" id="restartSurvey">Isi Survei Lagi &#8594;</button>`;
    $('restartSurvey').addEventListener('click',()=>location.reload());
    window.scrollTo({top:170,behavior:'smooth'});
  }catch(error){showError(error.message || 'Gagal mengirim. Coba lagi.');}
  finally{button.disabled=false;if(!$('surveyShell').hidden)button.innerHTML=`Kirim Penilaian ${icon('check',17)}`;}
}
$('backBtn').addEventListener('click',()=>{if(state.step>0){state.step--;render();$('surveyShell').scrollIntoView({behavior:'smooth',block:'start'});}});
$('nextBtn').addEventListener('click',async()=>{if(!validate())return;if(state.step<steps.length-1){state.step++;render();$('surveyShell').scrollIntoView({behavior:'smooth',block:'start'});}else await submit();});
render();
