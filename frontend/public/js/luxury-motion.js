/* Homepage hero choreography (GSAP). Skipped entirely for reduced-motion users;
   the static layout is already complete without it. */
(function(){
 'use strict';
 var gsap=window.gsap,ST=window.ScrollTrigger,hero=document.querySelector('[data-page=home] .hx');
 if(!gsap||!hero)return;
 if(ST)gsap.registerPlugin(ST);
 gsap.matchMedia().add({motion:'(prefers-reduced-motion: no-preference)',fine:'(hover: hover) and (pointer: fine) and (min-width: 960px)'},function(ctx){
  if(!ctx.conditions.motion)return;
  var q=gsap.utils.selector(hero),cards=q('.hx-card');
  gsap.timeline({defaults:{ease:'expo.out'},delay:.1})
   .from(q('.hx-line > span'),{yPercent:110,duration:1.2,stagger:.12},0)
   .from(q('.hx-lead, .hx-actions, .hx-proof'),{y:24,autoAlpha:0,duration:1,stagger:.1},.45)
   .fromTo(q('.hx-stage'),{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.4,ease:'expo.inOut',clearProps:'clipPath'},0)
   .from(cards,{y:140,autoAlpha:0,duration:1.3,stagger:{each:.1,from:'center'}},.4)
   .from(q('.hx-seal'),{scale:.6,autoAlpha:0,duration:1,ease:'back.out(1.6)'},.95)
   .from(q('.hx-note'),{y:16,autoAlpha:0,duration:.8},1.1);
  if(ST){
   /* The seal turns only while the visitor scrolls, so nothing moves on its own (WCAG 2.2.2). */
   gsap.to(q('.hx-seal-ring'),{rotation:240,svgOrigin:'60 60',ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.8}});
   gsap.to(q('.hx-stage'),{yPercent:-6,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:.6}});
  }
  if(!ctx.conditions.fine)return;
  /* Cursor parallax: each card drifts by its own depth, giving the fan a sense of layers. */
  var movers=cards.map(function(card,i){return {x:gsap.quickTo(card,'x',{duration:.9,ease:'power3'}),y:gsap.quickTo(card,'y',{duration:.9,ease:'power3'}),depth:[16,-12,24][i]||10};});
  function move(e){var r=hero.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;movers.forEach(function(m){m.x(nx*m.depth);m.y(ny*m.depth);});}
  function reset(){movers.forEach(function(m){m.x(0);m.y(0);});}
  hero.addEventListener('pointermove',move);hero.addEventListener('pointerleave',reset);
  return function(){hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',reset);};
 });
})();
