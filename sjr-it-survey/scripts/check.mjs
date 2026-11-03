import { existsSync } from 'node:fs';
for(const file of ['public/index.html','public/admin.html','public/assets/app.js','public/assets/admin.js','netlify/functions/submit.mjs','netlify/functions/admin.mjs','netlify/database/migrations/20261103000100_create_it_survey.sql']){
  if(!existsSync(file))throw new Error(`Missing required file: ${file}`);
}
console.log('SJR IT Voice: file proyek lengkap, siap di-build Netlify.');
