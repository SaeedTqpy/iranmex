import {createInterface} from 'node:readline';
import {Writable} from 'node:stream';
import {createAdministrator} from '../lib/server/admin-store.mjs';

const args=process.argv.slice(2);
const reset=args[0]==='--reset';
const username=args[reset?1:0];
if(!username||args.length!==(reset?2:1)){console.error('Usage: npm run admin:create -- USERNAME  |  npm run admin:reset -- USERNAME');process.exit(1);}
if(!process.stdin.isTTY||!process.stderr.isTTY){console.error('A secure interactive terminal is required. Do not pass passwords in command arguments or environment variables.');process.exit(1);}
let muted=false;
const output=new Writable({write(chunk,encoding,done){if(!muted)process.stderr.write(chunk,encoding);done();}});
const rl=createInterface({input:process.stdin,output,terminal:true});
const ask=prompt=>new Promise(resolve=>{process.stderr.write(prompt);muted=true;rl.question('',answer=>{muted=false;process.stderr.write('\n');resolve(answer);});});
try {
  const password=await ask('رمز عبور جدید (حداقل ۱۶ نویسه؛ هنگام تایپ نمایش داده نمی‌شود): ');
  const confirm=await ask('تکرار رمز عبور: ');
  if(password!==confirm)throw new Error('Passwords do not match.');
  await createAdministrator(username,password,{reset});
  console.log(reset?'Password changed; existing sessions revoked.':'Administrator account created.');
} catch(error){console.error(`Account setup failed: ${error.message}`);process.exitCode=1;}
finally{rl.close();}
