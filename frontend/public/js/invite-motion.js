/* Scroll motion for every invitation template: text blurs up and images unveil as each section enters view.
 * Wraps EVER_bindSite last, so it runs after each layout's own binding. The hero is left to the layouts' opening motion.
 * Skipped in the editor, inside catalogue thumbnails, and for reduced motion. */
(function(){
 'use strict';
 var E=window,original=E.EVER_bindSite;if(!original||!window.IntersectionObserver||!Element.prototype.animate)return;
 var reduced=matchMedia('(prefers-reduced-motion: reduce)'),ease='cubic-bezier(.22,1,.36,1)';
 var PICK='h2,h3,h4,p,blockquote,figure,img,form,ul,ol,.ex-button,.ws-btn,time';
 var TEXT=[{opacity:0,transform:'translateY(26px)',filter:'blur(6px)'},{opacity:1,transform:'none',filter:'blur(0)'}];
 var IMAGE=[{opacity:0,clipPath:'inset(14% 0 0 0)',transform:'scale(1.06)'},{opacity:1,clipPath:'inset(0 0 0 0)',transform:'none'}];
 E.EVER_bindSite=function(root,opts){
  var result=original.apply(this,arguments);
  if(!root||root.__rsMotion||(opts&&opts.editing)||reduced.matches||root.closest('.ex-mini,.nx-mini,.collection-art,[inert]'))return result;
  root.__rsMotion=true;
  var sections=Array.from(root.querySelectorAll('section')).filter(function(s){return !s.parentElement.closest('section');}).slice(1);
  var items=[];
  sections.forEach(function(section){
   var n=0;
   section.querySelectorAll(PICK).forEach(function(el){
    /* Animate the outermost match only, never form internals or interactive widgets, and at most 24 per section. */
    if(n>=24||el.parentElement.closest(PICK)&&section.contains(el.parentElement.closest(PICK))||el.closest('[data-scratch],canvas,video,iframe'))return;
    el.classList.add('rs-pre');el.__rsOrder=n++;items.push(el);
   });
  });
  if(!items.length)return result;
  document.documentElement.classList.add('rs-motion');
  var observer=new IntersectionObserver(function(entries){
   var batch=0;
   entries.forEach(function(entry){
    if(!entry.isIntersecting)return;observer.unobserve(entry.target);
    var el=entry.target,img=el.tagName==='IMG'||el.tagName==='FIGURE';
    el.classList.remove('rs-pre');
    el.animate(img?IMAGE:TEXT,{duration:img?1300:950,delay:Math.min(batch++,7)*70,easing:ease,fill:'backwards'});
   });
  },{threshold:.12,rootMargin:'0px 0px -5% 0px'});
  items.forEach(function(el){observer.observe(el);});
  return result;
 };
})();
