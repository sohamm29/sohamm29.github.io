/* ============================================================
   js/tunnel.js — the ride: a brick tunnel spinning up maglev
   style (speed climbs with the square of time), then a star
   burst out the far end.

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
    rings: 14,
    ringCols: ['#c84c0c', '#7a2e08', '#3a1404'],
    ringAspect: 0.75,   /* rings are wider than tall, like the hole */
    stars: 130,
    starCols: ['#e8e8f0', '#ffe066', '#7fe3ff', '#8d8da8'],
  };

  function ride(canvas, overrides = {}) {
    const cfg = { ...CFG, ...overrides };
    return new Promise(resolve => {
      const ctx = canvas.getContext('2d');
      const W = canvas.width = Math.ceil(innerWidth / 2);   // half-res = chunky pixels
      const H = canvas.height = Math.ceil(innerHeight / 2);
      const cx = W / 2, cy = H / 2;
      canvas.classList.remove('fade');
      canvas.classList.add('on');

      /* brick rings receding to a vanishing point */
      const rings = Array.from({ length: cfg.rings }, (_, i) => ({ i, z: 0.06 + i / cfg.rings }));

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
            if (r.z < 0.045) r.z += 1;
            const s = 26 / r.z;
            if (s > W + H) continue;
            ctx.lineWidth = Math.max(2, s * 0.09);
            ctx.strokeStyle = cfg.ringCols[r.i % cfg.ringCols.length];
            ctx.strokeRect(ox - s, oy - s * cfg.ringAspect, s * 2, s * cfg.ringAspect * 2);
          }

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
