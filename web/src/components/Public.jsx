import React,{useEffect,useState}from'react';
import{Link,useParams,useLocation}from'react-router-dom';
import ReactMarkdown from 'react-markdown';
import{ArrowUpRight,ArrowRight,Menu,X,Instagram,Linkedin,Facebook,Youtube,Twitter,Music2,Mail,MapPin,ChevronRight}from'lucide-react';
import{api,humanDate,safeHref,configOf}from'../api';
import{useSite}from'../main';
import{RenderSection,Newsletter}from'./Sections';

export function SiteLink({to='/',children,className='',...rest}){
 const url=safeHref(to);
 if(/^(https?:\/\/|mailto:|tel:)/i.test(url)) return <a className={className} href={url} rel="noopener noreferrer" target={url.startsWith('http')?'_blank':undefined} {...rest}>{children}</a>;
 return <Link className={className} to={url} {...rest}>{children}</Link>;
}
function ScrollToTop(){
 const {pathname}=useLocation();
 useEffect(()=>{
   window.scrollTo(0,0);
 },[pathname]);
 return null;
}
export function Seo({title,description,image}){
 const {settings}=useSite();useEffect(()=>{
   document.title=title||settings.seo?.siteTitle||'GLEAMS';
   const fav=document.querySelector('link[rel="icon"]')||document.createElement('link');fav.rel='icon';if(settings.brand?.faviconUrl){fav.href=settings.brand.faviconUrl;if(!fav.parentNode)document.head.appendChild(fav);}
   const metas=[['name','description',description||settings.seo?.description||''],['property','og:title',title||'GLEAMS'],['property','og:description',description||''],['property','og:image',image||'']];
   metas.forEach(([attr,key,content])=>{let el=document.querySelector(`meta[${attr}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.appendChild(el);}el.content=content;});
 },[title,description,image,settings]);return null;
}
export function PublicShell({children}){
 const {settings,navigation}=useSite(),[open,setOpen]=useState(false);
 const header=navigation.filter(n=>n.location==='header');const footer=navigation.filter(n=>n.location==='footer');
 const brand=settings.brand||{};const social=settings.social||{};
 return <><ScrollToTop/>{settings.announcement?.enabled&&settings.announcement?.text&&<div className="announcement"><SiteLink to={settings.announcement.url||'#'}>{settings.announcement.text} <ArrowUpRight size={14}/></SiteLink></div>}
 <header className="site-header"><div className="site-container nav-wrap">
   <SiteLink to="/" className="brand-logo">{brand.logoUrl?<img src={brand.logoUrl} alt="GLEAMS"/>:<span>GLEAMS<span className="brand-period">.</span></span>}<small>{brand.descriptor||'THE CREATIVE ECOSYSTEM'}</small></SiteLink>
   <nav className={`site-nav ${open?'is-open':''}`} aria-label="Main navigation">{(header.length?header:[{label:'Home',path:'/'},{label:'About',path:'/about'},{label:'Awards',path:'/awards'},{label:'Magazine',path:'/magazine'},{label:'Foundation',path:'/foundation'},{label:'Studios',path:'/studios'}]).map(item=><SiteLink onClick={()=>setOpen(false)} key={item.id||item.path} to={item.path} target={item.target||'_self'}>{item.label}</SiteLink>)}</nav>
   <SiteLink className="button button-dark nav-cta" to={brand.headerCtaUrl||"/contact"}>{brand.headerCtaLabel||"Let’s connect"} <ArrowUpRight size={16}/></SiteLink>
   <button className="nav-toggle" onClick={()=>setOpen(v=>!v)} aria-label={open?'Close menu':'Open menu'}>{open?<X/>:<Menu/>}</button>
 </div></header><main>{children}</main>
 <footer className="site-footer"><div className="site-container">
   <div className="footer-top"><div><div className="footer-logo">{brand.name||"GLEAMS"}<span>.</span></div><p>{settings.footer?.statement||'Connecting talent, culture and opportunity across Africa and beyond.'}</p></div><h2>{settings.footer?.headline||"Let’s build the"}<br/><em>{settings.footer?.headlineAccent||"next chapter."}</em></h2></div>
   <div className="footer-middle"><div><div className="eyebrow">EXPLORE</div><div className="footer-links">{footer.map(i=><SiteLink key={i.id} to={i.path} target={i.target||'_self'}>{i.label}</SiteLink>)}<SiteLink to="/about">About us</SiteLink><SiteLink to="/contact">Get in touch</SiteLink></div></div>
   <div><div className="eyebrow">FIND US</div><p>{settings.contact?.address||'Africa & beyond'}</p>{settings.contact?.email&&<a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>}{settings.contact?.phone&&<p><a href={`tel:${settings.contact.phone}`}>{settings.contact.phone}</a></p>}</div>
   <div className="footer-newsletter"><div className="eyebrow">STAY IN THE LOOP</div><Newsletter/></div></div>
   <div className="footer-bottom"><span>© {new Date().getFullYear()} {settings.footer?.copyright||'GLEAMS. All rights reserved.'}</span><span>{settings.footer?.bottomNote||"Culture makes connections."}</span><div className="socials">{[['instagram',Instagram],['facebook',Facebook],['linkedin',Linkedin],['youtube',Youtube],['x',Twitter],['tiktok',Music2]].map(([k,Icon])=>social[k]&&<a key={k} href={safeHref(social[k])} target="_blank" rel="noreferrer" aria-label={k}><Icon size={18}/></a>)}</div></div>
 </div></footer></>;
}
export function PageView({slug:fixedSlug}){
 const params=useParams(),slug=fixedSlug||params.slug;const[data,setData]=useState(null),[error,setError]=useState('');
 useEffect(()=>{setData(null);setError('');api(`/pages/${encodeURIComponent(slug)}`).then(setData).catch(e=>setError(e.message));},[slug]);
 if(error)return <NotFound detail={error}/>;
 if(!data)return <div className="page-loading"><span className="loading-mark">G.</span><p>Discovering...</p></div>;
 const{page,sections}=data;
 return <><Seo title={page.seo_title?`${page.seo_title} | GLEAMS`:'GLEAMS — Pan-African Creative Ecosystem'} description={page.seo_description||page.description} image={page.cover_image}/>{sections.length?sections.map((s,i)=><RenderSection key={s.id} section={s} index={i} isHome={slug==='home'}/>):<div className="empty-public site-container"><h1>{page.title}</h1><p>{page.description}</p></div>}</>;
}
export function PostCard({post}){return <SiteLink to={`/stories/${post.slug}`} className="post-card"><div className="post-image">{post.cover_image?<img loading="lazy" src={post.cover_image} alt=""/>:<div className="post-noimage">GLEAMS JOURNAL</div>}<span className="post-arrow"><ArrowUpRight size={20}/></span></div><div className="post-meta">{post.category||'GLEAMS STORIES'}<span>·</span>{humanDate(post.published_at||post.created_at)}</div><h3>{post.title}</h3><p>{post.excerpt}</p></SiteLink>}
export function StoriesView(){
 const [storiesPage,setStoriesPage]=useState(null),[data,setData]=useState({items:[],total:0}),[cats,setCats]=useState([]),[category,setCategory]=useState(''),[page,setPage]=useState(1),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{api('/categories').then(setCats).catch(()=>{});api('/pages/stories').then(setStoriesPage).catch(()=>{})},[]);
 useEffect(()=>{setLoading(true);api(`/posts?page=${page}&limit=9${category?`&category=${encodeURIComponent(category)}`:''}`).then(d=>{setData(d);setError('')}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[page,category]);
 return <><Seo title={storiesPage?.page?.seo_title?`${storiesPage.page.seo_title} | GLEAMS`:"Stories | GLEAMS"} description={storiesPage?.page?.seo_description||"Discover stories, culture and creative voices from GLEAMS Magazine."}/><div className="inner-hero"><div className="site-container"><span className="eyebrow eyebrow-light">{storiesPage?.sections?.[0]?.label||"THE GLEAMS JOURNAL"}</span><h1>{storiesPage?.sections?.[0]?.heading||"Stories that shape culture."}</h1><p>{storiesPage?.sections?.[0]?.subheading||"Ideas, perspectives, people, and the creative energy moving Africa forward."}</p></div></div>
 <section className="stories-list site-container"><div className="filter-bar"><h2>Explore the journal</h2><div className="category-pills"><button className={!category?'active':''} onClick={()=>{setCategory('');setPage(1)}}>All</button>{cats.map(c=><button className={category===c.slug?'active':''} key={c.id} onClick={()=>{setCategory(c.slug);setPage(1)}}>{c.name}</button>)}</div></div>
 {error?<p className="form-error">{error}</p>:loading?<p>Loading stories...</p>:data.items.length?<div className="posts-grid">{data.items.map(p=><PostCard post={p} key={p.id}/>)}</div>:<div className="empty-state"><h3>Good stories are coming.</h3><p>Check back soon for voices from across the GLEAMS ecosystem.</p></div>}
 {data.total>9&&<div className="pagination"><button disabled={page<=1} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page} of {Math.ceil(data.total/9)}</span><button disabled={page*9>=data.total} onClick={()=>setPage(page+1)}>Next</button></div>}
 </section></>;
}
export function StoryView(){
 const {slug}=useParams(),[post,setPost]=useState(null),[error,setError]=useState('');
 useEffect(()=>{setPost(null);setError('');api(`/posts/${encodeURIComponent(slug)}`).then(setPost).catch(e=>setError(e.message))},[slug]);
 if(error)return <NotFound detail={error}/>;if(!post)return <div className="page-loading"><span className="loading-mark">G.</span></div>;
 return <><Seo title={`${post.seo_title||post.title} | GLEAMS`} description={post.seo_description||post.excerpt} image={post.cover_image}/><article className="story-detail"><div className="site-container"><SiteLink className="back-link" to="/stories">← Back to stories</SiteLink><div className="story-heading"><div className="eyebrow">{post.category||'STORIES'} / {humanDate(post.published_at||post.created_at)}</div><h1>{post.title}</h1><p>{post.excerpt}</p></div>{post.cover_image&&<img className="story-cover" src={post.cover_image} alt={post.title}/>}<div className="story-body markdown"><ReactMarkdown>{post.body||''}</ReactMarkdown></div><div className="story-end"><SiteLink to="/stories" className="button button-dark">More stories <ArrowRight size={18}/></SiteLink></div></div></article></>;
}
export function NotFound({detail}){return <div className="notfound site-container"><span className="eyebrow">404 / NOT FOUND</span><h1>This page has<br/><em>moved on.</em></h1><p>{detail||'The page you’re looking for isn’t here yet.'}</p><SiteLink to="/" className="button button-dark">Back to home <ArrowRight size={16}/></SiteLink></div>}
