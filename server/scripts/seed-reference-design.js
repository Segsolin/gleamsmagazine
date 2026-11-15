/**
 * Install visual-reference content from the user-supplied GLEAMS walkthrough.
 * The data migration is intentionally opt-in and takes a DB snapshot of existing
 * page sections before replacing them. Re-run with --force only intentionally.
 * Note: original film/music media was NOT supplied; tracks have no playback URL.
 */
import {pool,query} from '../src/db.js';
const argForce=process.argv.includes('--force');
const R='/assets/reference/';
const s=(type,heading,opts={})=>({type,heading,label:'',subheading:'',body:'',media_url:'',button_label:'',button_url:'',config:{},...opts});
const eco=[
 {label:'EDITORIAL ARM',title:'Gleams Magazine',description:'Independent and uncompromising editorial storytelling across creativity, identity, people, ideas and culture.',url:'/magazine',cta:'Enter Magazine'},
 {label:'RECOGNITION',title:'Gleams Awards',description:'Celebrating Africa’s cultural excellence, ingenuity and influence across creative industry and community.',url:'/awards',cta:'Discover 2026 Awards'},
 {label:'IMPACT',title:'Gleams Foundation',description:'Creating sustainable pathways for young people through creative learning, social impact and opportunity.',url:'/foundation',cta:'Beyond the Spotlight'},
 {label:'PRODUCTION',title:'Gleams Studios',description:'Independent Pan-African film and storytelling production, bringing cinematic narratives to the world.',url:'/studios',cta:'View Film Slate'},
 {label:'DIALOGUE',title:'Gleams Conversations',description:'Ideas from the people shaping what comes next. On-demand interviews and cultural conversations.',url:'/conversations',cta:'Listen & Watch'},
 {label:'SONIC DISCOVERY',title:'First Sound by Gleams',description:'Discovering and uplifting new talent from across the continent and the diaspora.',url:'/first-sound',cta:'Explore Sound'},
 {label:'DEVELOPMENT & CAPACITY',title:'Gleams Creative Academy',description:'Building the next generation of African creative professionals through mentorship, learning and fellowships.',url:'/foundation',cta:'Explore Fellowships'}
];
const show=[
 {label:'RECOGNITION',title:'GLEAMS AWARDS 2026',description:'A modern cultural platform celebrating the continent’s creative excellence.',url:'/awards'},
 {label:'DIALOGUE',title:'THE DRIVE BY GLEAMS',description:'In-depth interviews and conversations with change-makers.',url:'/conversations'},
 {label:'SESSIONS',title:'GLEAMS INDUSTRY SESSIONS',description:'The future of the creative economy through insightful conversations.',url:'/conversations'},
 {label:'EDITORIAL',title:'GLEAMS ORIGINALS',description:'Culture, fashion and creativity, documented with care.',url:'/magazine'},
 {label:'SONIC',title:'FIRST SOUND SPOTLIGHT',description:'New artists. New sonic identities. A continent full of possibility.',url:'/first-sound'}
];
const awards=[
 {title:'African Cultural Impact Award',description:'Recognising artists, creators and institutions advancing African culture through enduring impact.',bullets:['Cultural Leadership','Creative Influence','Community Impact']},
 {title:'Living Heritage & Traditional Craft Prize',description:'Honouring the keepers of tradition and living heritage who enrich contemporary practice.',bullets:['Craftsmanship','Cultural Preservation','Intergenerational Knowledge']},
 {title:'Cultural Patronage & Philanthropy Award',description:'Recognising supporters and foundations that invest in sustaining African creative communities.',bullets:['Institutional Support','Sustainable Funding','Public Access']},
 {title:'Visual Arts & Spatial Design Distinction',description:'Honouring visual artists and architects whose public interventions and design shape African spaces.',bullets:['Contemporary Art','Architecture','Spatial Culture']},
 {title:'Creative Economy Pioneer Award',description:'Recognising founders and visionaries who build commercial infrastructure and opportunity.',bullets:['Creative Entrepreneurship','Sustainable Industry','Economic Influence']},
 {title:'Independent Studio & Production Innovation',description:'Celebrating studio founders, animators and independent production teams building world-class culture.',bullets:['Production Innovation','Independent Storytelling','Technical Excellence']},
 {title:'Cultural Technology & Digital Platform Prize',description:'Honouring digital platforms, creative technologies and projects connecting African culture to the world.',bullets:['Digital Distribution','Creative Technology','Digital Access']},
 {title:'Fashion & Textile Craftsmanship Award',description:'Honouring fashion designers and artisans whose work advances African fashion and textile craftsmanship.',bullets:['Design Heritage','Technical Craft','Contemporary Fashion']},
 {title:'Sonic Innovation & Composition Award',description:'Recognising composers, sound artists and producers shaping sonic landscapes.',bullets:['Composition','Sound Production','Creative Experimentation']},
 {title:'The Gleams Vanguard Prize (Emerging Voices)',description:'Dedicated to exceptional emerging talent under 30, demonstrating a clear creative direction.',bullets:['Emerging Cultural Vision','Social Perspective','Talent Development']},
 {title:'Lifetime Achievement in African Culture',description:'The highest honorary recognition for an individual who has made a lasting contribution to African culture.',bullets:['Cultural Legacy','Leadership','Enduring Influence']}
];
const fields=(...entries)=>entries.map(([key,label,placeholder='',type,required])=>({key,label,placeholder,type:type||(key==='email'?'email':'text'),required:required===undefined||required===''?true:!!required}));
const pages={
 home:[
 s('gleams_hero','GLEAMS',{label:'THE DIGITAL HEADQUARTERS',subheading:'Culture. Creativity. People. Ideas.',body:'A pan-African creative and cultural ecosystem built around storytelling, creativity, recognition, talent, ideas, opportunity, and lasting impact across the continent and its global diaspora.',media_url:R+'home-hero.webp',button_label:'EXPLORE GLEAMS',button_url:'/#ecosystem',config:{secondaryLabel:'ENTER GLEAMS MAGAZINE',secondaryUrl:'/magazine',links:[{title:'Editorial',subtitle:'Storytelling',url:'/magazine'},{title:'Excellence',subtitle:'Recognition',url:'/awards'},{title:'Foundation',subtitle:'Impact',url:'/foundation'},{title:'Studios',subtitle:'Original Films',url:'/studios'},{title:'Voices',subtitle:'Dialogue',url:'/conversations'},{title:'First Sound',subtitle:'Sound',url:'/first-sound'},{title:'Creative Academy',subtitle:'Academy',url:'/foundation'}]}}),
 s('ecosystem','The World of Gleams',{label:'ECOSYSTEM ARCHITECTURE',body:'Gleams is not a single product or media brand. It is a connected cultural ecosystem uniting storytelling, recognition, production, conversations, learning and social impact.',config:{cards:eco}}),
 s('showcase','ACTIVE ECOSYSTEM OPERATIONS',{label:'CREATIVITY AT GLEAMS',subheading:'ACTIVE / RIGHT NOW',config:{cards:show}}),
 s('editorial_hero','GLEAMS MAGAZINE',{label:'EDITORIAL PULSE',subheading:'Stories shaping African culture, creativity, and contemporary thought.',button_label:'EXPLORE GLEAMS MAGAZINE',button_url:'/magazine'}),
 s('magazine_feature','Cover feature',{config:{credit:'Kofi Mensah',creditRole:'Editorial Director, Gleams Magazine'}}),
 s('post_grid','Latest from the magazine',{label:'LATEST STORIES'}),
 s('newsletter','Receive The Gleams Editorial Dispatch',{label:'AN INTIMATE CREATIVE & IDEAS DISPATCH',subheading:'Ideas, films, people, perspective and cultural stories delivered to your inbox.'})
 ],
 magazine:[
 s('editorial_hero','GLEAMS MAGAZINE',{label:'EDITORIAL PULSE',subheading:'Stories shaping African culture, creativity, and contemporary thought.',button_label:'EXPLORE STORIES',button_url:'#stories'}),
 s('magazine_feature','The New Light: African Cinema Beyond Geography',{config:{credit:'Kofi Mensah',creditRole:'Editorial Director, Gleams Magazine'}}),
 s('post_grid','Explore Gleams Magazine',{label:'THE EDITORIAL ARCHIVE',config:{anchor:'stories'}}),
 s('newsletter','Receive The Gleams Editorial Dispatch',{label:'AN INTIMATE CREATIVE & IDEAS DISPATCH',subheading:'Ideas, films and people delivered to your inbox.'})
 ],
 awards:[
 s('dark_hero','GLEAMS AWARDS',{label:'THE CONTINENTAL RECOGNITION PLATFORM',subheading:'Celebrating the noble, the bold, the visionary.',body:'More than an event. An ecosystem. The Gleams Awards establishes a rigorous, peer-juried recognition framework that honours institutional longevity, exceptional craft, and transformative enterprise across the continent.',button_label:'SUBMIT A NOMINATION',button_url:'#nominate'}),
 s('text','Why the Gleams Awards Exists',{label:'INSTITUTIONAL PURPOSE',subheading:'A continental celebration of cultural ingenuity and legacy.',body:'At the heart of Gleams Awards is the recognition of cultural achievement, exceptional creative excellence, and meaningful impact across Africa and its global diaspora.'}),
 s('award_categories','Awards Categories & Framework',{label:'CONTINENTAL HONOURS',subheading:'Eleven areas of exceptional African creativity and cultural influence.',config:{cards:awards}}),
 s('form','Submit a 2026 Nomination',{label:'OFFICIAL NOMINATION',subheading:'Recommend a peer, a movement, a body of work, or an emerging person.',button_label:'SUBMIT NOMINATION DOSSIER',config:{anchor:'nominate',subject:'GLEAMS Awards — 2026 Nomination',fields:fields(['full_name','YOUR NAME (NOMINATOR)','Your full name'],['email','YOUR CONTACT EMAIL','name@example.com','',''],['nominee_name','NOMINEE / ORGANIZATION NAME','Nominee'],['category','AWARD CATEGORY','Choose category','select'],['portfolio','PORTFOLIO, SOCIALS OR WEBSITE URL','Website or social link'],['details','STATEMENT OF JUSTIFICATION','Why this nominee deserves recognition','textarea']) .map(f=>f.key==='category'?{...f,options:awards.map(a=>a.title),required:true}:f)}}),
 s('feature_split','The Gleams Fashion Showcase',{label:'CRAFT & CULTURAL SHOWCASE',subheading:'Transforming the continental stage into a narrative gallery of African design.',body:'Highlighting exceptional African fashion and textile artistry through a dedicated platform for innovation, original design and cultural expression.',media_url:R+'fashion.webp',button_label:'DESIGNER & INDUSTRY INQUIRIES',button_url:'#partner'}),
 s('form','Partner with The Gleams Awards',{label:'INSTITUTIONAL ALLIANCES',subheading:'Help build recognition and opportunity across the African cultural landscape.',button_label:'SUBMIT INQUIRY',config:{anchor:'partner',subject:'2026 GLEAMS Awards Partnership Inquiry',fields:fields(['organization','ORGANIZATION / INSTITUTION NAME','e.g., Cultural Foundation / Media Group'],['email','INSTITUTIONAL CONTACT EMAIL','executive@institution.org','',''],['stream','PARTNERSHIP STREAM','Choose stream','select'],['message','YOUR PARTNERSHIP PROPOSAL','Tell us more','textarea']).map(f=>f.key==='stream'?{...f,options:['Pillar Patronage (Category Naming)','Media & Broadcasting','Cultural Foundation Partner','Production & Events Partner']}:f)}})
 ],
 studios:[
 s('dark_hero','GLEAMS STUDIOS',{label:'VISUAL PRODUCTION ARM',subheading:'Stories made to be seen.',body:'Gleams Studios is an independent pan-African production house and soundstage network. We produce original documentaries, narrative feature films, and commercial storytelling grounded in authentic African aesthetics and uncompromising craft.',button_label:'COMMISSION THE STUDIO',button_url:'/contact'}),
 s('text','End-to-End Creative Capabilities',{label:'STUDIO INFRASTRUCTURE',body:'Original documentaries, narrative film, commercial storytelling, production development, post-production, and culturally-rooted visual work.',config:{theme:'dark'}}),
 s('film_gallery','Selected Film Works',{label:'REEL & SLATE',subheading:'ORIGINAL VISUAL NARRATIVES',config:{collection:'films'}}),
 s('collection_cards','Gleams Initiatives',{label:'INITIATIVE / FILM DEVELOPMENT',config:{collection:'initiatives'}}),
 s('form','Commission Gleams Studios',{label:'PRODUCTION INQUIRY',subheading:'Share your brief with our production team.',button_label:'SUBMIT PROJECT BRIEF',config:{subject:'GLEAMS Studios — Production Inquiry',theme:'dark',fields:fields(['full_name','YOUR NAME','Full name'],['email','EMAIL ADDRESS','name@example.com','',''],['project','PROJECT NAME','Working title'],['budget','PROJECT SCALE / BUDGET','Optional'],['message','CREATIVE BRIEF','Tell us about your production','textarea'])}})
 ],
 conversations:[
 s('editorial_hero','GLEAMS CONVERSATIONS',{label:'INTELLECTUAL CURIOSITY • CREATIVE DIALOGUE',subheading:'Ideas from the people building what comes next.',body:'Gleams Conversations hosts critical dialogue across the culture. The Drive by Gleams, intimate editorial journeys with cultural pioneers, and Gleams Industry Sessions, forensic economic analysis, is here to unpack Africa’s creative and economic future.'}),
 s('conversations_grid','Ideas, voices, dialogue',{label:'CONVERSATION FORMATS',config:{cards:[{label:'CONVERSATION SERIES',title:'The Drive by Gleams',description:'Shedding light on the purpose and ideas of the cultural world through honest conversations.',quote:'What happens when we put Africa’s future on the road?',image:R+'studio-night.webp',media_url:''},{label:'INDUSTRY SESSIONS',title:'Gleams Industry Sessions',description:'High-stakes dialogue around media, culture, capital markets, policy, tech, and the global creative economy.',quote:'The new economic frontier of Africa’s cultural powerhouse.',image:R+'sound-microphone.webp',media_url:''}]}}),
 s('audio_list','Featured Sessions',{label:'RECORDED SESSIONS',config:{collection:'conversations'}})
 ],
 'first-sound':[
 s('editorial_hero','FIRST SOUND BY GLEAMS',{label:'SONIC VANGUARD • TALENT DISCOVERY',subheading:'Discovering the next voices shaping the continental soundscape.',body:'First Sound bypasses corporate algorithms to unearth fearless sonic architects across Africa. From Sub-Bass Highlife in Kumasi to deep Soweto futurist jazz and Kinshasa alté, we provide emerging musicians with master rights protection, studio funding, and curated global distribution.'}),
 s('audio_spotlight','Current Spotlight Artists',{label:'CURATED SELECTION',subheading:'CLICK ANY TRACK TO AUDITION',config:{collection:'first-sound'}}),
 s('form','Submit Your Sound',{label:'DISCOVERY ARTISTS',subheading:'Are you an emerging African music artist or music producer? Submit your demo directly to First Sound’s curation team.',button_label:'SUBMIT TO LISTENING DESK',config:{anchor:'submit',subject:'FIRST SOUND — Artist Submission',theme:'cream',fields:fields(['full_name','ARTIST / STAGE NAME','Stage name'],['email','CONTACT EMAIL','name@example.com','',''],['country','COUNTRY / CITY','Where are you from?'],['genre','TRACK STYLE / GENRE','Alternative, Afro-jazz etc'],['link','AUDIO LINK (STREAM / DEMO / DRIVE)','Link to music', 'url'],['message','ABOUT YOUR SOUND','Tell us about your sound','textarea'])}})
 ],
 foundation:[
 s('dark_hero','GLEAMS FOUNDATION',{label:'CULTURE • OPPORTUNITY • SOCIAL IMPACT',subheading:'Beyond the spotlight.',body:'The Foundation is dedicated to community, creative education, youth empowerment and sustainable pathways into the cultural economy.',button_label:'EXPLORE INITIATIVES',button_url:'#next'}),
 s('text','Opening doors for the next generation',{label:'OUR PURPOSE',body:'Our initiatives bring culture, education, practical support, mentorship and opportunity together for emerging African creative talent.',config:{theme:'cream'}}),
 s('collection_cards','Current Initiatives',{label:'THE GLEAMS FOUNDATION',config:{collection:'initiatives'}})
 ],
 about:[s('dark_hero','THE WORLD OF GLEAMS',{label:'PAN-AFRICAN ECOSYSTEM',subheading:'Culture. Creativity. People. Ideas.',body:'A connected cultural ecosystem spanning editorial, awards, studios, conversations, emerging sound, creative learning and community impact.'}),s('ecosystem','The World of Gleams',{label:'ECOSYSTEM ARCHITECTURE',config:{cards:eco}})],
 contact:[s('dark_hero','PARTNER WITH GLEAMS',{label:'CONTACT / COLLABORATE',subheading:'Build something worth remembering.',body:'Tell us about your editorial, cultural, partnership or production idea.'}),s('form','Get in Touch',{label:'INSTITUTIONAL ENQUIRIES',subheading:'Contact the Gleams team.',button_label:'SEND ENQUIRY',config:{subject:'GLEAMS — General Enquiry',fields:fields(['full_name','FULL NAME','Your full name'],['email','EMAIL ADDRESS','name@example.com','',''],['subject','SUBJECT','How can we help?'],['message','MESSAGE','Tell us about your enquiry','textarea'])}})]
};
const postDrafts=[
 ['the-new-light-african-cinema-beyond-geography','The New Light: African Cinema Beyond Geography','Across West and East Africa, a new generation of visual storytellers is rejecting western festival validation, crafting immersive films that treat African cities not as backdrops, but as living, kinetic cultural spaces.','Culture','magazine-cover.webp',true],
 ['thread-soil-silicon-accra-avant-garde-textile-movement','Thread, Soil & Silicon: Accra’s Avant-Garde Textile Movement','Transforming discarded global consumer textiles into architectural haute couture, Ghanaian designers redefine luxury.','Fashion','fashion.webp',false],
 ['quiet-titans-financing-africas-creative-infrastructure','The Quiet Titans: Financing Africa’s Creative Infrastructure','How private equity and visionary angel syndicates are investing in sound stages, intellectual property, and streaming platforms.','Business','business.webp',false],
 ['sonic-cartography-beyond-afrobeats-monolith','Sonic Cartography: Beyond the Afrobeats Monolith','Amapiano, Alté, Drill-Fuji, and Highlife Electronica converge in the subterranean basement clubs of Nairobi and Lagos.','Creativity','sound-microphone.webp',false],
 ['monoliths-of-chic-the-radical-architecture-of-tropical-modernism','Monoliths of Chic: The Radical Architecture of Tropical Modernism','Exploring African architecture and contemporary design.','Ideas','business.webp',false],
 ['ferment-memory-new-pan-african-culinary-grammar','Ferment & Memory: The New Pan-African Culinary Grammar','Chefs returning from Michelin kitchens in Paris and Tokyo reopen forgotten pantry techniques in Dakar and Johannesburg.','People','fashion.webp',false]
];
const entries={
 films:[
 ['eko-noir-the-neon-lagoon','Eko Noir: The Neon Lagoon','An original cinematic portrait of Lagos.',R+'home-hero.webp',{category:'ORIGINAL FEATURE',duration:'86 MIN',media_url:''}],
 ['the-indigo-weaver-of-kano','The Indigo Weaver of Kano','A visual story exploring craftsmanship, textile heritage and contemporary African making.',R+'fashion.webp',{category:'DOCUMENTARY',duration:'IN PRODUCTION',media_url:''}],
 ['sons-of-the-red-dust','Sons of the Red Dust','Official film reel preview. Private screening and distribution dossiers are available upon accreditation request.',R+'studio-night.webp',{category:'FEATURE NARRATIVE',credit:'Director: Tendai Mutasa',media_url:''}],
 ['aura-continental-branded-storytelling','Aura: Continental Branded Storytelling','Creative development and cinematic storytelling in partnership with brands and cultural organisations.',R+'studio-night.webp',{category:'BRANDED FILM',media_url:''}]
 ],
 conversations:[
 ['scale-independence-and-the-lagos-gaze','Scale, Independence & The Lagos Gaze','A conversation on African cinema, independent filmmaking and the industry’s next chapter.',R+'magazine-cover.webp',{speaker:'Kunle Afolayan',label:'THE DRIVE • EP 06',audio_url:''}],
 ['reclaiming-the-museum-in-the-passenger-seat','Reclaiming the Museum in the Passenger Seat','Conversations about African heritage, creative institutions and what comes next.',R+'business.webp',{label:'THE DRIVE',audio_url:''}],
 ['the-billion-dollar-catalog-ip-rights-and-continental-sound','The Billion-Dollar Catalog: IP Rights & Continental Sound','The value of African creative work, rights and music distribution.',R+'sound-microphone.webp',{label:'INDUSTRY SESSION',audio_url:''}],
 ['vernacular-architecture-designing-the-african-megacity','Vernacular Architecture: Designing the African Megacity','Design and architecture across Africa’s growing urban centres.',R+'studio-night.webp',{label:'INDUSTRY SESSION',audio_url:''}]
 ],
 'first-sound':[
 ['odo-nwa-living-water','Òdò Nwa (Living Water)','Spotlighted sound from the next generation of African music.',R+'magazine-cover.webp',{artist:'FIRST SOUND SPOTLIGHT',audio_url:''}],
 ['azania-transit-route','Azania Transit Route','A curated musical journey across the continent.',R+'sound-microphone.webp',{artist:'FIRST SOUND SPOTLIGHT',audio_url:''}],
 ['fleurs-sauvages','Fleurs Sauvages','A new voice from the African sonic vanguard.',R+'fashion.webp',{artist:'FIRST SOUND SPOTLIGHT',audio_url:''}],
 ['nyariri-sky','Nyariri Sky','New sonic identities and emerging talent.',R+'business.webp',{artist:'FIRST SOUND SPOTLIGHT',audio_url:''}]
 ],
 initiatives:[
 ['slum-2-screen','Slum 2 Screen','An immersive creative training program providing youth from underserved communities across Lagos with cinematic production skills, practical experience and direct production opportunities.',R+'studio-night.webp',{}],
 ['gleams-creative-academy-fellowships','Gleams Creative Academy Fellowships','Pan-African professional apprenticeships and talent pathways.',R+'business.webp',{}]
 ]
};
async function main(){
 if(!process.env.DB_USER||!process.env.DB_PASSWORD)throw new Error('Set DB credentials in server/.env first');
 const [flag]=await query('SELECT setting_key FROM site_settings WHERE setting_key=?',['reference_design_seeded_v1']);
 if(flag&&!argForce){console.log('[GLEAMS] Reference design already installed. To replace sections AGAIN, run npm run design:seed -- --force (backs up current content).');return;}
 await query(`CREATE TABLE IF NOT EXISTS gleams_design_backups (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,page_slug VARCHAR(160) NOT NULL,sections_json LONGTEXT NOT NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
 for(const [slug,sections] of Object.entries(pages)){
  const conn=await pool.getConnection();try{await conn.beginTransaction();
   await conn.execute("INSERT INTO pages (slug,title,description,status) VALUES (?,?,?,'published') ON DUPLICATE KEY UPDATE status='published'",[slug,slug==='home'?'GLEAMS':slug.replaceAll('-',' ').toUpperCase(),`GLEAMS ${slug} reference-inspired editorial design`]);
   const [[p]]=await conn.execute('SELECT id FROM pages WHERE slug=?',[slug]);
   const [old]=await conn.execute('SELECT * FROM page_sections WHERE page_id=? ORDER BY position,id',[p.id]);
   if(old.length){await conn.execute('INSERT INTO gleams_design_backups (page_slug,sections_json) VALUES (?,?)',[slug,JSON.stringify(old)]);await conn.execute('DELETE FROM page_sections WHERE page_id=?',[p.id]);}
   for(let i=0;i<sections.length;i++){const x=sections[i];await conn.execute('INSERT INTO page_sections (page_id,type,label,heading,subheading,body,media_url,button_label,button_url,config,position,visible) VALUES (?,?,?,?,?,?,?,?,?,?,?,1)',[p.id,x.type,x.label,x.heading,x.subheading,x.body,x.media_url,x.button_label,x.button_url,JSON.stringify(x.config||{}),i*10]);}
   await conn.commit();console.log(`[GLEAMS] ${slug}: ${sections.length} editable sections installed. Original sections backed up: ${old.length}`);
  }catch(e){await conn.rollback();throw e}finally{conn.release()}
 }
 for(const [slug,title,desc,cat,img,featured] of postDrafts){
  await query('INSERT IGNORE INTO categories (name,slug) VALUES (?,?)',[cat,cat.toLowerCase()]);
  const [category]=await query('SELECT id FROM categories WHERE slug=?',[cat.toLowerCase()]);
  await query("INSERT IGNORE INTO posts (slug,title,excerpt,body,cover_image,category_id,status,featured,published_at) VALUES (?,?,?,?,?,?, 'published',?,UTC_TIMESTAMP())",[slug,title,desc,desc+'\n\n[Full article text to be supplied and edited in the admin dashboard.]',R+img,category.id,featured?1:0]);
 }
 for(const [slug,items] of Object.entries(entries)){
  await query('INSERT IGNORE INTO collections (title,slug,description) VALUES (?,?,?)',[slug.replaceAll('-',' ').toUpperCase(),slug,'GLEAMS media / cultural work']);
  const[c]=await query('SELECT id FROM collections WHERE slug=?',[slug]);
  for(let i=0;i<items.length;i++){const[id,title,description,image,metadata]=items[i];await query("INSERT IGNORE INTO collection_items (collection_id,slug,title,description,image_url,metadata,position,status) VALUES (?,?,?,?,?,?,?,'published')",[c.id,id,title,description,image,JSON.stringify(metadata),i*10]);}
 }
 const nav=[['PAN-AFRICAN ECOSYSTEM','/',0],['MAGAZINE','/magazine',10],['AWARDS','/awards',20],['STUDIOS','/studios',30],['CONVERSATIONS','/conversations',40],['FOUNDATION','/foundation',50],['FIRST SOUND','/first-sound',60]];
 for(const[label,path,pos]of nav){const [existing]=await query("SELECT id FROM navigation_items WHERE location='header' AND path=? LIMIT 1",[path]);if(existing){await query('UPDATE navigation_items SET label=?,position=?,visible=1 WHERE id=?',[label,pos,existing.id]);}else await query("INSERT INTO navigation_items (label,path,location,position,visible) VALUES (?,?,'header',?,1)",[label,path,pos]);}
 await query("UPDATE navigation_items SET visible=0 WHERE location='header' AND path IN ('/about','/contact') AND label IN ('About','Contact')");
 const footer={statement:'Gleams — Culture. Creativity. People. Ideas. Opportunity.',headline:'SOMETHING WORTH',headlineAccent:'REMEMBERING.',copyright:'GLEAMS. ALL RIGHTS RESERVED.'};
 await query('INSERT INTO site_settings (setting_key,value_json) VALUES (?,?) ON DUPLICATE KEY UPDATE value_json=JSON_MERGE_PATCH(value_json,VALUES(value_json))',['footer',JSON.stringify(footer)]);
 await query('INSERT INTO site_settings (setting_key,value_json) VALUES (?,?) ON DUPLICATE KEY UPDATE value_json=VALUES(value_json)',['reference_design_seeded_v1',JSON.stringify({version:1,at:new Date().toISOString(),source:'User supplied UI preview video'})]);
 console.log('[GLEAMS] Reference-inspired design seeded. Original full-resolution media files and licensed font files must be supplied separately.');
}
main().catch(e=>{console.error('[GLEAMS] Design seed failed:',e);process.exitCode=1}).finally(()=>pool.end());
