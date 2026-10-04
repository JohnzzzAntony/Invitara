import {animate as anime, createTimeline, stagger} from 'animejs';
import {animate as motion, inView} from 'motion';

export function bindEditionMotion(root){
 const clean=[],animations=[],continuous=new Set(),sectionAnimations=[],query=matchMedia('(prefers-reduced-motion: reduce)');let disposed=false;
 const allowed=()=>!disposed&&!query.matches&&root.dataset.motion!=='none'&&root.dataset.paused!=='true';
 const hero=root.querySelector('.ed-hero'),key=root.dataset.edition;
 const track=(a,loop=false)=>{animations.push(a);if(loop)continuous.add(a);return a;};
 if(!allowed())return()=>{};
 // Anime owns hero choreography. Motion owns section entrances; no shared targets.
 const headline=hero.querySelector('.ed-headline'),names=hero.querySelector('.ed-names'),photo=hero.querySelector('.ed-hero-photo');
 const timeline=track(createTimeline({defaults:{ease:'out(4)',duration:1100}}));
 if(headline)timeline.add(headline,{y:[key==='encore'?80:35,0],opacity:[0,1],rotate:[key==='postmark'?-3:0,0]},100);
 if(names)timeline.add(names,{y:[22,0],opacity:[0,1]},350);
 if(photo)timeline.add(photo,{scale:[1.08,1],opacity:[.4,1],duration:1600},0);
 const small=hero.querySelectorAll('.ed-meta,.ed-eyebrow,.ed-invite-link');timeline.add(small,{y:[15,0],opacity:[0,1],delay:stagger(100)},550);
 const record=hero.querySelector('.ed-record');if(record)track(anime(record,{rotate:[24,384],duration:22000,ease:'linear',loop:true}),true);
 const petals=hero.querySelector('.ed-petal-art');if(petals)track(anime(petals,{rotate:[-8,0],scale:[.9,1],duration:2100,ease:'out(4)'}));
 const arrow=hero.querySelector('.ed-next-arrow');if(arrow)track(anime(arrow,{x:[-45,0],y:[45,0],opacity:[0,1],duration:1200,delay:450,ease:'outExpo'}));
 const seal=hero.querySelector('.ed-travel-seal');if(seal)track(anime(seal,{rotate:[-30,12],scale:[.75,1],duration:1300,delay:300,ease:'outElastic(1,.6)'}));
 const stopView=inView(root.querySelectorAll('.nx-section:not(.ed-hero)'),el=>{if(!allowed())return;const parts=el.querySelectorAll(':scope>.ed-section-index,:scope>h2,:scope>p,:scope>.nx-story-copy,:scope>.nx-story-image,:scope>.nx-facts,:scope>.nx-gallery');const a=motion(parts,{opacity:[0,1],y:[28,0]},{duration:.8,delay:i=>i*.065,ease:[.22,1,.36,1]});sectionAnimations.push(a);clean.push(()=>a.cancel());},{amount:.12});clean.push(stopView);
 function page(e){if(allowed())track(anime(e.detail.node,{rotateY:[-7,0],opacity:[.65,1],duration:750,ease:'out(4)'}));}
 function reveal(e){if(allowed())track(anime(e.detail.node,{y:[20,0],opacity:[.3,1],duration:950,ease:'out(4)'}));}
 root.addEventListener('edition-page',page);root.addEventListener('edition-reveal',reveal);
 clean.push(()=>root.removeEventListener('edition-page',page),()=>root.removeEventListener('edition-reveal',reveal));
 let visible=true;
 function sync(){const play=allowed()&&!document.hidden&&visible;animations.forEach(a=>{if(!allowed()){if(!continuous.has(a))a.complete?.();a.pause?.();}else if(play)a.resume?.();else a.pause?.();});sectionAnimations.forEach(a=>{if(!allowed())a.complete();else if(document.hidden)a.pause();else a.play();});}
 const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});io.observe(hero);clean.push(()=>io.disconnect());
 document.addEventListener('visibilitychange',sync);root.addEventListener('edition-motion',sync);query.addEventListener('change',sync);
 clean.push(()=>document.removeEventListener('visibilitychange',sync),()=>root.removeEventListener('edition-motion',sync),()=>query.removeEventListener('change',sync));
 if(root.dataset.scene)import('./editions-scenes.js').then(module=>{if(!disposed&&root.isConnected&&allowed())clean.push(module.mountScene(root));}).catch(()=>{/* Static art remains visible if WebGL cannot load. */});
 return()=>{disposed=true;animations.forEach(a=>a.revert?.());clean.splice(0).forEach(fn=>fn());};
}
