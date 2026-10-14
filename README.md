# GlassFlow

A small, local-first Kanban board built with React, TypeScript, Redux Toolkit, and Vite.

## Run locally

```sh
npm install
npm run dev
```

## Use the board

- Select **New task** or press `N` to create a task.
- Select a card to edit its title, notes, priority, required deadline, or status.
- Drag any part of a card to reorder or move it; on touch, press and hold first. Keyboard users can focus the move control and press `Space`, then use arrow keys. `Option`/`Alt` plus arrow keys also reorders or changes columns. Hold `Shift` while dragging over text to select it.
- Change status from the task editor. GlassFlow uses one dark appearance.

Tasks persist in local storage under `glassflow-kanban`. Existing task IDs, ordering, and older task fields are retained when loaded. Older tasks without a valid deadline remain on the board with a **Deadline needed** label; open each card and set a deadline before saving. No date is fabricated during migration. The board works offline and needs no account.

## Verify and deploy

```sh
npm run build
npm run lint
npm run build:pages
```

`build:pages` creates the GitHub Pages site in `docs/`.
