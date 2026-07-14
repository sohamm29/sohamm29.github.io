/* ============================================================
   js/tunnel.js — the ride: a round brick tunnel spinning up
   maglev style (speed climbs with the square of time), then a
   star burst out the far end.

   Each ring is a course of bricks laid in a running bond,
   shaded darker the deeper it sits. Every few courses a
   pothole overhead lets light in: those bricks glow and a
   shaft of light spills down into the tunnel.

   Draws on whatever canvas you hand it; every knob lives in
   TUNNEL.CFG and can be overridden per ride:
     await TUNNEL.ride($('#tunnel'), { tunnelMs: 4000 });
   Resolves once the canvas has faded back out.
   ============================================================ */
const TUNNEL = (() => {
  const CFG = {
    tunnelMs: 2200,     /* spin-up */
    launchMs: 1300,     /* star burst */
    fadeMs: 440,        /* fade-out — keep in step with #tunnel's css transition */
    rings: 16,
    segs: 12,           /* bricks per course */
    ringAspect: 0.78,   /* rings are wider than tall, like the hole */
    litEvery: 3,        /* a pothole overhead every n-th course */
    /* dark depths -> base brick -> pothole daylight */
    shades: ['#140702', '#2a0e03', '#421604', '#5d2206', '#7a2e08',
             '#9c3c0a', '#c84c0c', '#e8804a', '#ffb066', '#ffe066'],
    stars: 130,
    starCols: ['#e8e8f0', '#ffe066', '#7fe3ff', '#8d8da8'],
  };
  const TAU = Math.PI * 2;

  function ride(canvas, overrides = {}) {
    const cfg = { ...CFG, ...overrides };
    return new Promise(resolve => {
      const ctx = canvas.getContext('2d');
      const W = canvas.width = Math.ceil(innerWidth / 2);   // half-res = chunky pixels
      const H = canvas.height = Math.ceil(innerHeight / 2);
      const cx = W / 2, cy = H / 2;
      canvas.classList.remove('fade');
      canvas.classList.add('on');

      /* brick courses receding to a vanishing point; n is the course
         number, so the running bond and the potholes stream past */
      const rings = Array.from({ length: cfg.rings }, (_, i) => ({ n: i, z: 0.06 + i / cfg.rings }));
      let course = cfg.rings;

      function drawCourse(r, ox, oy) {
        const s = 26 / r.z;
        if (s > W + H) return;
        const ry = s * cfg.ringAspect;
        const depth = Math.max(0, Math.min(1, 1.08 - r.z));   /* 0 far, 1 near */
        const base = (depth * 6) | 0;                         /* chunky depth steps */
        const lit = r.n % cfg.litEvery === 0;
        const bond = (r.n % 2) * (TAU / cfg.segs / 2);        /* stagger every other course */
        ctx.lineWidth = Math.max(2, s * 0.11);
        for (let k = 0; k < cfg.segs; k++) {
          const a0 = bond + (k / cfg.segs) * TAU;
          const a1 = a0 + (TAU / cfg.segs) * 0.8;             /* the rest is mortar */
          const mid = (a0 + a1) / 2;
          let dTop = (mid + Math.PI / 2) % TAU;               /* how far from 12 o'clock */
          if (dTop > Math.PI) dTop = TAU - dTop;
          let sh = base;
          if (Math.sin(mid) > 0.5) sh -= 1;                   /* floor bricks sit in shadow */
          if ((k * 5 + r.n * 3) % 4 === 0) sh -= 1;           /* odd brick fired darker */
          if (lit) sh += dTop < 0.5 ? 3 : dTop < 1 ? 2 : dTop < 1.5 ? 1 : 0;
          ctx.strokeStyle = cfg.shades[Math.max(0, Math.min(cfg.shades.length - 1, sh))];
          ctx.beginPath();
          ctx.ellipse(ox, oy, s, ry, 0, a0, a1);
          ctx.stroke();
        }
        if (lit) {                                            /* the pothole's shaft of light */
          ctx.fillStyle = `rgba(255, 224, 102, ${0.05 + depth * 0.07})`;
          ctx.beginPath();
          ctx.moveTo(ox - s * 0.24, oy - ry);
          ctx.lineTo(ox + s * 0.24, oy - ry);
          ctx.lineTo(ox + s * 0.34, oy + ry * 0.85);
          ctx.lineTo(ox - s * 0.34, oy + ry * 0.85);
          ctx.closePath();
          ctx.fill();
        }
      }

      /* stars for the burst out the far end */
      const stars = Array.from({ length: cfg.stars }, () => ({
        a: Math.random() * Math.PI * 2,
        d: 2 + Math.random() * 26,
        c: cfg.starCols[(Math.random() * cfg.starCols.length) | 0],
      }));

      const t0 = performance.now();
      let prev = t0, lastTone = -1;

      function frame(now) {
        const dt = Math.min(3, (now - prev) / 16.7);
        prev = now;
        const t = now - t0;

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        if (t < cfg.tunnelMs) {
          /* maglev spin-up: speed climbs with the square of time */
          const p = t / cfg.tunnelMs;
          const speed = (0.004 + p * p * 0.085) * dt;
          const shake = p * p * 5;
          const ox = cx + Math.sin(t / 83) * shake;
          const oy = cy + Math.cos(t / 67) * shake;

          const step = (p * 9) | 0;
          if (step !== lastTone) {                  /* rising hum */
            lastTone = step;
            SFX.blip([[98 * Math.pow(2, step / 4), 0, .12]]);
          }

          for (const r of rings) {
            r.z -= speed * r.z;
            if (r.z < 0.045) { r.z += 1; r.n = course++; }
          }
          rings.sort((a, b) => b.z - a.z);      /* far courses first, near paint over */
          for (const r of rings) drawCourse(r, ox, oy);

          /* the light at the end */
          ctx.fillStyle = '#ffe066';
          ctx.fillRect((ox - 2) | 0, (oy - 2) | 0, 4, 4);
        } else if (t < cfg.tunnelMs + cfg.launchMs) {
          const p = (t - cfg.tunnelMs) / cfg.launchMs;
          if (lastTone !== 99) {                    /* release! */
            lastTone = 99;
            SFX.play('launch');
          }
          if (p < 0.05) {                           /* the pop of release */
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, W, H);
          }
          const v = Math.pow(1.02 + p * 0.11, dt);
          ctx.lineWidth = 1;
          for (const st of stars) {
            const d0 = st.d;
            st.d *= v;
            if (st.d > W + H) st.d = 2 + Math.random() * 10;
            ctx.strokeStyle = st.c;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(st.a) * Math.min(d0, st.d), cy + Math.sin(st.a) * Math.min(d0, st.d));
            ctx.lineTo(cx + Math.cos(st.a) * st.d, cy + Math.sin(st.a) * st.d);
            ctx.stroke();
          }
        } else {
          canvas.classList.add('fade');
          setTimeout(() => { canvas.classList.remove('on', 'fade'); resolve(); }, cfg.fadeMs);
          return;
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  return { ride, CFG };
})();
