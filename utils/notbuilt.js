/* ============================================================
   utils/notbuilt.js — the "this section isn't built yet" error.
   One dialog (#warp in index.html), many doors that lead to it.

   NOTBUILT.show('space')  -> promise that resolves on close.
   Add a section: add a key to COPY, call show('key').
   ============================================================ */
const NOTBUILT = (() => {
  const COPY = {
    /* the old pipe error — what you get if the portal script is missing */
    pipe: {
      title: '\u{1F344} oops, hidden world discovered!',
      text: "we still haven't completed support for it yet...\ncome back later, plumber. \u{1F6A7}",
      button: 'Exit pipe ▶',
    },
    /* the far end of the tunnel — launched, but space isn't built */
    space: {
      title: '\u{1F680} launch successful! space... pending.',
      text: "the blob made it through the tunnel,\nbut nobody's built space yet.\ncome back later, pilot. \u{1F6A7}",
      button: 'Back to the wall ▶',
    },
  };

  const dlg = $('#warp');
  const title = dlg.querySelector('h2');
  const text = dlg.querySelector('p');
  const btn = dlg.querySelector('button');

  function show(section = 'space', overrides = {}) {
    const copy = { ...(COPY[section] || COPY.space), ...overrides };
    title.textContent = copy.title;
    text.textContent = copy.text;
    btn.textContent = copy.button;
    if (!dlg.open) dlg.showModal();
    return new Promise(res => dlg.addEventListener('close', res, { once: true }));
  }

  return { show, COPY };
})();
