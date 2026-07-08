/* ============================================================
   sprites.js — procedural pixel art. zero assets, zero deps.
   Sprites are string maps; planets are drawn from a seed.
   ============================================================ */
const PIX = (() => {

  /* seeded rng (mulberry32) so planets look the same every visit */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* draw a string-map sprite. one map cell = s canvas px */
  function draw(ctx, map, pal, x, y, s = 1, flip = false) {
    for (let r = 0; r < map.length; r++) {
      const row = map[r];
      for (let c = 0; c < row.length; c++) {
        const col = pal[flip ? row[row.length - 1 - c] : row[c]];
        if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect(x + c * s, y + r * s, s, s);
      }
    }
  }

  /* ---------- B.L.I.P. — the saucer (24 x 12) ---------- */
  const SHIP_PAL = {
    K: '#1a1a2e', S: '#c3c3d8', s: '#8d8da8',
    C: '#7fe3ff', c: '#3aa5cf', Y: '#ffe066', R: '#ff5e5e',
    B: '#f7f1e3', /* the pilot */
  };
  const SHIP = {
    a: [
      '.........KKKKKK.........',
      '........KCBBBBcK........',
      '.......KCBBBBBccK.......',
      '....KKKKKKKKKKKKKKKK....',
      '..KKSSSSSSSSSSSSSSSSKK..',
      '.KSSSSSSSSSSSSSSSSSSSSK.',
      'KSSYSSsYSSsYSSsYSSsYSSsK',
      '.KsSSSSSSSSSSSSSSSSSSsK.',
      '..KKssssssssssssssssKK..',
      '....KKKKKKKKKKKKKKKK....',
      '.......KsK....KsK.......',
      '........K......K........',
    ],
    b: [
      '.........KKKKKK.........',
      '........KCBBBBcK........',
      '.......KCBBBBBccK.......',
      '....KKKKKKKKKKKKKKKK....',
      '..KKSSSSSSSSSSSSSSSSKK..',
      '.KSSSSSSSSSSSSSSSSSSSSK.',
      'KSSRSSsRSSsRSSsRSSsRSSsK',
      '.KsSSSSSSSSSSSSSSSSSSsK.',
      '..KKssssssssssssssssKK..',
      '....KKKKKKKKKKKKKKKK....',
      '.......KsK....KsK.......',
      '........K......K........',
    ],
  };

  /* ---------- construction flag for the frontier ---------- */
  const FLAG_PAL = { K: '#1a1a2e', R: '#ff5e5e', r: '#c23a3a', P: '#c3c3d8' };
  const FLAG = {
    a: [
      'KRRRRRRR....',
      'KRRrRRRRR...',
      'KRRRRRrRR...',
      'KRRrRRRR....',
      'KRRRRRR.....',
      'K...........',
      'K...........',
      'K...........',
      'K...........',
      'K...........',
      'K...........',
      'KP..........',
    ],
    b: [
      'KRRRRRR.....',
      'KRRrRRRRR...',
      'KRRRRRrRRR..',
      'KRRrRRRRR...',
      'KRRRRRR.....',
      'K...........',
      'K...........',
      'K...........',
      'K...........',
      'K...........',
      'K...........',
      'KP..........',
    ],
  };

  /* ---------- procedural planets ----------
     Draws a pixel planet into ctx on an integer grid.
     opts: { r, seed, type:'gas'|'rock'|'ice', cols:{light,base,dark,deep,extra},
             ring:bool, craters:int } */
  function drawPlanet(ctx, cx, cy, opts) {
    const { r, seed, type, cols } = opts;
    const rand = rng(seed);
    const lx = -0.707, ly = -0.707; // light from top-left

    const craters = [];
    const n = opts.craters || 0;
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2, d = rand() * r * 0.72;
      craters.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: 1.5 + rand() * (r * 0.14) });
    }
    const blobs = [];
    if (type === 'rock') {
      for (let i = 0; i < 5; i++) {
        const a = rand() * Math.PI * 2, d = rand() * r * 0.8;
        blobs.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: r * (0.2 + rand() * 0.3) });
      }
    }
    const bandPhase = rand() * 10, bandH = Math.max(3, Math.round(r / 4));

    const px = (x, y, col) => { ctx.fillStyle = col; ctx.fillRect(cx + x, cy + y, 1, 1); };

    /* back half of the ring first, so the planet overlaps it */
    if (opts.ring) ringPass(ctx, cx, cy, r, cols, -1);

    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        const d2 = x * x + y * y;
        if (d2 > r * r) continue;

        let col = cols.base;
        if (type === 'gas') {
          const warp = Math.sin(x * 0.22 + bandPhase) * 1.6;
          const band = Math.floor((y + r + warp) / bandH) % 3;
          col = band === 0 ? cols.base : band === 1 ? cols.extra : cols.dark;
        } else if (type === 'rock') {
          for (const b of blobs) {
            const bd = (x - b.x) ** 2 + (y - b.y) ** 2;
            if (bd < b.r * b.r) { col = cols.extra; break; }
          }
        } else if (type === 'ice') {
          col = ((x * 7 + y * 13 + seed) % 23 === 0) ? cols.extra : cols.base;
        }

        for (const c of craters) {
          const cd = (x - c.x) ** 2 + (y - c.y) ** 2;
          if (cd < c.r * c.r) { col = cols.deep; break; }
          if (cd < (c.r + 1) ** 2 && x - c.x > 0 && y - c.y > 0) { col = cols.light; break; }
        }

        /* top-left light, bottom-right shadow, dithered terminators */
        const t = (x * lx + y * ly) / r; // 1 = fully lit
        const dith = (x + y) & 1;
        if (t > 0.45 || (t > 0.28 && dith)) col = lighten(col, cols);
        else if (t < -0.55 || (t < -0.34 && dith)) col = cols.deep;
        else if (t < -0.1 && dith) col = darken(col, cols);

        if (d2 > (r - 1.2) * (r - 1.2)) col = '#10101f';
        px(x, y, col);
      }
    }

    if (opts.ring) ringPass(ctx, cx, cy, r, cols, 1);

    function lighten(c) { return c === cols.dark ? cols.base : cols.light; }
    function darken(c) { return c === cols.light ? cols.base : cols.dark; }
  }

  /* half = -1 draws the back arc, +1 the front arc */
  function ringPass(ctx, cx, cy, r, cols, half) {
    const a = r * 1.75, b = r * 0.5, tilt = -0.28;
    for (let i = 0; i < 220; i++) {
      const ang = (i / 220) * Math.PI * 2;
      for (const rr of [1, 0.86]) {
        let ex = Math.cos(ang) * a * rr, ey = Math.sin(ang) * b * rr;
        const x = Math.round(ex * Math.cos(tilt) - ey * Math.sin(tilt));
        const y = Math.round(ex * Math.sin(tilt) + ey * Math.cos(tilt));
        if (half === -1 && y >= 0) continue;
        if (half === 1 && y < 0) continue;
        if (half === 1 && x * x + y * y < (r - 1) * (r - 1)) continue;
        ctx.fillStyle = ((x + y) & 1) ? cols.light : cols.dark;
        ctx.fillRect(cx + x, cy + y, 1, 1);
      }
    }
  }

  return { rng, draw, drawPlanet, SHIP, SHIP_PAL, FLAG, FLAG_PAL };
})();
