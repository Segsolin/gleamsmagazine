export async function api(url,{method='GET',body,headers={},...other}={}){
  const opts={method,credentials:'same-origin',headers:{...headers},...other};
  if(method!=='GET' && method!=='HEAD') opts.headers['X-CMS-Request']='1';
  if(body!==undefined){
    if(body instanceof FormData) opts.body=body;
    else {opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(body);}
  }
  let response;
  try{response=await fetch(`/api${url}`,opts);}catch{throw new Error('Cannot connect to the API. Check that the Node.js server is running.');}
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.error||`Request failed (${response.status})`);
  return data;
}
export const humanDate=(value)=>{if(!value)return '';const d=new Date(value);return Number.isNaN(+d)?'':d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});};
export const configOf=(value)=>{if(!value)return {};if(typeof value==='object')return value;try{return JSON.parse(value)}catch{return {}}};
export const safeHref=(raw)=>{const url=String(raw||'#').trim();return /^(\/|#|https?:\/\/|mailto:|tel:)/i.test(url)?url:'#';};
export const slugify=(s)=>String(s||'').toLowerCase().trim().replace(/[^a-z0-9-]+/g,'-').replace(/^-|-+$/g,'');
