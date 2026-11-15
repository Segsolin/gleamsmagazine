import React,{useEffect,useState}from'react';
import{ArrowRight,ArrowUpRight,MoveUpRight,Send,Check,ChevronRight}from'lucide-react';
import{api,configOf,safeHref}from'../api';
import{SiteLink,PostCard}from'./Public';
import{useSite}from'../main';

const Eyebrow=({children})=>children?<span className="eyebrow">{children}</span>:null;
const Action=({s,light=false})=>s.button_label?<SiteLink className={`text-action ${light?'text-action-light':''}`} to={s.button_url||'/contact'}>{s.button_label}<ArrowUpRight size={18}/></SiteLink>:null;
function Hero({s,isHome}){
 const config=configOf(s.config);
 return <section className={`hero-section ${isHome?'hero-home':'hero-inner'}`}>
 <div className="hero-grain"/><div className="site-container hero-layout"><div className="hero-copy">
 <div className="hero-identifier"><span className="small-square"/><span>{s.label||'A CREATIVE UNIVERSE'}</span></div>
 <h1>{s.heading}</h1><p>{s.subheading}</p>
 <div className="hero-actions"><SiteLink className="button button-cream" to={s.button_url||'/about'}>{s.button_label||'Explore GLEAMS'}<ArrowUpRight size={18}/></SiteLink>{config.secondaryLabel&&<SiteLink className="hero-secondary" to={config.secondaryUrl||'/stories'}>{config.secondaryLabel}<ArrowRight size={17}/></SiteLink>}</div>
 </div><div className="hero-art"><div className="hero-oval"/>{s.media_url?<img src={s.media_url} alt="Creative community"/>:<div className="hero-photo-fallback"/>}<div className="hero-art-caption"><span>CREATIVITY</span><span>WITHOUT BORDERS ↗</span></div><span className="hero-art-sticker">G<span>↗</span></span></div></div>
 <div className="site-container hero-bottom"><span>{config.kicker||'DISCOVER / CREATE / CONNECT'}</span><span>SCROLL TO EXPLORE ↓</span></div></section>;
}
function Intro({s}){return <section className="section-intro site-container"><div><Eyebrow>{s.label}</Eyebrow><div className="intro-icon">✳</div></div><div><h2>{s.heading}</h2><p>{s.body||s.subheading}</p><Action s={s}/></div></section>}
function CardSection({s}){
 const cards=configOf(s.config).cards||[];
 return <section className="section-padded section-sand"><div className="site-container"><div className="section-heading-row"><div><Eyebrow>{s.label}</Eyebrow><h2>{s.heading}</h2><p className="section-subtitle">{s.subheading}</p></div><Action s={s}/></div>
 <div className="platform-grid">{cards.map((c,i)=><SiteLink to={c.url||'#'} className="platform-card" key={i}><div className="platform-image">{c.image&&<img loading="lazy" src={c.image} alt=""/>}<span className="platform-index">{c.number||String(i+1).padStart(2,'0')}</span><span className="platform-next"><MoveUpRight size={19}/></span></div><div className="platform-body"><div className="platform-label">{c.label}</div><h3>{c.title}</h3><p>{c.description}</p></div></SiteLink>)}</div>
 </div></section>;
}
function Stats({s}){const stats=configOf(s.config).items||[];return <section className="stats-section"><div className="site-container"><div><Eyebrow>{s.label}</Eyebrow><h2>{s.heading}</h2></div><div className="stats-grid">{stats.map((item,i)=><div key={i}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div></div></section>}
function Split({s}){return <section className="section-padded section-split"><div className="site-container split-layout"><div className="split-media">{s.media_url?<img loading="lazy" src={s.media_url} alt="Creative vision"/>:<span className="split-fallback">GLEAMS</span>}<div className="split-badge">IMAGINE <b>↗</b> CREATE</div></div><div className="split-text"><Eyebrow>{s.label}</Eyebrow><h2>{s.heading}</h2><p>{s.body||s.subheading}</p><Action s={s}/></div></div></section>}
function Cta({s}){return <section className="cta-section"><div className="site-container cta-layout"><div><Eyebrow>{s.label||'LET’S CONNECT'}</Eyebrow><h2>{s.heading}</h2><p>{s.subheading||s.body}</p></div><SiteLink className="cta-circle" to={s.button_url||'/contact'} aria-label={s.button_label||'Get in touch'}><ArrowUpRight size={36}/><span>{s.button_label||'Get in touch'}</span></SiteLink></div></section>}
function LatestPosts({s}){const[posts,setPosts]=useState([]);useEffect(()=>{api('/posts?limit=3').then(d=>setPosts(d.items)).catch(()=>{})},[]);return <section className="section-padded latest-section"><div className="site-container"><div className="section-heading-row"><div><Eyebrow>{s.label}</Eyebrow><h2>{s.heading}</h2><p className="section-subtitle">{s.subheading}</p></div><Action s={s}/></div>{posts.length?<div className="posts-grid">{posts.map(p=><PostCard key={p.id} post={p}/>)}</div>:<div className="posts-empty"><div className="posts-empty-mark">G.</div><div><h3>Good stories are coming.</h3><p>New voices, new perspectives, and more from the GLEAMS world.</p><SiteLink to="/stories" className="text-action">Explore the journal <ArrowUpRight size={18}/></SiteLink></div></div>}</div></section>}
function RichText({s}){return <section className="section-padded"><div className="site-container richtext-layout"><Eyebrow>{s.label}</Eyebrow><div><h2>{s.heading}</h2><p className="richtext-body">{s.body||s.subheading}</p><Action s={s}/></div></div></section>}
function Collection({s}){const slug=configOf(s.config).slug||'events',[data,setData]=useState(null);useEffect(()=>{api(`/collections/${encodeURIComponent(slug)}`).then(setData).catch(()=>{})},[slug]);return <section className="section-padded section-sand"><div className="site-container"><div className="section-heading-row"><div><Eyebrow>{s.label}</Eyebrow><h2>{s.heading}</h2></div></div>{data?.items?.length?<div className="platform-grid collection-grid">{data.items.map(item=><div className="platform-card" key={item.id}><div className="platform-image">{item.image_url&&<img src={item.image_url} loading="lazy" alt=""/>}</div><div className="platform-body"><h3>{item.title}</h3><p>{item.description}</p>{item.link_url&&<SiteLink className="text-action" to={item.link_url}>Learn more <ArrowUpRight size={16}/></SiteLink>}</div></div>)}</div>:<div className="empty-state"><h3>More to be announced.</h3><p>Watch this space for updates and new opportunities.</p></div>}</div></section>}
export function ContactSection({s}){
 const {settings}=useSite();const contact=settings.contact||{};
 const [form,setForm]=useState({full_name:'',email:'',subject:'',message:'',website:''}),[status,setStatus]=useState(''),[saving,setSaving]=useState(false),[error,setError]=useState('');
 const update=(k,v)=>setForm(old=>({...old,[k]:v}));
 const submit=async e=>{e.preventDefault();setSaving(true);setError('');try{await api('/contact',{method:'POST',body:form});setStatus('Thank you! Your message has been received.');setForm({full_name:'',email:'',subject:'',message:'',website:''})}catch(e){setError(e.message)}finally{setSaving(false)}};
 return <section className="contact-section section-padded"><div className="site-container contact-layout"><div><Eyebrow>{s.label||'CONTACT US'}</Eyebrow><h2>{s.heading||'Start the conversation.'}</h2><p>{s.subheading||'Partnerships, stories, collaborations — let us know what you have in mind.'}</p><div className="contact-info-public">{contact.email&&<a href={`mailto:${contact.email}`}>{contact.email}</a>}{contact.phone&&<a href={`tel:${contact.phone}`}>{contact.phone}</a>}{contact.address&&<span>{contact.address}</span>}</div><div className="contact-decoration">G<span>.</span></div></div><form className="contact-form" onSubmit={submit}><div className="two-fields"><label>Your name<input required minLength={2} maxLength={180} value={form.full_name} onChange={e=>update('full_name',e.target.value)} placeholder="Full name"/></label><label>Email address<input required type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com"/></label></div><label>What is this about?<input value={form.subject} maxLength={250} onChange={e=>update('subject',e.target.value)} placeholder="Partnership, press, collaboration..."/></label><label>Your message<textarea required minLength={10} maxLength={5000} rows={6} value={form.message} onChange={e=>update('message',e.target.value)} placeholder="Tell us a little about your idea..."/></label><input tabIndex={-1} className="honeypot" aria-hidden="true" autoComplete="off" value={form.website} onChange={e=>update('website',e.target.value)}/>{error&&<p className="form-error">{error}</p>}{status&&<p className="form-success"><Check size={16}/>{status}</p>}<button className="button button-dark" disabled={saving}>{saving?'Sending...':'Send your message'}<Send size={17}/></button></form></div></section>;
}
export function Newsletter(){const[email,setEmail]=useState(''),[message,setMessage]=useState(''),[loading,setLoading]=useState(false);const submit=async e=>{e.preventDefault();setLoading(true);try{await api('/subscribe',{method:'POST',body:{email}});setMessage('You’re on the list.');setEmail('')}catch(e){setMessage(e.message)}finally{setLoading(false)}};return <form className="newsletter-form" onSubmit={submit}><div><input type="email" aria-label="Email address" placeholder="Your email address" required value={email} onChange={e=>setEmail(e.target.value)}/><button disabled={loading} aria-label="Subscribe"><ArrowUpRight size={19}/></button></div>{message&&<small>{message}</small>}</form>}
export function RenderSection({section,index,isHome}){const s=section;switch(s.type){
 case 'hero':return <Hero s={s} isHome={isHome&&index===0}/>;
 case 'intro':return <Intro s={s}/>;
 case 'cards':case 'feature_grid':return <CardSection s={s}/>;
 case 'stats':return <Stats s={s}/>;
 case 'split':case 'image_text':return <Split s={s}/>;
 case 'cta':return <Cta s={s}/>;
 case 'latest_posts':return <LatestPosts s={s}/>;
 case 'collection':return <Collection s={s}/>;
 case 'contact':return <ContactSection s={s}/>;
 case 'quote':return <section className="quote-section"><div className="site-container"><Eyebrow>{s.label}</Eyebrow><blockquote>“{s.heading||s.body}”</blockquote><span>{s.subheading}</span></div></section>;
 default:return <RichText s={s}/>;
}}
