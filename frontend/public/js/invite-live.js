(async function(){
 'use strict';var E=window,root=document.getElementById('invite-root'),missing=document.getElementById('invite-missing'),id=new URLSearchParams(location.search).get('e');
 document.getElementById('invite-retry').onclick=function(){location.reload();};
 document.getElementById('invite-retry').hidden=!id;
 try{
  if(!id)throw new Error('Missing invitation');
 var payload=await E.EVER_API.request('/invites/'+encodeURIComponent(id));
  var site=E.EVER_renderSite(payload.s,{interactive:true});root.appendChild(site);E.EVER_bindSite(site,{rsvpDemo:false});
  document.title=(payload.s.basics.title||payload.s.basics.brand)+' — you’re invited';
  site.querySelectorAll('.ws-rsvp-form').forEach(function(form){
   var status=document.createElement('p');status.setAttribute('role','status');status.className='ex-form-note';form.appendChild(status);
   if(payload.closed){form.querySelectorAll('input,textarea,select,button').forEach(function(el){el.disabled=true;});status.textContent='This event has ended. Guest replies are now closed.';return;}
   form.addEventListener('submit',async function(e){e.preventDefault();if(!form.reportValidity())return;var button=form.querySelector('button[type=submit]');button.disabled=true;status.textContent='Sending your reply…';
    try{await E.EVER_API.request('/invites/'+encodeURIComponent(id)+'/rsvp','POST',Object.fromEntries(new FormData(form)));status.textContent=payload.s.sections.rsvp.success||'Your reply has reached the host. Thank you!';button.textContent='Update my reply ↗';}
    catch(err){status.textContent=err.message;}finally{button.disabled=false;}
   });
  });
 }catch(err){root.hidden=true;missing.hidden=false;}finally{document.getElementById('invite-loading').hidden=true;}
})();
