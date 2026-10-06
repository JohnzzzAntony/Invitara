import { readFileSync } from 'node:fs';

const escape = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const privatePages = new Set(['account.html', 'dashboard.html', 'editor.html', 'checkout.html', 'invite.html', 'demo.html']);
export function pageHtml(file, origin, project) {
  let html = readFileSync(new URL('../public/' + file, import.meta.url), 'utf8');
  const url = origin + (file === 'index.html' ? '/' : '/' + file) + (project ? '?e=' + encodeURIComponent(project.id) : '');
  const title = project ? project.state.basics.title || project.themeName : /<title>(.*?)<\/title>/.exec(html)?.[1] || 'Invitara';
  const description = project ? [project.state.basics.date, project.state.basics.venue, project.state.basics.city].filter(Boolean).join(' · ') : /<meta name="description" content="([^"]*)"/.exec(html)?.[1] || 'Create a digital invitation and manage guest replies with Invitara.';
  if (project) html = html.replace(/<title>.*?<\/title>/, '<title>' + escape(title) + '</title>').replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + escape(description) + '">');
  let tags = '<link rel="canonical" href="' + escape(url) + '"><meta property="og:type" content="website"><meta property="og:title" content="' + escape(title) + '"><meta property="og:description" content="' + escape(description) + '"><meta property="og:url" content="' + escape(url) + '"><meta property="og:site_name" content="Invitara"><meta name="twitter:card" content="summary_large_image">';
  // Only bundled artwork is advertised to crawlers; private uploaded photos stay on the invitation.
  tags += '<meta property="og:image" content="' + escape(origin + '/assets/ws-couple.jpg') + '">';
  if (privatePages.has(file)) tags += '<meta name="robots" content="noindex, nofollow">';
  return html.replace('</head>', tags + '</head>');
}
