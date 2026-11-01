/* Prompt library: renders INVITARA_COUTURE_PROMPTS with accessible copy buttons. */
(function(){
 'use strict';var prompts=window.INVITARA_COUTURE_PROMPTS||[],list=document.getElementById('prompt-list'),status=document.getElementById('prompt-status');if(!list)return;
 async function copy(text,label){try{await navigator.clipboard.writeText(text);status.textContent=label+' copied to your clipboard.';}catch(_){status.textContent='Copying is blocked in this browser. Select the prompt text and copy it manually.';}}
 prompts.forEach(function(p){
  var card=document.createElement('article');card.className='prompt-card';card.id='prompt-'+p.id;
  var header=document.createElement('header'),h=document.createElement('h2'),button=document.createElement('button'),meta=document.createElement('p'),details=document.createElement('details'),summary=document.createElement('summary'),pre=document.createElement('pre');
  h.textContent=p.title;button.type='button';button.className='studio-button light';button.textContent='Copy prompt';button.setAttribute('aria-label','Copy prompt: '+p.title);button.addEventListener('click',function(){copy(p.prompt,p.title);});
  meta.className='prompt-meta';meta.textContent=p.scope+' · '+p.occasion+' · Inspired by '+p.inspiration+' · '+p.prompt.length.toLocaleString()+' characters';
  summary.textContent='Show prompt';pre.textContent=p.prompt;details.append(summary,pre);
  header.append(h,button);card.append(header,meta,details);list.appendChild(card);
 });
 document.getElementById('copy-all').addEventListener('click',function(){copy(prompts.map(function(p){return '### '+p.title+'\n\n'+p.prompt;}).join('\n\n---\n\n'),'All '+prompts.length+' prompts');});
})();
