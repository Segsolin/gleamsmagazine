import 'dotenv/config';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {pool,query} from '../src/db.js';
const schemaPath=fileURLToPath(new URL('../db/schema.sql',import.meta.url));
const placeholder={
  awards:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&q=80',
  magazine:'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1000&q=80',
  sound:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&q=80',
  foundation:'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&q=80',
  studios:'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1000&q=80'
};
const platforms=[
  {number:'01',title:'GLEAMS Awards',label:'Celebrate excellence',description:'Recognising outstanding talent in entertainment, entrepreneurship and the creative economy.',image:placeholder.awards,url:'/awards'},
  {number:'02',title:'GLEAMS Magazine',label:'Stories that travel',description:'Editorial storytelling and ideas shaping Africa’s culture and creative conversations.',image:placeholder.magazine,url:'/magazine'},
  {number:'03',title:'FIRST SOUND',label:'The next wave',description:'A space for music, performances and stories from emerging African artists.',image:placeholder.sound,url:'/first-sound'},
  {number:'04',title:'GLEAMS Foundation',label:'Opportunity for all',description:'Supporting youth empowerment and access to creative education and development.',image:placeholder.foundation,url:'/foundation'},
  {number:'05',title:'GLEAMS Studios',label:'Ideas into impact',description:'Creative production and content services for African stories with global ambition.',image:placeholder.studios,url:'/studios'}
];
const sec=(type,heading,extras={})=>({type,heading,label:'',subheading:'',body:'',media_url:'',button_label:'',button_url:'',config:{},...extras});
const pages=[
  {slug:'home',title:'Welcome to GLEAMS',subtitle:'African creativity deserves the world.',description:'An interconnected Pan-African ecosystem celebrating and amplifying creative voices.',template:'home',sections:[
    sec('hero','Africa creates. The world watches.',{label:'WELCOME TO GLEAMS',subheading:'The future of African creativity is not waiting to be discovered. We are building the stage it deserves.',button_label:'Explore our world',button_url:'/about',media_url:placeholder.sound,config:{secondaryLabel:'Our stories',secondaryUrl:'/stories',kicker:'Culture / Talent / Possibility'}}),
    sec('intro','A connected universe of African possibility.',{label:'WHO WE ARE',body:'From the first spark of an idea to a global stage, GLEAMS connects people, stories and opportunities across Africa’s creative landscape.',button_label:'Discover our mission',button_url:'/about'}),
    sec('cards','One vision. Five powerful platforms.',{label:'THE GLEAMS ECOSYSTEM',subheading:'Different ways to discover, amplify and invest in African talent.',config:{cards:platforms}}),
    sec('stats','A movement beyond borders.',{label:'BUILT FOR WHAT IS NEXT',config:{items:[{value:'05',label:'Connected platforms'},{value:'Africa',label:'Our creative home'},{value:'Global',label:'Our ambition'}]}}),
    sec('split','Our stories deserve room to grow.',{label:'OUR PURPOSE',body:'We believe the next era of African creativity will be shaped by the people who give emerging voices the space, resources and recognition to thrive.',media_url:placeholder.studios,button_label:'What drives us',button_url:'/about'}),
    sec('latest_posts','The stories behind the culture.',{label:'FROM THE MAGAZINE',subheading:'Perspectives, people and powerful ideas from the GLEAMS world.',button_label:'All stories',button_url:'/stories'}),
    sec('cta','Let’s create what comes next.',{label:'PARTNER WITH GLEAMS',subheading:'Connect your brand, organisation or vision with a creative community building something bigger.',button_label:'Work with us',button_url:'/contact'})
  ]},
  {slug:'about',title:'About GLEAMS',subtitle:'Building the stage African creativity deserves.',description:'Meet the mission and vision behind GLEAMS.',sections:[
    sec('hero','A continent of ideas. A universe of possibility.',{label:'ABOUT GLEAMS',subheading:'We are a Pan-African creative ecosystem connecting talent, culture and opportunity.',media_url:placeholder.foundation}),
    sec('split','We believe in the power of being seen.',{label:'OUR STORY',body:'GLEAMS brings awards, editorial media, music discovery, youth development and creative production into one connected ecosystem. Our ambition is to help extraordinary creative voices find recognition, resources and real opportunities.',media_url:placeholder.awards}),
    sec('cards','Our five connected worlds.',{label:'THE ECOSYSTEM',config:{cards:platforms}}),
    sec('cta','The next chapter is ours to write.',{button_label:'Get in touch',button_url:'/contact'})
  ]},
  {slug:'awards',title:'GLEAMS Awards',subtitle:'A spotlight on excellence.',description:'Recognising creative and entrepreneurial excellence.',sections:[
    sec('hero','Greatness deserves recognition.',{label:'GLEAMS AWARDS',subheading:'Celebrating achievement in entertainment, entrepreneurship and the creative economy.',media_url:placeholder.awards,button_label:'Enquire about awards',button_url:'/contact'}),
    sec('split','A bigger stage for extraordinary talent.',{label:'WHY IT MATTERS',body:'GLEAMS Awards is our platform for shining a spotlight on the people and ideas moving African creativity forward. Event information, honourees and announcements can be published here from the admin dashboard.',media_url:placeholder.awards}),
    sec('collection','Upcoming moments.',{label:'EVENTS & ANNOUNCEMENTS',config:{slug:'events'}}),
    sec('cta','Celebrate with us.',{button_label:'Become a partner',button_url:'/contact'})
  ]},
  {slug:'magazine',title:'GLEAMS Magazine',subtitle:'Stories that move culture.',description:'Editorial storytelling from Africa and the diaspora.',sections:[
    sec('hero','Stories worth telling. Voices worth hearing.',{label:'GLEAMS MAGAZINE',subheading:'Discover the ideas, people and perspectives shaping creative life across Africa and the diaspora.',media_url:placeholder.magazine,button_label:'Read the stories',button_url:'/stories'}),
    sec('latest_posts','Fresh perspectives.',{label:'EDITORIAL',button_label:'Browse all stories',button_url:'/stories'})
  ]},
  {slug:'first-sound',title:'FIRST SOUND',subtitle:'Where new voices take the stage.',description:'Music discovery, performance and storytelling.',sections:[
    sec('hero','Every great sound begins somewhere.',{label:'FIRST SOUND BY GLEAMS',subheading:'Discovering and amplifying the next generation of African artists through music, performance and storytelling.',media_url:placeholder.sound,button_label:'Get in touch',button_url:'/contact'}),
    sec('split','More than music. A platform to be heard.',{label:'OUR PLATFORM',body:'FIRST SOUND explores the stories behind emerging artists and gives new creative voices space to connect with a wider audience.',media_url:placeholder.sound})
  ]},
  {slug:'foundation',title:'GLEAMS Foundation',subtitle:'Unlocking potential through opportunity.',description:'Youth empowerment and creative learning.',sections:[
    sec('hero','Potential is everywhere. Opportunity should be too.',{label:'GLEAMS FOUNDATION',subheading:'Opening doors for emerging talent through youth empowerment and creative development.',media_url:placeholder.foundation,button_label:'Collaborate with us',button_url:'/contact'}),
    sec('split','From talent to possibility.',{label:'OUR COMMITMENT',body:'Our foundation focuses on helping young people develop, create and access opportunities. Initiatives include Slum 2 Screen and plans for the Gleams Creative Academy in Lagos.',media_url:placeholder.foundation}),
    sec('collection','Our initiatives.',{label:'PROGRAMMES',config:{slug:'initiatives'}})
  ]},
  {slug:'studios',title:'GLEAMS Studios',subtitle:'Stories made for the world.',description:'Creative production and content services.',sections:[
    sec('hero','Ideas deserve world-class execution.',{label:'GLEAMS STUDIOS',subheading:'Creative production and content services that help ambitious African stories make an impact.',media_url:placeholder.studios,button_label:'Start a conversation',button_url:'/contact'}),
    sec('split','Creation with purpose.',{label:'WHAT WE DO',body:'From concept development to finished content, GLEAMS Studios is designed to help creators and brands bring meaningful stories to life.',media_url:placeholder.studios}),
    sec('cta','Have a story to tell?',{button_label:'Contact our team',button_url:'/contact'})
  ]},
  {slug:'stories',title:'Stories',subtitle:'Stories that shape culture.',description:'Ideas, perspectives, people and the creative energy moving Africa forward.',sections:[
    sec('hero','Stories that shape culture.',{label:'THE GLEAMS JOURNAL',subheading:'Ideas, perspectives, people, and the creative energy moving Africa forward.'})
  ]},
  {slug:'contact',title:'Contact GLEAMS',subtitle:'We would love to hear from you.',description:'Connect, collaborate and grow with GLEAMS.',sections:[
    sec('hero','Great things begin with a conversation.',{label:'GET IN TOUCH',subheading:'Whether you are a creator, brand, storyteller or potential partner, there is a place for you here.'}),
    sec('contact','Start the conversation.',{label:'CONTACT'})
  ]}
];
async function main(){
  if(!process.env.DB_USER||!process.env.DB_PASSWORD){throw new Error('Set DB_USER and DB_PASSWORD in server/.env before installing schema');}
  const schema=readFileSync(schemaPath,'utf8');
  for(const statement of schema.split(/;\s*\n/).map(s=>s.trim()).filter(Boolean)) await pool.query(statement.replace(/;$/,''));
  console.log('[GLEAMS] Tables ready');
  const settings={
    brand:{name:'GLEAMS',descriptor:'THE CREATIVE ECOSYSTEM',tagline:'African creativity deserves the world.',logoUrl:'',faviconUrl:'',headerCtaLabel:'Let’s connect',headerCtaUrl:'/contact'},
    contact:{email:'',phone:'',address:'Lagos, Nigeria',formIntro:'Tell us about your idea, your work, or how we can collaborate.'},
    social:{instagram:'',facebook:'',x:'',linkedin:'',youtube:'',tiktok:''},
    footer:{statement:'Connecting talent, culture and opportunity across Africa and beyond.',headline:'Let’s build the',headlineAccent:'next chapter.',bottomNote:'Culture makes connections.',copyright:'GLEAMS. All rights reserved.'},
    seo:{siteTitle:'GLEAMS — Pan-African Cultural & Creative Ecosystem',description:'Discover GLEAMS: a Pan-African creative ecosystem spanning awards, magazine, music, youth development and studios.'},
    announcement:{enabled:false,text:'',url:''}
  };
  for(const [key,value] of Object.entries(settings)) await query('INSERT IGNORE INTO site_settings (setting_key,value_json) VALUES (?,?)',[key,JSON.stringify(value)]);
  for(const p of pages){
    await query("INSERT IGNORE INTO pages (slug,title,subtitle,description,template,seo_title,seo_description,status) VALUES (?,?,?,?,?,?,?,'published')",
      [p.slug,p.title,p.subtitle,p.description,p.template||'default',p.title,p.description]);
    const [page]=await query('SELECT id FROM pages WHERE slug=?',[p.slug]);
    const [count]=await query('SELECT COUNT(*) total FROM page_sections WHERE page_id=?',[page.id]);
    if(count.total===0){for(let i=0;i<p.sections.length;i++){
      const s=p.sections[i];await query('INSERT INTO page_sections (page_id,type,label,heading,subheading,body,media_url,button_label,button_url,config,position,visible) VALUES (?,?,?,?,?,?,?,?,?,?,?,1)',
      [page.id,s.type,s.label,s.heading,s.subheading,s.body,s.media_url,s.button_label,s.button_url,JSON.stringify(s.config||{}),i*10]);
    }}
  }
  const nav=[['Home','/', 'header',0],['About','/about','header',10],['Awards','/awards','header',20],['Magazine','/magazine','header',30],['FIRST SOUND','/first-sound','header',40],['Foundation','/foundation','header',50],['Studios','/studios','header',60],['Contact','/contact','footer',50],['Stories','/stories','footer',40]];
  const [navCount]=await query('SELECT COUNT(*) total FROM navigation_items');
  if(!navCount.total){for(const [label,url,location,position] of nav) await query('INSERT INTO navigation_items (label,path,location,position) VALUES (?,?,?,?)',[label,url,location,position]);}
  for(const [name,slug] of [['Culture','culture'],['Music','music'],['People','people'],['Ideas','ideas'],['News','news']]) await query('INSERT IGNORE INTO categories (name,slug) VALUES (?,?)',[name,slug]);
  for(const [title,slug,description] of [['Events','events','Awards and ecosystem events'],['Initiatives','initiatives','Foundation programmes and initiatives'],['Partners','partners','Our creative and strategic partners']]) await query('INSERT IGNORE INTO collections (title,slug,description) VALUES (?,?,?)',[title,slug,description]);
  console.log('[GLEAMS] Seed completed. Existing content was preserved. No articles were fabricated or published.');
  await pool.end();
}
main().catch(async e=>{console.error('[GLEAMS] Setup error:',e.message);await pool.end();process.exit(1);});
