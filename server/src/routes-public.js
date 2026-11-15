import {Router} from 'express';
import rateLimit from 'express-rate-limit';
import {query} from './db.js';
import {asyncRoute,cleanEmail,validEmail,onlyString,httpError} from './utils.js';
const router=Router();
const formLimit=rateLimit({windowMs:15*60*1000,limit:8,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Too many submissions, please try again later'}});

router.get('/site',asyncRoute(async(req,res)=>{
  const [settings,nav]=await Promise.all([
    query('SELECT setting_key,value_json FROM site_settings'),
    query('SELECT id,label,path,location,position,target FROM navigation_items WHERE visible=1 ORDER BY location,position,id')
  ]);
  const values=Object.fromEntries(settings.map(r=>[r.setting_key,r.value_json]));
  res.json({settings:values,navigation:nav});
}));
router.get('/pages/:slug',asyncRoute(async(req,res)=>{
  const page=(await query('SELECT * FROM pages WHERE slug=? AND status=? LIMIT 1',[req.params.slug,'published']))[0];
  if(!page) throw httpError(404,'Page not found');
  const sections=await query('SELECT id,type,label,heading,subheading,body,media_url,button_label,button_url,config,position FROM page_sections WHERE page_id=? AND visible=1 ORDER BY position,id',[page.id]);
  res.json({page,sections});
}));
router.get('/posts',asyncRoute(async(req,res)=>{
  const page=Math.max(1,Math.min(1000,parseInt(req.query.page,10)||1));
  const limit=Math.max(1,Math.min(24,parseInt(req.query.limit,10)||9));
  const category=String(req.query.category||'').slice(0,160);
  const where="WHERE p.status='published' AND (p.published_at IS NULL OR p.published_at<=UTC_TIMESTAMP())";
  let extra='',args=[];
  if(category){extra=' AND c.slug=?';args=[category];}
  const count=await query(`SELECT COUNT(*) AS total FROM posts p LEFT JOIN categories c ON c.id=p.category_id ${where}${extra}`,args);
  const rows=await query(`SELECT p.id,p.title,p.slug,p.excerpt,p.cover_image,p.featured,p.published_at,p.created_at,c.name AS category,c.slug AS category_slug FROM posts p LEFT JOIN categories c ON c.id=p.category_id ${where}${extra} ORDER BY p.featured DESC,COALESCE(p.published_at,p.created_at) DESC LIMIT ${limit} OFFSET ${(page-1)*limit}`,args);
  res.json({items:rows,total:count[0].total,page,limit});
}));
router.get('/posts/:slug',asyncRoute(async(req,res)=>{
  const rows=await query(`SELECT p.id,p.title,p.slug,p.excerpt,p.body,p.cover_image,p.published_at,p.created_at,p.seo_title,p.seo_description,c.name AS category,a.name AS author FROM posts p LEFT JOIN categories c ON c.id=p.category_id LEFT JOIN admin_users a ON a.id=p.author_id WHERE p.slug=? AND p.status='published' AND (p.published_at IS NULL OR p.published_at<=UTC_TIMESTAMP())`,[req.params.slug]);
  if(!rows.length) throw httpError(404,'Story not found');res.json(rows[0]);
}));
router.get('/categories',asyncRoute(async(req,res)=>res.json(await query('SELECT id,name,slug,description FROM categories ORDER BY name'))));
router.get('/collections/:slug',asyncRoute(async(req,res)=>{
  const c=(await query('SELECT * FROM collections WHERE slug=?',[req.params.slug]))[0];
  if(!c) throw httpError(404,'Collection not found');
  const items=await query("SELECT id,title,slug,description,body,image_url,link_url,metadata,position FROM collection_items WHERE collection_id=? AND status='published' ORDER BY position,id",[c.id]);
  res.json({collection:c,items});
}));
router.post('/contact',formLimit,asyncRoute(async(req,res)=>{
  const {website}=req.body||{}; if(website) return res.status(200).json({success:true});
  const name=onlyString(req.body?.full_name,180),email=cleanEmail(req.body?.email),subject=onlyString(req.body?.subject,250),message=onlyString(req.body?.message,5000);
  if(name.length<2 || !validEmail(email) || message.length<10) throw httpError(400,'Enter your name, a valid email, and a message of at least 10 characters');
  await query('INSERT INTO contact_messages (full_name,email,subject,message) VALUES (?,?,?,?)',[name,email,subject,message]);res.status(201).json({success:true});
}));
router.post('/subscribe',formLimit,asyncRoute(async(req,res)=>{
  if(req.body?.website) return res.json({success:true});
  const email=cleanEmail(req.body?.email);if(!validEmail(email)) throw httpError(400,'Enter a valid email address');
  await query('INSERT IGNORE INTO subscribers (email) VALUES (?)',[email]);res.status(201).json({success:true});
}));
export default router;
