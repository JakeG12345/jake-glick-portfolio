# Jake Glick — Portfolio City

A walkable 3D Sydney built from Jake's work. Roll a football around the city,
stop at a building to read about the project it stands for, cross the Harbour
Bridge, and browse the full archive underneath.

Next.js 16 (App Router) · React 19 · Three.js · TypeScript.

## Run it

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

If edits ever stop showing up, the dev server's file watcher has probably run
out of file descriptors (it logs `EMFILE` to `.next/dev/logs`). Restart it with
a higher limit:

```bash
ulimit -n 8192 && npm run dev
```

## The map

| Control | Does |
| --- | --- |
| `WASD` / arrow keys | Roll the ball |
| `Space` | Jump |
| Click the ground | Travel there |
| Click a building, or roll into its ring | Open that project |
| Dock buttons | Jump to a place |

- **48 stops**: 13 city stops with their own models, plus the Project Graveyard
  (older builds) and the Learning Centre (tutorials and practice repos).
- **Landmarks** (Opera House, Bondi, Home) move the camera but open no card.
- The **Harbour Bridge** is a real surface: the ball climbs the ramps and rides
  the deck. One definition (`HARBOUR_BRIDGE`) drives the model, the walkable
  strip and the ball's height.
- Placards face the camera's fixed bearing rather than turning to follow you.
- The coastline, shallows and woodland are generated from the land polygons, so
  reshaping the land reshapes them too.

## Editing content

With the dev server running, open `http://localhost:3000/studio`.

Studio is a local editor for everything the site says. It writes straight back
to the JSON files and the dev server hot-reloads, so a save shows up at once.
`⌘S` saves.

| Tab | File | Covers |
| --- | --- | --- |
| Projects | `app/data/projects.json` | all 43 archive entries, and the base copy for map stops built from them |
| Map stops | `app/data/city.json` | the 13 city stops: landmark copy, per-stop overrides, model height and heading |
| Site copy | `app/data/site.json` | hero, stats, section headings, contact links, experience, footer |

Plot coordinates stay in `app/MuseumPortfolio.tsx` because they are derived from
real Sydney latitude/longitude, not hand-set.

Studio only exists under `next dev`. In a production build both `/studio` and
`/api/studio` return 404, so a deployed copy of the site has no write endpoint.

## Where things live

| Path | What |
| --- | --- |
| `app/MuseumPortfolio.tsx` | The scene, every 3D model, and the page |
| `app/data/*.json` | All copy (see above) |
| `app/data/projects.ts` | Types and image helpers |
| `app/studio/`, `app/api/studio/` | The content editor |
| `app/globals.css` | Site styles |
| `public/projects/` | Screenshots and generated card art |
| `docs/history/` | Screenshots from earlier iterations |

Adding a new city stop needs three things: an entry in `city.json`, a plot in
`cityProjectPlots`, and (optionally) a model wired into `createProjectModel`.

## Checks

```bash
npm run verify
```

Runs ESLint and a production build.
