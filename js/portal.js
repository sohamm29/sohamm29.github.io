/* ============================================================
   portal.js — the launch choreography. Click the hole and the
   blob camouflaged in the paint wakes up: eyes open, camouflage
   drops, and it hops across the wall and ports into the hole.
   Then the tunnel (js/tunnel.js) fires it out into the stars.

   What's on the space side isn't defined yet, so the ride ends
   at the NOTBUILT error (utils/notbuilt.js). When space is
   real, swap that call for the space entry point.
   ============================================================ */
const PORTAL = (() => {
  const blob = $('#blob');
  const shade = $('#shade');
  const tunnelCanvas = $('#tunnel');

  const anim = ANIM.channel();
  let launching = false;

  async function launch() {
    if (launching) return;
    launching = true;

    if (reducedMotion) {
      shade.classList.add('on');
      await wait(250);
      shade.classList.remove('on');
      await NOTBUILT.show('space');
      reset();
      return;
    }

    /* 1 — the blob was in the paint all along: eyes open, camouflage drops */
    blob.classList.add('awake');
    SFX.play('wake');
    await anim.play(blob, [
      { transform: 'scale(1, 1)' },
      { transform: 'scale(1.15, 0.8)', offset: 0.4 },
      { transform: 'scale(0.95, 1.1)', offset: 0.7 },
      { transform: 'scale(1, 1)' },
    ], { duration: 550, easing: 'ease-out' });
    await wait(120);

    /* 2 — three hops across the wall to the hole */
    SFX.play('hop');
    await anim.play(blob, [
      { transform: 'translate(0, 0) scale(1)' },
      { transform: 'translate(-70px, -60px) scale(1)', offset: 0.18 },
      { transform: 'translate(-135px, -10px) scale(1.15, 0.85)', offset: 0.34 },
      { transform: 'translate(-210px, -75px) scale(1)', offset: 0.55 },
      { transform: 'translate(-285px, -15px) scale(1.15, 0.85)', offset: 0.72 },
      { transform: 'translate(-345px, -60px) scale(1)', offset: 0.9 },
      { transform: 'translate(-387px, -25px) scale(1)' },
    ], { duration: 1400, easing: 'cubic-bezier(.3,0,.7,1)' });

    /* 3 — port in: the hole pulls it through */
    SFX.play('suck');
    await anim.play(blob, [
      { transform: 'translate(-387px, -25px) scale(1) rotate(0deg)' },
      { transform: 'translate(-387px, -25px) scale(0.6) rotate(180deg)', offset: 0.55 },
      { transform: 'translate(-387px, -25px) scale(0) rotate(420deg)' },
    ], { duration: 480, easing: 'ease-in' });
    blob.style.opacity = 0;

    /* 4 — the ride: spin up, launch */
    await wait(150);
    await TUNNEL.ride(tunnelCanvas);

    /* 5 — space isn't built yet. the error says so. */
    await NOTBUILT.show('space');
    reset();
  }

  /* back on the wall: put everything the way it was */
  function reset() {
    anim.cancelAll();
    blob.classList.remove('awake');
    blob.style.opacity = '';
    tunnelCanvas.classList.remove('on', 'fade');
    shade.classList.remove('on');
    launching = false;
  }

  return { launch, reset };
})();
