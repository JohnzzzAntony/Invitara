import express from 'express';
import { resolveOrigin } from './origin.mjs';
import { pageHtml } from './page-meta.mjs';
import Stripe from 'stripe';
import QRCode from 'qrcode';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from './catalog.mjs';
import { invitationState } from './invitation-state.mjs';
import { SECURITY_HEADERS } from '../config/security-headers.mjs';
import { eventExpiry, editable } from './access.mjs';
import { initAuth, accountFor, mountAuth } from './auth.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(root, 'public');
const production = process.env.NODE_ENV === 'production';
const origin = resolveOrigin(process.env.APP_ORIGIN, production);
if (production && (!origin.startsWith('https://') || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)) throw new Error('Production requires HTTPS APP_ORIGIN and Stripe secrets.');
if(production&&(!process.env.BUSINESS_NAME||!process.env.SUPPORT_EMAIL))throw new Error('Production requires BUSINESS_NAME and SUPPORT_EMAIL.');
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const dataDir = process.env.DATA_DIR || path.join(root, 'data');
mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'invitara.sqlite'));
db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, owner TEXT NOT NULL, body TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, project TEXT NOT NULL);');
db.exec('CREATE TABLE IF NOT EXISTS replies (project TEXT NOT NULL,guest TEXT NOT NULL,body TEXT NOT NULL,PRIMARY KEY(project,guest))');
db.exec('CREATE TABLE IF NOT EXISTS invitation_views (project TEXT NOT NULL, visitor TEXT NOT NULL, PRIMARY KEY(project,visitor))');
initAuth(db);
db.exec('CREATE INDEX IF NOT EXISTS projects_owner ON projects(owner); CREATE INDEX IF NOT EXISTS sessions_project ON sessions(project); CREATE INDEX IF NOT EXISTS account_sessions_owner ON account_sessions(owner)');
const hash = value => createHash('sha256').update(value).digest('hex');
const get = id => { const r = db.prepare('SELECT body FROM projects WHERE id=?').get(id); return r ? JSON.parse(r.body) : null; };
const save = p => db.prepare('UPDATE projects SET body=? WHERE id=?').run(JSON.stringify(p), p.id);
const publicProject = p => ({ ...p, expired: !!p.paid && !editable(p), views:db.prepare('SELECT COUNT(*) AS n FROM invitation_views WHERE project=?').get(p.id).n, replyCount:db.prepare('SELECT COUNT(*) AS n FROM replies WHERE project=?').get(p.id).n });
const catalog = loadCatalog();
const app = express();
if(process.env.TRUST_PROXY_HOPS){
  const hops=Number(process.env.TRUST_PROXY_HOPS);
  if(!/^\d+$/.test(process.env.TRUST_PROXY_HOPS)||!Number.isSafeInteger(hops))throw new Error('TRUST_PROXY_HOPS must be a nonnegative integer.');
  app.set('trust proxy',hops);
}
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set(SECURITY_HEADERS);
  if (production) res.set('Strict-Transport-Security', 'max-age=31536000');
  next();
});
app.post('/api/webhook', express.raw({ type: 'application/json', limit: '1mb' }), (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.sendStatus(503);
  let event;
  try { event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET); }
  catch { return res.status(400).json({ error: 'Invalid webhook signature.' }); }
  if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
    const session = event.data.object;
    const p = get(session.metadata?.projectId);
    const registered = db.prepare('SELECT project FROM sessions WHERE id=?').get(session.id);
    if (p && registered?.project === p.id && session.payment_status === 'paid' && session.amount_total === p.amount && session.currency === 'aed') {
      if (!p.paid) { p.paid = true; p.status = 'PAID'; p.orderId = session.id; p.paidAt = new Date().toISOString(); save(p); }
    }
  }
  res.json({ received: true });
});
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(req.method) && req.headers.origin !== origin) return res.status(403).json({ error: 'Invalid request origin.' });
  let token = /(?:^|; )invitara_owner=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
  if (!token) {
    token = randomBytes(32).toString('hex');
    res.cookie('invitara_owner', token, { httpOnly: true, secure: production, sameSite: 'lax', maxAge: 365 * 86400000, path: '/' });
  }
  req.sessionHash = hash(token);
  req.account = accountFor(db,req.sessionHash);
  req.owner = req.account?.id || req.sessionHash;
  next();
});
app.use(express.json({ limit: '12mb' }));
app.use('/api', (req, res, next) => {
  if (!['GET', 'HEAD'].includes(req.method) && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) {
    return res.status(400).json({ error: 'A JSON object is required.' });
  }
  next();
});
const limits = new Map();
setInterval(() => { const now=Date.now(); for(const [key,bucket] of limits) if(bucket.until<now) limits.delete(key); },60000).unref();
function limited(key, maximum) {
  const now = Date.now();
  let bucket = limits.get(key);
  if (!bucket || bucket.until < now) {
    bucket = { count: 0, until: now + 60000 };
    limits.set(key, bucket);
  }
  return ++bucket.count > maximum;
}
for (const [route, maximum, message] of [
  ['checkout', 10, 'Too many checkout attempts. Please wait a minute.'],
  ['auth', 15, 'Too many attempts. Please wait a minute.']
]) app.use('/api/' + route, (req, res, next) => {
  if (limited(route + ':' + req.ip, maximum)) return res.status(429).json({ error: message });
  next();
});
mountAuth(app,db,production);


function owned(req, res) {
  const row = db.prepare('SELECT * FROM projects WHERE id=? AND owner=?').get(req.params.id, req.owner);
  if (!row) { res.status(404).json({ error: 'Invitation not found on this account.' }); return null; }
  return JSON.parse(row.body);
}
const listProjects = db.prepare(`SELECT p.body,
  (SELECT COUNT(*) FROM invitation_views v WHERE v.project=p.id) AS views,
  (SELECT COUNT(*) FROM replies r WHERE r.project=p.id) AS replyCount
  FROM projects p WHERE p.owner=?`);
app.get('/api/projects', (req, res) => res.json(listProjects.all(req.owner).map(row => {
  const p = JSON.parse(row.body);
  return { ...p, expired: !!p.paid && !editable(p), views: row.views, replyCount: row.replyCount };
})));
app.post('/api/checkout', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Payments are not configured yet. Your draft is safe. Please contact the site owner.' });
  if (!req.account) return res.status(401).json({ error: 'Sign in to your account before purchasing.' });
  const { themeId, plan, addons = [], eventDate, timezone, email, state, consent, draftId } = req.body;
  if (typeof draftId !== 'string' || draftId.length > 100 || !draftId) return res.status(400).json({ error: 'Select an invitation before checkout.' });
  if (!consent || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) return res.status(400).json({ error: 'Enter your email and accept the event access policy.' });
  const theme = catalog.EVER_THEMES.find(t => t.id === themeId);
  const meta = theme && catalog.EVER_C.themeCommerce(themeId);
  if (!meta || !meta.plans.includes(plan) || !Array.isArray(addons) || addons.some(a => !catalog.EVER_C.addonsFor(plan).some(x => x.id === a))) return res.status(400).json({ error: 'Invalid design or plan.' });
  let expiresAt;
  try { expiresAt = eventExpiry(eventDate, timezone); } catch (e) { return res.status(400).json({ error: e.message }); }
  const q = catalog.EVER_C.quote({ themeId, plan, addons: [...new Set(addons)] });
  const id = hash(JSON.stringify([req.owner,draftId,themeId,plan,[...new Set(addons)].sort(),eventDate,timezone])).slice(0,32);
  const existing = get(id);
  if (existing?.paid) return res.json({url:origin+'/editor.html?p='+id});
  let s;try{s=invitationState(catalog,state||{},themeId,eventDate);}catch(err){return res.status(400).json({error:err.message});}
  const p = existing || { id, themeId, themeName: theme.name, layoutId: theme.layout, plan, addons, state: s, eventDate, timezone, expiresAt, amount: Math.round(q.total * 100), paid: false, status: 'PAYMENT_PENDING', published: false, createdAt: new Date().toISOString(), policyVersion: '2026-09-22', quote:q };
  db.prepare('INSERT OR IGNORE INTO projects VALUES (?,?,?)').run(id, req.owner, JSON.stringify(p));
  try {
    const previous=db.prepare('SELECT id FROM sessions WHERE project=? ORDER BY rowid DESC LIMIT 1').get(id);
    let idempotencyKey=id;
    if(previous) {
      const prior=await stripe.checkout.sessions.retrieve(previous.id);
      if(prior.status==='open') return res.json({url:prior.url});
      if(prior.status==='complete') return res.json({url:origin+'/editor.html?p='+id});
      if(prior.status!=='expired')return res.status(409).json({error:'Your payment is still being checked. Please try again shortly.'});
      // Concurrent retries of one expired session must create the same replacement.
      // Keep its old mapping so delayed signed webhooks remain verifiable.
      idempotencyKey=id+':'+previous.id;
    }
    p.state=s;save(p);
    const session = await stripe.checkout.sessions.create({ mode: 'payment', customer_email: email, metadata: { projectId: id }, line_items: [{ price_data: { currency: 'aed', unit_amount: p.amount, product_data: { name: theme.name + ' — ' + catalog.EVER_C.findPlan(plan).name, description: 'Editor access through ' + eventDate + ' (' + timezone + '). Includes VAT.' } }, quantity: 1 }], success_url: origin + '/editor.html?p=' + id, cancel_url: origin + '/checkout.html?cancelled=1' }, { idempotencyKey });
    db.prepare('INSERT OR IGNORE INTO sessions VALUES (?,?)').run(session.id, id);
    res.json({ url: session.url });
  } catch (e) { console.error('Checkout failed:', e.type || 'provider error'); res.status(502).json({ error: 'Checkout is unavailable. Please try again.' }); }
});
app.get('/api/projects/:id', (req, res) => { const p = owned(req, res); if (p) res.json(publicProject(p)); });
app.put('/api/projects/:id', (req, res) => {
  const p = owned(req, res); if (!p) return;
  if (!editable(p)) return res.status(403).json({ error: p.paid ? 'Editor access ended after your event.' : 'Payment confirmation is required.' });
  const s = req.body.state;
  if (!s || s.templateId !== p.themeId || s.layoutId !== p.layoutId || s.basics?.date !== p.eventDate || !s.sections || !Array.isArray(s.order)) return res.status(400).json({ error: 'Design and purchased event date cannot be changed.' });
  try{p.state=invitationState(catalog,s,p.themeId,p.eventDate);}catch(err){return res.status(400).json({error:err.message});} p.updatedAt = new Date().toISOString(); save(p); res.json(publicProject(p));
});
app.post('/api/projects/:id/publish', (req, res) => {
  const p = owned(req, res); if (!p) return;
  if (!editable(p)) return res.status(403).json({ error: 'Active paid editor access is required.' });
  if (!catalog.EVER_C.isValid(p.state)) return res.status(400).json({ error: 'Personalise the required event details before publishing.' });
  p.published = true; p.status = 'PUBLISHED'; p.slug = p.id; save(p); res.json(publicProject(p));
});
app.get('/api/invites/:id', (req, res) => {
  const p = get(req.params.id);
  if (!p?.published || !p.paid) return res.status(404).json({ error: 'Invitation unavailable.' });
  if(req.owner!==db.prepare('SELECT owner FROM projects WHERE id=?').get(p.id).owner)db.prepare('INSERT OR IGNORE INTO invitation_views VALUES (?,?)').run(p.id,req.sessionHash);
  res.json({ s: p.state, t: p.themeId, n: p.slug, closed:!editable(p) });
});
app.post('/api/invites/:id/rsvp',(req,res)=>{
 const p=get(req.params.id);if(!p?.published||!editable(p))return res.status(403).json({error:'Guest replies are closed for this invitation.'});
 if(limited('rsvp:'+req.ip,30))return res.status(429).json({error:'Please wait a minute before sending another reply.'});
 if(p.state.sections.rsvp?.on===false||!p.state.order.includes('rsvp'))return res.status(403).json({error:'Guest replies are disabled for this invitation.'});
 const {name,attend,msg='',meal=''}=req.body,guests=Number(req.body.guests);
 if(typeof meal!=='string'||meal.length>120||(p.state.sections.rsvp.mealEnabled&&!String(p.state.sections.rsvp.mealOptions||'No preference').split(',').map(s=>s.trim()).includes(meal)))return res.status(400).json({error:'Choose a valid meal preference.'});
 if(typeof name!=='string'||!name.trim()||name.length>120||!['yes','no'].includes(attend)||!Number.isInteger(guests)||guests<1||guests>Math.min(50,Number(p.state.sections.rsvp.guestsMax)||6)||typeof msg!=='string'||msg.length>2000)return res.status(400).json({error:'Add your name, attendance and a valid guest count. Keep your message under 2,000 characters.'});
 const reply={name:name.trim(),attend,guests,msg:msg.trim(),meal:p.state.sections.rsvp.mealEnabled?meal:'',updatedAt:new Date().toISOString()};db.prepare('INSERT INTO replies VALUES (?,?,?) ON CONFLICT(project,guest) DO UPDATE SET body=excluded.body').run(p.id,req.sessionHash,JSON.stringify(reply));res.json({ok:true});
});
app.get('/api/projects/:id/replies',(req,res)=>{const p=owned(req,res);if(!p)return;res.json(db.prepare('SELECT body FROM replies WHERE project=?').all(p.id).map(r=>JSON.parse(r.body)));});
app.get('/api/projects/:id/qr',async(req,res)=>{const p=owned(req,res);if(!p)return;if(!p.paid||!p.published)return res.status(409).json({error:'Publish your invitation before sharing.'});try{const svg=await QRCode.toString(origin+'/invite.html?e='+encodeURIComponent(p.id),{type:'svg',errorCorrectionLevel:'M',margin:4,color:{dark:'#203e36',light:'#ffffff'}});res.type('image/svg+xml').send(svg);}catch(_){res.status(500).json({error:'Could not generate the QR code.'});}});
app.get('/api/config',(req,res)=>res.json({businessName:process.env.BUSINESS_NAME||'Invitara',supportEmail:process.env.SUPPORT_EMAIL||''}));
app.get('/api/health',(req,res)=>{db.prepare('SELECT 1').get();res.json({ok:true,paymentsConfigured:!!stripe});});
// Explicit public allowlist: never expose database, secrets, source or dependencies.
for (const dir of ['assets', 'mu', 'css', 'js', 'vendor']) app.use('/' + dir, express.static(path.join(publicRoot, dir), { dotfiles: 'deny' }));
app.get('/robots.txt',(req,res)=>res.type('text/plain').send('User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /editor.html\nDisallow: /dashboard.html\nDisallow: /account.html\nDisallow: /checkout.html\nDisallow: /invite.html\nSitemap: '+origin+'/sitemap.xml\n'));
app.get('/sitemap.xml',(req,res)=>res.type('application/xml').send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['/','/create.html','/pricing.html','/terms.html','/privacy.html'].map(p=>'<url><loc>'+origin+p+'</loc></url>').join('')+'</urlset>'));
app.get('/', (req, res) => res.type('html').send(pageHtml('index.html', origin)));
app.get('/invite.html', (req, res) => {
  const p = typeof req.query.e === 'string' ? get(req.query.e) : null;
  res.set('Cache-Control', 'no-store');
  res.type('html').send(pageHtml('invite.html', origin, p?.published && p.paid ? p : null));
});
// Former static landing pages; occasion pages keep their filter instead of dropping visitors on the full catalogue.
const legacyPages = { 'wedding-invitations.html': 'create.html?occasion=wedding', 'birthday-invitations.html': 'create.html?occasion=birthday', 'anniversary-invitations.html': 'create.html?occasion=anniversary', 'baby-shower-invitations.html': 'create.html?occasion=baby', 'baptism-invitations.html': 'create.html', 'gala-invitations.html': 'create.html', 'housewarming-invitations.html': 'create.html', 'digital-invitations.html': 'create.html', 'online-rsvp.html': 'create.html', 'plan.html': 'pricing.html', 'layouts-test.html': 'create.html' };
app.get('/:file', (req, res, next) => {
  if (Object.hasOwn(legacyPages, req.params.file)) return res.redirect(301, '/' + legacyPages[req.params.file]);
  if (['index.html','create.html','design.html','pricing.html','account.html','dashboard.html','editor.html','checkout.html','demo.html','terms.html','privacy.html'].includes(req.params.file)) return res.type('html').send(pageHtml(req.params.file, origin));
  if (/^[a-z0-9-]+\.html$/.test(req.params.file) || ['styles.css', 'robots.txt', 'sitemap.xml'].includes(req.params.file)) return res.sendFile(path.join(publicRoot, req.params.file));
  next();
});
app.use((req,res)=>{if(req.path.startsWith('/api/'))return res.status(404).json({error:'Not found.'});res.status(404).sendFile(path.join(publicRoot,'404.html'));});
app.use((err, req, res, next) => { if(res.headersSent)return next(err);console.error('Request failed:',err.type||err.name||'Error'); res.status(err.status || 500).json({ error: err.status === 413 ? 'Invitation is too large. Use smaller images.' : 'Request could not be completed.' }); });
const server=app.listen(Number(process.env.PORT || 3000));
server.on('listening',()=>console.log('Invitara listening at '+origin));
server.on('error',err=>{console.error('Server could not start: '+err.message);process.exit(1);});
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));
