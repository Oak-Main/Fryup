import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MAX_DURATION_SECONDS,
  announcementFor,
  completeDueTimers,
  createTimers,
  formatClock,
  minutesAccessibleName,
  pauseTimer,
  primaryActionAccessibleName,
  primaryActionLabel,
  remainingSecondsAt,
  resetAccessibleName,
  resetTimer,
  secondsAccessibleName,
  setDurationAccessibleName,
  setTimerDuration,
  startTimer,
  statusLabel,
  timerAccessibleName,
  type TimerEvent,
  type TimerState
} from '../../lib/fryup-timer';
import {
  getStorage,
  readStoredTimerState,
  restoreTimerState,
  writeStoredTimerState
} from '../../lib/fryup-timer-storage';

interface Announcement {
  id: number;
  text: string;
}

const MAX_VISIBLE_ANNOUNCEMENTS = 4;

export default function FryUpTimer() {
  // The first render has to match the server-rendered HTML, so the state saved
  // on this device is applied in an effect rather than during the initial state.
  const [timers, setTimers] = useState<TimerState[]>(() => createTimers());
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [minutesDraft, setMinutesDraft] = useState<Record<string, string>>({});
  const [secondsDraft, setSecondsDraft] = useState<Record<string, string>>({});

  const timersRef = useRef<TimerState[]>(timers);
  const announcementIdRef = useRef(0);

  const announce = useCallback((events: TimerEvent[]) => {
    if (events.length === 0) {
      return;
    }
    const additions = events.map((event) => ({
      id: announcementIdRef.current++,
      text: announcementFor(event)
    }));
    setAnnouncements((previous) => [...previous, ...additions].slice(-MAX_VISIBLE_ANNOUNCEMENTS));
  }, []);

  const applyTransition = useCallback(
    (timersNext: TimerState[], events: TimerEvent[]) => {
      timersRef.current = timersNext;
      setTimers(timersNext);
      announce(events);
    },
    [announce]
  );

  // Restore the timers saved on this device, then start the clock.
  useEffect(() => {
    const restored = restoreTimerState(readStoredTimerState(getStorage()), Date.now());

    if (restored.restored) {
      timersRef.current = restored.timers;
      setTimers(restored.timers);
      announce(restored.completedWhileAway.map((timer): TimerEvent => ({ type: 'finished', timer })));
    }

    setNowMs(Date.now());
    setHydrated(true);
  }, [announce]);

  // Save the timers whenever they change in a way worth keeping. This never
  // runs on a tick, so the countdown itself does not write to storage.
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!writeStoredTimerState(getStorage(), timers, Date.now())) {
      setStorageBlocked(true);
    }
  }, [timers, hydrated]);

  // Keep the ref in step with the rendered state.
  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  // One clock for every timer. The remaining time is derived from each
  // deadline, so a throttled or sleeping tab cannot make a timer lose time.
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setNowMs(now);

      const due = timersRef.current.filter(
        (timer) => timer.status === 'running' && timer.deadline !== null && timer.deadline <= now
      );
      if (due.length > 0) {
        const transition = completeDueTimers(timersRef.current, now);
        timersRef.current = transition.timers;
        setTimers(transition.timers);
        announce(transition.events);
      }
    };

    const interval = window.setInterval(tick, 1000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [announce]);

  const handlePrimaryAction = (id: string) => {
    const current = timersRef.current;
    const timer = current.find((item) => item.id === id);
    if (!timer) {
      return;
    }

    const now = Date.now();
    const transition =
      timer.status === 'running' ? pauseTimer(current, id, now) : startTimer(current, id, now);
    applyTransition(transition.timers, transition.events);
  };

  const handleReset = (id: string) => {
    const transition = resetTimer(timersRef.current, id);
    applyTransition(transition.timers, transition.events);
  };

  const handleSetDuration = (id: string) => {
    const timer = timersRef.current.find((item) => item.id === id);
    if (!timer) {
      return;
    }

    const minutesValue = minutesDraft[id] ?? String(Math.floor(timer.durationSeconds / 60));
    const secondsValue = secondsDraft[id] ?? String(timer.durationSeconds % 60);
    const minutes = Number.parseInt(minutesValue, 10);
    const seconds = Number.parseInt(secondsValue, 10);
    const total =
      (Number.isFinite(minutes) ? minutes : 0) * 60 + (Number.isFinite(seconds) ? seconds : 0);

    const transition = setTimerDuration(timersRef.current, id, total);
    applyTransition(transition.timers, transition.events);

    setMinutesDraft((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
    setSecondsDraft((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
  };

  return (
    <div className="bg-white text-stone-900 p-6 sm:p-8 rounded-xl border border-stone-200 my-8 shadow-xl">
      {/* Announcements for meaningful state changes only: never a tick. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions text"
        className="sr-only"
      >
        {announcements.map((announcement) => (
          <p key={announcement.id}>{announcement.text}</p>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {timers.map((timer) => {
          const remaining = nowMs === null ? timer.remainingSeconds : remainingSecondsAt(timer, nowMs);
          const clock = formatClock(remaining);
          const minutesValue =
            minutesDraft[timer.id] ?? String(Math.floor(timer.durationSeconds / 60));
          const secondsValue = secondsDraft[timer.id] ?? String(timer.durationSeconds % 60);

          return (
            <section
              key={timer.id}
              aria-labelledby={`${timer.id}-name`}
              className="bg-stone-50 p-4 rounded-lg border border-stone-200 flex flex-col justify-between space-y-4"
            >
              <div>
                <h2 id={`${timer.id}-name`} className="text-xs text-stone-600 font-semibold uppercase">
                  {timer.name}
                </h2>
                <div
                  role="timer"
                  aria-live="off"
                  aria-label={timerAccessibleName(timer, remaining)}
                  className="text-4xl font-mono font-bold text-amber-600 mt-2 tabular-nums"
                >
                  {clock}
                </div>
                <p className="text-xs text-stone-600 mt-1">Status: {statusLabel(timer)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrimaryAction(timer.id)}
                  aria-label={primaryActionAccessibleName(timer)}
                  className={`flex-1 py-2 rounded text-xs font-bold transition min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                    timer.status === 'running'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                  }`}
                >
                  {primaryActionLabel(timer)}
                </button>
                <button
                  type="button"
                  onClick={() => handleReset(timer.id)}
                  aria-label={resetAccessibleName(timer)}
                  className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded text-xs font-semibold min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                >
                  Reset
                </button>
              </div>

              <div
                role="group"
                aria-label={`Duration for the ${timer.name} timer`}
                className="border-t border-stone-200 pt-3 flex flex-wrap items-end gap-2"
              >
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`${timer.id}-minutes`}
                    className="text-[11px] uppercase tracking-wide text-stone-600 font-semibold"
                  >
                    Minutes
                  </label>
                  <input
                    id={`${timer.id}-minutes`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={Math.floor(MAX_DURATION_SECONDS / 60)}
                    step={1}
                    value={minutesValue}
                    aria-label={minutesAccessibleName(timer)}
                    onChange={(event) =>
                      setMinutesDraft((previous) => ({ ...previous, [timer.id]: event.target.value }))
                    }
                    className="w-20 px-2 py-1 rounded border border-stone-300 bg-white text-stone-900 text-sm min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor={`${timer.id}-seconds`}
                    className="text-[11px] uppercase tracking-wide text-stone-600 font-semibold"
                  >
                    Seconds
                  </label>
                  <input
                    id={`${timer.id}-seconds`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={59}
                    step={1}
                    value={secondsValue}
                    aria-label={secondsAccessibleName(timer)}
                    onChange={(event) =>
                      setSecondsDraft((previous) => ({ ...previous, [timer.id]: event.target.value }))
                    }
                    className="w-20 px-2 py-1 rounded border border-stone-300 bg-white text-stone-900 text-sm min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSetDuration(timer.id)}
                  aria-label={setDurationAccessibleName(timer)}
                  className="px-3 py-2 rounded bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                >
                  Set duration
                </button>
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-xs text-stone-600 mt-6">
        Timers keep running while this tab is in the background, and they are restored if you
        reload the page or close the tab. The state is stored on this device only.
        {storageBlocked
          ? ' This browser is blocking local storage, so the timers will reset if you reload.'
          : ''}
      </p>

      <p className="text-xs text-stone-600 mt-2">
        A timer measures cooking time only. Cooking times vary with your pan and your hob, so
        check each item is cooked through before serving.
      </p>
    </div>
  );
}
