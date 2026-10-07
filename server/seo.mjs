// Search and AI-engine metadata: page titles, structured data, occasion landing pages, sitemap and llms.txt.
// Copy here is rendered into the HTML, so crawlers that do not run JavaScript still see it.

const BRAND = 'Invitara';
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const PAGES = {
  'index.html': {
    title: 'Digital Invitations & Online RSVP Maker | Invitara',
    description: 'Create interactive digital invitations for weddings, birthdays, baby showers and every celebration. Animated designs, online RSVP and one shareable link. Pay once.',
    keywords: 'digital invitations, online invitation maker, e-invitations, digital wedding invitations, online RSVP, animated invitations, invitation website, invitation link, QR code invitation',
  },
  'create.html': {
    title: 'Digital Invitation Templates for Every Occasion | Invitara',
    description: 'Browse 14 interactive invitation templates for weddings, engagements, birthdays, baby showers, Eid, Ramadan and more. Preview free, personalise, share with online RSVP.',
    keywords: 'invitation templates, digital invitation templates, online invitation designs, wedding invitation templates, birthday invitation templates, e-invite templates',
  },
  'pricing.html': {
    title: 'Invitation Pricing: One Payment, No Subscription | Invitara',
    description: 'Every Invitara digital invitation is one payment per event, from AED 79 plus VAT. No subscription or per-guest fees. Editor, photos, online RSVP and share link included.',
    keywords: 'digital invitation price, online invitation cost, e-invitation pricing, wedding website price, RSVP website cost',
  },
  'terms.html': {
    title: 'Terms & Event Access | Invitara',
    description: 'How Invitara event access works: editing stays open until midnight after your event, published invitations remain viewable, and how purchases and support are handled.',
  },
  'privacy.html': {
    title: 'Privacy Policy | Invitara',
    description: 'How Invitara protects your account, guest replies and photos: what we store, cookies and device storage, payment handling, invitation privacy and data requests.',
  },
  'design.html': { title: 'Invitation Design | Invitara', description: 'Preview an interactive digital invitation, then make every detail yours.' },
};

// One landing page per occasion. `key` matches the catalogue occasion id.
export const OCCASIONS = [
  { key: 'wedding', slug: 'wedding-invitations', label: 'Wedding', title: 'Digital Wedding Invitations with Online RSVP | Invitara', h1: 'Digital wedding invitations', lead: 'A wedding invitation your guests will open twice: an interactive keepsake with your story, the day’s schedule, a venue map and online RSVP, shared with one beautiful link.',
    description: 'Elegant digital wedding invitations with your photos, love story, schedule, venue map and online RSVP. Share one link by WhatsApp, email or QR code. Pay once per wedding.',
    keywords: 'digital wedding invitations, online wedding invitation, wedding e-invite, wedding invitation website, wedding RSVP online, animated wedding invitation',
    body: ['A digital wedding invitation replaces the printed card and the wedding website with a single interactive page. Guests open your link on any phone or computer, turn the pages of your story, see when and where to arrive, and reply in seconds.', 'Every Invitara wedding design includes a photo gallery, event schedule, countdown, venue details with a map and private RSVP with guest numbers and meal preferences. You can edit wording, photos, fonts and colours until your wedding day, and replies stay organised in your dashboard with CSV export.'],
    faqs: [['Are digital wedding invitations acceptable?', 'Yes. Digital wedding invitations are now widely used for formal and intimate weddings alike. They arrive instantly, collect RSVPs automatically and can be updated if plans change, while still feeling personal and considered.'], ['Can guests RSVP to my wedding online?', 'Yes. Guests reply directly on your invitation with their name, attendance, number of guests and an optional message or meal preference. You see every reply in your dashboard and can export the guest list as a CSV file.'], ['How do I send a digital wedding invitation?', 'After publishing, you receive one private link and a QR code. Share the link by WhatsApp, text, email or social media, or print the QR code on a save-the-date card.']] },
  { key: 'engagement', slug: 'engagement-invitations', label: 'Engagement', title: 'Engagement Party Invitations Online | Invitara', h1: 'Engagement party invitations', lead: 'Announce the yes with an engagement invitation that feels like the moment itself: modern, personal and ready to share in seconds.',
    description: 'Modern online engagement party invitations with your photos, story and online RSVP. Personalise every detail and share one link with family and friends. Pay once per event.',
    keywords: 'engagement invitations, engagement party invitation online, digital engagement invitation, engagement e-invite',
    body: ['An online engagement invitation lets you share your news and invite guests to celebrate in one link. Add your photos, tell the story of the proposal and give guests the date, venue and dress code.', 'Guests RSVP directly on the invitation, and you can keep editing details until the day of your party.'],
    faqs: [['What should an engagement invitation include?', 'Include both names, the date and start time, the venue, any dress code and how to RSVP. A short line about the proposal or a favourite photo makes it personal.'], ['How far in advance should engagement invitations be sent?', 'Send engagement party invitations three to six weeks before the celebration so guests can plan, and set an RSVP date about a week before the event.']] },
  { key: 'save-date', slug: 'save-the-date', label: 'Save the Date', title: 'Digital Save the Date Cards & Online Announcements | Invitara', h1: 'Digital save the date cards', lead: 'Let guests know early with a tactile, interactive save the date: a sealed postcard with a date to reveal, shared with one link.',
    description: 'Interactive digital save the date cards with a reveal-the-date moment, your photo and event details. Send by WhatsApp, email or QR code, then follow with your full invitation.',
    keywords: 'save the date, digital save the date, online save the date card, save the date e-card, electronic save the date',
    body: ['A digital save the date gives guests advance notice of your wedding or event before the full invitation. Invitara’s save the date design opens like airmail post, with the date sealed until your guest reveals it.', 'Add your names, photo and location, and send it months ahead by link or QR code.'],
    faqs: [['When should I send a save the date?', 'Send save the dates six to eight months before a wedding, or up to a year ahead for destination weddings and holiday-season celebrations.'], ['Is a digital save the date enough?', 'Yes. A digital save the date reaches guests instantly and cannot get lost in the post. Many couples follow it with a digital invitation that collects RSVPs.']] },
  { key: 'birthday', slug: 'birthday-invitations', label: 'Birthday', title: 'Birthday Party Invitations Online with RSVP | Invitara', h1: 'Birthday party invitations', lead: 'From milestone birthdays to late-night celebrations: a bold, animated birthday invitation with the details, the dress code and online RSVP built in.',
    description: 'Bold, animated online birthday invitations for milestone and adult birthday parties. Add photos, schedule and dress code, collect RSVPs online and share one link.',
    keywords: 'birthday invitations, online birthday invitation, birthday party invitation, digital birthday invitation, 30th birthday invitation, 40th birthday invitation, birthday e-invite',
    body: ['An online birthday invitation sets the tone before the party starts. Invitara’s birthday design turns your celebration into a sold-out concert poster with a spinning record and a tear-off ticket.', 'Share the time, venue and set list, and let guests RSVP with the number of people they are bringing.'],
    faqs: [['How do I make an online birthday invitation?', 'Choose a birthday design, add the name, date, time, venue and a photo, then publish and share the link. Guests can open it on any device and reply instantly.'], ['When should birthday invitations be sent?', 'Send birthday party invitations two to four weeks before the party, and closer to six weeks for milestone birthdays or destination celebrations.']] },
  { key: 'anniversary', slug: 'anniversary-invitations', label: 'Anniversary', title: 'Anniversary Party Invitations Online | Invitara', h1: 'Anniversary party invitations', lead: 'Celebrate the years with an invitation that feels like a family album: overlapping prints, numbered memories and a gallery of your story.',
    description: 'Online anniversary party invitations with a photo archive of your years together, event details and online RSVP. Perfect for 25th, 40th and 50th anniversaries.',
    keywords: 'anniversary invitations, anniversary party invitation, 25th anniversary invitation, 50th anniversary invitation, online anniversary invitation',
    body: ['An anniversary invitation is a chance to share the story so far. Invitara’s anniversary design presents your photographs as a collected archive guests can browse.', 'Add the celebration details, and guests can RSVP and leave a message for the couple.'],
    faqs: [['What do you write on an anniversary invitation?', 'Include the couple’s names, the milestone being celebrated, date, time and venue, and how to RSVP. Many hosts add a favourite photo or a line about the years together.']] },
  { key: 'baby', slug: 'baby-shower-invitations', label: 'Baby Shower', title: 'Baby Shower Invitations Online with RSVP | Invitara', h1: 'Baby shower invitations', lead: 'Welcome someone small with an invitation that feels gentle and joyful: a tiny universe of floating moons and soft clouds, with online RSVP for every guest.',
    description: 'Sweet online baby shower invitations with gentle animation, event details and online RSVP. Personalise for a boy, girl or surprise, and share one link with guests.',
    keywords: 'baby shower invitations, online baby shower invitation, digital baby shower invitation, baby shower e-invite, gender reveal invitation',
    body: ['An online baby shower invitation makes it easy for friends and family to celebrate the parents-to-be, wherever they are. Invitara’s baby shower design opens into a calm, playful nursery scene.', 'Add the date, venue and host details, and track replies and guest numbers in one place.'],
    faqs: [['When should baby shower invitations be sent?', 'Send baby shower invitations four to six weeks before the shower, which is usually held four to eight weeks before the due date.'], ['Who hosts the baby shower?', 'A close friend or relative traditionally hosts, though parents-to-be increasingly host their own. The invitation should name the host and say how to RSVP.']] },
  { key: 'bridal', slug: 'bridal-shower-invitations', label: 'Bridal Shower', title: 'Bridal Shower Invitations Online | Invitara', h1: 'Bridal shower invitations', lead: 'For the bride, for the bloom: a floral bridal shower invitation with an afternoon schedule, dress code and RSVP in one elegant link.',
    description: 'Floral online bridal shower invitations with the afternoon schedule, dress code and online RSVP. Personalise every detail and share one link with the bride’s guests.',
    keywords: 'bridal shower invitations, online bridal shower invitation, bridal brunch invitation, hen party invitation, digital bridal shower invite',
    body: ['A bridal shower invitation should feel as considered as the celebration. Invitara’s floral design frames the bride’s photo in a botanical arrangement and lays out the afternoon beautifully.', 'Guests RSVP online, and the host sees every reply in one place.'],
    faqs: [['What should a bridal shower invitation say?', 'Name the bride, the host, the date, time and venue, any theme or dress code, gift registry notes if appropriate, and how to RSVP.']] },
  { key: 'graduation', slug: 'graduation-invitations', label: 'Graduation', title: 'Graduation Party Invitations & Announcements | Invitara', h1: 'Graduation party invitations', lead: 'Next, everything: a bold graduation announcement and party invitation built for the class of the year.',
    description: 'Bold online graduation party invitations and announcements. Share the date, venue and celebration plans, collect RSVPs online and send one link to family and friends.',
    keywords: 'graduation invitations, graduation party invitation, graduation announcement, online graduation invitation, class of graduation invite',
    body: ['A graduation invitation celebrates the achievement and invites everyone to the party. Invitara’s graduation design uses oversized type and a confident layout made for milestone moments.', 'Add a note about what comes next, share the schedule and collect replies online.'],
    faqs: [['When should graduation invitations be sent?', 'Send graduation party invitations three to four weeks before the party, and announcements shortly after the ceremony.']] },
  { key: 'party', slug: 'party-invitations', label: 'Party', title: 'Party Invitations Online: Evening & Cocktail Parties | Invitara', h1: 'Party invitations', lead: 'Meet me under the mirrorball: a cinematic evening invitation with a curtain reveal, dress code and RSVP for the after-hours crowd.',
    description: 'Cinematic online party invitations for cocktail evenings, dinner parties and celebrations. Curtain-reveal animation, dress code, schedule and online RSVP in one link.',
    keywords: 'party invitations, online party invitation, cocktail party invitation, dinner party invitation, evening party e-invite',
    body: ['An online party invitation should make guests want to clear their calendar. Invitara’s party design opens behind velvet curtains to a spinning mirrorball and the details of your night.', 'Share the time, venue and dress code, and collect RSVPs with guest numbers.'],
    faqs: [['How do I invite people to a party online?', 'Create your invitation, add the details and publish. Share the link in a group chat, by email or with a QR code, and replies arrive in your dashboard.']] },
  { key: 'corporate', slug: 'corporate-event-invitations', label: 'Corporate Event', title: 'Corporate Event Invitations & Online RSVP | Invitara', h1: 'Corporate event invitations', lead: 'For launches, forums and company celebrations: a refined, architectural invitation with agenda, venue and RSVP management.',
    description: 'Professional online invitations for corporate events, product launches, forums and company celebrations. Agenda, venue map, online RSVP and guest list export included.',
    keywords: 'corporate event invitations, business event invitation, online event invitation, conference invitation, product launch invitation, event RSVP',
    body: ['A corporate event invitation represents your brand before the doors open. Invitara’s corporate design pairs bold typography with a sculptural 3D form and a clear agenda.', 'Guests RSVP online, and organisers can export the guest list as a CSV file for registration.'],
    faqs: [['What should a corporate event invitation include?', 'Include the event name, host company, date and time, venue, agenda highlights, dress code and an RSVP deadline.'], ['Can I export the guest list?', 'Yes. All replies, guest counts and messages can be exported from your dashboard as a CSV file.']] },
  { key: 'ramadan', slug: 'ramadan-iftar-invitations', label: 'Ramadan', title: 'Ramadan Iftar Invitations Online | Invitara', h1: 'Ramadan iftar invitations', lead: 'Under one moon, around one table: an elegant iftar invitation with a lantern-screen reveal, timings and RSVP for family and friends.',
    description: 'Elegant online Ramadan iftar and suhoor invitations with a lantern reveal, timings, venue and online RSVP. Share one link with family, friends and colleagues.',
    keywords: 'Ramadan invitation, iftar invitation, online iftar invitation, Ramadan iftar invite, suhoor invitation, Ramadan Kareem invitation',
    body: ['An iftar invitation brings people together to break the fast. Invitara’s Ramadan design opens a carved lantern screen to reveal a golden crescent and the details of your gathering.', 'Share iftar timings and the venue, and see who is joining before you plan the table.'],
    faqs: [['What should an iftar invitation include?', 'Include the host, the date, the iftar time or Maghrib time, the venue and an RSVP request so you can plan for the number of guests.']] },
  { key: 'eid', slug: 'eid-invitations', label: 'Eid', title: 'Eid Invitations Online: Eid al-Fitr & Eid al-Adha | Invitara', h1: 'Eid invitations', lead: 'Joy in every corner: a courtyard invitation whose doors open onto your Eid gathering, with details and RSVP for every guest.',
    description: 'Beautiful online Eid invitations for Eid al-Fitr and Eid al-Adha gatherings. Courtyard doors that open, event details and online RSVP, shared with one link.',
    keywords: 'Eid invitation, Eid Mubarak invitation, Eid al-Fitr invitation, Eid al-Adha invitation, online Eid invite, Eid party invitation',
    body: ['An Eid invitation welcomes loved ones to celebrate together. Invitara’s Eid design opens patterned courtyard doors onto your message, date and venue.', 'Guests reply online, so you know who is coming before the celebration.'],
    faqs: [['When should Eid invitations be sent?', 'Send Eid invitations one to two weeks before the gathering, noting that the exact date may depend on the moon sighting.']] },
  { key: 'holiday', slug: 'holiday-party-invitations', label: 'Holiday', title: 'Holiday Party Invitations Online | Invitara', h1: 'Holiday party invitations', lead: 'A little warmth, wrapped for you: a winter gathering invitation with a gentle reveal, details and RSVP for the season’s best evening.',
    description: 'Warm online holiday party invitations for winter gatherings, festive dinners and end-of-year celebrations. Gentle animation, details and online RSVP in one link.',
    keywords: 'holiday party invitations, Christmas party invitation, festive party invitation online, winter party invitation, New Year party invitation',
    body: ['A holiday party invitation sets the mood for the season. Invitara’s winter design unwraps like a parcel under a quiet moonlit sky.', 'Share the date, venue and plan for the evening, and collect replies online.'],
    faqs: [['When should holiday party invitations go out?', 'Send holiday party invitations three to four weeks ahead, as December calendars fill quickly.']] },
];
export const occasionBySlug = Object.fromEntries(OCCASIONS.map(o => [o.slug, o]));
export const occasionByKey = Object.fromEntries(OCCASIONS.map(o => [o.key, o]));
export const occasionPath = key => occasionByKey[key] ? '/' + occasionByKey[key].slug : '/create.html';

const jsonLd = data => '<script type="application/ld+json">' + JSON.stringify(data).replace(/</g, '\\u003c') + '</script>';
const organization = (origin, supportEmail) => ({ '@type': 'Organization', '@id': origin + '/#organization', name: BRAND, url: origin + '/', logo: origin + '/assets/invitara-logo.png', description: 'Invitara makes interactive digital invitations with online RSVP for weddings, birthdays, baby showers and every celebration.', ...(supportEmail ? { email: supportEmail, contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: supportEmail } } : {}) });
const website = origin => ({ '@type': 'WebSite', '@id': origin + '/#website', name: BRAND, url: origin + '/', publisher: { '@id': origin + '/#organization' }, inLanguage: 'en' });
const breadcrumbs = (origin, items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: origin + path })) });
const faqPage = faqs => ({ '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
// FAQ markup must match visible content, so it is read from the page's own <details> blocks.
const visibleFaqs = html => [...html.matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>\s*<\/details>/g)].map(m => [m[1], m[2]].map(t => t.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’').trim()));

// "Digital wedding invitations" -> "wedding invitation"; proper nouns keep their capital.
const guideNoun = h1 => { const noun = h1.replace(/^Digital /, '').replace(/s$/, ''); return /^(?:Eid|Ramadan) /.test(noun) ? noun : noun[0].toLowerCase() + noun.slice(1); };
const designPath = id => '/design.html?id=' + encodeURIComponent(id);
function designFacts(catalog, t) {
  const engine = catalog.INVITARA_CATALOG.experiences[t.experience];
  const occasion = catalog.INVITARA_CATALOG.label(t.occasion);
  const price = catalog.EVER_C.startingPrice(t.id);
  const photo = catalog.EVER_siteDefaults(t.id).sections.hero.photo;
  return { engine, occasion, price, photo, features: engine.features.concat(['Mobile & desktop responsive', 'Customisable sections', 'Private RSVP management']) };
}

function faqSection(faqs, heading) {
  return '<section class="launch-faq seo-faq" aria-labelledby="seo-faq-title"><p class="studio-kicker">Questions, answered</p><h2 id="seo-faq-title">' + escapeHtml(heading) + '</h2>' + faqs.map(([q, a]) => '<details><summary>' + escapeHtml(q) + '</summary><p>' + escapeHtml(a) + '</p></details>').join('') + '</section>';
}

const SHARED_FAQS = [['How much does a digital invitation cost?', 'Each Invitara invitation is a one-time payment per event, starting from AED 79 plus 5% VAT. There is no subscription, and you can personalise a draft for free before paying.'], ['How long can I edit my invitation?', 'You can edit wording, photos and details until midnight after your event date in your chosen timezone. The published invitation stays viewable afterwards as a keepsake.']];

const PRICING_FAQS = [SHARED_FAQS[0], ['Are there monthly or per-guest fees?', 'No. You pay once per event, and you can invite as many guests as you like. There is no subscription and no charge per reply.'], ['Is VAT included in the price?', 'Prices are shown before VAT. The UAE standard rate of 5% is added and shown clearly at checkout before you pay.'], ['Can I try a design before paying?', 'Yes. Preview every design and personalise a draft for free on your device. You only pay when you are ready to publish and share your invitation.'], SHARED_FAQS[1]];
// Lucide icons (lucide.dev, ISC licence) for each invitation experience.
const EXPERIENCE_ICONS = {"classic":["#3A6157","<path d=\"M15 12h-5\"/><path d=\"M15 8h-5\"/><path d=\"M19 17V5a2 2 0 0 0-2-2H4\"/><path d=\"M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3\"/>"],"story":["#C7487E","<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20\"/><path d=\"M8.62 9.8A2.25 2.25 0 1 1 12 6.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z\"/>"],"book":["#8E3B5C","<path d=\"M12 5v16\"/><path d=\"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z\"/>"],"magazine":["#D9653B","<path d=\"M15 18h-5\"/><path d=\"M18 14h-8\"/><path d=\"M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2\"/><rect width=\"8\" height=\"4\" x=\"10\" y=\"6\" rx=\"1\"/>"],"cinematic":["#2F4B8A","<path d=\"m12.296 3.464 3.02 3.956\"/><path d=\"M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3z\"/><path d=\"M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><path d=\"m6.18 5.276 3.1 3.899\"/>"],"reveal":["#B8862E","<path d=\"M12 7v14\"/><path d=\"M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8\"/><path d=\"M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5\"/><rect x=\"3\" y=\"7\" width=\"18\" height=\"4\" rx=\"1\"/>"],"timeline":["#6A4FB0","<path d=\"M12 13v8\"/><path d=\"M12 3v3\"/><path d=\"M18.172 6a2 2 0 0 1 1.414.586l2.06 2.06a1.207 1.207 0 0 1 0 1.708l-2.06 2.06a2 2 0 0 1-1.414.586H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z\"/>"],"gallery":["#2E8B6A","<path d=\"m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16\"/><path d=\"M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2\"/><circle cx=\"13\" cy=\"7\" r=\"1\" fill=\"currentColor\"/><rect x=\"8\" y=\"2\" width=\"14\" height=\"14\" rx=\"2\"/>"]};

/** Returns overrides for pageHtml: title, description, canonical path, image, JSON-LD and HTML replacements. */
export function seoFor(file, { origin, catalog, query = {}, occasion, supportEmail }) {
  const base = PAGES[file] || {};
  const graph = [organization(origin, supportEmail), website(origin)];
  const out = { title: base.title, description: base.description, keywords: base.keywords, path: file === 'index.html' ? '/' : '/' + file, replace: [] };
  const templates = catalog.INVITARA_availableTemplates();

  if (file === 'index.html') {
    out.graph = html => [...graph, faqPage(visibleFaqs(html))];
  } else if (file === 'pricing.html') {
    const price = Math.min(...templates.map(t => catalog.EVER_C.startingPrice(t.id)));
    graph.push({ '@type': 'Product', name: 'Invitara digital invitation', description: base.description, brand: { '@id': origin + '/#organization' }, image: origin + '/assets/ws-couple.jpg', offers: { '@type': 'AggregateOffer', priceCurrency: 'AED', lowPrice: price, highPrice: Math.max(...templates.map(t => catalog.EVER_C.startingPrice(t.id))), offerCount: templates.length, availability: 'https://schema.org/InStock' } }, breadcrumbs(origin, [['Home', '/'], ['Pricing', '/pricing.html']]), faqPage(PRICING_FAQS));
    const cards = Object.entries(catalog.INVITARA_CATALOG.experiences).map(([key, meta]) => {
      const themes = templates.filter(t => t.experience === key); if (!themes.length) return '';
      const [hue, icon] = EXPERIENCE_ICONS[key] || EXPERIENCE_ICONS.classic;
      return '<a class="experience-price-card" style="--occasion-hue:' + hue + '" href="create.html?experience=' + key + '"><span class="occasion-icon"><svg viewBox="0 0 24 24" aria-hidden="true">' + icon + '</svg></span><h3>' + escapeHtml(meta.name) + '</h3><p>' + escapeHtml(meta.description) + '</p><span class="experience-price-meta">' + themes.length + (themes.length === 1 ? ' design' : ' designs') + '<b>Explore →</b></span></a>';
    }).join('');
    out.replace.push(['<strong id="pricing-amount">79</strong>', '<strong id="pricing-amount">' + price + '</strong>'], ['<div id="pricing-grid" class="experience-price-grid"></div>', '<div id="pricing-grid" class="experience-price-grid">' + cards + '</div>'], ['</main>', faqSection(PRICING_FAQS, 'Pricing questions') + '</main>']);
  } else if (file === 'create.html' && occasion) {
    const o = occasion, designs = templates.filter(t => t.occasion === o.key);
    Object.assign(out, { title: o.title, description: o.description, keywords: o.keywords, path: '/' + o.slug, bodyOccasion: o.key });
    if (designs[0]) out.image = { url: origin + '/' + designFacts(catalog, designs[0]).photo, alt: designs[0].name + ' ' + o.label.toLowerCase() + ' invitation design' };
    const faqs = o.faqs.concat(SHARED_FAQS);
    graph.push({ '@type': 'CollectionPage', name: o.h1, description: o.description, url: origin + '/' + o.slug, isPartOf: { '@id': origin + '/#website' }, mainEntity: { '@type': 'ItemList', itemListElement: designs.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: origin + designPath(t.id), name: t.name })) } }, breadcrumbs(origin, [['Home', '/'], ['Invitations', '/create.html'], [o.h1, '/' + o.slug]]), faqPage(faqs));
    out.replace.push(['<p class="studio-kicker">Made for your moment</p><h1 id="collection-title">Beautiful invitations</h1><p id="collection-description">Find a design that feels like you. Make the experience your own.</p>', '<p class="studio-kicker">' + escapeHtml(o.label) + ' · Interactive · Online RSVP</p><h1 id="collection-title" data-seo-title="' + escapeHtml(o.h1) + '">' + escapeHtml(o.h1) + '</h1><p id="collection-description">' + escapeHtml(o.lead) + '</p>'],
      ['</main>', '<section class="occasion-guide" id="occasion-guide" data-occasion="' + o.key + '" aria-labelledby="occasion-guide-title"><p class="studio-kicker">The ' + escapeHtml(o.label.toLowerCase()) + ' guide</p><h2 id="occasion-guide-title">Why choose a digital ' + escapeHtml(guideNoun(o.h1)) + '?</h2>' + o.body.map(b => '<p>' + escapeHtml(b) + '</p>').join('') + (designs.length ? '<p class="occasion-guide-designs">Featured design: ' + designs.map(t => '<a href="' + designPath(t.id).slice(1) + '">' + escapeHtml(t.name) + '</a>').join(', ') + '.</p>' : '') + '</section>' + faqSection(faqs, o.label + ' invitation questions') + '</main>']);
  } else if (file === 'create.html') {
    graph.push({ '@type': 'CollectionPage', name: 'Digital invitation templates', description: base.description, url: origin + '/create.html', isPartOf: { '@id': origin + '/#website' }, mainEntity: { '@type': 'ItemList', itemListElement: templates.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: origin + designPath(t.id), name: t.name })) } }, breadcrumbs(origin, [['Home', '/'], ['Invitations', '/create.html']]));
    out.replace.push(['<p class="studio-kicker">Made for your moment</p><h1 id="collection-title">Beautiful invitations</h1>', '<p class="studio-kicker">Made for your moment</p><h1 id="collection-title" data-seo-title="Digital invitation templates">Digital invitation templates</h1>'],
      ['</main>', '<nav class="occasion-index" aria-label="Invitations by occasion"><p class="studio-kicker">Browse by occasion</p><ul>' + OCCASIONS.map(o => '<li><a href="' + o.slug + '">' + escapeHtml(o.h1) + '</a></li>').join('') + '</ul></nav></main>']);
  } else if (file === 'design.html') {
    const t = catalog.EVER_findTemplate(query.id) && templates.find(x => x.id === query.id) || templates[0];
    const f = designFacts(catalog, t), o = occasionByKey[t.occasion];
    Object.assign(out, { title: t.name + ' — ' + t.style + ' ' + f.occasion + ' Invitation | Invitara', description: (t.description + ' Interactive ' + f.engine.name.toLowerCase() + ' invitation with online RSVP, from AED ' + f.price + '.').slice(0, 300), keywords: f.occasion.toLowerCase() + ' invitation, digital ' + f.occasion.toLowerCase() + ' invitation, ' + t.style.toLowerCase() + ' invitation template, online RSVP', path: designPath(t.id), image: { url: origin + '/' + f.photo, alt: t.name + ' ' + f.occasion.toLowerCase() + ' invitation' } });
    graph.push({ '@type': 'Product', name: t.name + ' ' + f.occasion + ' Invitation', description: t.description, image: origin + '/' + f.photo, category: f.occasion + ' invitations', brand: { '@id': origin + '/#organization' }, offers: { '@type': 'Offer', price: f.price, priceCurrency: 'AED', availability: 'https://schema.org/InStock', url: origin + designPath(t.id) } }, breadcrumbs(origin, [['Home', '/'], [o ? o.h1 : 'Invitations', o ? '/' + o.slug : '/create.html'], [t.name, designPath(t.id)]]));
    const fill = (id, text) => out.replace.push([new RegExp('(<[^>]+id="' + id + '"[^>]*>)(</)'), '$1' + escapeHtml(text) + '$2']);
    fill('detail-title', t.name); fill('detail-breadcrumb', t.name); fill('detail-occasion', f.occasion + ' invitation'); fill('detail-description', t.description || f.engine.description); fill('detail-price', 'AED ' + f.price + ' / event'); fill('detail-badges', t.style + ' · ' + f.engine.name + ' · Fully customisable');
    out.replace.push([/(<ul id="detail-features"[^>]*>)(<\/ul>)/, '$1' + f.features.map(s => '<li>' + escapeHtml(s) + '</li>').join('') + '$2']);
  } else if (file === 'terms.html' || file === 'privacy.html') {
    graph.push(breadcrumbs(origin, [['Home', '/'], [file === 'terms.html' ? 'Terms' : 'Privacy', '/' + file]]));
  }
  out.graph = out.graph || (() => graph);
  out.jsonLd = html => jsonLd({ '@context': 'https://schema.org', '@graph': out.graph(html) });
  return out;
}

export function sitemapXml(origin, catalog, lastmod) {
  const urls = ['/', '/create.html', '/pricing.html', ...OCCASIONS.map(o => '/' + o.slug), ...catalog.INVITARA_availableTemplates().map(t => designPath(t.id)), '/terms.html', '/privacy.html'];
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(u => '<url><loc>' + escapeHtml(origin + u) + '</loc><lastmod>' + lastmod + '</lastmod></url>').join('\n') + '\n</urlset>\n';
}

export function llmsTxt(origin, catalog) {
  const templates = catalog.INVITARA_availableTemplates(), price = Math.min(...templates.map(t => catalog.EVER_C.startingPrice(t.id)));
  return `# ${BRAND}

> ${BRAND} is an online invitation maker for interactive digital invitations with built-in online RSVP. Hosts choose a design, personalise words, photos, fonts and colours, pay once per event (from AED ${price} plus VAT, no subscription) and share one link or QR code. Guests open the invitation on any device and reply online; hosts manage replies in a dashboard with CSV export.

## Key facts
- Product: interactive digital invitations (e-invitations) with online RSVP, guest list export, view counts, share link and QR code.
- Pricing: one-time payment per event, from AED ${price} plus 5% VAT, with no subscription or per-guest fees. Drafts can be personalised for free before paying.
- Editing: open until midnight after the event date in the host's timezone; the published invitation stays viewable afterwards.
- Designs: ${templates.length} art-directed designs, one per occasion, with experiences such as a page-turning book, cinematic reveal, story, gallery and timeline.
- Guest privacy: invitations are private links (not indexed); only the host sees replies.

## Occasions
${OCCASIONS.map(o => `- [${o.h1}](${origin}/${o.slug}): ${o.description}`).join('\n')}

## Designs
${templates.map(t => `- [${t.name}](${origin}${designPath(t.id)}): ${catalog.INVITARA_CATALOG.label(t.occasion)}, ${t.style}. ${t.description}`).join('\n')}

## Pages
- [Home](${origin}/): overview, how it works and FAQ
- [All invitation templates](${origin}/create.html)
- [Pricing](${origin}/pricing.html)
- [Terms & event access](${origin}/terms.html)
- [Privacy](${origin}/privacy.html)
`;
}
