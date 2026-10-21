import { db, istDay, keysFor, okSid, json } from '../../lib/stats-db.js';

// POST {sid, ev?, d?}: a heartbeat every minute while the game is open, plus play/done/over events
export async function onRequestPost({ request, env }){
  const DB = await db(env);
  if (!DB) return json({ ok: false, why: 'no-db' }, 503);
  let b;
  try { b = await request.json(); } catch { return json({ ok: false }, 400); }
  if (!okSid(b.sid)) return json({ ok: false }, 400);
  const now = Date.now(), day = istDay(now);
  const q = [
    DB.prepare('INSERT INTO online (sid, ts) VALUES (?1, ?2) ON CONFLICT(sid) DO UPDATE SET ts = ?2').bind(b.sid, now),
    DB.prepare('INSERT OR IGNORE INTO seen (day, sid) VALUES (?1, ?2)').bind(day, b.sid),
  ];
  for (const k of keysFor(b.ev, b.d || {})) q.push(DB.prepare('INSERT INTO counts (day, k, n) VALUES (?1, ?2, 1) ON CONFLICT(day, k) DO UPDATE SET n = n + 1').bind(day, k));
  if (Math.random() < 0.05) q.push(DB.prepare('DELETE FROM online WHERE ts < ?1').bind(now - 10*60e3));
  await DB.batch(q);
  return json({ ok: true });
}
