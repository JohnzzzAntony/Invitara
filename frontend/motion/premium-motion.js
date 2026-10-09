import {createTimeline,animate,stagger} from 'animejs';
export function bindPremiumMotion(root){
 const running=[],clean=[],reduce=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduce.matches||root.dataset.motion==='none';
 const hero=root.querySelector('.suite-hero'),key=root.dataset.suite;
 const add=a=>{running.push(a);return a;};
 if(paused)return()=>{};
 const tl=add(createTimeline({defaults:{ease:'out(4)',duration:1400}}));
 tl.add(hero.querySelectorAll('.suite-monogram'),{opacity:[0,1],scale:[.65,1],duration:1500},0)
 .add(hero.querySelectorAll('.suite-name'),{y:[key==='maison'?45:22,0],opacity:[0,1],delay:stagger(170)},350)
 .add(hero.querySelectorAll('.suite-portrait'),{scale:[1.04,1],opacity:[.25,1],duration:2000},150)
 .add(hero.querySelectorAll('.suite-kicker,.suite-hero-foot,.suite-headline'),{opacity:[0,1],y:[15,0],delay:stagger(110)},850);
 if(key==='noir')tl.add(hero.querySelector('.suite-light'),{translateX:['-120%','120%'],duration:2200},300);
 const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;io.unobserve(entry.target);if(paused)return;const targets=entry.target.querySelectorAll(':scope > h2,:scope > p,:scope > .suite-chapter,.nx-gallery figure');if(targets.length)add(animate(targets,{opacity:[0,1],y:[20,0],clipPath:key==='maison'?['inset(0 0 100% 0)','inset(0 0 0% 0)']:['inset(0)','inset(0)'],delay:stagger(90),duration:1200,ease:'out(4)'}));}),{threshold:.12});
 root.querySelectorAll('.nx-section:not(.suite-hero)').forEach(s=>io.observe(s));clean.push(()=>io.disconnect());
 function change(e){paused=e.detail.paused;running.forEach(a=>{if(paused){a.complete();a.pause();}});}
 root.addEventListener('suite-motion',change);clean.push(()=>root.removeEventListener('suite-motion',change));
 return()=>{running.forEach(a=>a.revert());clean.forEach(f=>f());};
}
