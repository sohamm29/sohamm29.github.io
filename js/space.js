/* ============================================================
   space.js — the navigable strip of space, Jetpack-Joyride
   style. B.L.I.P.'s horizontal thrusters are always on
   (float mode); the arrow keys — and only the arrow keys —
   steer (navigation mode). Fly into a world to land on it.
   ============================================================ */
const SPACE = (() => {
  const overlay = $('#flight');
  const canvas = $('#flight-canvas');
  const ctx = canvas.getContext('2d');
  const modeEl = $('#fmode'), distEl = $('#fdist'), msgEl = $('#fmsg');
  const land = $('#land'), landTitle = $('#land-title'), landText = $('#land-text'), landBtn = $('#land-btn');

  /* ---------- tuning ---------- */
  const CRUISE = 1.4;   // float mode: thrusters hold this
  const MAXV = 3.4;     // full throttle
  const MINV = -1.1;    // gentle reverse
  const THROTTLE = 0.06;
  const STEER = 0.12;
  const VMAX = 2.3;
  const SPACING = 780;
  const START_X = 900;

  /* ---------- state ---------- */
  let W = 0, H = 0, camX = 0, tick = 0, raf = null;
  let mode = 'off'; // off | intro | fly | landed
  let intro = 0;
  const ship = { x: 60, y: 0, vx: CRUISE, vy: 0 };
  const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
  let stars = [];
  let worlds = [], frontier = null, ENDX = 0;

  /* ---------- planets, prerendered once ---------- */
  function planetCanvas(px) {
    const grid = px.r * 2 + (px.ring ? Math.ceil(px.r * 1.9) : 4);
    const c = document.createElement('canvas');
    c.width = c.height = grid;
    PIX.drawPlanet(c.getContext('2d'), grid >> 1, grid >> 1, px);
    return c;
  }

  function buildStrip() {
    worlds = WORLDS.list.map((w, i) => ({
      ...w,
      x: START_X + i * SPACING,
      y: 0, // set on resize
      canvas: planetCanvas(w.px),
    }));

    /* the frontier: a half-assembled world + construction sign */
    const px = WORLDS.frontier.px;
    const c = planetCanvas(px);
    const g = c.getContext('2d'), grid = c.width, r = px.r, cc = grid >> 1;
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y > r * r) continue;
        if ((x - y > r * 0.25) && (y % 3 !== 0)) g.clearRect(cc + x, cc + y, 1, 1);
      }
    }
    for (let i = 0; i < 90; i++) { // dashed blueprint outline
      const a = (i / 90) * Math.PI * 2;
      if (i % 6 > 2) continue;
      g.fillStyle = '#59d3f5';
      g.fillRect(cc + Math.round(Math.cos(a) * (r + 2)), cc + Math.round(Math.sin(a) * (r + 2)), 1, 1);
    }
    frontier = { ...WORLDS.frontier, x: START_X + worlds.length * SPACING, y: 0, canvas: c };
    ENDX = frontier.x + 240;
  }

  /* ---------- canvas + starfield ---------- */
  function resize() {
    W = canvas.width = Math.ceil(innerWidth / 2);   // half-res = chunky pixels
    H = canvas.height = Math.ceil(innerHeight / 2);
    for (const w of worlds) w.y = Math.round(w.yFrac * H);
    frontier.y = Math.round(frontier.yFrac * H);

    const rand = PIX.rng(42);
    stars = [];
    const layers = [
      { n: Math.round(W * H / 3400), d: 0.15, s: 1, cols: ['#4a4a6a', '#3d3d5c'] },
      { n: Math.round(W * H / 6200), d: 0.4, s: 1, cols: ['#8d8da8', '#7a7a9a'] },
      { n: Math.round(W * H / 12000), d: 0.75, s: 2, cols: ['#e8e8f0', '#ffe066', '#7fe3ff'] },
    ];
    for (const L of layers) {
      for (let i = 0; i < L.n; i++) {
        stars.push({
          x: rand() * W, y: rand() * H, d: L.d, s: L.s,
          c: L.cols[(rand() * L.cols.length) | 0],
          tw: rand() < 0.12 ? 20 + rand() * 60 : 0,
        });
      }
    }
  }

  /* ---------- input: arrow keys, and arrow keys alone ---------- */
  addEventListener('keydown', e => {
    if (mode === 'off') return;
    if (e.key === 'Escape') { e.preventDefault(); mode === 'landed' ? resume() : exit(); return; }
    if (mode === 'landed' && e.key === 'Enter') { e.preventDefault(); resume(); return; }
    if (e.key in keys) { e.preventDefault(); keys[e.key] = true; }
  });
  addEventListener('keyup', e => { if (e.key in keys) keys[e.key] = false; });

  /* touch: the on-screen arrows are arrow keys too */
  document.querySelectorAll('#fpads [data-key]').forEach(btn => {
    const k = btn.dataset.key;
    const on = e => { e.preventDefault(); keys[k] = true; };
    const off = e => { e.preventDefault(); keys[k] = false; };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointercancel', off);
    btn.addEventListener('pointerleave', off);
  });

  $('#fexit').addEventListener('click', () => exit());
  landBtn.addEventListener('click', () => resume());

  /* ---------- flight ---------- */
  function physics() {
    const up = keys.ArrowUp, dn = keys.ArrowDown, lf = keys.ArrowLeft, rt = keys.ArrowRight;

    if (mode === 'intro') {
      /* boost out of the hole, then settle to cruise */
      intro++;
      ship.vx += (CRUISE - ship.vx) * 0.02;
      if (intro > 110) { mode = 'fly'; msg('FLOAT MODE ENGAGED — ARROW KEYS TO NAVIGATE', 2600); }
    } else if (mode === 'fly') {
      if (rt) ship.vx = Math.min(MAXV, ship.vx + THROTTLE);
      else if (lf) ship.vx = Math.max(MINV, ship.vx - THROTTLE);
      else ship.vx += (CRUISE - ship.vx) * 0.02;   // float mode: drift back to cruise

      if (up) ship.vy = Math.max(-VMAX, ship.vy - STEER);
      else if (dn) ship.vy = Math.min(VMAX, ship.vy + STEER);
      else ship.vy *= 0.92;
    }

    ship.x += ship.vx;
    ship.y += ship.vy;

    /* soft walls */
    if (ship.y < 22) { ship.y = 22; ship.vy = Math.max(0, ship.vy); }
    if (ship.y > H - 22) { ship.y = H - 22; ship.vy = Math.min(0, ship.vy); }
    if (ship.x < 40) { ship.x = 40; ship.vx = Math.max(0.4, ship.vx); }
    if (ship.x > ENDX) { ship.x = ENDX; ship.vx = -0.6; msg('NOTHING PAST HERE YET. TURN AROUND, PILOT.', 2000); }

    camX = Math.max(0, Math.min(ship.x - W * 0.32, ENDX + 160 - W));

    /* landing: fly into a world */
    if (mode === 'fly') {
      for (const w of worlds) {
        const pr = w.px.r + 14;
        const dx = ship.x - w.x, dy = ship.y - w.y;
        if (dx * dx + dy * dy < pr * pr) { landOn(w); break; }
      }
    }

    modeEl.textContent = 'MODE · ' + (mode === 'landed' ? 'DOCKED' :
      (up || dn || lf || rt) && mode === 'fly' ? 'NAV' : 'FLOAT');
    distEl.textContent = 'DIST ' + String(Math.max(0, Math.round(ship.x * 61.8))).padStart(7, '0') + ' KM';
  }

  /* ---------- drawing ---------- */
  function drawStars() {
    for (const st of stars) {
      if (st.tw && !reducedMotion && ((tick / st.tw) | 0) % 2) continue;
      const sx = ((st.x - camX * st.d) % W + W) % W;
      ctx.fillStyle = st.c;
      ctx.fillRect(sx | 0, st.y | 0, st.s, st.s);
    }
  }

  function drawWorlds() {
    ctx.textAlign = 'center';
    for (const w of worlds.concat([frontier])) {
      const sx = w.x - camX;
      if (sx < -160 || sx > W + 160) continue;
      const g = w.canvas.width;
      ctx.drawImage(w.canvas, Math.round(sx - g / 2), Math.round(w.y - g / 2));

      ctx.font = '8px "Press Start 2P", monospace';
      if (w === frontier) {
        const f = ((tick / 26) | 0) % 2 ? PIX.FLAG.a : PIX.FLAG.b;
        PIX.draw(ctx, f, PIX.FLAG_PAL, Math.round(sx + w.px.r * 0.4), Math.round(w.y - w.px.r - 14), 1);
        ctx.fillStyle = '#ffe066';
        ctx.fillText('⚠ ' + w.title + ' ⚠', Math.round(sx), Math.round(w.y + w.px.r + 20));
        ctx.fillStyle = '#8d8da8';
        ctx.fillText(w.sign, Math.round(sx), Math.round(w.y + w.px.r + 34));
      } else {
        ctx.fillStyle = '#e8e8f0';
        ctx.fillText(w.name, Math.round(sx), Math.round(w.y + w.px.r + 22));
        ctx.fillStyle = '#8d8da8';
        ctx.fillText(w.tagline, Math.round(sx), Math.round(w.y + w.px.r + 36));
        const dx = ship.x - w.x, dy = ship.y - w.y;
        if (dx * dx + dy * dy < 160 * 160) {
          ctx.fillStyle = '#ffe066';
          ctx.fillText('[ fly into it to land ]', Math.round(sx), Math.round(w.y + w.px.r + 50));
        }
      }
    }
  }

  function drawShip() {
    const bob = (!reducedMotion && mode === 'fly' && Math.abs(ship.vy) < 0.2)
      ? Math.round(Math.sin(tick / 24) * 1.5) : 0;
    const sx = Math.round(ship.x - camX - 12), sy = Math.round(ship.y - 6 + bob);
    const flick = (tick & 2) ? '#ffe066' : '#ff8c42';

    /* horizontal thrusters: always on. bigger flame = more throttle. */
    ctx.fillStyle = flick;
    if (ship.vx >= 0) {
      const len = 3 + Math.round(ship.vx * 2);
      ctx.fillRect(sx - len, sy + 5, len, 2);
      ctx.fillRect(sx - Math.max(2, len - 3), sy + 4, 2, 4);
    } else {
      const len = 3 + Math.round(-ship.vx * 3);
      ctx.fillRect(sx + 24, sy + 5, len, 2);
    }
    /* vertical steering jets */
    if (keys.ArrowUp && mode === 'fly') { ctx.fillRect(sx + 7, sy + 12, 2, 4); ctx.fillRect(sx + 15, sy + 12, 2, 4); }
    if (keys.ArrowDown && mode === 'fly') { ctx.fillRect(sx + 7, sy - 4, 2, 4); ctx.fillRect(sx + 15, sy - 4, 2, 4); }

    const frame = ((tick / 14) | 0) % 2 ? PIX.SHIP.a : PIX.SHIP.b;
    PIX.draw(ctx, frame, PIX.SHIP_PAL, sx, sy, 1);
  }

  function loop() {
    tick++;
    physics();
    ctx.fillStyle = '#07071a';
    ctx.fillRect(0, 0, W, H);
    drawStars();
    drawWorlds();
    drawShip();
    raf = requestAnimationFrame(loop);
  }

  /* ---------- landing (placeholder — every world, on purpose) ---------- */
  function landOn(w) {
    mode = 'landed';
    ship.vx = 0; ship.vy = 0;
    SFX.play('dock');
    landTitle.textContent = WORLDS.placeholder.title.replace('{name}', w.name);
    landText.textContent = WORLDS.placeholder.text;
    landBtn.textContent = WORLDS.placeholder.button;
    land.classList.add('on');
    land._world = w;
    landBtn.focus();
  }

  function resume() {
    const w = land._world;
    land.classList.remove('on');
    if (w) { ship.x = w.x + w.px.r + 46; ship.y = w.y; }
    ship.vx = CRUISE; ship.vy = 0;
    mode = 'fly';
    SFX.play('resume');
  }

  /* ---------- messages ---------- */
  let msgTimer = null;
  function msg(text, hold) {
    msgEl.textContent = text;
    msgEl.classList.add('on');
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => msgEl.classList.remove('on'), hold);
  }

  /* ---------- enter / leave ---------- */
  let built = false;
  function begin() {
    if (mode !== 'off') return;
    if (!built) {
      buildStrip();
      addEventListener('resize', () => { if (mode !== 'off') resize(); });
      built = true;
    }
    resize();
    if (document.fonts && document.fonts.load) document.fonts.load('8px "Press Start 2P"');

    ship.x = 60; ship.y = Math.round(H * 0.5);
    ship.vx = reducedMotion ? CRUISE : 4.2; ship.vy = 0;
    intro = 0; camX = 0;
    mode = reducedMotion ? 'fly' : 'intro';

    overlay.classList.add('on');
    document.body.classList.add('locked');
    msg('B.L.I.P. ONLINE — ' + WORLDS.probe.full, 2600);
    if (!raf) loop();
  }

  function exit() {
    mode = 'off';
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    land.classList.remove('on');
    overlay.classList.remove('on');
    document.body.classList.remove('locked');
    for (const k in keys) keys[k] = false;
    if (window.PORTAL && PORTAL.reset) PORTAL.reset();
  }

  return { begin, exit };
})();
