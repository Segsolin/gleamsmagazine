import {Router} from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import {randomUUID} from 'node:crypto';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {query,logAction} from './db.js';
import {asyncRoute,httpError,cleanEmail,validEmail,cleanSlug,onlyString,parseJSON} from './utils.js';
import {requireAdmin,requireSuperAdmin,setLoginCookie,clearLoginCookie,csrfCheck,verifyPassword,hashPassword} from './auth.js';

const router=Router();
const loginLimit=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Too many login attempts. Try again shortly.'}});
const uploadDir=process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../uploads');
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:8*1024*1024,files:1},fileFilter(req,file,cb){
  if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.mimetype)) return cb(httpError(400,'Upload JPG, PNG, WebP or GIF images only'));
  cb(null,true);
}});

router.post('/auth/login',csrfCheck,loginLimit,asyncRoute(async(req,res)=>{
  const email=cleanEmail(req.body?.email),password=String(req.body?.password||'');
  if(!validEmail(email)||!password) throw httpError(400,'Email and password are required');
  const users=await query('SELECT * FROM admin_users WHERE email=? LIMIT 1',[email]);
  const user=users[0];
  if(!user || !user.active || !(await verifyPassword(password,user.password_hash))) throw httpError(401,'Incorrect email or password');
  setLoginCookie(res,user);
  await logAction(user.id,'sign_in','admin_user',user.id);
  res.json({user:{id:user.id,name:user.name,email:user.email,role:user.role}});
}));
router.use(requireAdmin,csrfCheck);
router.get('/auth/me',(req,res)=>res.json({user:req.user}));
router.post('/auth/logout',(req,res)=>{clearLoginCookie(res);res.json({success:true});});
router.post('/auth/password',asyncRoute(async(req,res)=>{
  const {current_password,new_password}=req.body||{};
  if(typeof new_password!=='string'||new_password.length<12) throw httpError(400,'New password must be at least 12 characters');
  const result=await query('SELECT password_hash FROM admin_users WHERE id=?',[req.user.id]);
  if(!await verifyPassword(String(current_password||''),result[0].password_hash)) throw httpError(400,'Current password is incorrect');
  await query('UPDATE admin_users SET password_hash=? WHERE id=?',[await hashPassword(new_password),req.user.id]);
  await logAction(req.user.id,'password_changed','admin_user',req.user.id);
  clearLoginCookie(res);res.json({success:true,message:'Password changed. Sign in again.'});
}));
router.get('/dashboard',asyncRoute(async(req,res)=>{
  const [pageCount,postCount,messageCount,subscriberCount,mediaCount,latest]=await Promise.all([
    query('SELECT COUNT(*) total FROM pages'),query('SELECT COUNT(*) total FROM posts'),query("SELECT COUNT(*) total FROM contact_messages WHERE status='new'"),
    query('SELECT COUNT(*) total FROM subscribers'),query('SELECT COUNT(*) total FROM media'),
    query('SELECT id,full_name,email,subject,created_at FROM contact_messages ORDER BY id DESC LIMIT 5')
  ]);
  res.json({pages:pageCount[0].total,posts:postCount[0].total,newMessages:messageCount[0].total,subscribers:subscriberCount[0].total,media:mediaCount[0].total,recentMessages:latest});
}));

const resources={
  pages:{table:'pages',fields:['slug','title','subtitle','description','template','cover_image','seo_title','seo_description','status','position'],required:['title','slug'],order:'position,id',values:{status:['draft','published']}},
  sections:{table:'page_sections',fields:['page_id','type','label','heading','subheading','body','media_url','button_label','button_url','config','position','visible'],required:['page_id','type'],json:['config'],order:'page_id,position,id'},
  posts:{table:'posts',fields:['slug','title','excerpt','body','cover_image','category_id','status','featured','published_at','seo_title','seo_description'],required:['title','slug'],order:'updated_at DESC,id DESC',values:{status:['draft','published']}},
  categories:{table:'categories',fields:['name','slug','description'],required:['name','slug'],order:'name,id'},
  navigation:{table:'navigation_items',fields:['label','path','location','position','target','visible'],required:['label','path'],order:'location,position,id',values:{location:['header','footer'],target:['_self','_blank']}},
  collections:{table:'collections',fields:['title','slug','description','position'],required:['title','slug'],order:'position,id'},
  collection_items:{table:'collection_items',fields:['collection_id','title','slug','description','body','image_url','link_url','metadata','position','status'],required:['collection_id','title','slug'],json:['metadata'],order:'collection_id,position,id',values:{status:['draft','published']}}
};
function resourceFor(req) {const resource=resources[req.params.resource];if(!resource) throw httpError(404,'Unknown resource');return resource;}
function prepareInput(def,body,create){
  if(!body || typeof body!=='object' || Array.isArray(body)) throw httpError(400,'Invalid object');
  const data={};
  for(const field of def.fields){
    if(!(field in body)) continue;
    let val=body[field];
    if(['slug'].includes(field)) val=cleanSlug(val);
    else if(def.json?.includes(field)){if(val!==null) { const v=parseJSON(val,null); if(v===null) throw httpError(400,`Invalid JSON in ${field}`); val=JSON.stringify(v);}}
    else if(['position','page_id','category_id','collection_id'].includes(field)){if(val==='' || val===null) val=null; else {val=Number(val);if(!Number.isSafeInteger(val)||val<0) throw httpError(400,`Invalid ${field}`);}}
    else if(['visible','featured'].includes(field)) val=val?1:0;
    else if(field==='published_at') val=val?new Date(val):null;
    else if(typeof val==='string') val=val.slice(0,['body','description'].includes(field)?100000:field==='excerpt'?2000:1000);
    if(def.values?.[field] && !def.values[field].includes(val)) throw httpError(400,`Invalid ${field}`);
    data[field]=val;
  }
  if(create){for(const f of def.required||[]){if(!data[f]) throw httpError(400,`${f} is required`);}}
  return data;
}
function dbErrorFriendly(e){
  if(e?.code==='ER_DUP_ENTRY') throw httpError(409,'This slug or unique value is already in use');
  if(e?.code==='ER_NO_REFERENCED_ROW_2') throw httpError(400,'Select an existing related record');
  throw e;
}
router.get('/data/:resource',asyncRoute(async(req,res)=>{
  const def=resourceFor(req);
  let where='',args=[];
  if(req.params.resource==='sections' && req.query.page_id){where=' WHERE page_id=?';args=[Number(req.query.page_id)];}
  if(req.params.resource==='collection_items' && req.query.collection_id){where=' WHERE collection_id=?';args=[Number(req.query.collection_id)];}
  res.json(await query(`SELECT * FROM ${def.table}${where} ORDER BY ${def.order} LIMIT 1000`,args));
}));
router.get('/data/:resource/:id',asyncRoute(async(req,res)=>{
  const def=resourceFor(req); const rows=await query(`SELECT * FROM ${def.table} WHERE id=?`,[req.params.id]);
  if(!rows.length) throw httpError(404,'Record not found');res.json(rows[0]);
}));
router.post('/data/:resource',asyncRoute(async(req,res)=>{
  const def=resourceFor(req);const data=prepareInput(def,req.body,true);
  if(req.params.resource==='posts') data.author_id=req.user.id;
  if(req.params.resource==='posts' && data.status==='published' && !data.published_at) data.published_at=new Date();
  const keys=Object.keys(data);let result;
  try {result=await query(`INSERT INTO ${def.table} (${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')})`,keys.map(k=>data[k]));} catch(e){dbErrorFriendly(e);}
  await logAction(req.user.id,'create',req.params.resource,result.insertId,{title:data.title||data.heading||data.label||''});
  res.status(201).json({id:result.insertId});
}));
router.put('/data/:resource/:id',asyncRoute(async(req,res)=>{
  const def=resourceFor(req);const id=Number(req.params.id);
  const data=prepareInput(def,req.body,false);
  if(req.params.resource==='posts' && data.status==='published' && !('published_at' in data)) {
    const [current]=await query('SELECT published_at FROM posts WHERE id=?',[id]);
    if(current && !current.published_at) data.published_at=new Date();
  }
  const keys=Object.keys(data);if(!keys.length) throw httpError(400,'No editable fields supplied');
  let result;try{result=await query(`UPDATE ${def.table} SET ${keys.map(k=>`${k}=?`).join(',')} WHERE id=?`,[...keys.map(k=>data[k]),id]);}catch(e){dbErrorFriendly(e);}
  if(!result.affectedRows) throw httpError(404,'Record not found');
  await logAction(req.user.id,'update',req.params.resource,id,{fields:keys});res.json({success:true});
}));
router.delete('/data/:resource/:id',asyncRoute(async(req,res)=>{
  const def=resourceFor(req);const id=Number(req.params.id);
  if(req.params.resource==='pages'){
    const [page]=await query('SELECT slug FROM pages WHERE id=?',[id]);
    if(page?.slug==='home') throw httpError(400,'Homepage cannot be deleted');
  }
  const result=await query(`DELETE FROM ${def.table} WHERE id=?`,[id]);
  if(!result.affectedRows) throw httpError(404,'Record not found');
  await logAction(req.user.id,'delete',req.params.resource,id);res.json({success:true});
}));

router.get('/settings',asyncRoute(async(req,res)=>{
  const rows=await query('SELECT setting_key,value_json FROM site_settings ORDER BY setting_key');
  res.json(Object.fromEntries(rows.map(r=>[r.setting_key,r.value_json])));
}));
router.put('/settings/:key',asyncRoute(async(req,res)=>{
  const key=req.params.key;
  if(!/^[a-z][a-z0-9_]{0,69}$/.test(key)) throw httpError(400,'Invalid settings key');
  const value=req.body?.value;
  if(value===undefined || !['object','string','boolean','number'].includes(typeof value)) throw httpError(400,'Supply a JSON value');
  const encoded=JSON.stringify(value);
  if(encoded.length>50000) throw httpError(400,'Setting value is too large');
  await query('INSERT INTO site_settings (setting_key,value_json) VALUES (?,?) ON DUPLICATE KEY UPDATE value_json=VALUES(value_json)',[key,encoded]);
  await logAction(req.user.id,'update','settings',key);res.json({success:true});
}));
router.get('/messages',asyncRoute(async(req,res)=>res.json(await query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 1000'))));
router.patch('/messages/:id',asyncRoute(async(req,res)=>{
  if(!['new','read','replied'].includes(req.body?.status)) throw httpError(400,'Invalid message status');
  await query('UPDATE contact_messages SET status=? WHERE id=?',[req.body.status,req.params.id]);
  await logAction(req.user.id,'update','contact_message',req.params.id);res.json({success:true});
}));
router.get('/subscribers',asyncRoute(async(req,res)=>res.json(await query('SELECT * FROM subscribers ORDER BY created_at DESC LIMIT 10000'))));
router.delete('/subscribers/:id',asyncRoute(async(req,res)=>{
  const r=await query('DELETE FROM subscribers WHERE id=?',[req.params.id]);
  if(!r.affectedRows) throw httpError(404,'Subscriber not found');
  await logAction(req.user.id,'delete','subscriber',req.params.id);res.json({success:true});
}));
router.get('/audit',requireSuperAdmin,asyncRoute(async(req,res)=>res.json(await query('SELECT l.id,l.action,l.entity,l.entity_id,l.detail_json,l.created_at,a.name AS actor FROM audit_logs l LEFT JOIN admin_users a ON a.id=l.actor_id ORDER BY l.id DESC LIMIT 250'))));

router.get('/media',asyncRoute(async(req,res)=>res.json(await query('SELECT m.*,u.name AS uploader FROM media m LEFT JOIN admin_users u ON u.id=m.uploaded_by ORDER BY m.id DESC LIMIT 1000'))));
router.post('/media',upload.single('file'),asyncRoute(async(req,res)=>{
  const f=req.file;if(!f) throw httpError(400,'Select an image');
  let ext=null;
  if(f.buffer.subarray(0,3).equals(Buffer.from([0xff,0xd8,0xff]))) ext='jpg';
  else if(f.buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) ext='png';
  else if(f.buffer.subarray(0,4).toString()==='RIFF'&&f.buffer.subarray(8,12).toString()==='WEBP') ext='webp';
  else if(['GIF87a','GIF89a'].includes(f.buffer.subarray(0,6).toString())) ext='gif';
  const expected={jpg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif'};
  if(!ext || expected[ext]!==f.mimetype) throw httpError(400,'Image file signature does not match its type');
  const filename=`${randomUUID()}.${ext}`;await fs.mkdir(uploadDir,{recursive:true});await fs.writeFile(path.join(uploadDir,filename),f.buffer,{flag:'wx'});
  const mediaPath=`/uploads/${filename}`;
  const result=await query('INSERT INTO media (path,filename,mime,bytes,alt,uploaded_by) VALUES (?,?,?,?,?,?)',[mediaPath,onlyString(f.originalname,255),f.mimetype,f.size,onlyString(req.body?.alt,300),req.user.id]);
  await logAction(req.user.id,'upload','media',result.insertId);
  res.status(201).json({id:result.insertId,path:mediaPath});
}));
router.delete('/media/:id',asyncRoute(async(req,res)=>{
  const [item]=await query('SELECT * FROM media WHERE id=?',[req.params.id]);if(!item) throw httpError(404,'Image not found');
  await query('DELETE FROM media WHERE id=?',[item.id]);
  if(/^\/uploads\/[\da-f-]+\.(jpg|png|webp|gif)$/.test(item.path)) await fs.unlink(path.join(uploadDir,path.basename(item.path))).catch(()=>{});
  await logAction(req.user.id,'delete','media',item.id);res.json({success:true});
}));

router.get('/users',requireSuperAdmin,asyncRoute(async(req,res)=>res.json(await query('SELECT id,name,email,role,active,created_at FROM admin_users ORDER BY created_at'))));
router.post('/users',requireSuperAdmin,asyncRoute(async(req,res)=>{
  const name=onlyString(req.body?.name,160),email=cleanEmail(req.body?.email),password=String(req.body?.password||''),role=req.body?.role;
  if(!name||!validEmail(email)||password.length<12||!['editor','super_admin'].includes(role)) throw httpError(400,'Name, email, role and a password of 12+ characters are required');
  let result;try{result=await query('INSERT INTO admin_users (name,email,password_hash,role) VALUES (?,?,?,?)',[name,email,await hashPassword(password),role]);}catch(e){dbErrorFriendly(e);}
  await logAction(req.user.id,'create','admin_user',result.insertId);res.status(201).json({id:result.insertId});
}));
router.patch('/users/:id',requireSuperAdmin,asyncRoute(async(req,res)=>{
  const id=Number(req.params.id),changes=[],args=[];
  if('name' in req.body){changes.push('name=?');args.push(onlyString(req.body.name,160));}
  if('role' in req.body){if(!['editor','super_admin'].includes(req.body.role)) throw httpError(400,'Invalid role');changes.push('role=?');args.push(req.body.role);}
  if('active' in req.body){changes.push('active=?');args.push(req.body.active?1:0);}
  if(req.body.password){if(req.body.password.length<12) throw httpError(400,'Password must be at least 12 characters');changes.push('password_hash=?');args.push(await hashPassword(req.body.password));}
  if(!changes.length) throw httpError(400,'No changes supplied');
  if(id===Number(req.user.id) && ('role' in req.body && req.body.role!=='super_admin' || 'active' in req.body && !req.body.active)) throw httpError(400,'You cannot remove your own super admin access');
  if(('role' in req.body&&req.body.role==='editor')||('active' in req.body&&!req.body.active)){
    const [target]=await query('SELECT role,active FROM admin_users WHERE id=?',[id]);
    if(target?.role==='super_admin'&&target.active){const [count]=await query("SELECT COUNT(*) total FROM admin_users WHERE role='super_admin' AND active=1");if(count.total<=1) throw httpError(400,'At least one active super admin is required');}
  }
  args.push(id);const result=await query(`UPDATE admin_users SET ${changes.join(',')} WHERE id=?`,args);
  if(!result.affectedRows) throw httpError(404,'User not found');
  await logAction(req.user.id,'update','admin_user',id);res.json({success:true});
}));
export default router;
