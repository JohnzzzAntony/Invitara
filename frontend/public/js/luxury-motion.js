/* Homepage hero choreography (GSAP). Skipped entirely for reduced-motion users;
   the static layout is already complete without it. */
(function(){
 'use strict';
 var E=window,gsap=E.gsap,ST=E.ScrollTrigger;
 if(!gsap||!document.querySelector('[data-page=home] .hero-stage'))return;
 if(ST)gsap.registerPlugin(ST);
 gsap.matchMedia().add('(prefers-reduced-motion: no-preference)',function(){
  var phones=gsap.utils.toArray('.hero-stage .hero-phone'),note='.hero-stage .hero-float-note';
  gsap.timeline({defaults:{ease:'expo.out'},delay:.15})
   .from('.hero-stage .hero-halo',{scale:.82,opacity:0,duration:1.6},0)
   .from(phones,{y:70,opacity:0,duration:1.3,stagger:{each:.12,from:'center'},clearProps:'transform,opacity'},.1)
   .from(note,{y:18,opacity:0,duration:.9,clearProps:'transform,opacity'},.85);
  if(ST)gsap.to('.hero-stage',{yPercent:-7,ease:'none',scrollTrigger:{trigger:'.studio-hero',start:'top top',end:'bottom top',scrub:.6}});
 });
})();
