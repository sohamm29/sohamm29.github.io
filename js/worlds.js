/* ============================================================
   worlds.js — ALL the content lives here.

   The probe flies a horizontal strip of space. Each entry in
   WORLDS.list gets a planet on the strip; fly into it to land.
   Landing is not supported yet — every world currently shows
   the same placeholder (WORLDS.placeholder), on purpose.

   HOW TO ADD A WORLD: copy a block, change id/name/tagline/px
   (r = radius, seed = any number, type = 'gas'|'rock'|'ice').
   It appears on the strip automatically.
   ============================================================ */
const WORLDS = {

  probe: {
    name: 'B.L.I.P.',
    full: 'BLOB-LAUNCHED INTERSTELLAR PROBE',
  },

  /* what you get when you land anywhere, for now */
  placeholder: {
    title: '\u{1F344} oops, {name} discovered!',
    text: "we still haven't completed support for it yet... come back later, pilot. \u{1F6A7}",
    button: 'RESUME FLIGHT ▶',
  },

  list: [
    {
      id: 'verdant-9',
      name: 'VERDANT-9',
      tagline: 'the home world',
      yFrac: 0.34,
      px: {
        r: 26, seed: 909, type: 'rock', craters: 3,
        cols: { light: '#9fe770', base: '#5cb84a', dark: '#2e7a3c', deep: '#1b4a2e', extra: '#3f96c9' },
      },
    },
    {
      id: 'forge-7',
      name: 'FORGE-7',
      tagline: 'the workshop',
      yFrac: 0.66,
      px: {
        r: 24, seed: 707, type: 'gas', craters: 0,
        cols: { light: '#ffd27a', base: '#ff8c42', dark: '#c2452a', deep: '#7a2420', extra: '#e8632f' },
      },
    },
    {
      id: 'relic-1',
      name: 'RELIC-1',
      tagline: 'the old world',
      yFrac: 0.30,
      px: {
        r: 22, seed: 111, type: 'ice', craters: 4, ring: true,
        cols: { light: '#d9c8ff', base: '#9a7fd1', dark: '#5e4a94', deep: '#37285e', extra: '#e8e8f0' },
      },
    },
    {
      id: 'beacon-4',
      name: 'BEACON-4',
      tagline: 'the signal array',
      yFrac: 0.62,
      px: {
        r: 25, seed: 404, type: 'rock', craters: 5,
        cols: { light: '#8ff0ef', base: '#3fb8c9', dark: '#20708c', deep: '#123f56', extra: '#2a8ca8' },
      },
    },
  ],

  frontier: {
    title: 'EDGE OF KNOWN SPACE',
    sign: 'UNDER CONSTRUCTION',
    yFrac: 0.48,
    px: {
      r: 30, seed: 2026, type: 'rock', craters: 4,
      cols: { light: '#c9c9dd', base: '#8d8da8', dark: '#5a5a74', deep: '#38384e', extra: '#6e6e8a' },
    },
  },
};
