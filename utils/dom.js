/* ============================================================
   utils/dom.js — shared page plumbing. Load this before every
   other script: it declares the globals the rest lean on.
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
