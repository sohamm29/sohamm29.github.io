/* ============================================================
   portal.js — the launch choreography. Click the hole and the
   vortex spins open in it; the blob camouflaged in the paint
   wakes up: eyes open, camouflage drops, two hops, then swirl
   sparkles lift it and float it across the wall until the
   vortex wins and it spirals down the drain.
   Then the tunnel (js/tunnel.js) fires it out into the stars.

   What's on the space side isn't defined yet, so the ride ends
   at the NOTBUILT error (utils/notbuilt.js). When space is
   real, swap that call for the space entry point.
   ============================================================ */
const PORTAL = (() => {
  const blob = $('#blob');
  const swirl = $('#swirl');
  const vortex = $('#vortex');
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

    /* 1 — the tunnel is already spinning open (openHole lit the vortex);
       the blob was in the paint all along: eyes open, camouflage drops */
    vortex.classList.add('on');
    blob.classList.add('awake');
    SFX.play('wake');
    await anim.play(blob, [
      { transform: 'scale(1, 1)' },
      { transform: 'scale(1.15, 0.8)', offset: 0.4 },
      { transform: 'scale(0.95, 1.1)', offset: 0.7 },
      { transform: 'scale(1, 1)' },
    ], { duration: 550, easing: 'ease-out' });
    await wait(120);

    /* 2 — two hops off the ledge */
    SFX.play('hop');
    await anim.play(blob, [
      { transform: 'translate(0, 0) scale(1)' },
      { transform: 'translate(-38px, -58px) scale(1)', offset: 0.25 },
      { transform: 'translate(-76px, -6px) scale(1.18, 0.82)', offset: 0.48 },
      { transform: 'translate(-118px, -64px) scale(1)', offset: 0.75 },
      { transform: 'translate(-158px, -10px) scale(1.18, 0.82)' },
    ], { duration: 900, easing: 'cubic-bezier(.3,0,.7,1)' });

    /* 3 — swirl sparkles spin up and float the blob to the hole,
       bobbing on the way. the sparkles fly the same path. */
    swirl.classList.add('on');
    SFX.play('float');
    anim.play(swirl, [
      { transform: 'translate(-158px, -10px)' },
      { transform: 'translate(-172px, -78px)', offset: 0.22 },
      { transform: 'translate(-226px, -60px)', offset: 0.45 },
      { transform: 'translate(-278px, -84px)', offset: 0.68 },
      { transform: 'translate(-330px, -58px)', offset: 0.88 },
      { transform: 'translate(-348px, -66px)' },
    ], { duration: 1700, easing: 'ease-in-out' });
    await anim.play(blob, [
      { transform: 'translate(-158px, -10px) scale(1.18, 0.82) rotate(0deg)' },
      { transform: 'translate(-172px, -78px) scale(0.94, 1.1) rotate(-6deg)', offset: 0.22 },
      { transform: 'translate(-226px, -60px) scale(1) rotate(5deg)', offset: 0.45 },
      { transform: 'translate(-278px, -84px) scale(1) rotate(-5deg)', offset: 0.68 },
      { transform: 'translate(-330px, -58px) scale(1) rotate(4deg)', offset: 0.88 },
      { transform: 'translate(-348px, -66px) scale(1) rotate(0deg)' },
    ], { duration: 1700, easing: 'ease-in-out' });

    /* 4 — the vortex wins: blob spirals down the drain, sparkles too */
    SFX.play('suck');
    anim.play(swirl, [
      { transform: 'translate(-348px, -66px) scale(1)', opacity: 1 },
      { transform: 'translate(-387px, -25px) scale(0)', opacity: 0 },
    ], { duration: 700, easing: 'ease-in' });
    await anim.play(blob, [
      { transform: 'translate(-348px, -66px) scale(1) rotate(0deg)' },
      { transform: 'translate(-361px, 8px) scale(0.85) rotate(120deg)', offset: 0.18 },
      { transform: 'translate(-413px, -9px) scale(0.68) rotate(240deg)', offset: 0.36 },
      { transform: 'translate(-395px, -42px) scale(0.5) rotate(360deg)', offset: 0.54 },
      { transform: 'translate(-377px, -28px) scale(0.32) rotate(480deg)', offset: 0.72 },
      { transform: 'translate(-386px, -21px) scale(0.16) rotate(580deg)', offset: 0.88 },
      { transform: 'translate(-387px, -25px) scale(0) rotate(660deg)' },
    ], { duration: 950, easing: 'ease-in' });
    blob.style.opacity = 0;
    swirl.classList.remove('on');

    /* 5 — the ride: spin up, launch. the vortex hides behind the canvas. */
    await wait(150);
    const riding = TUNNEL.ride(tunnelCanvas);
    vortex.classList.remove('on');
    await riding;

    /* 6 — space isn't built yet. the error says so. */
    await NOTBUILT.show('space');
    reset();
  }

  /* back on the wall: put everything the way it was */
  function reset() {
    anim.cancelAll();
    blob.classList.remove('awake');
    blob.style.opacity = '';
    swirl.classList.remove('on');
    vortex.classList.remove('on');
    tunnelCanvas.classList.remove('on', 'fade');
    shade.classList.remove('on');
    launching = false;
  }

  return { launch, reset };
})();
