# Agent 07 — Phase Handoff

## Mission
Task 28: make the existing Fryup.UK multi-timer accessible and reliable without replacing it.

Worked on the existing `src/components/tools/FryUpTimer.tsx` implementation (reviewed at
`afd760d42f18b30d758522124241fdb47c011d93`). No new timer tool was built.

## Inputs Reviewed
- `src/components/tools/FryUpTimer.tsx` at `afd760d4` — five in-memory timers, generic
  "Start"/"Reset" labels, `setInterval` decrement, no announcements, no persistence.
- `src/pages/fry-up-timer.astro`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`.
- `docs/file-ownership-matrix.md` (AGENT 07 owns `src/components/*`, `src/pages/*`, `src/lib/*`).
- `docs/editorial/food-safety-standard.md` — house wording for food safety.
- Browser baseline on the unreviewed page: duplicate accessible names, no live region, and a
  44-second countdown error under a throttled interval.

## Research / Work Completed
1. **Deadline-based clock.** Timers now run against an absolute deadline (`deadline`, epoch ms).
   Remaining time is derived from the deadline and the current time, so a throttled background
   tab or a sleeping device cannot make a timer lose time. `visibilitychange` re-reads the clock
   when the tab wakes.
2. **Unambiguous accessible names.** Every control names its timer: "Start Sausages (Pan Sear)
   timer", "Reset Hash Browns timer", "Set duration for Back Bacon Rashers timer",
   "Minutes duration for ... timer". The visible label is always contained in the accessible
   name. The countdown readout is `role="timer"` with `aria-live="off"`, and its accessible name
   repeats the visible clock value plus the timer name and status.
3. **Screen-reader announcements.** One polite `role="status"` region announces starts, pauses,
   resumes, resets, duration edits and completions. Ticks are never announced, and two timers
   finishing together produce two separately named announcements.
4. **Editable durations.** Each timer has Minutes and Seconds inputs and a "Set duration" button.
   Editing returns the timer to ready with the new duration; a duration of zero is allowed and
   finishes the moment it is started.
5. **Persistence across reload.** Timer state is stored under `fryup_multi_timer_state` as a
   versioned payload (`version`, `savedAt`, per-timer deadline). Restoring is defensive:
   malformed JSON, a wrong shape, an unknown schema version, an expired payload, or blocked
   storage all fall back to the default timers instead of breaking the tool. A running timer is
   restored against its deadline, so time that passed while the page was closed is not lost.
6. **Contract made explicit.** The page states that timers keep running in the background and
   are restored on reload, and says so on the page when the browser blocks local storage. The
   completion message never claims that food is safe or fully cooked; it tells the cook to check
   each item is cooked through before serving.
7. **Collateral robustness fixes.** `CookieBanner.tsx` and `FavouriteButton.tsx` guarded their
   `localStorage` access (a blocked-storage browser crashed the banner island). Timer button
   contrast was corrected to dark-on-amber, and the footer copyright line to the same shade the
   rest of the footer uses.

## Decisions Made
- The page heading moved from the React island into `fry-up-timer.astro` so the built HTML keeps
  exactly one `h1` and the island stays server-render safe; timer names are `h2`.
- Persistence was implemented rather than an intentional reset-on-reload, because the task is
  "live announcements and persistence" and the reload requirement is that a timer survives a
  reload. The behaviour is stated on the page and covered by tests.
- Timer logic lives in `src/lib/fryup-timer.ts` and `src/lib/fryup-timer-storage.ts` as pure,
  clock-injected functions, so the timing rules are testable without a DOM.
- No new runtime dependency was added; the repository has no DOM test environment.

## Files Created or Modified
- Created `src/lib/fryup-timer.ts` — timer state, transitions, announcements, accessible names.
- Created `src/lib/fryup-timer-storage.ts` — versioned persistence, validation, safe storage.
- Created `tests/unit/fryup-timer.test.ts` — 33 focused regressions.
- Created `tests/unit/fryup-timer-storage.test.ts` — 18 focused regressions.
- Modified `src/components/tools/FryUpTimer.tsx` — the timer island.
- Modified `src/pages/fry-up-timer.astro` — page heading, intro and contract wording.
- Modified `src/components/layout/CookieBanner.tsx` — guarded storage access.
- Modified `src/components/recipe/FavouriteButton.tsx` — guarded storage access.
- Modified `src/components/layout/Footer.astro` — footer copyright contrast.
- Created `docs/handoffs/agent-07-hand-off.md` — this file.

## Tests / Validation Performed
- `npm test` — 5 files, 67 tests passed (16 pre-existing + 51 new).
- `npm run typecheck` (`astro check`) — 0 errors, 0 warnings, 10 pre-existing hints.
- `npm run validate:content` — passed.
- `npm run build` — 127 pages built.
- `npm run verify` — full chain passed at the final head.
- Browser (Chrome, real input): keyboard-only start, pause, resume, reset and duration edit;
  focus retained on the activated control at every step; visible focus ring confirmed.
- Browser: 390 px and 360 px viewports, no horizontal overflow, all 25 controls 44 px tall.
- Browser: throttled interval, drift 0 s at the clock read (44 s before the change).
- Browser: reload restores a running timer against its deadline; blocked storage keeps the tool
  working and shows the explicit note.
- Lighthouse accessibility on `/fry-up-timer/`: 94 → 98. The one remaining failure is the shared
  footer heading order (`h4` after `h2`), which affects every page and is an information
  architecture decision rather than a timer defect.

## Acceptance Status
PASS — Task 28 complete for the multi-timer. Not run: a real screen-reader session. Windows
Narrator is present but its spoken output cannot be captured on this machine (the diagnostic
event channel refuses a non-interactive enable and query), so announcements were verified through
the accessibility tree, the live region's DOM content, and the unit tests of the announcement
strings. That is accessibility-tree inspection, not a screen-reader test.

## Receiver Instructions
- `docs/handoffs/agent-07-hand-off.md` is this handoff; `docs/project-state.json` and
  `docs/decision-log.md` remain with AGENT 00.
- The shared footer heading order (`h4` → `h3`) is the one known accessibility item left on the
  timer page. It is a site-wide information architecture change and needs AGENT 03 / AGENT 04
  sign-off before it is applied across 127 pages.
