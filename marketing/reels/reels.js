/* Reel scripts. Each scene shows real captured footage ([clip, fromSecond, seconds]) with captions.
   Caption text: *word* is highlighted. Every claim below is a shipped momentsiz feature; keep it that way.
   Captions stay inside Instagram's safe area (clear of the top bar, right-hand buttons and bottom caption). */
window.REELS = {
  'opens-like-a-movie': [
    { clip: ['palace', 0.6, 4.2], captions: [{ at: 0.1, to: 4.0, text: 'POV: your wedding invite *opens like a movie*', y: 600, size: 92 }] },
    { clip: ['garden', 0.8, 2.6], rate: 2, captions: [{ at: 0.2, to: 2.5, text: 'Guests *tap to open*', y: 600 }] },
    { clip: ['cinema', 1.0, 3.2], rate: 2.1, captions: [{ at: 0.2, to: 2.9, text: 'No app. No printing. Just *one link*.', y: 600 }] },
    { clip: ['champagne', 2.0, 2.6], captions: [{ at: 0.2, to: 2.5, text: 'Every RSVP lands in *your dashboard*', y: 600 }] },
    { end: 3.4, headline: 'Your invitation, but *unforgettable*.' }
  ],
  'how-it-works': [
    { clip: ['site-home', 0.6, 2.6], captions: [{ at: 0.1, to: 2.5, text: 'A digital invitation in *5 easy steps*', y: 1180, size: 88 }] },
    { clip: ['site-catalog', 1.0, 4.2], captions: [{ at: 0.1, to: 4.1, step: 1, text: 'Pick a *design*', sub: 'Weddings, birthdays, anniversaries, launches and more', y: 1250 }] },
    { clip: ['site-home', 6.4, 3.6], captions: [{ at: 0.1, to: 3.5, step: 2, text: 'Make it *yours*', sub: 'Edit words, photos and colours, or let the AI write it', y: 1250 }] },
    { clip: ['site-pricing', 0.4, 3.0], captions: [{ at: 0.1, to: 2.9, step: 3, text: 'Pay *once*, publish', sub: 'AED 103.95 incl. VAT. No subscription.', y: 640 }] },
    { clip: ['dashboard', 4.6, 3.8], captions: [{ at: 0.1, to: 3.7, step: 4, text: 'Share on *WhatsApp*', sub: 'One link and a QR code for every guest', y: 1360 }] },
    { clip: ['rsvp', 5.2, 5.0], rate: 1.4, captions: [{ at: 0.1, to: 4.9, step: 5, text: 'Guests reply in *seconds*', sub: 'No account, no app to install', y: 600 }] },
    { clip: ['dashboard', 2.4, 2.4], captions: [{ at: 0.1, to: 2.3, text: 'Every reply in *one place*', y: 1360 }] },
    { end: 3.4, headline: 'Ready in minutes. *Remembered for years.*' }
  ],
  'every-celebration': [
    { clip: ['clouds', 0.3, 2.4], captions: [{ at: 0.1, to: 2.3, text: 'One link for *every celebration*', y: 600, size: 92 }] },
    { clip: ['garden', 0.8, 2.2], rate: 2.2, captions: [{ at: 0.15, to: 2.1, chip: 'Weddings', y: 600 }] },
    { clip: ['champagne', 1.6, 2.2], captions: [{ at: 0.15, to: 2.1, chip: 'Anniversaries', y: 600 }] },
    { clip: ['clouds', 4.3, 2.2], captions: [{ at: 0.15, to: 2.1, chip: 'Birthdays', y: 600 }] },
    { clip: ['diya', 1.6, 2.2], captions: [{ at: 0.15, to: 2.1, chip: 'Griha Pravesh', y: 600 }] },
    { clip: ['home', 1.6, 2.2], captions: [{ at: 0.15, to: 2.1, chip: 'Housewarmings', y: 600 }] },
    { clip: ['perfume', 1.6, 2.2], captions: [{ at: 0.15, to: 2.1, chip: 'Product launches', y: 600 }] },
    { clip: ['cocktail', 3.2, 2.2], captions: [{ at: 0.15, to: 2.1, chip: 'Parties', y: 600 }] },
    { end: 3.4, headline: 'Which one is *your* moment?' }
  ],
  'why-momentsiz': [
    { clip: ['palace', 4.6, 9.2], rate: 0.45, dim: 0.62, list: { title: 'Why hosts choose *momentsiz*', at: 0.2, every: 1.05, items: ['No app for guests', 'No subscription', 'No per-guest fees', 'WhatsApp link and QR code', 'RSVP dashboard and CSV export', 'A personal link for each guest', 'Edit until your event day'] } },
    { end: 3.4, headline: 'One price. *Everything included.*' }
  ],
  'launch-invite': [
    { clip: ['drop', 0.4, 4.0], captions: [{ at: 0.1, to: 3.9, text: 'Launching something *new*?', y: 600, size: 96 }] },
    { clip: ['perfume', 1.0, 3.6], captions: [{ at: 0.2, to: 3.5, text: 'Send an invite people *actually open*', y: 600 }] },
    { clip: ['drop', 4.4, 4.0], captions: [{ at: 0.2, to: 3.9, text: 'Countdown, venue and RSVP in *one link*', y: 600 }] },
    { end: 3.4, headline: 'Launch invites that feel like *the launch*.' }
  ],
  'personal-touch': [
    { clip: ['guest-link', 0.4, 2.8], captions: [{ at: 0.1, to: 2.7, text: 'What if every guest got *their own* invite?', y: 1250, size: 88 }] },
    { clip: ['dashboard', 6.6, 2.2], zoom: [1.25, 1.4], focus: [0.5, 0.75], captions: [{ at: 0.1, to: 2.1, text: 'Add names, get *personal links*', y: 600 }] },
    { clip: ['guest-link', 6.3, 2.0], zoom: [1.5, 1.7], focus: [0.5, 0.97], captions: [{ at: 0.1, to: 1.9, text: 'They see *their name*', y: 600 }] },
    { clip: ['rsvp', 7.2, 3.4], rate: 1.4, captions: [{ at: 0.1, to: 3.3, text: 'One reply per guest. *No duplicates.*', y: 600 }] },
    { end: 3.4, headline: 'Personal, for *every* guest.' }
  ]
};
