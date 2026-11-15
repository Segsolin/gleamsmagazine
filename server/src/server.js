import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pool} from './db.js';
import publicRoutes from './routes-public.js';
import adminRoutes from './routes-admin.js';

const app=express();
const here=path.dirname(fileURLToPath(import.meta.url));
app.disable('x-powered-by');
app.set('trust proxy',process.env.TRUST_PROXY==='true'?1:false);
app.use(helmet({contentSecurityPolicy:false,crossOriginResourcePolicy:{policy:'cross-origin'}}));
app.use(express.json({limit:'1mb'}));
app.use(cookieParser());
const uploads=process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.resolve(here,'../uploads');
app.use('/uploads',express.static(uploads,{dotfiles:'deny',maxAge:'7d',index:false}));
app.get('/api/health',async(req,res)=>{
  try{await pool.query('SELECT 1');res.json({ok:true,service:'Gleams CMS API'});}catch{res.status(503).json({ok:false,error:'Database unavailable'});}
});
app.use('/api',rateLimit({windowMs:60*1000,limit:180,standardHeaders:'draft-7',legacyHeaders:false}));
app.use('/api/admin',adminRoutes);
app.use('/api',publicRoutes);
app.use('/api',(req,res)=>res.status(404).json({error:'API endpoint not found'}));

// Optional: serve Vite production build from this API when deployed on a Node-capable host.
const dist=path.resolve(here,'../../web/dist');
app.use(express.static(dist,{maxAge:'1h',index:false}));
app.get(/^(?!\/api(?:\/|$)|\/uploads(?:\/|$)).*/, (req,res)=>res.sendFile(path.join(dist,'index.html'),e=>{if(e && !res.headersSent) res.status(404).send('Frontend not built. Run npm run build.');}));
app.use((err,req,res,next)=>{
  const code=err.code==='LIMIT_FILE_SIZE'?413:(err.code==='LIMIT_UNEXPECTED_FILE'?400:(err.status||err.statusCode||(err.code==='ER_DUP_ENTRY'?409:500))); 
  if(code>=500) console.error('[GLEAMS API]',err);
  res.status(code).json({error:code>=500?'Unexpected server error':err.message});
});

const port=Number(process.env.PORT||5100);
if(!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.SESSION_SECRET || process.env.SESSION_SECRET.length<32 || (process.env.NODE_ENV==='production' && !process.env.PUBLIC_ORIGIN)){ 
  console.error('[GLEAMS] Configure DB_USER, DB_PASSWORD, SESSION_SECRET (32+ chars), and PUBLIC_ORIGIN in production.');
  process.exit(1);
}
try {
  await pool.query('SELECT 1');
  app.listen(port,()=>console.log(`[GLEAMS API] listening on http://localhost:${port} (${process.env.NODE_ENV||'development'})`));
} catch(error){
  console.error('[GLEAMS] Database connection failed:',error.code||error.message);
  console.error(`[GLEAMS] DB_HOST=${process.env.DB_HOST} DB_NAME=${process.env.DB_NAME} DB_PORT=${process.env.DB_PORT||3306}`);
  console.error('[GLEAMS] Check credentials, remote MySQL allowlisting, and that schema has been installed.');
  process.exit(1);
}
