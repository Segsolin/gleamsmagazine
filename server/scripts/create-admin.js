import 'dotenv/config';
import {createInterface} from 'node:readline/promises';
import {stdin,stdout} from 'node:process';
import {pool,query} from '../src/db.js';
import {hashPassword} from '../src/auth.js';
import {cleanEmail,validEmail} from '../src/utils.js';
async function main(){
  const rl=createInterface({input:stdin,output:stdout});
  let name=process.env.ADMIN_NAME||'',email=process.env.ADMIN_EMAIL||'',password=process.env.ADMIN_PASSWORD||'';
  try{
    if(!name) name=await rl.question('Admin name: ');
    if(!email) email=await rl.question('Admin email: ');
    if(!password) password=await rl.question('Admin password (input visible; use ADMIN_PASSWORD environment variable for privacy): ');
  }finally{rl.close();}
  email=cleanEmail(email);
  if(!name.trim()||!validEmail(email)||password.length<12) throw new Error('Name, valid email and password of at least 12 characters required');
  const [existing]=await query('SELECT id FROM admin_users WHERE email=?',[email]);
  if(existing) throw new Error('That admin email already exists; change the password from the dashboard instead');
  const [count]=await query('SELECT COUNT(*) AS total FROM admin_users');
  const role=count.total?'editor':'super_admin';
  await query('INSERT INTO admin_users (name,email,password_hash,role) VALUES (?,?,?,?)',[name.trim(),email,await hashPassword(password),role]);
  console.log(`Admin created: ${email} (${role}). Additional super admins can be created from dashboard > Team.`);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>pool.end());
