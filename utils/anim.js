/* ============================================================
   utils/anim.js — a WAAPI "channel": play animations, await
   them, cancel the whole batch on reset.

   const ch = ANIM.channel();
   await ch.play(el, frames, { duration: 500 });
   ch.cancelAll();
   ============================================================ */
const ANIM = (() => {
  function channel() {
    let anims = [];
    return {
      play(el, frames, opts) {
        const a = el.animate(frames, { fill: 'forwards', ...opts });
        anims.push(a);
        return a.finished.catch(() => {});
      },
      cancelAll() {
        anims.forEach(a => a.cancel());
        anims = [];
      },
    };
  }
  return { channel };
})();
