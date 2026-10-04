/* Invitara: event-date checkout via hosted Stripe. Payment confirmation is server-owned. */
(async function () {
  'use strict';

  var C = window.EVER_C;
  var form = document.getElementById('pay-form');
  var payBtn = document.getElementById('pay-btn');

  if (!C) return;

  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  }

  /* ---------- The project being paid for ---------- */
  var project = C.findProject(param('p')) || C.activeProject();
  if (!project) {
    window.location.replace('create.html');
    return;
  }
  if (!project.plan) {
    /* Arrived without choosing a plan — that step owns the decision. */
    window.location.replace('plan.html?p=' + encodeURIComponent(project.id));
    return;
  }
  /* Already paid: nothing to buy twice (§57 duplicate-payment protection). */
  if (C.isPaid(project)) {
    window.location.replace('dashboard.html');
    return;
  }
  C.setActive(project.id);
  try {var session=await window.EVER_API.request('/me');if(!session.account){location.replace('account.html?return=checkout.html');return;}document.getElementById('pay-email').value=session.account.email;}catch(err){var message=document.getElementById('checkout-error');message.textContent='The invitation server is unavailable. Your draft is saved.';message.hidden=false;payBtn.disabled=true;return;}

  var tpl = window.EVER_findTemplate(project.themeId);
  var meta = C.themeCommerce(project.themeId);
  var quote = C.quote({
    themeId: project.themeId,
    plan: project.plan,
    addons: project.addons
  });

  /* ---------- Order summary ---------- */
  var esc = window.EVER_esc;

  var previewBox = document.getElementById('summary-preview');
  if (previewBox && tpl) {
    previewBox.innerHTML = '';
    try {
      previewBox.appendChild(
        window.EVER_renderSiteMini(tpl, project.state || null, { short: true })
      );
    } catch (e) { /* preview is decorative */ }
  }

  var nameEl = document.getElementById('summary-design-name');
  if (nameEl && tpl) nameEl.textContent = tpl.name;

  var metaEl = document.getElementById('summary-design-meta');
  if (metaEl && tpl) {
    var EVENTS = window.EVER_EVENTS || {};
    metaEl.textContent =
      ((EVENTS[tpl.event] && EVENTS[tpl.event].label) || 'Event') +
      ' · ' + meta.style + ' · ' + C.findPlan(project.plan).name + ' plan';
  }

  var linesEl = document.getElementById('summary-lines');
  if (linesEl) {
    linesEl.innerHTML =
      quote.lines.map(function (l) {
        return '<li><span>' + esc(l.label) + '<em>' + esc(l.detail) + '</em></span>' +
          '<span>' + esc(C.money(l.amount)) + '</span></li>';
      }).join('') +
      '<li class="pl-sub"><span>Subtotal</span><span>' + esc(C.money(quote.subtotal)) + '</span></li>' +
      (quote.discount
        ? '<li class="pl-disc"><span>Discount</span><span>−' + esc(C.money(quote.discount)) + '</span></li>'
        : '') +
      '<li class="pl-vat"><span>VAT (' + Math.round(quote.vatRate * 100) + '%)</span>' +
      '<span>' + esc(C.money(quote.vat)) + '</span></li>';
  }

  var totalEl = document.getElementById('summary-total');
  if (totalEl) totalEl.textContent = C.money(quote.total);

  var btnLabel = payBtn && payBtn.querySelector('.pay-btn-label');
  if (btnLabel) btnLabel.textContent = 'Pay ' + C.money(quote.total) + ' & create invitation';


  var date = document.getElementById('event-date');
  var zone = document.getElementById('event-zone');
  var guessed = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  var zones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : ['UTC','Asia/Dubai','Europe/London','America/New_York'];
  zones = Array.from(new Set([guessed,'UTC'].concat(zones))).sort();
  zones.forEach(function(z) { var o = new Option(z.replace(/_/g,' '),z); zone.add(o); });
  zone.value = guessed;
  date.value = project.state && project.state.basics && project.state.basics.date || '';
  function summary() {
    document.getElementById('access-summary').textContent = date.value ? 'All purchased template content is editable through ' + date.value + ' in ' + zone.value + '. Access closes at the following midnight.' : 'Choose your event date to see when editor access ends.';
  }
  date.addEventListener('input',summary); zone.addEventListener('change',summary); summary();
  form.addEventListener('submit',async function(e) {
    e.preventDefault();
    var error = document.getElementById('checkout-error'); error.hidden = true;
    document.getElementById('pay-email').required = true;
    if (!form.reportValidity()) return;
    payBtn.disabled = true; if(btnLabel) btnLabel.textContent = 'Opening secure checkout…';
    try {
      C.syncActiveState();
      var current = C.findProject(project.id);
      var result = await window.EVER_API.request('/checkout','POST', {draftId:project.id, themeId:project.themeId, plan:project.plan, addons:project.addons, state:current.state, email:document.getElementById('pay-email').value.trim(), eventDate:date.value, timezone:zone.value, consent:document.getElementById('access-consent').checked});
      location.assign(result.url);
    } catch(err) { error.textContent = err.message; error.hidden = false; payBtn.disabled = false; if(btnLabel) btnLabel.textContent = 'Continue to secure payment'; }
  });
})();
