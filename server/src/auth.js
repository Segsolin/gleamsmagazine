import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {query} from './db.js';
import {asyncRoute,httpError} from './utils.js';

const cookieName = 'gleams_admin_session';
function secret() { if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET must have at least 32 characters'); return process.env.SESSION_SECRET; }
export function setLoginCookie(res,user) {
  const token=jwt.sign({sub:String(user.id), role:user.role},secret(),{expiresIn:'8h'});
  res.cookie(cookieName,token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:8*60*60*1000,path:'/api'});
}
export function clearLoginCookie(res) {res.clearCookie(cookieName,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/api'});}
export const requireAdmin = asyncRoute(async (req,res,next)=>{
  const token=req.cookies?.[cookieName];
  if(!token) throw httpError(401,'Sign in to continue');
  let payload;
  try {payload=jwt.verify(token,secret());} catch {throw httpError(401,'Session expired. Please sign in again');}
  const rows=await query('SELECT id,name,email,role,active FROM admin_users WHERE id=? LIMIT 1',[payload.sub]);
  if(!rows.length || !rows[0].active) throw httpError(401,'Account inactive or no longer exists');
  req.user=rows[0]; next();
});
export function requireSuperAdmin(req,res,next) {if(req.user?.role!=='super_admin') return next(httpError(403,'Super admin privileges required')); next();}
export function csrfCheck(req,res,next) {
  if(['GET','HEAD','OPTIONS'].includes(req.method)) return next();
  if(req.get('x-cms-request')!=='1') return next(httpError(403,'Missing CMS request header'));
  const origin=req.get('origin');
  const allowed=process.env.PUBLIC_ORIGIN;
  if(origin && allowed && origin!==allowed) return next(httpError(403,'Origin not permitted'));
  next();
}
export const verifyPassword=(raw,hash)=>bcrypt.compare(raw,hash);
export const hashPassword=(raw)=>bcrypt.hash(raw,12);
