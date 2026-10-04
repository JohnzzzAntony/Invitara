(function(){
 var edit=document.getElementById('mobile-edit'),preview=document.getElementById('mobile-preview');
 function change(show){document.body.classList.toggle('is-previewing',show);document.body.classList.toggle('show-settings',!show);document.getElementById('visual-inspector').classList.remove('has-selection');edit.setAttribute('aria-pressed',String(!show));preview.setAttribute('aria-pressed',String(show));if(window.ScrollTrigger)setTimeout(function(){window.ScrollTrigger.refresh();},100);}
 edit.addEventListener('click',function(){change(false);});preview.addEventListener('click',function(){change(true);});
 change(true);
 document.querySelectorAll('.ed-tab').forEach(function(b){b.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){var other=document.querySelector('.ed-tab:not(.on)');other.click();other.focus();}});});
})();
