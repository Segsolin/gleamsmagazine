export const asyncRoute = (fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
export function httpError(status,message) { const e=new Error(message); e.status=status; return e; }
export function cleanEmail(email) { return String(email||'').trim().toLowerCase(); }
export const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
export function cleanSlug(slug) { return String(slug || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,200); }
export function parseJSON(v,fallback={}) { if (v == null || v === '') return fallback; if (typeof v === 'object') return v; try{return JSON.parse(v)} catch{return fallback} }
export function onlyString(input, max=10000) { return String(input ?? '').trim().slice(0,max); }
