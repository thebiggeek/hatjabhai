// Plays every place × character, forces every special event, and checks the key screens.
// Usage: BASE_URL=http://localhost:8918 node tests/run.mjs   (CHROME_PATH optional)
import { chromium } from 'playwright';
const BASE = process.env.BASE_URL || 'http://localhost:8918';
const b = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const errs = [];
const fail = m => { errs.push(m); };
const pg = await b.newPage({ viewport: { width: 1280, height: 800 } });
pg.on('pageerror', e => fail('pageerror: ' + e.message));
await pg.goto(BASE + '/index.html'); await pg.waitForTimeout(500);
if ((await pg.locator('.char').count()) !== 3) fail('menu should offer 3 vehicles');
if ((await pg.locator('.region').count()) !== 2) fail('menu should offer 2 places');

for (const view of ['pov', 'top']){
  await pg.evaluate(v => { localStorage.setItem('bkc_view', JSON.stringify(v)); }, view);
  await pg.reload(); await pg.waitForTimeout(300);
  for (const r of ['city', 'hills', 'town', 'highway']) for (const c of ['paidal','cycle','scooty','car','thar','suv','truck','bus','jcb']){
    await pg.evaluate(([r, c]) => { document.querySelectorAll('.overlay').forEach(o => o.hidden = true); window.__bkc.newGame(c, r); }, [r, c]);
    const specials = await pg.evaluate(() => Object.keys(window.__bkc.SPECIAL));
    for (let i = 0; i < specials.length; i++){
      await pg.evaluate(s => { const G = window.__bkc.G; if (G && !G.dying) window.__bkc.SPECIAL[s](); }, specials[i]);
      if (i % 4 === 0){ await pg.keyboard.press(['ArrowLeft','ArrowRight',' ','ArrowUp'][i % 4]); }
      await pg.waitForTimeout(view === 'pov' && c === 'paidal' ? 40 : 20);
      const st = await pg.evaluate(() => [...document.querySelectorAll('.overlay')].filter(o => !o.hidden).map(o => o.id).join());
      if (st === 'dayclear') await pg.click('#dcGo');
      if (st === 'over') break;
    }
  }
}
// day clear shows the report card; game over shows report card, revive and the share card
await pg.evaluate(() => { document.querySelectorAll('.overlay').forEach(o => o.hidden = true); window.__bkc.newGame('car', 'city'); });
await pg.waitForTimeout(1500);
await pg.evaluate(() => { const G = window.__bkc.G; G.dayDist = G.dayTarget - 2; });
await pg.waitForTimeout(500);
if (!(await pg.locator('#dcCII .grade').count())) fail('day clear: no report card');
await pg.click('#dcGo'); await pg.waitForTimeout(300);
await pg.evaluate(() => { const G = window.__bkc.G; G.p.invT = 0; G.p.helmet = false; G.p.hearts = 1; G.p.bp = 205; });
await pg.waitForTimeout(2500);
if (!(await pg.locator('#over:not([hidden])').count())) fail('game over screen did not show');
if (!(await pg.locator('#ovCII .grade').count())) fail('game over: no report card');
if (await pg.locator('#ovRevive:not([hidden])').count()){ await pg.click('#ovRevive'); await pg.waitForTimeout(300); if (await pg.evaluate(() => document.querySelector('#over').hidden) !== true) fail('revive did not resume'); }
// levels: map opens, level 1-1 completes with stars and unlocks the next level and a vehicle
await pg.evaluate(() => { localStorage.removeItem('bkc_lv'); localStorage.removeItem('bkc_lvUnlocks'); state = undefined; });
await pg.evaluate(() => window.__bkc.openLevels()); await pg.waitForTimeout(200);
if ((await pg.locator('.lvcard').count()) !== 20) fail('levels should show 20 cards');
const centred = await pg.evaluate(() => { const car = document.querySelector('#lvCar'), r = car.getBoundingClientRect(), mid = r.left + r.width/2; const c = [...car.children].find(x => { const b = x.getBoundingClientRect(); return b.left <= mid && b.right >= mid; }); return c && !c.classList.contains('locked'); });
if (!centred) fail('levels should open on a playable card');
await pg.evaluate(() => window.__bkc.startLevel(0)); await pg.waitForTimeout(1500);
await pg.evaluate(() => { const G = window.__bkc.G; G.coins = G.coinsTotal; G.dayDist = G.dayTarget - 2; });
await pg.waitForTimeout(800);
if (!(await pg.locator('#lvdone:not([hidden])').count())) fail('level done screen did not show');
const lv = await pg.evaluate(() => JSON.parse(localStorage.getItem('bkc_lv') || '{}'));
if (lv['1-1'] !== 3) fail('level 1-1 should save 3 stars, got ' + lv['1-1']);
await pg.click('#ldNext'); await pg.waitForTimeout(800);
if ((await pg.evaluate(() => window.__bkc.G.lv.id)) !== '1-2') fail('next level did not start');
console.log(errs.length ? 'FAIL\n' + [...new Set(errs)].join('\n') : 'PASS: 2 views × 4 places × 9 characters, all specials, day clear, game over, revive, levels');
await b.close();
process.exit(errs.length ? 1 : 0);
