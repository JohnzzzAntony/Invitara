# Instagram reels

Six ready-to-post reels in `out/`: 1080×1920 (9:16), H.264 MP4, 30 fps, 8–38 MB each. They are built from real footage of the site and its templates, with no stock footage and no invented reviews or numbers. Every claim is a shipped feature.

| File | Length | Angle | Best for |
|---|---|---|---|
| `opens-like-a-movie.mp4` | 16 s | Hook: "POV: your wedding invite opens like a movie", palace doors, garden gates, cinema, champagne | **Post first**; widest reach |
| `every-celebration.mp4` | 21 s | One link for weddings, anniversaries, birthdays, Griha Pravesh, housewarmings, launches, parties | Shows the range |
| `how-it-works.mp4` | 28 s | 5 steps: pick → personalise (AI) → pay once → share on WhatsApp → guests reply | Converting viewers who are interested |
| `personal-touch.mp4` | 14 s | Personal guest links: their name, one reply each | Differentiator |
| `why-momentsiz.mp4` | 13 s | Checklist: no app, no subscription, no per-guest fees, QR, dashboard, CSV, edit until the day | Objection handling; good as a pinned reel |
| `launch-invite.mp4` | 15 s | Product-launch invites (perfume unveil, "coming soon" drop) | Business and brand audience |

## Before posting

1. **Add audio in Instagram.** The files are silent on purpose. Pick a trending sound in the Reels editor (Instagram favours trending audio, and in-app audio avoids music licensing problems). Keep it around 20% volume if you add a voiceover.
2. **Cover frame:** choose the end card (last 2 s: logo, "momentsiz.com", price) or the most striking template frame.
3. **Link in bio** must point to momentsiz.com; every end card says "Link in bio".
4. **Price shown:** AED 103.95 per event, VAT included. Confirm this before posting (owner decision D1 in `docs/implementation-decisions.md`).

## Captions and hashtags

**opens-like-a-movie**
> Your guests deserve an entrance. 🚪✨ Interactive wedding invitations that open like a film, with RSVP built in. Share one link on WhatsApp. Create yours at momentsiz.com (link in bio).
> #weddinginvitation #digitalinvitation #weddinginvite #dubaiwedding #uaewedding #indianwedding #evite #weddingplanning #rsvp #momentsiz

**every-celebration**
> Wedding, birthday, Griha Pravesh or product launch: which one is your moment? 🎉 One link, every celebration. momentsiz.com
> #partyinvitation #birthdayinvitation #housewarming #grihapravesh #anniversary #eventplanning #digitalinvite #dubaievents #momentsiz

**how-it-works**
> From idea to invite in 5 steps 👇 Pick a design, make it yours (the AI can write it), pay once, share on WhatsApp, and watch the replies arrive. Save this for your next event!
> #howto #weddingplanning #digitalinvitation #whatsappinvite #rsvp #eventplanner #dubaibride #momentsiz

**personal-touch**
> Every guest gets their own link, with their name already on it. 💌 One reply per guest, no duplicates. momentsiz.com
> #weddingguests #guestlist #rsvp #weddinginvitation #personalised #uaewedding #momentsiz

**why-momentsiz**
> No app. No subscription. No per-guest fees. Just a beautiful invitation and every RSVP in one place. AED 103.95 per event, VAT included.
> #digitalinvitation #evite #weddingbudget #eventplanning #rsvp #dubai #momentsiz

**launch-invite**
> Launching something? Send an invite people actually open. 🚀 Countdown, venue and RSVP in one link. momentsiz.com
> #productlaunch #launchevent #brandevent #eventmarketing #dubaibusiness #corporateevents #momentsiz

## Posting plan

- Post 3–4 reels a week, starting with `opens-like-a-movie`, then `every-celebration` and `how-it-works`. Pin `how-it-works` and `why-momentsiz` to the profile grid.
- Share each reel to Stories with a link sticker to momentsiz.com.
- Reply to comments asking "how?" or "price?" quickly; early engagement drives reach.
- Nothing guarantees a reel goes viral. Watch the 3-second hold rate and shares in Insights, then make more versions of whichever hook wins.

## Regenerating

```powershell
npm run dev
```

```powershell
node marketing/reels/capture.mjs http://localhost:3000
```

```powershell
node marketing/reels/render.mjs
```

- `capture.mjs` records real footage at 576×1024; the compositor upscales it to 1080×1920.
- `guest-link` and `dashboard` clips need `REEL_GUEST_LINK` and `REEL_LOGIN` pointing at a local **test** account and invitation. Never use real customer data.
- Edit the scripts, captions and timing in `reels.js`.
- `render.mjs` encodes with WebCodecs, writes a standard MP4 (`mp4.js`), and checks each file plays back at the right length and size.
- `inspect.mjs <file> <png> <seconds…>` makes a frame-exact contact sheet for review.
