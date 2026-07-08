/* ============================================================
   portal.js — the launch sequence. On dev the hole no longer
   errors: the blob camouflaged in the paint wakes up, jumps
   into B.L.I.P., the probe shrinks into the hole, and space
   takes over. ESC in space hands control back here.
   ============================================================ */
const PORTAL = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const blob = $('#blob'), blobEyes = $('#blob-eyes');
  const ship = $('#mini-ship'), shade = $('#shade');

  let launching = false;
  let anims = [];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const play = (el, frames, opts) => {
    const a = el.animate(frames, { fill: 'forwards', ...opts });
    anims.push(a);
    return a.finished.catch(() => {});
  };

  async function launch() {
    if (launching) return;
    launching = true;

    if (reduced) {
      shade.classList.add('on');
      await wait(250);
      SPACE.begin();
      await wait(350);
      shade.classList.remove('on');
      launching = false;
      return;
    }

    /* 1 — the blob was in the paint all along */
    blobEyes.style.opacity = 1;
    if (window.blip) blip([[659.25, 0, .09], [987.77, .09, .12]]);
    await play(blob, [
      { transform: 'scale(1, 1)' },
      { transform: 'scale(1.15, 0.8)', offset: 0.4 },
      { transform: 'scale(0.95, 1.1)', offset: 0.7 },
      { transform: 'scale(1, 1)' },
    ], { duration: 550, easing: 'ease-out' });

    /* 2 — B.L.I.P. rises into position below the ledge */
    ship.style.opacity = 1;
    await play(ship, [
      { transform: 'translate(960px, 830px)' },
      { transform: 'translate(960px, 500px)' },
    ], { duration: 700, easing: 'cubic-bezier(.2,.8,.3,1)' });

    /* 3 — the blob leaps into the dome */
    if (window.blip) blip([[523.25, 0, .1], [783.99, .1, .14]]);
    await play(blob, [
      { transform: 'translate(0, 0) scale(1)' },
      { transform: 'translate(-20px, -60px) scale(1.05)', offset: 0.35 },
      { transform: 'translate(-50px, -45px) scale(1)', offset: 0.6 },
      { transform: 'translate(-67px, 48px) scale(0.45)', offset: 0.9 },
      { transform: 'translate(-67px, 60px) scale(0)' },
    ], { duration: 850, easing: 'cubic-bezier(.4,0,.6,1)' });
    blob.style.opacity = 0;

    /* 4 — pilot aboard: shrink into the hole */
    await wait(180);
    if (window.blip) blip([[392, 0, .12], [329.63, .12, .12], [261.63, .24, .2]]);
    await play(ship, [
      { transform: 'translate(960px, 500px) scale(1)' },
      { transform: 'translate(700px, 430px) scale(0.7)', offset: 0.6 },
      { transform: 'translate(640px, 400px) scale(0.02)' },
    ], { duration: 1250, easing: 'cubic-bezier(.6,0,.9,.5)' });
    ship.style.opacity = 0;

    /* 5 — through the wall */
    shade.classList.add('on');
    await wait(450);
    SPACE.begin();
    await wait(400);
    shade.classList.remove('on');
    launching = false;
  }

  /* back from space: put the wall back the way it was */
  function reset() {
    anims.forEach(a => a.cancel());
    anims = [];
    blob.style.opacity = '';
    blobEyes.style.opacity = '';
    ship.style.opacity = '';
    shade.classList.remove('on');
    launching = false;
  }

  return { launch, reset };
})();
