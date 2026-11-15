import 'dotenv/config';
import {pool} from '../src/db.js';
const required=['DB_HOST','DB_NAME','DB_USER','DB_PASSWORD','SESSION_SECRET','PUBLIC_ORIGIN'];
let fail=false;
for(const name of required){const value=process.env[name];console.log(`${value?'OK':'MISSING'} ${name}${name==='DB_HOST'&&value?': '+value:''}${name==='DB_NAME'&&value?': '+value:''}`);if(!value)fail=true;}
if(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32){console.log('ERROR: SESSION_SECRET must be at least 32 characters');fail=true;}
if(fail){console.error('Fill in server/.env before running the project.');process.exitCode=1;}else{
 try{
  const [version]=await pool.query('SELECT VERSION() AS version');
  console.log('OK MySQL connection:',version[0].version);
  const [tables]=await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema=DATABASE()");
  const found=new Set(tables.map(t=>Object.values(t)[0]));
  const expected=['admin_users','site_settings','pages','page_sections','categories','posts','navigation_items','media','collections','collection_items','contact_messages','subscribers','audit_logs'];
  const missing=expected.filter(t=>!found.has(t));
  if(missing.length){console.error('Missing tables:',missing.join(', '));console.error('Run npm run db:setup');process.exitCode=1;}else console.log(`OK Database schema (${expected.length} tables)`);
 }catch(e){console.error('ERROR MySQL connection:',e.code||e.message);process.exitCode=1;}
}
await pool.end();
