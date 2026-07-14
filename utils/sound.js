/* ============================================================
   utils/sound.js — tiny 8-bit sounds. No assets, just WebAudio
   squares. Every effect on the site is a named entry in FX:
   SFX.play('boom'). Dynamic notes go through SFX.blip directly.

   A note is [frequency Hz, start offset s, duration s].
   ============================================================ */
const SFX = (() => {
  let ac;

  function blip(notes) {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = ac.currentTime;
      notes.forEach(([freq, at, dur]) => {
        const osc = ac.createOscillator(), gain = ac.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.06, t0 + at);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + at + dur);
        osc.connect(gain).connect(ac.destination);
        osc.start(t0 + at);
        osc.stop(t0 + at + dur);
      });
    } catch (e) { /* silence is golden */ }
  }

  const FX = {
    boom:   [[98, 0, .3], [65.41, .08, .45], [49, .16, .6]],          /* the hole opens */
    wake:   [[659.25, 0, .09], [987.77, .09, .12]],                   /* blob eyes open */
    hop:    [[523.25, 0, .1], [783.99, .18, .1], [659.25, .4, .1]],   /* across the wall */
    float:  [[523.25, 0, .12], [659.25, .16, .12], [783.99, .32, .14], [659.25, .5, .12]], /* swirl liftoff */
    suck:   [[392, 0, .1], [261.63, .1, .14], [130.81, .22, .25]],    /* into the hole */
    launch: [[523.25, 0, .3], [783.99, .06, .35], [1046.5, .12, .5]], /* tunnel release */
    dock:   [[196, 0, .12], [155.56, .1, .2]],                        /* landing on a world */
    resume: [[523.25, 0, .1], [659.25, .1, .15]],                     /* back to flight */
  };

  const play = name => { if (FX[name]) blip(FX[name]); };

  return { blip, play, FX };
})();
