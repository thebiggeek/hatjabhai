// Anonymous play counters for hatjabhai.com/stats, stored in Cloudflare D1 (binding: DB).
// No IPs, no user agents, no persistent ids: each browser tab gets a random session id.

const SCHEMA = [
  'CREATE TABLE IF NOT EXISTS online (sid TEXT PRIMARY KEY, ts INTEGER NOT NULL)',
  'CREATE TABLE IF NOT EXISTS seen (day TEXT NOT NULL, sid TEXT NOT NULL, PRIMARY KEY (day, sid))',
  'CREATE TABLE IF NOT EXISTS counts (day TEXT NOT NULL, k TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (day, k))',
];
let ready = false;
export async function db(env){
  if (!env.DB) return null;
  if (!ready){ await env.DB.batch(SCHEMA.map(q => env.DB.prepare(q))); ready = true; }
  return env.DB;
}

// days roll over at midnight India time
export const istDay = (t = Date.now()) => new Date(t + 5.5*3600e3).toISOString().slice(0, 10);

const SID = /^[a-z0-9]{8,24}$/;
const WORD = /^[a-z_]{1,16}$/;
const LV = /^[1-4]-[1-5]$/;
// the only counters a client may bump; anything else is dropped
export function keysFor(ev, d = {}){
  const k = [];
  if (ev === 'play'){
    k.push('play');
    if (LV.test(d.lv || '')) k.push('play:' + d.lv); else k.push('play:endless');
    if (WORD.test(d.veh || '')) k.push('veh:' + d.veh);
  }
  if (ev === 'done' && LV.test(d.lv || '')){
    k.push('done:' + d.lv);
    if (d.stars === 3) k.push('star3:' + d.lv);
  }
  if (ev === 'over'){
    k.push('over');
    if (WORD.test(d.cause || '')) k.push('cause:' + d.cause);
  }
  return k;
}
export const okSid = s => SID.test(s || '');
export const json = (o, status = 200, extra = {}) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...extra } });
