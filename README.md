# Minimal Scroll Sync

[![CI](https://github.com/gilicaspi/minimal-scroll-sync/actions/workflows/ci.yml/badge.svg)](https://github.com/gilicaspi/minimal-scroll-sync/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/minimal-scroll-sync.svg)](https://www.npmjs.com/package/minimal-scroll-sync) <br>[![bundlephobia](https://img.shields.io/bundlephobia/minzip/minimal-scroll-sync)](https://bundlephobia.com/package/minimal-scroll-sync)

A **lightweight, dependency‑free** emitter + set of React hooks that keep any number of horizontally scrollable elements synchronized with minimal lag. Ideal for virtualized timelines, kanban boards, Gantt charts, parallax backgrounds, or anything that needs *follow‑the‑leader* scrolling.

> **Why another scroll‑sync lib?**  React is great for a lot of things, but sometimes it takes just a few too many milliseconds to pass a message between components.
>
> Usually this tradeoff is worthwhile, but in the case of scrolling, it can lead to a 'rubber band' effect where the scroll position lags behind the mouse.
>
> This library is designed to minimize that lag by using a simple event emitter to synchronize scroll positions between elements.

---

## ✨ Features

| Feature                            | Details                                                                            |
| ---------------------------------- |------------------------------------------------------------------------------------|
| ⚡ **Ultra‑light**                  | Zero runtime deps. Just **~836B** minified + gzipped.                              |
| 🪝 **Hooks first**                 | `useScrollSync`, `useScrollSyncSubscribe`, `useScrollEndSubscribe` for React apps. |
| 🪢 **Pure emitter**                | Non‑React projects can import `scrollSyncEmitter` directly.                        |
| 🧠 **Smart *lead / follow* logic** | Only the actively‑scrolled element publishes; everyone else follows.               |
| 🏎️ **RAF‑based**                  | Updates happen in `requestAnimationFrame`, avoiding recursive scroll events.       |
| 🛑 **Scroll‑end callback**         | Fire one final callback when scroll ends (for React state, analytics, etc.).       |

---

## 🚀 Installation

```bash
npm i minimal-scroll-sync
# or
pnpm add minimal-scroll-sync
```

The package ships **ESM, CJS, and type declarations**—whatever your bundler prefers.

---

## 🏁 Quick start (three‑pane example)

```tsx
import React, { useRef } from "react";
import { useScrollSync } from "minimal-scroll-sync";

export default function ScrollSyncDemo() {
  const leaderRef = useRef<HTMLDivElement>(null);
  const leaderRef2 = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  // Leader both publishes & follows (edge‑case safety)
  useScrollSync(leaderRef);
  // Leader also dispatches scroll end events out to state management
  useScrollEndSubscribe(leaderRef, offset => dispatch(setLeaderScrolledTo(columns[column].date)));

  // Leader 2 both publishes & follows (edge‑case safety)
  useScrollSync(leaderRef2);

  // Follower only follows; never publishes its own scroll
  // Example: If you have a parallax background, this is the one to use
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

## 🧩 More examples

### 1. Virtualized timeline with auto‑snap

```ts
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

export default function ParallaxBackground() {
  const contentRef = useRef<HTMLDivElement>(null); // lead
  const bgRef      = useRef<HTMLDivElement>(null); // follow

  // Lead publishes scroll position
  useScrollSync(contentRef);
  // Follow subscribes to scroll position
  useScrollSyncSubscribe(bgRef, 0.25); // 4× slower parallax

  return (
    <div className="parallax">
      {/* Absolutely positioned in the background behind content */}
      <div ref={bgRef} className="bg" />
      <div ref={contentRef} className="content" />
    </div>
  );
}
```

---

## 🛠 Build & test

```bash
# compile ESM + CJS + d.ts
npm run build

# unit tests
npm run test         # one‑shot
npm run test:watch   # watch mode
```

---

## 🙌 Contributing

Issues and PRs are welcome!  If you spot a race‑condition edge case, open an issue with a repro or failing test.

1. `git clone https://github.com/gilicaspi/minimal-scroll-sync`
2. `pnpm install` (or npm / yarn)
3. Create a branch, add tests (`npm run test`), open PR.

We enforce **prettier + eslint** and green tests in CI.

---

## 💖 Sponsorship

If you find this library helpful and happen to know me personally, I accept sponsorship in the form of coffee, pizza, or other types of pizza.

---

## 📜 License

[MIT](LICENSE) © gilicaspi + contributors
