/** Normalize operator configuration without trusting request headers. */
export function resolveOrigin(value, production = false) {
  const input = String(value || '').trim();
  if (!input) {
    if (production) throw new Error('APP_ORIGIN is required in production. Set it to your public HTTPS origin.');
    return 'http://localhost:3000';
  }
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(input) ? input : 'https://' + input;
  let url;
  try { url = new URL(candidate); }
  catch { throw new Error('APP_ORIGIN must be a hostname or an HTTP(S) origin, for example https://invitara-production.up.railway.app.'); }
  if (input.startsWith('/') || !['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash || /[\s\\?#]/.test(input)) {
    throw new Error('APP_ORIGIN must contain only a hostname and optional port, without credentials, a path, query or fragment.');
  }
  if (production && url.protocol !== 'https:') throw new Error('APP_ORIGIN must use HTTPS in production.');
  return url.origin;
}
