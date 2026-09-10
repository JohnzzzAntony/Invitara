/* landing-content.mjs — copy and metadata for the SEO landing pages.
 *
 * One entry per page. scripts/gen-landing.mjs turns each into a static
 * public/<slug>.html so the pages are real, crawlable HTML rather than
 * client-rendered routes.
 *
 * `event` filters the design grid to one of the ids in EVER_EVENTS
 * (wedding, birthday, anniversary, housewarming, baptism, baby, gala).
 * Capability pages leave it null and show a mixed selection.
 *
 * All copy here is original. The page STRUCTURE follows the pattern
 * documented in DESIGN.md (hero → designs → how it works → why → FAQ → CTA);
 * the words are ours.
 */

export const PAGES = [
  {
    slug: 'wedding-invitations',
    event: 'wedding',
    title: 'Wedding Invitation Websites with Online RSVP',
    description:
      'Send a wedding invitation your guests can open on any phone, and collect every RSVP through one link. 14 wedding designs, from AED 58, paid once.',
    keywords:
      'wedding invitation website, online wedding invitation, wedding rsvp online, digital wedding invitation, wedding website with rsvp',
    kicker: 'Wedding invitations',
    h1: 'Wedding invitations your guests open in one tap',
    lead:
      'A whole wedding website behind a single link — your story, the venue, the schedule, the gift list, and an RSVP that actually asks what you need to know.',
    intro: [
      {
        h: 'One link does the inviting',
        p: 'Share it in a message, an e-mail or on a card. It opens instantly on a phone, with no app to install and nothing for a guest to sign up for.',
      },
      {
        h: 'Ask what you really need',
        p: 'Attendance, party size, meal preference, a note for the couple. The reply comes back to you complete, so you are not chasing details for a fortnight.',
      },
      {
        h: 'Change it after you send it',
        p: 'A venue moves, a time shifts, a photo turns out better than the one you picked. Edit the page and everyone who opens the link sees the new version.',
      },
    ],
    faq: [
      [
        'Can I collect meal choices with the RSVP?',
        'Yes. The RSVP section takes attendance, party size and a meal preference, plus a free-text note. You choose which of those to ask for.',
      ],
      [
        'Do our guests need an account?',
        'No. They open the link and reply. There is no registration, no download and no password for anyone on the guest side.',
      ],
      [
        'How much does a wedding invitation cost?',
        'Your total is the design price plus one plan, paid once. Wedding designs start at AED 58 including the Basic plan. There is no subscription and no per-guest fee.',
      ],
    ],
  },
  {
    slug: 'birthday-invitations',
    event: 'birthday',
    title: 'Birthday Invitation Websites with Online RSVP',
    description:
      'Birthday invitations that open on any phone, with a head count you can trust. Milestone designs for every age, from AED 58, paid once.',
    keywords:
      'birthday invitation online, digital birthday invitation, birthday party rsvp, online birthday invite, birthday invitation website',
    kicker: 'Birthday invitations',
    h1: 'Birthday invitations with a head count you can trust',
    lead:
      'Sixteenth, thirtieth, eightieth — send an invitation that suits the age, and know exactly how many are coming before you order the cake.',
    intro: [
      {
        h: 'Know the number early',
        p: 'Every reply lands in one place with the party size attached, so catering and seating stop being guesswork.',
      },
      {
        h: 'A design that fits the age',
        p: 'Neon and balloons for a sixteenth, something quieter for a milestone birthday. Every colour, font and photo is yours to change.',
      },
      {
        h: 'Share it wherever your people are',
        p: 'One link works in a group chat, an e-mail or a printed card. Guests do not need the same app as you.',
      },
    ],
    faq: [
      [
        'Can I limit how many guests someone brings?',
        'You set the maximum party size on the RSVP, so a reply cannot come back with more guests than you can seat.',
      ],
      [
        'Can children reply on their own invitation?',
        'The invitation is a normal web page, so anyone with the link can reply. For a child’s party most hosts share it with the parents.',
      ],
      [
        'Is there a limit on how many people I invite?',
        'No. Every plan includes unlimited guests and unlimited replies — the price does not change with the size of the party.',
      ],
    ],
  },
  {
    slug: 'anniversary-invitations',
    event: 'anniversary',
    title: 'Anniversary Invitation Websites with Online RSVP',
    description:
      'Mark a pearl, silver or golden anniversary with an invitation guests open on any phone, and gather every reply in one place. From AED 58, paid once.',
    keywords:
      'anniversary invitation, wedding anniversary invitation online, golden anniversary invite, silver anniversary rsvp',
    kicker: 'Anniversary invitations',
    h1: 'Anniversary invitations worth the years behind them',
    lead:
      'Pearl, silver, golden — an invitation with room for the photographs, the story so far, and a reply that comes back complete.',
    intro: [
      {
        h: 'Room for the whole story',
        p: 'A timeline of the years, a gallery of the photographs, and space to say what the day means. Not just a date and a place.',
      },
      {
        h: 'Kind to less-technical guests',
        p: 'One tap opens the page. No app, no account, no small print — which matters when the guest list spans four generations.',
      },
      {
        h: 'Replies you can act on',
        p: 'Attendance, party size and dietary notes arrive together, so the caterer gets one clean list.',
      },
    ],
    faq: [
      [
        'Can we include photographs from over the years?',
        'Yes. The gallery and story sections take as many photographs as you want, each with its own caption and year.',
      ],
      [
        'Can family reply on behalf of a relative?',
        'Yes. Anyone with the link can send a reply, and they can name who it is for in the guest-name field.',
      ],
      [
        'Will the invitation still work on an older phone?',
        'It is a plain web page with no app behind it, so it opens on anything with a browser.',
      ],
    ],
  },
  {
    slug: 'housewarming-invitations',
    event: 'housewarming',
    title: 'Housewarming Invitation Websites with Online RSVP',
    description:
      'Invite people to the new address with a page that carries the map, the parking and the RSVP. From AED 58, paid once, no subscription.',
    keywords:
      'housewarming invitation, new home invitation online, housewarming rsvp, open house invitation',
    kicker: 'Housewarming invitations',
    h1: 'Housewarming invitations that come with directions',
    lead:
      'A new address is the hard part. Put the map, the parking, the door code and the RSVP on one page and nobody has to text you for it.',
    intro: [
      {
        h: 'The address, properly explained',
        p: 'Venue, full address, a map and a directions button. Guests get where they are going without a thread of follow-up questions.',
      },
      {
        h: 'Say what the day is like',
        p: 'Drop in and out, or sit down to eat? Shoes on or off? The details section answers it before anyone has to ask.',
      },
      {
        h: 'A gift list without duplicates',
        p: 'List what the house still needs and let guests claim an item, so you do not end up with three of the same kettle.',
      },
    ],
    faq: [
      [
        'Can I add a map to the new place?',
        'Yes. Add the address and the page shows a map with a directions button that opens the guest’s own maps app.',
      ],
      [
        'Can people drop in at different times?',
        'Use the schedule section to show an open window rather than a single start time, and ask on the RSVP when guests expect to arrive.',
      ],
      [
        'Can I hide our address until someone replies?',
        'The whole invitation lives behind the link you share, so only the people you send it to can see it.',
      ],
    ],
  },
  {
    slug: 'baptism-invitations',
    event: 'baptism',
    title: 'Baptism & Christening Invitation Websites with RSVP',
    description:
      'Gentle baptism and christening invitations with the service details, the reception and an online RSVP. From AED 58, paid once.',
    keywords:
      'baptism invitation, christening invitation online, naming ceremony invitation, baptism rsvp',
    kicker: 'Baptism & christening',
    h1: 'Baptism invitations with the day laid out plainly',
    lead:
      'The service, the reception, the godparents and the reply — set out gently, on a page that opens anywhere.',
    intro: [
      {
        h: 'Two places, one page',
        p: 'A church and then a reception is two addresses and two times. The schedule section carries both without confusing anyone.',
      },
      {
        h: 'Name the people who matter',
        p: 'Godparents, grandparents, the family. There is room to say who is who and why the day matters.',
      },
      {
        h: 'A quiet, respectful design',
        p: 'Soft palettes and traditional typography, with none of the noise of a party invitation.',
      },
    ],
    faq: [
      [
        'Can I show the church and the reception separately?',
        'Yes. The schedule takes as many parts as the day has, each with its own time, place and short description.',
      ],
      [
        'Can I ask who is bringing children?',
        'Yes. The party-size question covers it, and you can add a free-text note for anything more specific.',
      ],
      [
        'Is the invitation private?',
        'It is reachable only through the link you share, and it is never indexed by search engines.',
      ],
    ],
  },
  {
    slug: 'baby-shower-invitations',
    event: 'baby',
    title: 'Baby Shower Invitation Websites with Online RSVP',
    description:
      'Baby shower invitations with a gift list, a head count and one shareable link. Soft designs for showers and first birthdays, from AED 58.',
    keywords:
      'baby shower invitation, baby shower rsvp online, gender reveal invitation, first birthday invitation',
    kicker: 'Baby showers & kids',
    h1: 'Baby shower invitations with the gift list built in',
    lead:
      'Send the invitation, collect the replies, and let guests claim a gift so nothing arrives twice.',
    intro: [
      {
        h: 'A gift list people can claim',
        p: 'Add what you need. Guests mark what they are bringing, and everyone else sees it is taken.',
      },
      {
        h: 'A clean head count',
        p: 'Attendance and party size come back together, so you know how many chairs, plates and party bags to plan for.',
      },
      {
        h: 'Soft designs, easy to make yours',
        p: 'Gentle palettes and rounded type, with every word, colour and photograph editable.',
      },
    ],
    faq: [
      [
        'Can guests see what has already been claimed?',
        'Yes. Once an item is claimed it shows as taken, which is what stops the duplicate gifts.',
      ],
      [
        'Can I use this for a gender reveal or a first birthday?',
        'Yes. The same designs cover showers, gender reveals and first birthdays — change the wording to suit.',
      ],
      [
        'Do I need to buy a new invitation for a second child?',
        'A purchase covers one invitation. A second event needs its own, and you can pick a different design for it.',
      ],
    ],
  },
  {
    slug: 'gala-invitations',
    event: 'gala',
    title: 'Gala & Evening Event Invitation Websites with RSVP',
    description:
      'Formal invitations for galas, fundraisers and evening events, with dress code, programme and online RSVP. From AED 104, paid once.',
    keywords:
      'gala invitation, formal event invitation online, fundraiser invitation, black tie invitation, corporate event rsvp',
    kicker: 'Galas & evening events',
    h1: 'Gala invitations that set the tone before the night does',
    lead:
      'Black tie, a programme, a seating plan and a guest list that has to be right. A formal invitation that behaves like one.',
    intro: [
      {
        h: 'Dress code, stated clearly',
        p: 'Say what the evening expects, where to arrive and when to be seated, so nobody has to guess.',
      },
      {
        h: 'A programme for the night',
        p: 'Reception, dinner, speeches, dancing. Each part with its own time and place, laid out in order.',
      },
      {
        h: 'A guest list you can work from',
        p: 'Names, party sizes and dietary requirements arrive in one table, ready for the venue.',
      },
    ],
    faq: [
      [
        'Can I use this for a corporate or charity event?',
        'Yes. The gala designs suit fundraisers, awards nights and company dinners as readily as private events.',
      ],
      [
        'Can I collect dietary requirements?',
        'Yes. The RSVP takes a meal preference and a free-text note, which covers allergies and restrictions.',
      ],
      [
        'Why do gala designs cost more?',
        'The formal layouts carry more sections — programme, seating, gallery, video — and only sell with the Pro and Advanced plans, so they start higher.',
      ],
    ],
  },
  {
    slug: 'online-rsvp',
    event: null,
    title: 'Online RSVP — Collect Every Reply Through One Link',
    description:
      'Collect RSVPs online without an app or an account. Attendance, party size, meal choice and notes, from every guest, through one shareable link.',
    keywords:
      'online rsvp, rsvp website, collect rsvps online, free rsvp tool, event rsvp form, digital rsvp',
    kicker: 'Online RSVP',
    h1: 'Every reply, through one link',
    lead:
      'No app for your guests. No account. No spreadsheet you maintain by hand. Share one link and let the answers come to you.',
    intro: [
      {
        h: 'Nothing for a guest to install',
        p: 'The RSVP is part of the invitation page. A guest opens the link, answers, and is done — usually inside a minute.',
      },
      {
        h: 'Ask real questions',
        p: 'Attendance, how many are coming, a meal preference and a message. Enough to plan from, short enough that people finish it.',
      },
      {
        h: 'Replies reach you directly',
        p: 'A reply is composed and sent straight to the contact details you put on the invitation, so it lands where you already look.',
      },
    ],
    faq: [
      [
        'Is there a limit on the number of RSVPs?',
        'No. Every plan takes unlimited guests and unlimited replies. The price does not move with the size of the list.',
      ],
      [
        'Where do the replies actually go?',
        'Each reply is sent to the contact you gave on the invitation — a WhatsApp number or an e-mail address — so it arrives somewhere you already check.',
      ],
      [
        'Can I change the RSVP questions?',
        'Yes. Turn the meal question or the phone field on and off, and set the largest party size you will accept.',
      ],
    ],
  },
  {
    slug: 'digital-invitations',
    event: null,
    title: 'Digital Invitations — A Whole Website, Not Just a Picture',
    description:
      'A digital invitation that is a real web page: story, schedule, gallery, map, gift list and RSVP. 8 designs, from AED 58, paid once.',
    keywords:
      'digital invitation, online invitation, electronic invitation, e-invite, invitation website, paperless invitation',
    kicker: 'Digital invitations',
    h1: 'A digital invitation is more than a picture of a card',
    lead:
      'An image in a group chat cannot hold a map, a schedule, a gift list or a reply. A page can.',
    intro: [
      {
        h: 'It holds everything the day needs',
        p: 'Story, schedule, venue, map, gallery, gift list and RSVP — all on one page, all editable after you send it.',
      },
      {
        h: 'It reads properly on a phone',
        p: 'Every design is built mobile-first, so nobody is pinching and dragging to read the time and the address.',
      },
      {
        h: 'It stays correct',
        p: 'A picture is wrong the moment a detail changes. Edit the page and the link everyone already has shows the new version.',
      },
    ],
    faq: [
      [
        'How is this different from sending an image?',
        'An image cannot take a reply, show a map, or be corrected after you have sent it. This is a real page that does all three.',
      ],
      [
        'Can I still print something?',
        'Many hosts print a small card carrying just the link, and let the page hold the detail.',
      ],
      [
        'What happens to the page after the event?',
        'It stays available for as long as you want it. Your invitation lives on your device and nothing expires it.',
      ],
    ],
  },
];
