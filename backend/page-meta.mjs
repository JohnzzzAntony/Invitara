import { readFileSync } from 'node:fs';
import { escapeHtml as escape } from './seo.mjs';

const privatePages = new Set(['account.html', 'dashboard.html', 'editor.html', 'checkout.html', 'invite.html', 'demo.html']);
/**
 * Renders a public HTML page with crawler metadata.
 * `seo` (from seoFor) supplies the title, description, canonical path, image, JSON-LD and server-rendered copy.
 */
export function pageHtml(file, origin, project, seo = {}) {
  let html = readFileSync(new URL('../frontend/public/' + file, import.meta.url), 'utf8');
  for (const [from, to] of seo.replace || []) html = html.replace(from, to);
  const url = project ? origin + '/' + file + '?e=' + encodeURIComponent(project.id) : origin + (seo.path || (file === 'index.html' ? '/' : '/' + file));
  const title = project ? project.state.basics.title || project.themeName : seo.title || /<title>(.*?)<\/title>/.exec(html)?.[1] || 'Invitara';
  const description = project ? [project.state.basics.date, project.state.basics.venue, project.state.basics.city].filter(Boolean).join(' · ') : seo.description || /<meta name="description" content="([^"]*)">/.exec(html)?.[1] || 'Create a digital invitation and manage guest replies with Invitara.';
  html = html.replace(/<title>.*?<\/title>/, '<title>' + escape(title) + '</title>').replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + escape(description) + '">');
  if (seo.bodyOccasion) html = html.replace(/<body([^>]*)>/, '<body$1 data-occasion="' + escape(seo.bodyOccasion) + '">');
  // Only bundled artwork is advertised to crawlers; private uploaded photos stay on the invitation.
  const image = seo.image || { url: origin + '/assets/ws-couple.jpg', alt: 'A couple sharing a quiet moment, from an Invitara wedding invitation' };
  let tags = '<link rel="canonical" href="' + escape(url) + '"><meta property="og:type" content="website"><meta property="og:title" content="' + escape(title) + '"><meta property="og:description" content="' + escape(description) + '"><meta property="og:url" content="' + escape(url) + '"><meta property="og:site_name" content="Invitara"><meta property="og:locale" content="en_US">'
    + '<meta property="og:image" content="' + escape(image.url) + '"><meta property="og:image:alt" content="' + escape(image.alt) + '">'
    + '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' + escape(title) + '"><meta name="twitter:description" content="' + escape(description) + '"><meta name="twitter:image" content="' + escape(image.url) + '">'
    + '<link rel="apple-touch-icon" href="/assets/invitara-logo.png">';
  if (seo.keywords) tags += '<meta name="keywords" content="' + escape(seo.keywords) + '">';
  if (privatePages.has(file)) tags += '<meta name="robots" content="noindex, nofollow">';
  else tags += '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">' + (seo.jsonLd ? seo.jsonLd(html) : '');
  return html.replace('</head>', tags + '</head>');
}
