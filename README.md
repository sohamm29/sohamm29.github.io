My personal site — a freshly painted wall with the paint chipping off, old bricks underneath, and a hole in the middle. Click the hole. Zero frameworks, zero image assets: everything is hand-typed SVG and canvas pixels. Live at **[sohamm29.github.io](https://sohamm29.github.io)**.

## Run it locally

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. That's it — no build step, no dependencies; any static file server works (`npx serve` too). Edit a file, refresh the browser.

## Where things live

| File | What it is |
|---|---|
| `index.html` | The wall: beige paint (the page background), exposed bricks, the hole. Self-contained — works with no other file. |
| `world1-1.html` | The previous version of the site, preserved as a monument |
