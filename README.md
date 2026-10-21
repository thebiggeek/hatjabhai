# Hat Ja Bhai! (हट जा भाई!)

**A road-survival satire game.** In a racing game you try to finish first. Here you just try to get home alive.

It's part of a movement for road-safety behaviour change. The jokes are aimed at all of us: wrong-side driving, footpath parking, horn spam. They aren't aimed at any real person or department.

Live at **https://hatjabhai.com** (once the domain is connected).

## Play locally
```
npm run serve        # python3 -m http.server 8918
open http://localhost:8918
```

## What's in it
- **Driver's view (default):** a pseudo-3D road with bends and hills, buildings streaming past, rear-view traffic sprites and a cockpit for each vehicle with a real rear-view mirror. "Upar se" (top-down) is an option in the menu.
- **4 fictional places:** Ultapur (city), Fisalgarh (hills), Dhoolnagar (town) and Ulta Expressway, each with 5 seasons.
- **9 vehicles:** they unlock as you play. Each has its own background music, synthesised in the browser (no video player, nothing streamed).
- **The menu:** 2 random places and 3 random vehicles per visit. "Aaj ki Sadak" gives everyone the same road each day.
- **Daily missions,** an event feed, badges, a daily streak and near-miss combos with slow-mo.
- **One free revive** a day, and the Bhai Mode easter egg.
- **Sadak Report Card:** a Citizen Inconvenience Index scoring the street on obstruction, continuity, surface, crossings, sanitation and accessibility. It's simulated and fictional, never a claim about a real road.
- **Sadak ka Sach:** collectible road-safety tips.
- **Share card image,** plus an installable app (PWA) with offline play.
- **Privacy:** no login, no location, no tracking. Progress lives in the browser.

## Tests
```
npm install && npx playwright install chromium
npm run serve &   # in another terminal
npm test          # 2 views × 4 places × 9 characters, all events, result screens
```
CI runs the same suite on every push (`.github/workflows/test.yml`).

## Deploy (Cloudflare Pages, free)
1. **Create the project.** Cloudflare → Workers & Pages → Create → Pages → Connect to Git, and pick this repo. Leave the build command empty and set the output directory to `/`.
2. **Add the domain to Cloudflare.** Add `hatjabhai.com` to Cloudflare on the Free plan, then set your registrar's nameservers to the two Cloudflare gives you.
3. **Connect the domain.** In the Pages project, go to Custom domains and add `hatjabhai.com` and `www.hatjabhai.com`. Cloudflare creates the DNS records and the SSL certificate.

Every push to `main` redeploys automatically.

## Live stats (hatjabhai.com/stats)
A public page with players online now, plays per day, level finish rates, top game-over causes and vehicle picks.
The game sends a ping a minute plus play / level-done / game-over events to `/api/ping` (Cloudflare Pages Functions in `functions/`), stored as anonymous counts in Cloudflare D1. No IPs, names or locations are stored.

The D1 database `hatjabhai-stats` (APAC) is bound as `DB` through `wrangler.toml`; Cloudflare Pages reads it on every deploy. Tables are created automatically.
Local test: `npx wrangler@4.20.0 pages dev --port 8788` (uses a local copy of the database).

## Config
- `WHATSAPP_URL` in `index.html`: the Sadak Crew WhatsApp channel (https://whatsapp.com/channel/0029Vb9VzGZ6WaKldSHpUH3s).
- Contact and takedown: gagandeep.sapra@gmail.com

## Credits
Inspired by Rahgir's "Aadmi Chutiya Hai" (theme only) and mantarjantar.com. All music is original and generated in the browser. All places, departments and headlines are fictional.
