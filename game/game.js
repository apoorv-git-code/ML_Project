'use strict';
// Adaptive Fighter AI: minimal game + logger. Log format = docs/SCHEMA.md v1.0 (one row per fighter per 100 ms tick).
const ATK = { PUNCH: { dur: 2, rng: 80, dmg: 5 }, KICK: { dur: 3, rng: 110, dmg: 10 }, GRAB: { dur: 3, rng: 55, dmg: 8 } };
const TICK = 100, SPEED = 30, MAXT = 600, JY = [100, 200, 100, 0], GAP = 30;
const COLS = ['match_id','session_type','player_id','is_human','tick','t_ms','action','opp_action','x','y','opp_x','opp_y','distance','hp','opp_hp','meter','opp_meter','hit_landed','hit_taken','reaction_ms'];
const MCOLS = ['match_id','date','session_type','p1_id','p2_id','winner_id','duration_ms','p1_final_hp','p2_final_hp','group','self_rated_skill','self_described_style'];
const KEYS = [
  { KeyA:'MOVE_LEFT', KeyD:'MOVE_RIGHT', KeyW:'JUMP', KeyS:'BLOCK', KeyJ:'PUNCH', KeyK:'KICK', KeyL:'GRAB' },
  { ArrowLeft:'MOVE_LEFT', ArrowRight:'MOVE_RIGHT', ArrowUp:'JUMP', ArrowDown:'BLOCK', Comma:'PUNCH', Period:'KICK', Slash:'GRAB' }];
const inp = [{ held: new Set(), tap: new Set() }, { held: new Set(), tap: new Set() }];
let S = null;

function fighter(id, human, x, pi, bot) {
  return { id, human, pi, bot: !!bot, n: 0, x, dx: x, y: 0, hp: 100, meter: 0, act: 'IDLE', cact: '', commit: 0, air: 0, hl: 0, ht: 0, pend: null, rt: '' };
}
function newMatch(cfg) { // cfg: {id, type, p1, p2, p1Human, p2Human}
  S = { cfg, f: [fighter(cfg.p1, cfg.p1Human, 300, 0, cfg.p1Bot), fighter(cfg.p2, cfg.p2Human, 700, 1)], tick: 0, rows: [], over: false };
  return S;
}
function humanAct(pi) {
  const s = new Set([...inp[pi].held, ...inp[pi].tap]); inp[pi].tap.clear();
  for (const a of ['PUNCH', 'KICK', 'GRAB', 'BLOCK', 'JUMP']) if (s.has(a)) return a;
  const l = s.has('MOVE_LEFT'), r = s.has('MOVE_RIGHT');
  return l && !r ? 'MOVE_LEFT' : r && !l ? 'MOVE_RIGHT' : 'IDLE';
}
// Rule-based CPU. Hook for the ML predictor goes here later (CONTRACT section 2); the game must never wait for it.
function cpuAct(f, g) {
  const d = Math.abs(f.x - g.x), r = Math.random(), toward = g.x < f.x ? 'MOVE_LEFT' : 'MOVE_RIGHT', away = g.x < f.x ? 'MOVE_RIGHT' : 'MOVE_LEFT';
  if (ATK[g.act] && d < 130 && r < 0.5) return r < 0.35 ? 'BLOCK' : 'JUMP';
  const q = Math.random();
  if (d > 100) return q < 0.8 ? toward : 'IDLE';
  return q < .35 ? 'PUNCH' : q < .5 ? 'KICK' : q < .62 ? 'GRAB' : q < .77 ? 'BLOCK' : q < .85 ? 'JUMP' : q < .93 ? away : 'IDLE';
}
// Scripted bot (BOT01, BOT03: macro with a punch every 6 ticks; BOT02, BOT04: instant blocker, kick every 8 ticks). No human-like variation.
function botAct(f, g) {
  f.n++; const d = Math.abs(f.x - g.x), macro = parseInt(f.id.slice(3), 10) % 2 === 1;
  if (!macro && ATK[g.act] && d < 130) return 'BLOCK';
  if (d > 70) return g.x < f.x ? 'MOVE_LEFT' : 'MOVE_RIGHT';
  return f.n % (macro ? 6 : 8) === 0 ? (macro ? 'PUNCH' : 'KICK') : 'IDLE';
}
function decide(f, g) { // returns [action, startedThisTick]
  if (f.commit > 0) { f.commit--; return [f.cact, false]; }
  if (f.air > 0) return ['JUMP', false];
  const a = f.human ? humanAct(f.pi) : f.bot ? botAct(f, g) : cpuAct(f, g);
  if (ATK[a]) { f.cact = a; f.commit = ATK[a].dur - 1; return [a, true]; }
  if (a === 'JUMP') { f.air = JY.length; return [a, true]; }
  return [a, false];
}
function react(f, g, gStart, t) { // reaction_ms: first tick after the opponent's attack start where f changes action (100 ms resolution)
  f.rt = '';
  if (gStart && ATK[g.act]) f.pend = { t, base: f.act };
  else if (f.pend && t > f.pend.t) {
    if (f.act !== f.pend.base) { f.rt = (t - f.pend.t) * TICK; f.pend = null; }
    else if (t - f.pend.t >= 10) f.pend = null;
  }
}
function tick() {
  const [a, b] = S.f, t = S.tick;
  const da = decide(a, b), db = decide(b, a);
  a.act = da[0]; b.act = db[0]; a.hl = a.ht = b.hl = b.ht = 0;
  for (const [f, g] of [[a, b], [b, a]]) {
    const dx = f.act === 'MOVE_LEFT' ? -SPEED : f.act === 'MOVE_RIGHT' ? SPEED : 0;
    if (dx) { const nx = Math.max(0, Math.min(1000, f.x + dx)); if (Math.abs(nx - g.x) >= GAP) f.x = nx; }
    if (f.air > 0) { f.y = JY[JY.length - f.air]; f.air--; } else f.y = 0;
  }
  [[a, b, da[1]], [b, a, db[1]]].forEach(([f, g, st]) => {
    const A = ATK[f.act];
    if (!st || !A || Math.abs(f.x - g.x) > A.rng) return;
    if (f.act === 'GRAB' ? g.y > 0 : g.y > 60) return; // airborne fighters dodge
    const blocked = g.act === 'BLOCK' && f.act !== 'GRAB';
    g.hp = Math.max(0, g.hp - (blocked ? Math.max(1, Math.round(A.dmg * 0.2)) : A.dmg));
    f.hl = 1; g.ht = 1; f.meter = Math.min(100, f.meter + (blocked ? 3 : 8)); g.meter = Math.min(100, g.meter + 5);
  });
  react(a, b, db[1], t); react(b, a, da[1], t);
  for (const [f, g] of [[a, b], [b, a]]) {
    S.rows.push([S.cfg.id, S.cfg.type, f.id, f.human ? 1 : 0, t, t * TICK, f.act, g.act, f.x, f.y, g.x, g.y,
      Math.abs(f.x - g.x), f.hp, g.hp, f.meter, g.meter, f.hl, f.ht, f.rt].join(','));
  }
  S.tick++;
  if (a.hp <= 0 || b.hp <= 0 || S.tick >= MAXT) S.over = true;
}
function winner() { const [a, b] = S.f; return a.hp === b.hp ? 'DRAW' : a.hp > b.hp ? a.id : b.id; }
const matchCsv = () => COLS.join(',') + '\n' + S.rows.join('\n') + '\n';
function summaryRow(extra) {
  const [a, b] = S.f;
  return [S.cfg.id, new Date().toLocaleDateString('en-CA'), S.cfg.type, a.id, b.id, winner(), S.tick * TICK, a.hp, b.hp,
    extra.group, extra.skill || '', extra.style || ''].join(',');
}
if (typeof module !== 'undefined') module.exports = { newMatch, tick, matchCsv, summaryRow, winner, MCOLS, getS: () => S };

// ---------------- browser UI ----------------
if (typeof document !== 'undefined') (() => {
  const $ = id => document.getElementById(id), cv = $('cv'), ctx = cv.getContext('2d');
  let acc = 0, last = 0, running = false, setup = {};
  const store = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const download = (name, text) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); a.download = name; a.click(); };
  const show = id => ['setup', 'game', 'result'].forEach(s => $(s).style.display = s === id ? 'block' : 'none');

  const bot = () => $('mode').value === 'scripted_bot', sync = () => $('go').disabled = !($('agree').checked || bot());
  $('mode').onchange = () => { $('p2row').style.display = $('mode').value === 'human_vs_human' ? 'block' : 'none'; sync(); };
  $('agree').onchange = sync;
  $('go').onclick = () => {
    const p1 = $('p1').value.trim().toUpperCase(), p2 = $('p2').value.trim().toUpperCase(), hh = $('mode').value === 'human_vs_human';
    if (!(bot() ? /^BOT\d{2}$/ : /^P\d{2,}$/).test(p1) || (hh && !/^P\d{2,}$/.test(p2))) return alert('IDs look like P07 (humans) or BOT01 (bots)');
    setup = { p1, p2: hh ? p2 : 'CPU', type: $('mode').value, group: bot() ? 'bot' : $('group').value, skill: bot() ? '' : $('skill').value };
    startMatch();
  };
  function startMatch() {
    const n = store('nextMatch', 1); put('nextMatch', n + 1);
    newMatch({ id: 'M' + String(n).padStart(4, '0'), type: setup.type, p1: setup.p1, p2: setup.p2, p1Human: setup.type !== 'scripted_bot', p1Bot: setup.type === 'scripted_bot', p2Human: setup.type === 'human_vs_human' });
    acc = 0; last = performance.now(); running = true; show('game');
    $('ctl').textContent = setup.type === 'scripted_bot' ? 'Bot vs CPU: just watch.  Esc = stop (nothing is saved)' : 'P1: A/D move, W jump, S block, J punch, K kick, L grab' + (S.cfg.p2Human ? '  |  P2: arrows move/jump/block, , punch  . kick  / grab' : '') + '  |  Esc = stop (nothing is saved)';
    requestAnimationFrame(loop);
  }
  function loop(now) {
    if (!running) return;
    acc += Math.min(now - last, 500); last = now;
    while (acc >= TICK && !S.over) { tick(); acc -= TICK; }
    draw();
    if (S.over) { running = false; finish(); } else requestAnimationFrame(loop);
  }
  function draw() {
    ctx.clearRect(0, 0, 1000, 340); ctx.fillStyle = '#222'; ctx.fillRect(0, 300, 1000, 40);
    S.f.forEach((f, i) => {
      f.dx += (f.x - f.dx) * 0.35;
      ctx.fillStyle = f.ht ? '#fff' : i ? '#e55' : '#4af';
      ctx.fillRect(f.dx - 20, 220 - f.y * 0.7, 40, 80);
      if (f.act === 'BLOCK') { ctx.strokeStyle = '#ff0'; ctx.strokeRect(f.dx - 24, 216 - f.y * 0.7, 48, 88); }
      ctx.fillStyle = '#fff'; ctx.font = '12px monospace'; ctx.fillText(f.act, f.dx - 24, 210 - f.y * 0.7);
      const bx = i ? 520 : 20; ctx.fillStyle = '#400'; ctx.fillRect(bx, 15, 460, 16); ctx.fillStyle = '#3c3'; ctx.fillRect(bx, 15, 4.6 * f.hp, 16);
      ctx.fillStyle = '#334'; ctx.fillRect(bx, 36, 460, 8); ctx.fillStyle = '#fc0'; ctx.fillRect(bx, 36, 4.6 * f.meter, 8);
      ctx.fillStyle = '#fff'; ctx.fillText(f.id, bx, 60);
    });
    ctx.fillText('time ' + (S.tick / 10).toFixed(0) + ' / ' + MAXT / 10 + ' s', 450, 60);
  }
  function finish() {
    download(S.cfg.id + '.csv', matchCsv());
    $('who').textContent = 'Winner: ' + winner() + ' (' + S.f[0].hp + ' vs ' + S.f[1].hp + ' HP)  match ' + S.cfg.id;
    $('styleRow').style.display = S.cfg.type === 'human_vs_cpu' ? 'block' : 'none'; show('result');
  }
  $('save').onclick = () => {
    const style = S.cfg.type === 'human_vs_cpu' ? $('style').value : '';
    const rows = store('matchRows', []); rows.push(summaryRow({ group: setup.group, skill: setup.skill, style })); put('matchRows', rows);
    download('matches.csv', MCOLS.join(',') + '\n' + rows.join('\n') + '\n'); startMatch();
  };
  $('done').onclick = () => { show('setup'); $('agree').checked = false; sync(); };
  document.addEventListener('keydown', e => {
    if (e.code === 'Escape' && running) { running = false; return show('setup'); }
    KEYS.forEach((m, i) => { if (m[e.code] && running) { inp[i].held.add(m[e.code]); inp[i].tap.add(m[e.code]); e.preventDefault(); } });
  });
  document.addEventListener('keyup', e => KEYS.forEach((m, i) => { if (m[e.code]) inp[i].held.delete(m[e.code]); }));
  show('setup');
})();
