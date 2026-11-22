/* Offline copy of opened invitations. Registered by js/invite-live.js.
 * Network first, so guests always get the latest version; the cache is only the fallback when offline.
 * Only the invitation page, its public data and static files are stored, never account or editor data. */
const CACHE = 'momentsiz-invite-v1';
const KEEP = /^\/(invite\.html|api\/invites\/[^/]+(\/manifest\.webmanifest)?|(css|js|assets|vendor|mu|invitation-templates)\/.*)$/;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys()
  .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  .then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || !KEEP.test(url.pathname)) return;
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request).then(hit => hit || Promise.reject(new Error('offline')))));
});
