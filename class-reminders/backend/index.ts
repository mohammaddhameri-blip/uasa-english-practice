import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import webpush from 'npm:web-push@3.6.7';
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const origin='https://mohammaddhameri-blip.github.io';
const url=origin+'/uasa-english-practice/class-reminders/';
const hash=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');
const token=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
const code=(prefix:string)=>prefix+'-'+crypto.randomUUID().replaceAll('-','').slice(0,20).toUpperCase();
async function q(query:any){const {data,error}=await query;if(error)throw new Error('Database operation failed');return data;}
const fail=(m:string,status=400)=>{throw Object.assign(new Error(m),{status});};
const clean=(s:any,max:number)=>typeof s==='string'?s.trim().slice(0,max):'';
async function config(){return (await q(db.from('cr_config').select('value').eq('key','push').single())).value;}
async function classes(a:any){
 if(a.role==='parent'){const children=await q(db.from('cr_children').select('student_id').eq('account_id',a.id));if(!children.length)return [];return [...new Set((await q(db.from('students').select('class_name').in('id',children.map((x:any)=>x.student_id)))).map((x:any)=>x.class_name))];}
 return (await q(db.from('cr_memberships').select('class_name').eq('account_id',a.id))).map((x:any)=>x.class_name);
}
async function session(a:any){const t=token();await q(db.from('cr_sessions').insert({token_hash:await hash(t),account_id:a.id,expires_at:new Date(Date.now()+(a.role==='parent'?30:1)*86400000).toISOString()}));return {token:t,account:{id:a.id,name:a.name,role:a.role}};}
async function student(c:any){const s=await q(db.from('students').select('id,display_name,class_name').eq('pupil_code',clean(c,80).toUpperCase()).maybeSingle());if(!s)fail('Pupil code not recognised. Ask your class teacher.');return s;}
async function dispatch(){
 const cfg=await config();const jobs=await q(db.rpc('cr_claim_jobs'));let sent=0;
 for(const job of jobs){
  const p=await q(db.from('cr_posts').select('*').eq('id',job.post_id).single());
  if(p.archived || Date.parse(job.run_at)<Date.now()-7*86400000){await q(db.from('cr_jobs').update({done:true}).eq('id',job.id));continue;}
  const members=await q(db.from('cr_memberships').select('account_id').eq('class_name',p.class_name));
  const pupils=await q(db.from('students').select('id').eq('class_name',p.class_name));
  const parents=pupils.length?await q(db.from('cr_children').select('account_id').in('student_id',pupils.map((x:any)=>x.id))):[];
  const ids=[...new Set([...members,...parents].map((x:any)=>x.account_id))];
  const active=ids.length?await q(db.from('cr_accounts').select('id').in('id',ids).eq('active',true)):[];
  const subs=active.length?await q(db.from('cr_subscriptions').select('*').in('account_id',active.map((x:any)=>x.id))):[];
  const delivered=await q(db.from('cr_deliveries').select('subscription_id').eq('job_id',job.id));const done=new Set(delivered.map((x:any)=>x.subscription_id));let retry=false;
  for(const sub of subs){if(done.has(sub.id))continue;
   try{
    const req=webpush.generateRequestDetails(sub.subscription,JSON.stringify({title:job.kind==='reminder'?'Class reminder':'New class update',body:p.class_name+' · '+p.category+' — open Classbell to read.',url,tag:p.id}),{TTL:86400,vapidDetails:{subject:url,publicKey:cfg.publicKey,privateKey:cfg.privateKey}});
    const res=await fetch(req.endpoint,{method:'POST',headers:req.headers,body:new Uint8Array(req.body),signal:AbortSignal.timeout(8000)});
    if(res.status===404||res.status===410){await q(db.from('cr_subscriptions').delete().eq('id',sub.id));continue;}
    if(!res.ok){retry=true;continue;}
    await q(db.from('cr_deliveries').upsert({job_id:job.id,subscription_id:sub.id}));sent++;
   }catch{retry=true;}
  }
  if(!retry)await q(db.from('cr_jobs').update({done:true}).eq('id',job.id));
 }
 return {processed:jobs.length,sent};
}
Deno.serve(async(req)=>{
 const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type, authorization, x-dispatch-key','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
 const respond=(data:any,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return respond({error:'POST required'},405);
 try{
  if(Number(req.headers.get('content-length')||0)>20000)fail('Request too large',413);
  const b=await req.json();const action=b.action;
  if(action==='dispatch'){const cfg=await config();if(await hash(req.headers.get('x-dispatch-key')||'')!==cfg.dispatchHash)fail('Not authorised',401);return respond(await dispatch());}
  if(['login','register','link'].includes(action)){
   const ip=(req.headers.get('x-forwarded-for')||'unknown').split(',')[0];const allowed=await q(db.rpc('cr_rate_limit',{p_key:await hash(ip)}));if(!allowed)fail('Too many attempts. Please try again in 15 minutes.',429);
  }
  if(action==='login'){const a=await q(db.from('cr_accounts').select('*').eq('code_hash',await hash(clean(b.code,100).toUpperCase())).eq('active',true).maybeSingle());if(!a)fail('Access code not recognised.',401);return respond(await session(a));}
  if(action==='register'){
   const s=await student(b.pupilCode);const name=clean(b.name,60);if(!name)fail('Enter your name.');
   const c=code('PAR');const a=await q(db.from('cr_accounts').insert({name,role:'parent',code_hash:await hash(c)}).select().single());await q(db.from('cr_children').insert({account_id:a.id,student_id:s.id}));return respond({...await session(a),code:c});
  }
  const t=req.headers.get('authorization')?.replace(/^Bearer /,'')||'';
  const ss=await q(db.from('cr_sessions').select('account_id').eq('token_hash',await hash(t)).gt('expires_at',new Date().toISOString()).maybeSingle());if(!ss)fail('Please sign in again.',401);
  const a=await q(db.from('cr_accounts').select('id,name,role,active').eq('id',ss.account_id).eq('active',true).maybeSingle());if(!a)fail('Access has been disabled.',401);
  const cs=await classes(a);const teacher=a.role!=='parent';
  if(action==='logout'){await q(db.from('cr_sessions').delete().eq('token_hash',await hash(t)));if(b.endpoint)await q(db.from('cr_subscriptions').delete().eq('account_id',a.id).eq('endpoint',b.endpoint));return respond({ok:true});}
  if(action==='feed'){
   const posts=cs.length?await q(db.from('cr_posts').select('id,author_id,class_name,category,title,body,due_at,remind_at,created_at').in('class_name',cs).eq('archived',false).order('created_at',{ascending:false}).limit(200)):[];
   const seen=posts.length?await q(db.from('cr_seen').select('post_id,account_id').in('post_id',posts.map((p:any)=>p.id))):[];
   let children=[];if(!teacher){const links=await q(db.from('cr_children').select('student_id').eq('account_id',a.id));children=links.length?await q(db.from('students').select('id,display_name,class_name').in('id',links.map((x:any)=>x.student_id))):[];}
   return respond({account:a,classes:cs,children,posts:posts.map((p:any)=>({...p,seen:seen.some((s:any)=>s.post_id===p.id&&s.account_id===a.id),seenCount:teacher?seen.filter((s:any)=>s.post_id===p.id).length:undefined})),pushKey:(await config()).publicKey});
  }
  if(action==='link'){if(teacher)fail('Parent access required',403);const s=await student(b.pupilCode);await q(db.from('cr_children').upsert({account_id:a.id,student_id:s.id}));return respond({ok:true});}
  if(action==='seen'||action==='archive'){
   const p=await q(db.from('cr_posts').select('*').eq('id',b.id).maybeSingle());if(!p||!cs.includes(p.class_name))fail('Update unavailable',403);
   if(action==='seen')await q(db.from('cr_seen').upsert({post_id:p.id,account_id:a.id}));else {if(!teacher)fail('Teacher access required',403);await q(db.from('cr_posts').update({archived:true}).eq('id',p.id));}return respond({ok:true});
  }
  if(action==='post'){
   if(!teacher||!cs.includes(b.className))fail('You are not assigned to this class.',403);
   const title=clean(b.title,120),body=clean(b.body,3000),category=b.category;
   if(!title||!['homework','meeting','cleaning','fee','exam','event','announcement'].includes(category))fail('Add a title and category.');
   const due=b.dueAt?new Date(b.dueAt).toISOString():null;const hours=Number(b.reminderHours||0);
   if(![0,1,24,48].includes(hours))fail('Invalid reminder');
   const remind=due&&hours?new Date(Date.parse(due)-hours*3600000).toISOString():null;
   if(remind&&Date.parse(remind)<=Date.now())fail('Choose a later deadline or switch off the reminder.');
   const id=await q(db.rpc('cr_create_post',{p_author:a.id,p_class:b.className,p_category:category,p_title:title,p_body:body,p_due:due,p_remind:remind}));return respond({ok:true,id});
  }
  if(action==='subscribe'){
   const s=b.subscription;let ep:URL;try{ep=new URL(s.endpoint);}catch{fail('Invalid push subscription');}
   const h=ep!.hostname;if(ep!.protocol!=='https:'||ep!.port||!(h==='fcm.googleapis.com'||h==='updates.push.services.mozilla.com'||h.endsWith('.push.services.mozilla.com')||h==='web.push.apple.com'||h.endsWith('.push.apple.com')))fail('Unsupported push provider');
   if(!/^[A-Za-z0-9_-]{80,100}$/.test(s.keys?.p256dh)||!/^[A-Za-z0-9_-]{20,30}$/.test(s.keys?.auth))fail('Invalid push keys');
   await q(db.from('cr_subscriptions').upsert({account_id:a.id,endpoint:s.endpoint,subscription:s},{onConflict:'endpoint'}));return respond({ok:true});
  }
  if(action==='unsubscribe'){await q(db.from('cr_subscriptions').delete().eq('account_id',a.id).eq('endpoint',b.endpoint));return respond({ok:true});}
  if(a.role==='admin'&&action==='teachers'){
   const teachers=await q(db.from('cr_accounts').select('id,name,role,active').in('role',['teacher','admin']));const memberships=await q(db.from('cr_memberships').select('*'));const students=await q(db.from('students').select('class_name'));return respond({teachers:teachers.map((t:any)=>({...t,classes:memberships.filter((m:any)=>m.account_id===t.id).map((m:any)=>m.class_name)})),classes:[...new Set(students.map((s:any)=>s.class_name))].sort()});
  }
  if(a.role==='admin'&&action==='createTeacher'){
   const name=clean(b.name,60);const existing=await q(db.from('students').select('class_name'));const valid=new Set(existing.map((s:any)=>s.class_name));const list=[...new Set(b.classes||[])];if(!name||!list.length||list.some(x=>!valid.has(x)))fail('Enter a name and valid classes.');
   const c=code('TCH');const row=await q(db.from('cr_accounts').insert({name,role:'teacher',code_hash:await hash(c)}).select('id').single());await q(db.from('cr_memberships').insert(list.map(class_name=>({account_id:row.id,class_name}))));return respond({code:c});
  }
  if(a.role==='admin'&&action==='disableTeacher'){if(b.id===a.id)fail('You cannot disable your own access.');await q(db.from('cr_accounts').update({active:false}).eq('id',b.id).eq('role','teacher'));return respond({ok:true});}
  fail('Unknown action',404);
 }catch(e){return respond({error:e.status?e.message:'Something went wrong. Please try again.'},e.status||500);}
});
