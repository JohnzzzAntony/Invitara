(function () {
  'use strict';
  async function request(url, method, body) {
    var r = await fetch('/api' + url, { method: method || 'GET', credentials:'same-origin', headers: {'Content-Type':'application/json'}, body:body ? JSON.stringify(body) : undefined });
    var data; try { data = await r.json(); } catch (_) { throw new Error('The invitation server is unavailable. Please try again.'); }
    if (!r.ok) throw new Error(data.error || 'Request failed.');
    return data;
  }
  function cacheMany(projects) {
    if (!projects.length) return;
    var ids = new Set(projects.map(function(p) { return p.id; }));
    var paid = projects.filter(function(p) { return p.paid && p.orderId; });
    if (paid.length) {
      var orderIds = new Set(paid.map(function(p) { return p.id; }));
      var orders = window.EVER_C.allOrders().filter(function(o) { return !orderIds.has(o.projectId); });
      paid.forEach(function(p) {
        var quote = p.quote || window.EVER_C.quote({themeId:p.themeId,plan:p.plan,addons:p.addons});
        orders.unshift(Object.assign({},quote,{id:p.orderId,projectId:p.id,number:'INV-'+p.id.slice(0,8).toUpperCase(),themeName:p.themeName,plan:p.plan,addons:p.addons,status:'Paid',total:p.amount/100,paidAt:p.paidAt}));
      });
      try { localStorage.setItem('ever-orders',JSON.stringify(orders)); } catch (_) { /* Restored from server. */ }
    }
    var list = window.EVER_C.allProjects().filter(function(p) { return !ids.has(p.id); });
    projects.forEach(function(p) { p.server = true; list.unshift(p); });
    try { localStorage.setItem('ever-projects', JSON.stringify(list)); }
    catch (_) {
      // Paid content is authoritative on the server; local drafts must survive quota pressure.
      try { localStorage.setItem('ever-projects', JSON.stringify(list.map(function(p) { return p.server ? Object.assign({},p,{state:null}) : p; }))); } catch (_) { /* Server data remains safe. */ }
    }
  }
  function cache(p) { cacheMany([p]); return p; }
  window.EVER_API = { request:request, cache:cache, refresh:async function () {
    var projects = await request('/projects'); cacheMany(projects); return projects;
  }};
})();
