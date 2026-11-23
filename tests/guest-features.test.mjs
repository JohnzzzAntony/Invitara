import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';import {DatabaseSync} from 'node:sqlite';import {createHash} from 'node:crypto';import Stripe from 'stripe';
import {repliesOpen} from '../backend/access.mjs';

test('reply deadline closes at the end of the deadline day in the event timezone',()=>{
 const p={paid:true,expiresAt:Date.parse('2027-06-11T00:00:00Z'),timezone:'Asia/Dubai',rsvpDeadline:'2027-06-01'};
 assert.equal(repliesOpen(p,Date.parse('2027-06-01T19:59:00Z')),true);
 assert.equal(repliesOpen(p,Date.parse('2027-06-01T20:00:00Z')),false);
 assert.equal(repliesOpen({...p,rsvpDeadline:undefined},Date.parse('2027-06-05T00:00:00Z')),true);
 assert.equal(repliesOpen({...p,paid:false},Date.parse('2027-05-01T00:00:00Z')),false);
});

test('personal guest links, check-in, reply deadline, one reschedule and discounted payments',async()=>{
 const dir=mkdtempSync(path.join(tmpdir(),'invitara-guests-')),origin='http://localhost:3201';
 const proc=spawn(process.execPath,['backend/index.mjs'],{env:{...process.env,PORT:'3201',APP_ORIGIN:origin,DATA_DIR:dir,NODE_ENV:'test',STRIPE_SECRET_KEY:'sk_test_fixture',STRIPE_WEBHOOK_SECRET:'whsec_fixture'},stdio:'pipe'});let db;
 try{await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Startup timeout')),10000);proc.stdout.on('data',d=>{if(d.toString().includes('listening')){clearTimeout(timeout);resolve();}});proc.on('error',reject);});
 const first=await fetch(origin+'/api/me'),cookie=first.headers.get('set-cookie').split(';')[0],owner=createHash('sha256').update(cookie.split('=')[1]).digest('hex');
 const call=(url,body,c=cookie)=>fetch(origin+'/api'+url,{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json',...(c?{Cookie:c}:{})},body:body?JSON.stringify(body):undefined});
 db=new DatabaseSync(path.join(dir,'invitara.sqlite'));
 const p={id:'party',themeId:'vellum',layoutId:'vellum',paid:true,published:true,eventDate:'2029-06-10',timezone:'UTC',expiresAt:Date.parse('2029-06-11T00:00:00Z'),amount:10395,state:{basics:{date:'2029-06-10',title:'Party'},order:['rsvp'],sections:{rsvp:{guestsMax:4}}}};
 db.prepare('INSERT INTO projects VALUES (?,?,?)').run(p.id,owner,JSON.stringify(p));
 db.prepare('INSERT INTO projects VALUES (?,?,?)').run('unpaid',owner,JSON.stringify({...p,id:'unpaid',paid:false,published:false}));

 const links=await(await call('/projects/party/guests',{names:['Aunt Mira','  ','Omar']})).json();assert.deepEqual(links.map(g=>g.name),['Aunt Mira','Omar']);
 assert.equal((await call('/projects/party/guests',null,'')).status,404,'other visitors cannot list guest links');
 const token=links[0].token;assert.match(token,/^[a-f0-9]{32}$/);
 assert.equal((await(await call('/invites/party?g='+token,null,'')).json()).guest,'Aunt Mira');
 assert.equal((await call('/invites/party/rsvp',{name:'Mira',attend:'yes',guests:2,g:'0'.repeat(32)},'')).status,400);
 assert.equal((await call('/invites/party/rsvp',{name:'Mira',attend:'yes',guests:2,g:token},'')).status,200);
 assert.equal((await call('/invites/party/rsvp',{name:'Mira K',attend:'yes',guests:3,g:token},'')).status,200,'second device');
 let replies=await(await call('/projects/party/replies')).json();assert.equal(replies.length,1);assert.equal(replies[0].invited,'Aunt Mira');assert.equal(replies[0].guests,3);
 assert.equal((await(await call('/projects/party/replies/'+replies[0].id+'/checkin',{checkedIn:true})).json()).checkedIn,true);
 assert.equal((await call('/projects/party/replies/'+replies[0].id+'/checkin',{checkedIn:true},'')).status,404);
 replies=await(await call('/projects/party/replies')).json();assert.equal(replies[0].checkedIn,true);

 assert.equal((await call('/projects/party/settings',{rsvpDeadline:'2029-07-01'})).status,400,'deadline after event');
 assert.equal((await call('/projects/party/settings',{rsvpDeadline:'2020-01-01'})).status,200);
 assert.equal((await(await call('/invites/party',null,'')).json()).repliesClosed,true);
 assert.equal((await call('/invites/party/rsvp',{name:'Late',attend:'yes',guests:1},'')).status,403);
 await call('/projects/party/settings',{rsvpDeadline:''});

 assert.equal((await call('/projects/unpaid/reschedule',{eventDate:'2029-07-01'})).status,403);
 assert.equal((await call('/projects/party/reschedule',{eventDate:'2001-01-01'})).status,400);
 const moved=await(await call('/projects/party/reschedule',{eventDate:'2029-08-01'})).json();
 assert.equal(moved.eventDate,'2029-08-01');assert.equal(moved.state.basics.date,'2029-08-01');assert.equal(moved.expiresAt,Date.parse('2029-08-02T00:00:00Z'));
 assert.equal((await call('/projects/party/reschedule',{eventDate:'2029-09-01'})).status,409,'only once');

 // A Stripe promotion code lowers amount_total; the pre-discount subtotal must still match the quoted price.
 db.prepare('INSERT INTO sessions VALUES (?,?)').run('cs_promo','unpaid');
 const stripe=new Stripe('sk_test_fixture');
 const webhook=object=>{const payload=JSON.stringify({id:'evt_promo',type:'checkout.session.completed',data:{object:{id:'cs_promo',metadata:{projectId:'unpaid'},payment_status:'paid',currency:'aed',...object}}});return fetch(origin+'/api/webhook',{method:'POST',headers:{'Content-Type':'application/json','stripe-signature':stripe.webhooks.generateTestHeaderString({payload,secret:'whsec_fixture'})},body:payload});};
 await webhook({amount_total:5000,amount_subtotal:5000,total_details:{amount_discount:0}});
 assert.equal(JSON.parse(db.prepare("SELECT body FROM projects WHERE id='unpaid'").get().body).paid,false,'underpayment without a discount is rejected');
 await webhook({amount_total:5000,amount_subtotal:10395,total_details:{amount_discount:5395}});
 assert.equal(JSON.parse(db.prepare("SELECT body FROM projects WHERE id='unpaid'").get().body).paid,true);
 }finally{db?.close();proc.kill();await new Promise(r=>proc.once('exit',r));if(path.dirname(dir)!==path.resolve(tmpdir())||!path.basename(dir).startsWith('invitara-guests-'))throw Error('Unsafe cleanup');rmSync(dir,{recursive:true,force:true});}
});
