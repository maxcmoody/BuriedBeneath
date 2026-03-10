# Buried Beneath Browser Prototype (Floor 1 MVP)

Local single-session React + TypeScript prototype for rapid rules testing.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Architecture Overview

- `src/game/core`: rules and runtime systems (combat engine, dice, movement, enemy AI scripts, initiative).
- `src/game/content`: content data for heroes, powers, items, enemies, floor nodes.
- `src/components`: battle/grid/dice/cards/log/map/merchant/reward UI blocks.
- `src/app/state.ts`: run-level map flow and post-encounter transitions.
- `src/App.tsx`: top-level view routing and interaction glue.

The design keeps game rules mostly outside UI so content/rules can be extended without rewriting components.

## Where to edit content

- Heroes: `src/game/content/heroes.ts`
- Powers: `src/game/content/powers.ts`
- Items + merchant offers: `src/game/content/items.ts`
- Enemies + scripts: `src/game/content/enemies.ts`
- Floor node progression + rewards: `src/game/content/floors.ts`

## MVP assumptions beyond the bible

See `ASSUMPTIONS.md`.

## TODO / NEXT-STEPS

- Add Floor 2 and Floor 3 map generation (`2x2 -> 3x3 -> 4x4`) and branching node graph.
- Add more heroes with distinct special dice + power kits.
- Add CSV import pipeline for powers/items/enemies/floor nodes.
- Expand enemy roster and script action vocabulary (push, ranged volleys, summons, curses).
- Add event/curses/vendor variants for non-combat nodes.
- Add browser save/load for run progress.
- Add proper reward implementations (real upgrades/new-power draft) replacing placeholders.
