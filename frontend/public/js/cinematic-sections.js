/* Scroll-linked depth for the occasion, template, and experience showcases. */
(function(){
 'use strict';
 var cards='[data-page="home"] .collection-card,[data-page="collection"] .collection-card,.experience-card';
 var reduced=matchMedia('(prefers-reduced-motion: reduce)'),desktop=matchMedia('(min-width: 768px)'),frame=0;
 function paint(){
  frame=0;
  var active=!reduced.matches&&desktop.matches,items=document.querySelectorAll(cards),height=innerHeight||1;
  items.forEach(function(card){
   if(!active){card.style.removeProperty('--cinema-tilt');card.style.removeProperty('--cinema-depth');card.style.removeProperty('--cinema-scale');card.style.removeProperty('--cinema-brightness');return;}
   var rect=card.getBoundingClientRect(),distance=Math.max(-1.35,Math.min(1.35,(rect.top+rect.height/2-height/2)/(height*.9))),away=Math.abs(distance);
   card.style.setProperty('--cinema-tilt',(distance*14).toFixed(2)+'deg');
   card.style.setProperty('--cinema-depth',(-away*145).toFixed(1)+'px');
   card.style.setProperty('--cinema-scale',(1-Math.min(.14,away*.085)).toFixed(3));
   card.style.setProperty('--cinema-brightness',(1-Math.min(.38,away*.25)).toFixed(3));
  });
 }
 function queue(){if(!frame)frame=requestAnimationFrame(paint);}
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
 reduced.addEventListener('change',queue);desktop.addEventListener('change',queue);
 var observer=new MutationObserver(queue);['collection-grid','home-occasions','home-experiences'].forEach(function(id){var node=document.getElementById(id);if(node)observer.observe(node,{childList:true,subtree:true});});
 document.addEventListener('visibilitychange',function(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else queue();});
 addEventListener('pagehide',function(){cancelAnimationFrame(frame);observer.disconnect();});
 queue();
})();
