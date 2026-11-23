import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const derive=promisify(scrypt),digest=value=>createHash('sha256').update(value).digest('hex');
export function initAuth(db){db.exec('CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,salt TEXT NOT NULL,password TEXT NOT NULL,recovery TEXT NOT NULL); CREATE TABLE IF NOT EXISTS account_sessions (token TEXT PRIMARY KEY,owner TEXT NOT NULL,expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS password_resets (token TEXT PRIMARY KEY,owner TEXT NOT NULL,expires INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS auth_events (owner TEXT NOT NULL,event TEXT NOT NULL,at TEXT NOT NULL)');}
export function accountFor(db,token){return db.prepare('SELECT a.id,a.email FROM accounts a JOIN account_sessions s ON s.owner=a.id WHERE s.token=? AND s.expires>?').get(token,Date.now())||null;}
// Sends the reset link through Resend's HTTP API. Without RESEND_API_KEY, development logs the link; production sends nothing.
async function sendResetEmail(email,link,production){
 const key=process.env.RESEND_API_KEY,brand=process.env.BUSINESS_NAME||'momentsiz';
 if(!key){if(!production)console.log('Password reset link (dev only): '+link);return;}
 const text='Someone asked to reset the password for your '+brand+' account.\n\nReset it within 30 minutes: '+link+'\n\nIf this was not you, ignore this email. Your password stays the same.';
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.MAIL_FROM||brand+' <noreply@momentsiz.com>',to:[email],subject:'Reset your '+brand+' password',text})});
 if(!r.ok)throw Error('Mail provider returned '+r.status);
}
export const emailResetEnabled=production=>!!process.env.RESEND_API_KEY||!production;
export function mountAuth(app,db,production,limited,origin){
 const audit=(owner,event)=>db.prepare('INSERT INTO auth_events VALUES (?,?,?)').run(owner,event,new Date().toISOString());
 const hashPassword=async password=>{const salt=randomBytes(16).toString('hex');return {salt,key:Buffer.from(await derive(password,salt,64)).toString('hex')};};
 const validPassword=password=>typeof password==='string'&&password.length>=12&&password.length<=128;
 const options={httpOnly:true,secure:production,sameSite:'lax',maxAge:365*86400000,path:'/'};
 function signIn(res,id){const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO account_sessions VALUES (?,?,?)').run(digest(token),id,Date.now()+365*86400000);res.cookie('invitara_owner',token,options);}
 app.get('/api/me',(req,res)=>res.json({account:req.account||null}));
 app.post('/api/auth/logout',(req,res)=>{db.prepare('DELETE FROM account_sessions WHERE token=?').run(req.sessionHash);res.clearCookie('invitara_owner',{path:'/',secure:production,sameSite:'lax'});res.json({ok:true});});
 // Same answer whether or not the email has an account, so the endpoint cannot be used to enumerate users.
 app.post('/api/auth/reset-request',(req,res)=>{
  const email=String(req.body.email||'').trim().toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return res.status(400).json({error:'Enter a valid email address.'});
  const done=()=>res.json({ok:true,message:'If an account uses that email, a reset link is on its way. It expires in 30 minutes.'});
  if(limited('reset-email:'+email,3))return done();
  const record=db.prepare('SELECT id FROM accounts WHERE email=?').get(email);
  if(!record||!emailResetEnabled(production))return done();
  const token=randomBytes(32).toString('hex');
  db.prepare('DELETE FROM password_resets WHERE owner=?').run(record.id);
  db.prepare('INSERT INTO password_resets VALUES (?,?,?)').run(digest(token),record.id,Date.now()+30*60000);
  audit(record.id,'reset-requested');
  // The token travels in the fragment so it never reaches server logs or Referer headers.
  sendResetEmail(email,origin+'/account.html#reset='+token,production).catch(e=>console.error('Reset email failed:',e.message));
  done();
 });
 app.post('/api/auth/reset',async(req,res)=>{
  const token=String(req.body.token||''),password=req.body.password;
  if(!/^[a-f0-9]{64}$/.test(token))return res.status(400).json({error:'This reset link is invalid. Request a new one.'});
  if(!validPassword(password))return res.status(400).json({error:'Use a password of 12–128 characters.'});
  const row=db.prepare('DELETE FROM password_resets WHERE token=? RETURNING owner,expires').get(digest(token));
  if(!row||row.expires<Date.now())return res.status(400).json({error:'This reset link has expired or was already used. Request a new one.'});
  const {salt,key}=await hashPassword(password);
  db.prepare('UPDATE accounts SET salt=?,password=? WHERE id=?').run(salt,key,row.owner);
  db.prepare('DELETE FROM password_resets WHERE owner=?').run(row.owner);
  db.prepare('DELETE FROM account_sessions WHERE owner=?').run(row.owner);
  audit(row.owner,'password-reset');
  signIn(res,row.owner);res.json({account:db.prepare('SELECT id,email FROM accounts WHERE id=?').get(row.owner)});
 });
 app.post('/api/auth/recovery-code',async(req,res)=>{
  if(!req.account)return res.status(401).json({error:'Sign in first.'});
  const record=db.prepare('SELECT * FROM accounts WHERE id=?').get(req.account.id),password=String(req.body.password||'');
  if(!timingSafeEqual(Buffer.from(await derive(password,record.salt,64)),Buffer.from(record.password,'hex')))return res.status(401).json({error:'Your current password is incorrect.'});
  const recovery=randomBytes(24).toString('hex');
  db.prepare('UPDATE accounts SET recovery=? WHERE id=?').run(digest(recovery),record.id);
  audit(record.id,'recovery-regenerated');res.json({recovery});
 });
 app.post('/api/auth/logout-all',(req,res)=>{
  if(!req.account)return res.status(401).json({error:'Sign in first.'});
  db.prepare('DELETE FROM account_sessions WHERE owner=?').run(req.account.id);audit(req.account.id,'logout-all');
  res.clearCookie('invitara_owner',{path:'/',secure:production,sameSite:'lax'});res.json({ok:true});
 });
 app.post('/api/auth/:action',async(req,res)=>{
  const {action}=req.params;const email=String(req.body.email||'').trim().toLowerCase(),password=String(req.body.password||'');
  if(!['login','register','recover'].includes(action))return res.sendStatus(404);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||password.length<12||password.length>128)return res.status(400).json({error:'Use a valid email and a password of 12–128 characters.'});
  // Per-email limit on top of the per-IP one: stops many IPs guessing one account's password.
  if(limited('auth-email:'+email,10))return res.status(429).json({error:'Too many attempts for this account. Please wait a minute.'});
  const record=db.prepare('SELECT * FROM accounts WHERE email=?').get(email);
  if(action==='register'){
   if(record)return res.status(409).json({error:'An account already uses that email. Sign in or use your recovery code.'});
   const id=randomBytes(16).toString('hex'),salt=randomBytes(16).toString('hex'),recovery=randomBytes(24).toString('hex');
   const key=Buffer.from(await derive(password,salt,64)).toString('hex');
   try{db.prepare('INSERT INTO accounts VALUES (?,?,?,?,?)').run(id,email,salt,key,digest(recovery));}catch{return res.status(409).json({error:'An account already uses that email.'});}
   if(!req.account)db.prepare('UPDATE projects SET owner=? WHERE owner=?').run(id,req.sessionHash);signIn(res,id);return res.json({account:{id,email},recovery});
  }
  if(action==='recover'){
   const recovery=String(req.body.recovery||'').trim();
   if(!record||!timingSafeEqual(Buffer.from(record.recovery,'hex'),Buffer.from(digest(recovery),'hex')))return res.status(401).json({error:'The email or recovery code is incorrect.'});
   const salt=randomBytes(16).toString('hex'),newRecovery=randomBytes(24).toString('hex'),key=Buffer.from(await derive(password,salt,64)).toString('hex');
   const changed=db.prepare('UPDATE accounts SET salt=?,password=?,recovery=? WHERE id=? AND recovery=?').run(salt,key,digest(newRecovery),record.id,record.recovery);
   if(!changed.changes)return res.status(401).json({error:'Recovery code was already used.'});
   db.prepare('DELETE FROM account_sessions WHERE owner=?').run(record.id);audit(record.id,'recovery-used');signIn(res,record.id);return res.json({account:{id:record.id,email},recovery:newRecovery});
  }
  const key=Buffer.from(await derive(password,record?.salt||'missing-account-salt',64));
  if(!record||!timingSafeEqual(key,Buffer.from(record.password,'hex')))return res.status(401).json({error:'The email or password is incorrect.'});
  signIn(res,record.id);res.json({account:{id:record.id,email}});
 });
}
