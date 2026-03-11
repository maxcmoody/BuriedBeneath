# Pyramid Roguelite Prototype (React + TypeScript + Vite)

Browser-based digital tabletop + CSV-first content editor for rapid physical playtesting.

## Run

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## Modes

- **Play Mode**: encounter sandbox with grid, heroes/enemies, initiative bag, dice lock/reroll, corruption tracker, manual power/item resolution helpers, combat log, save/load state slot.
- **Content Editor**: table editor per CSV group with exact headers/order, add/duplicate/delete/reorder rows, import/export CSV, export all, reset seed, inline validation, copy JSON/paste row, local persistence.
- **Run / Floor Mode**: simple 3-floor progression shell with encounter select, rest options, end-of-floor reward hooks, and quick jump back to play encounter.

## CSV editing + export

- Each group has its own **Export CSV** and **Import CSV** in Content Editor.
- App-level **Export All CSVs** creates a single text download containing each CSV block.
- Headers are strict and must match exactly for import.
- Content groups supported:
  - Player Boards
  - Hero Powers
  - Enemies
  - Items
  - Bosses (separate collection using enemy-like schema)
  - Placeholder tabs: events, curses, manifest, schema

## Manual overrides philosophy

Freeform card/script text is intentionally left manual-first:

- Use **Resolve Power (manual)** and **Resolve Item (manual)** to log custom effects.
- Enemy target suggestion follows closest -> lowest HP -> tie (player choice), but can be manually overridden by direct stat/position edits.
- HP/shield/status/position/corruption are directly editable at all times.

## Persistence

- Whole app state auto-saves to localStorage key `pyramid-roguelite-prototype-v1`.
- Optional manual save slot buttons in Play Mode use `pyramid-roguelite-save-slot`.

## Extending schemas

Add or update schema definitions in:

- `src/data/schemas/contentSchemas.ts`

Seed records live in:

- `src/data/seed/seedContent.ts`

CSV parser/export helpers live in:

- `src/lib/csv/csvUtils.ts`

Game rules and state actions live in:

- `src/lib/rules/gameRules.ts`
- `src/lib/state/appState.ts`
