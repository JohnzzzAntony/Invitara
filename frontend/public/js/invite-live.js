(async function(){
 'use strict';
 // Calendar and directions for every invitation, unless its design already offers them.
 function guestActions(site,payload){
  var b=payload.s.basics||{},has=function(re){return Array.from(site.querySelectorAll('a,button')).some(function(el){return re.test(el.textContent);});};
  var bar=document.createElement('nav');bar.className='invite-guest-actions';bar.setAttribute('aria-label','Event actions');
  if(payload.guest){var hi=document.createElement('p');hi.textContent='Dear '+payload.guest+', you are invited.';bar.appendChild(hi);}
  if(/^\d{4}-\d{2}-\d{2}$/.test(b.date||'')&&!has(/calendar/i)){var cal=document.createElement('button');cal.type='button';cal.textContent='Add to calendar';cal.onclick=function(){
   var day=b.date.replace(/-/g,''),timed=/^\d{2}:\d{2}$/.test(b.time||''),start=timed?';TZID='+payload.z+':'+day+'T'+b.time.replace(':','')+'00':';VALUE=DATE:'+day;
   var text=function(v){return String(v||'').replace(/[\,;]/g,'\$&').replace(/\r?\n/g,'\n');};
   var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//momentsiz//invitation//EN','BEGIN:VEVENT','UID:'+id+'@momentsiz','DTSTAMP:'+new Date().toISOString().replace(/[-:]|\.\d+/g,''),'DTSTART'+start,timed?'DURATION:PT3H':'DURATION:P1D','SUMMARY:'+text(b.title||b.brand),'LOCATION:'+text([b.venue,b.city].filter(Boolean).join(', ')),'URL:'+location.origin+'/invite.html?e='+id,'END:VEVENT','END:VCALENDAR'].join('\r\n');
   var url=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='invitation.ics';a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);};bar.appendChild(cal);}
  var place=[b.venue,b.city].filter(Boolean).join(', ');
  if(place&&!has(/direction|map/i)){var map=document.createElement('a');map.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(place);map.target='_blank';map.rel='noopener';map.textContent='Get directions';bar.appendChild(map);}
  if(bar.children.length)root.appendChild(bar);
 }var E=window,root=document.getElementById('invite-root'),missing=document.getElementById('invite-missing'),params=new URLSearchParams(location.search),id=params.get('e'),guestToken=params.get('g');
 document.getElementById('invite-retry').onclick=function(){location.reload();};
 document.getElementById('invite-retry').hidden=!id;
 try{
  if(!id)throw new Error('Missing invitation');
 var payload=await E.EVER_API.request('/invites/'+encodeURIComponent(id)+(guestToken?'?g='+encodeURIComponent(guestToken):''));
  var site=E.EVER_renderSite(payload.s,{interactive:true,inviteId:id});root.appendChild(site);E.EVER_bindSite(site,{rsvpDemo:false});
  document.title=(payload.s.basics.title||payload.s.basics.brand)+' — you’re invited';
  guestActions(site,payload);
  site.querySelectorAll('.ws-rsvp-form').forEach(function(form){
   var status=document.createElement('p');status.setAttribute('role','status');status.className='ex-form-note';form.appendChild(status);
   if(payload.guest&&form.elements.name&&!form.elements.name.value){form.elements.name.value=payload.guest;}
   if(payload.closed||payload.repliesClosed){form.querySelectorAll('input,textarea,select,button').forEach(function(el){el.disabled=true;});status.textContent=payload.closed?'This event has ended. Guest replies are now closed.':'The reply deadline has passed. Contact the host if your plans change.';return;}
   form.addEventListener('submit',async function(e){e.preventDefault();if(!form.reportValidity())return;var button=form.querySelector('button[type=submit]');button.disabled=true;status.textContent='Sending your reply…';
    try{await E.EVER_API.request('/invites/'+encodeURIComponent(id)+'/rsvp','POST',Object.assign(Object.fromEntries(new FormData(form)),guestToken?{g:guestToken}:{}));status.textContent=payload.s.sections.rsvp.success||'Your reply has reached the host. Thank you!';if(payload.t==='edition-aangan'){var attendance=new FormData(form).get('attend');if(attendance==='no')status.textContent='Thank you for sending your love. Your reply has reached us.';if(attendance==='maybe')status.textContent='Your reply has reached us. You can update it when you know.';form.classList.add('hw-reply-saved');}button.textContent='Update my reply ↗';}
    catch(err){status.textContent=err.message;}finally{button.disabled=false;}
   });
  });
 }catch(err){root.hidden=true;missing.hidden=false;}finally{document.getElementById('invite-loading').hidden=true;}
})();
