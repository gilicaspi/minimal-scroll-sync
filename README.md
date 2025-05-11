# gilicaspi/scroll-sync

[![CI](https://github.com/gilicaspi/scroll-sync/actions/workflows/ci.yml/badge.svg)](https://github.com/gilicaspi/scroll-sync/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/gilicaspi/scroll-sync/branch/main/graph/badge.svg)](https://codecov.io/gh/gilicaspi/scroll-sync)

A **lightweight, dependency‑free** emitter + set of React hooks that keep any number of horizontally scrollable elements in synchonized with minimal lag. Ideal for virtualized timelines, kanban boards, Gantt charts, parallax backgrounds, or anything that needs *follow‑the‑leader* scrolling.

> **Why another scroll‑sync lib?**  This emitter keeps track of **which element is actively scrolling** (winning the race in JavaScript’s single‑threaded world) and publishes at `requestAnimationFrame` cadence only to the *other* nodes.  No extra `setState` churn, no jank.

---

## ✨ Features

| Feature                            | Details                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| ⚡ **Ultra‑light**                  | Zero runtime deps.|
| 🪝 **Hooks first**                 | `useScrollSync`, `useScrollSyncSubscribe`, `useScrollEndSubscribe` for React apps. |
| 🪢 **Pure emitter**                | Non‑React projects can import `scrollSyncEmitter` directly.|
| 🧠 **Smart *lead / follow* logic** | Only the actively‑scrolled element publishes; everyone else follows.|
| 🏎️ **RAF‑based**                  | Updates happen in `requestAnimationFrame`, avoiding recursive scroll events.|
| 🛑 **Scroll‑end callback**         | Fire one final callback when interaction stops (for snap, analytics, etc.).|

---

## 🚀 Installation

```bash
npm i gilicaspi/scroll-sync
# or
pnpm add gilicaspi/scroll-sync
```

The package ships **ESM, CJS, and type declarations**—whatever your bundler prefers.

---

## 🏁 Quick start (three‑pane example)

```tsx
import React, { useRef } from "react";
import { useScrollSync } from "gilicaspi/scroll-sync";

export default function TwinPanes() {
  const leaderRef = useRef<HTMLDivElement>(null);
  const leaderRef2 = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  // Leader both publishes & follows (edge‑case safety)
  useScrollSync(leaderRef);
  // Leader 2 both publishes & follows (edge‑case safety)
  useScrollSync(leaderRef2);

  // Follower only follows; never publishes its own scroll
  useScrollSyncSubscribe(followerRef);

  return (
    <>
      <div ref={leaderRef} className="pane scrollable">/* … */</div>
      <div ref={leaderRef2} className="pane scrollable">/* … */</div>
      <div ref={followerRef} className="pane scrollable">/* … */</div>
    </>
  );
}
```

That’s all; drag either of the first two panes, and the third glides perfectly alongside.

---

## 🔍 API

### `useScrollSync(ref)`

*Publishes **and** subscribes.*  Attach to every element that might **lead** the scroll.  Under the hood it:

1. Registers the element’s callback (`scrollLeft = offset`).
2. Adds `scroll` and `scrollend` listeners that call `scrollSyncEmitter.publish()` / `publishScrollEnd()`.

### `useScrollSyncSubscribe(ref, scrollSpeed = 1)`

Read‑only follower.  The optional `scrollSpeed` lets you build parallax effects by scrolling at a fraction (e.g. `0.25`).

### `useScrollEndSubscribe(ref, cb)`

Calls `cb(offset)` **once** when the user finishes interacting with `ref` (after a tiny debounce). Handy for scroll‑snap hacks, analytics pings, etc.

### `scrollSyncEmitter`

If you’re outside React or writing your own wrapper you can rely on the bare emitter:

```ts
scrollSyncEmitter.subscribeScroll(element, cb);     // follow scrollLeft
scrollSyncEmitter.publish(element);                 // broadcast offset
scrollSyncEmitter.subscribeScrollEnd(element, cb);  // follow scrollend
scrollSyncEmitter.publishScrollEnd(element);        // broadcast + onEnd
scrollSyncEmitter.resetCurrentElement();            // manual reset (rare)
```

All subs return an **unsubscribe** function.

---

## 🧩 Real‑world examples

### 1. Virtualized timeline with auto‑snap

```tsx
const parentRef = useRef<HTMLDivElement>(null);
useScrollSync(parentRef);
useScrollEndSubscribe(parentRef, offset => {
  const column = Math.round(offset / COLUMN_WIDTH);
  setDate(columns[column].date);            // Redux, Zustand, etc.
  dispatchSnapSemaphore();                  // trigger smooth snap
});
```

### 2. Parallax background follower

```tsx
const contentRef   = useRef<HTMLDivElement>(null); // lead
const bgRef        = useRef<HTMLDivElement>(null); // follow

useScrollSync(contentRef);
useScrollSyncSubscribe(bgRef, 0.25); // 4× slower parallax
```

---

## 🛠 Build & test

```bash
# compile ESM + CJS + d.ts
npm run build

# unit tests + coverage
npm run test         # one‑shot
npm run test:watch   # watch mode
npm run coverage     # => coverage/lcov.info
```

CI (GitHub Actions) runs the same commands and uploads coverage to Codecov—badges update automatically.

---

## 🙌 Contributing

Issues and PRs are welcome!  If you spot a race‑condition edge case, open an issue with a repro or failing test and we’ll squash it together.

1. `git clone https://github.com/gilicaspi/scroll-sync`
2. `pnpm install` (or npm / yarn)
3. Create a branch, add tests (`npm run test`), open PR.

We enforce **prettier + eslint** and green tests in CI.

---

## 📜 License

[MIT](LICENSE) © gilicaspi + contributors
