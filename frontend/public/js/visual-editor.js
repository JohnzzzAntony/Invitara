/* Contextual editing adapter; the existing editor owns persistence and permissions. */
(function () {
  'use strict';
  var selected = '', preview = false, api, inspector, body;
  var fonts = ['Cormorant Garamond', 'Playfair Display', 'DM Sans', 'Jost', 'Cinzel', 'Great Vibes'];
  function valueAt(path) { return path.split('.').reduce(function (v, k) { return v && v[k]; }, api.getState()); }
  function current() { return Array.from(document.querySelectorAll('#canvas [data-field]')).find(function (n) { return n.dataset.field === selected; }); }
  function label(text, control) {
    var id = 'visual-' + text.toLowerCase().replace(/[^a-z]+/g, '-');
    var l = document.createElement('label'); l.className = 'inspector-label'; l.htmlFor = id; l.textContent = text;
    control.id = id; body.append(l, control); return control;
  }
  function select(options, value, change) {
    var el = document.createElement('select');
    options.forEach(function (o) { var option = document.createElement('option'); option.value = Array.isArray(o) ? o[0] : o; option.textContent = Array.isArray(o) ? o[1] : o; el.appendChild(option); });
    el.value = value; el.addEventListener('change', function () { change(el.value); }); return el;
  }
  function style(prop, val) { api.style(selected, prop, val); }
  function number(text, prop, fallback, min, max, unit, step) {
    var node = current(), saved = (api.getState().elementStyles || {})[selected] || {};
    var input = document.createElement('input'); input.type = 'number'; input.min = min; input.max = max; input.step = step || 1;
    input.value = Math.round(Math.max(min, Math.min(max, parseFloat(saved[prop] || getComputedStyle(node)[prop]) || fallback)) * 10) / 10;
    label(text, input).addEventListener('input', function () {
      var val = Number(input.value); if (input.value === '' || !Number.isFinite(val) || val < min || val > max) return;
      style(prop, String(val) + unit);
    });
  }
  function close() {
    var n = current(); if (n) { n.classList.remove('is-selected'); n.removeAttribute('contenteditable'); }
    selected = ''; inspector.classList.remove('has-selection'); body.innerHTML = '<div class="inspector-empty">Click text or a photograph<br>to personalise your invitation.</div>';
    document.getElementById('inspector-title').textContent = 'Element settings';
  }
  function show(node) {
    if (!api.canEdit(node.dataset.field)) return;
    document.querySelectorAll('#canvas .is-selected').forEach(function (n) { n.classList.remove('is-selected'); if (n !== node) n.removeAttribute('contenteditable'); });
    selected = node.dataset.field; node.classList.add('is-selected'); inspector.classList.add('has-selection');
    var type = node.dataset.editType || 'text';
    document.getElementById('inspector-title').textContent = type === 'section' ? 'Section settings' : type === 'image' ? 'Image settings' : type === 'button' ? 'Button settings' : type === 'date' ? 'Event date' : 'Text settings';
    body.replaceChildren();
    if (type === 'section') {
      var id = selected.split('.')[1], actions = document.createElement('div'); actions.className = 'section-actions';
      var typeId = (api.getState().sectionTypes || {})[id] || id;
      var tools = [['up','Move up'],['down','Move down'],['hide','Hide section']];
      if (!['hero','rsvp','contact','date'].includes(typeId)) tools.push(['duplicate','Duplicate']);
      if (!['hero','rsvp','contact'].includes(id)) tools.push(['delete','Delete section']);
      tools.forEach(function (item) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = item[1];
        var order = api.getState().order, index = order.indexOf(id);
        b.disabled = item[0] === 'up' && index === 0 || item[0] === 'down' && index === order.length - 1;
        b.addEventListener('click', function () { if (item[0] === 'delete' && !confirm('Remove this section? You can restore it from Sections or use Undo.')) return; close(); api.section(id, item[0]); }); actions.appendChild(b);
      }); body.appendChild(actions);
      ['bg','textColor'].forEach(function (key) { var color = document.createElement('input'); color.type = 'color'; color.value = api.getState().sections[id][key] || (key === 'bg' ? '#f5f1e9' : '#203b37'); label(key === 'bg' ? 'Background color' : 'Section text color', color).addEventListener('input', function () { api.change('sections.'+id+'.'+key, color.value); }); });
      label('Section alignment', select(['left','center','right'], node.style.textAlign || 'center', function(v){style('textAlign',v);}));
      number('Section padding', 'padding', 40, 0, 160, 'px');
      number('Minimum height', 'minHeight', 400, 0, 1400, 'px');
      if(api.getState().layoutId==='platform'){var bgImage=document.createElement('input');bgImage.type='text';bgImage.value=api.getState().sections[id].backgroundPhoto||'';label('Background image URL',bgImage).addEventListener('change',function(){if(!bgImage.value||/^(https:\/\/|assets\/)/.test(bgImage.value))api.change('sections.'+id+'.backgroundPhoto',bgImage.value);});}
      if(typeId==='gallery'&&api.getState().layoutId==='platform')label('Gallery layout',select([['editorial','Editorial'],['masonry','Masonry'],['horizontal','Horizontal']],api.getState().sections[id].layout||'editorial',function(v){api.change('sections.'+id+'.layout',v);}));
    } else if (type === 'image') {
      var url = document.createElement('input'); url.type = 'url'; url.value = valueAt(selected) || '';
      label('Image URL', url).addEventListener('change', function () {
        if (/^(https:\/\/|assets\/|mu\/)/.test(url.value)) { api.change(selected, url.value); url.setCustomValidity(''); }
        else { url.setCustomValidity('Use an HTTPS image URL or a local asset path.'); url.reportValidity(); }
      });
      var upload = document.createElement('input'); upload.type = 'file'; upload.accept = 'image/jpeg,image/png,image/webp';
      label('Upload photograph', upload).addEventListener('change', function () {
        var file = upload.files[0]; if (!file) return;
        if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) { upload.setCustomValidity('Choose a JPG, PNG or WebP smaller than 10 MB.'); upload.reportValidity(); return; }
        upload.setCustomValidity(''); var path = selected, image = new Image(), src = URL.createObjectURL(file);
        image.onload = function () { var c = document.createElement('canvas'), scale = Math.min(1, 1400 / Math.max(image.width, image.height)); c.width = image.width * scale; c.height = image.height * scale; c.getContext('2d').drawImage(image, 0, 0, c.width, c.height); URL.revokeObjectURL(src); api.change(path, c.toDataURL('image/jpeg', .82)); };
        image.onerror = function () { URL.revokeObjectURL(src); upload.setCustomValidity('This image could not be opened. Try another photograph.'); upload.reportValidity(); }; image.src = src;
      });
      label('Image fit', select(['cover', 'contain'], node.style.objectFit || 'cover', function (v) { style('objectFit', v); }));
      label('Image position', select(['center', 'top', 'bottom', 'left', 'right'], node.style.objectPosition || 'center', function (v) { style('objectPosition', v); }));
      number('Corner radius', 'borderRadius', 0, 0, 150, 'px');
      number('Image opacity', 'opacity', 1, .1, 1, '', .1);
      var crop=node.style.objectPosition.match(/^(\d+)% (\d+)%$/),x=Number(crop?.[1]||50),y=Number(crop?.[2]||50);
      [['Crop horizontally',x],['Crop vertically',y]].forEach(function(pair,i){var range=document.createElement('input');range.type='range';range.min=0;range.max=100;range.value=pair[1];label(pair[0],range).addEventListener('input',function(){if(i===0)x=Number(range.value);else y=Number(range.value);style('objectPosition',x+'% '+y+'%');});});
      label('Image treatment',select([['none','Natural'],['grayscale(1)','Black & white'],['sepia(.4)','Warm'],['brightness(.65)','Dark overlay']],node.style.filter||'none',function(v){style('filter',v);}));
    } else {
      var content = document.createElement(type === 'date' ? 'input' : 'textarea'); if (type === 'date') content.type = 'date';
      content.value = valueAt(selected) || '';
      label(type === 'date' ? 'Date' : 'Text content', content).addEventListener('input', function () { api.change(selected, content.value); });
      if (type !== 'date') {
        if (type === 'button') {
          if(node.tagName==='A'&&api.getState().layoutId==='platform'){var href=document.createElement('input');href.type='text';href.value=(api.getState().elementLinks||{})[selected]||node.getAttribute('href')||'';label('Button link',href).addEventListener('change',function(){if(/^(https:\/\/|mailto:|#ws-sec-)/.test(href.value)){api.link(selected,href.value);href.setCustomValidity('');}else{href.setCustomValidity('Use an HTTPS URL, email link or #ws-sec-section anchor.');href.reportValidity();}});}
          number('Button padding','padding',14,0,160,'px');number('Button radius','borderRadius',4,0,150,'px');
          var fill=document.createElement('input');fill.type='color';fill.value=node.style.backgroundColor||'#203e36';label('Button color',fill).addEventListener('input',function(){style('backgroundColor',fill.value);});
        }
        label('Font family', select([['', 'Template default']].concat(fonts), node.style.fontFamily.replace(/"/g, '') || '', function (v) { style('fontFamily', v); }));
        number('Font size', 'fontSize', 24, 10, 180, 'px');
        label('Font weight', select([['400', 'Regular'], ['500', 'Medium'], ['600', 'Semibold'], ['700', 'Bold']], node.style.fontWeight || '400', function (v) { style('fontWeight', v); }));
        label('Font style', select([['normal','Regular'],['italic','Italic']], node.style.fontStyle || 'normal', function(v){style('fontStyle',v);}));
        label('Alignment', select(['left', 'center', 'right'], node.style.textAlign || 'center', function (v) { style('textAlign', v); }));
        var color = document.createElement('input'); color.type = 'color'; var rgb = getComputedStyle(node).color.match(/\d+/g); color.value = rgb ? '#' + rgb.slice(0, 3).map(function (v) { return Number(v).toString(16).padStart(2, '0'); }).join('') : '#203b37';
        label('Text color', color).addEventListener('input', function () { style('color', color.value); });
        number('Letter spacing', 'letterSpacing', 0, -3, 15, 'px', .1);
        var line = document.createElement('input'); line.type = 'number'; line.min = .8; line.max = 3; line.step = .1; line.value = node.style.lineHeight || 1.4;
        label('Line height', line).addEventListener('input', function () { if (+line.value >= .8 && +line.value <= 3) style('lineHeight', line.value); });
      }
    }
    var hint = document.createElement('p'); hint.className = 'inspector-hint'; hint.textContent = 'Changes save automatically. Undo with Ctrl / ⌘ Z. Press Escape to finish editing.'; body.appendChild(hint);
  }
  function mount(site) {
    if (!api) return;
    if (preview) return;
    site.querySelectorAll('[data-editable=true]').forEach(function (node) {
      if (!api.canEdit(node.dataset.field)) return;
      node.tabIndex = 0;
      node.setAttribute('aria-label', 'Edit ' + node.dataset.field.split('.').pop());
      function activate(e) {
        if (preview || !api.canEdit(node.dataset.field)) return;
        e.stopImmediatePropagation();
        if (node.matches('a,button,img')) e.preventDefault();
        var wasSelected = selected === node.dataset.field;
        if (!wasSelected || !inspector.classList.contains('has-selection')) show(node);
        var type = node.dataset.editType;
        if (type !== 'image' && type !== 'date' && !node.querySelector('[data-field]')) {
          node.setAttribute('contenteditable', 'plaintext-only'); node.setAttribute('spellcheck', 'true');
          if (type === 'button' && !wasSelected) node.textContent = valueAt(node.dataset.field) || '';
          if (document.activeElement !== node) node.focus({preventScroll:true});
        }
      }
      node.addEventListener('click', activate, true);
      node.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !node.isContentEditable) { e.preventDefault(); activate(e); } });
      node.addEventListener('input', function () {
        if (!api.canEdit(node.dataset.field)) return;
        var text = node.textContent;
        api.change(node.dataset.field, text, true);
        var control = document.getElementById('visual-text-content'); if (control) control.value = text;
      });
      node.addEventListener('blur', function () { api.sync(); });
      if (node.dataset.field === selected) node.classList.add('is-selected');
    });
    if (selected && !current()) close();
    site.querySelectorAll('[data-edit-type=section]').forEach(function (section) {
      var toolbar=document.createElement('div');toolbar.className='section-hover-tools';toolbar.setAttribute('aria-label','Section actions');[['edit','Edit section'],['up','Move up'],['down','Move down']].forEach(function(action){var b=document.createElement('button');b.type='button';b.textContent=action[1];b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(action[0]==='edit')show(section);else api.section(section.dataset.field.split('.')[1],action[0]);});toolbar.appendChild(b);});section.prepend(toolbar);
      section.addEventListener('click', function (e) { if (e.target.closest('[data-editable=true],a,button,input,select,textarea')) return; e.stopPropagation(); show(section); });
    });
    // Guest form submissions belong to Preview; never submit sample replies while editing.
    site.addEventListener('submit', function (e) { e.preventDefault(); e.stopImmediatePropagation(); }, true);
  }
  function init() {
    api = window.EVER_EDITOR; inspector = document.getElementById('visual-inspector'); body = document.getElementById('inspector-body');
    document.getElementById('inspector-close').addEventListener('click', function () { var node = current(); close(); if (node) node.focus(); });
    document.getElementById('undo-btn').addEventListener('click', function () { close(); api.undo(); });
    document.getElementById('redo-btn').addEventListener('click', function () { close(); api.redo(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (selected) { var n = current(); if (n) n.blur(); close(); } else if (preview) document.getElementById('full-preview-btn').click(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !preview) { e.preventDefault(); close(); if (e.shiftKey) api.redo(); else api.undo(); }
    });
    document.getElementById('full-preview-btn').addEventListener('click', function () {
      close(); preview = !preview; document.body.classList.toggle('is-full-preview', preview);
      this.textContent = preview ? 'Back to editor' : 'Preview'; this.setAttribute('aria-pressed', String(preview)); api.preview();
    });
    var presets = [
      {name:'Classic Wedding',font:'corm',accent:'#a48a57',bg:'#faf6ed',ink:'#394139',shape:'soft',spacing:'airy'},
      {name:'Arabian Luxury',font:'cinzel',accent:'#b5934b',bg:'#f6eedc',ink:'#4b3d28',shape:'square',spacing:'airy'},
      {name:'Luxury Editorial',font:'corm',accent:'#87734e',bg:'#f7f2e9',ink:'#38372f',shape:'soft',spacing:'airy'},
      {name:'Minimal Ivory',font:'jost',accent:'#657764',bg:'#faf9f3',ink:'#273f36',shape:'square',spacing:'airy'},
      {name:'Modern Romance',font:'pfd',accent:'#ac6c78',bg:'#f9eded',ink:'#673e49',shape:'pill',spacing:'normal'},
      {name:'Black & Gold',font:'cinzel',accent:'#c6a45b',bg:'#171b19',ink:'#f1e7ce',shape:'square',spacing:'normal'},
      {name:'Soft Floral',font:'corm',accent:'#8d9c80',bg:'#eef2e9',ink:'#374d3d',shape:'pill',spacing:'airy'},
      {name:'Contemporary',font:'jost',accent:'#577c83',bg:'#eff4f5',ink:'#243b43',shape:'soft',spacing:'cozy'}
    ];
    var group = document.createElement('details'); group.className = 'ed-group'; group.open = true;
    group.innerHTML = '<summary>Theme presets</summary><div class="ed-body preset-list"></div>';
    presets.forEach(function (p) { var b = document.createElement('button'); b.type = 'button'; b.style.background = p.bg; b.style.color = p.ink; b.innerHTML = '<span>Aa</span>' + p.name; b.addEventListener('click', function () { close(); api.preset(p); }); group.lastChild.appendChild(b); });
    document.getElementById('panel-design').prepend(group);
  }
  window.EVER_visualEditor = {init:init, mount:mount, isPreview:function () { return preview; }};
})();
