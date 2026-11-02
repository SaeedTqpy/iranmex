import Database from 'better-sqlite3';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const target=process.argv[2];
if(!target){console.error('Usage: node scripts/export-registrations.mjs /private/path/registrations.csv');process.exit(1);}
const db=new Database(process.env.REGISTRATION_DB_PATH||resolve('.data/registrations.sqlite'),{readonly:true,fileMustExist:true});
try {
  const rows=db.prepare('SELECT id,type,status,created_at,payload FROM registrations ORDER BY created_at').all();
  const columns=['reference','type','status','createdAt','firstName','lastName','mobile','jobTitle','experience','city','email','referral','companyName','activity','website','requestedArea','notes'];
  function cell(value){let text=String(value??'');if(/^[\s]*[=+@\-]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
  const lines=[columns.map(cell).join(',')];
  for(const row of rows){const values={...JSON.parse(row.payload),reference:row.id,type:row.type,status:row.status,createdAt:new Date(row.created_at).toISOString()};lines.push(columns.map(key=>cell(values[key])).join(','));}
  writeFileSync(resolve(target),'\uFEFF'+lines.join('\r\n'),{mode:0o600,flag:'wx'});
  console.log(`Exported ${rows.length} records. Keep the output file private.`);
} finally {db.close();}
