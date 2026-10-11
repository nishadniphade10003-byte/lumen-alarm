# Lumen

**[Try it live →](https://nishadniphade10003-byte.github.io/lumen-alarm/)**

A calm, contemporary alarm clock for the browser. Dark by default, gradient-driven,
and genuinely functional — alarms really ring, sounds really play, and everything
you set is still there after a reload.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

| Script | Does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check, then production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | oxlint |

## What is actually implemented

- **Alarm engine** — real date arithmetic (no string comparison) for one-shot and
  recurring alarms, midnight and noon boundaries, day-of-week recurrence, snooze,
  dismissal, and a 60-second grace window so a throttled background tab still fires.
  An unanswered alarm gives up after five minutes and is logged as missed.
- **Sound** — the eight built-in tones are synthesised at runtime with the Web Audio
  API, so previews and alarms produce real sound with no audio files to ship. Gradual
  volume ramps the master gain instead of starting at full blast.
- **Persistence** — alarms, history and preferences live in `localStorage`, with an
  in-memory fallback and a visible warning when storage is unavailable.
- **Vibration and notifications** — used when the platform supports them, degraded
  quietly (and labelled in the UI) when it does not.
- **Themes** — dark and light are both first-class, built from the same token set.

## Layout

```
src/
  styles/index.css     Design tokens, gradient system, typography, motion
  types.ts             Domain model
  lib/                 time math, audio engine, storage, haptics, notifications
  data/sounds.ts       Built-in tone catalogue
  state/               reducer, providers, alarm engine, action layer
  components/          icons, ui primitives, layout, alarm and history pieces
  screens/             Home, Alarms, History, Settings, Editor, Ringing
```

Every colour, radius, duration and gradient comes from a token in
`src/styles/index.css`. Component styles live in `@layer components` so Tailwind
utilities can still override them at the call site.

## Trying it quickly

The dashboard has a **Preview the alarm** card (also under Settings → Developer)
that rings the next alarm immediately. A test ring never consumes the scheduled
occurrence, so your real alarm still goes off at its proper time.

## Known limits

A browser tab can only ring while it is open, and background tabs are throttled by
the browser. Keep a device alarm as a backup for anything that matters.
