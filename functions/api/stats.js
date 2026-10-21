import { db, istDay, json } from '../../lib/stats-db.js';

// GET: public, aggregate-only numbers for /stats
export async function onRequestGet({ env }){
  const DB = await db(env);
  if (!DB) return json({ ok: false, why: 'no-db' }, 503);
  const now = Date.now(), today = istDay(now), weekAgo = istDay(now - 6*864e5);
  const [online, players, players7, todayRows, allRows, daily] = await DB.batch([
    DB.prepare('SELECT COUNT(*) AS n FROM online WHERE ts > ?1').bind(now - 90e3),
    DB.prepare('SELECT COUNT(*) AS n FROM seen WHERE day = ?1').bind(today),
    DB.prepare('SELECT COUNT(DISTINCT sid) AS n FROM seen WHERE day >= ?1').bind(weekAgo),
    DB.prepare('SELECT k, n FROM counts WHERE day = ?1').bind(today),
    DB.prepare('SELECT k, SUM(n) AS n FROM counts GROUP BY k'),
    DB.prepare("SELECT c.day AS day, c.n AS plays, (SELECT COUNT(*) FROM seen s WHERE s.day = c.day) AS players FROM counts c WHERE c.k = 'play' AND c.day >= ?1 ORDER BY c.day").bind(istDay(now - 13*864e5)),
  ]);
  const obj = r => Object.fromEntries(r.results.map(x => [x.k, x.n]));
  return json({
    ok: true, at: now, day: today,
    online: online.results[0].n,
    playersToday: players.results[0].n,
    playersWeek: players7.results[0].n,
    today: obj(todayRows),
    all: obj(allRows),
    daily: daily.results,
  }, 200, { 'cache-control': 'public, max-age=10' });
}
