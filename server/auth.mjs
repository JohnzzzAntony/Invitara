import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const derive=promisify(scrypt),digest=value=>createHash('sha256').update(value).digest('hex');
export function initAuth(db){db.exec('CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,salt TEXT NOT NULL,password TEXT NOT NULL,recovery TEXT NOT NULL); CREATE TABLE IF NOT EXISTS account_sessions (token TEXT PRIMARY KEY,owner TEXT NOT NULL,expires INTEGER NOT NULL)');}
export function accountFor(db,token){return db.prepare('SELECT a.id,a.email FROM accounts a JOIN account_sessions s ON s.owner=a.id WHERE s.token=? AND s.expires>?').get(token,Date.now())||null;}
export function mountAuth(app,db,production){
 const options={httpOnly:true,secure:production,sameSite:'lax',maxAge:365*86400000,path:'/'};
 function signIn(res,id){const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO account_sessions VALUES (?,?,?)').run(digest(token),id,Date.now()+365*86400000);res.cookie('invitara_owner',token,options);}
 app.get('/api/me',(req,res)=>res.json({account:req.account||null}));
 app.post('/api/auth/logout',(req,res)=>{db.prepare('DELETE FROM account_sessions WHERE token=?').run(req.sessionHash);res.clearCookie('invitara_owner',{path:'/',secure:production,sameSite:'lax'});res.json({ok:true});});
 app.post('/api/auth/:action',async(req,res)=>{
  const {action}=req.params;const email=String(req.body.email||'').trim().toLowerCase(),password=String(req.body.password||'');
  if(!['login','register','recover'].includes(action))return res.sendStatus(404);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||password.length<12||password.length>128)return res.status(400).json({error:'Use a valid email and a password of 12–128 characters.'});
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
   db.prepare('DELETE FROM account_sessions WHERE owner=?').run(record.id);signIn(res,record.id);return res.json({account:{id:record.id,email},recovery:newRecovery});
  }
  const key=Buffer.from(await derive(password,record?.salt||'missing-account-salt',64));
  if(!record||!timingSafeEqual(key,Buffer.from(record.password,'hex')))return res.status(401).json({error:'The email or password is incorrect.'});
  signIn(res,record.id);res.json({account:{id:record.id,email}});
 });
}
