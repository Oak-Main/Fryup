/**
 * Fryup.UK multi-timer logic.
 *
 * Timers run against an absolute deadline (epoch milliseconds) rather than by
 * counting interval ticks. A backgrounded tab, a throttled timer or a device
 * that goes to sleep can therefore never make a timer lose time: the remaining
 * time is always derived from the deadline and the current wall clock.
 *
 * Every function in this module is pure and takes the current time as an
 * argument, so the whole module can be tested against a controlled clock.
 */

/** Lifecycle of a single timer. */
export type TimerStatus = 'ready' | 'running' | 'paused' | 'finished';

/** The five fry-up timers, in the order they are presented. */
export interface TimerDefinition {
  id: string;
  name: string;
  durationSeconds: number;
}

/** Runtime state of a single timer. */
export interface TimerState {
  id: string;
  name: string;
  /** Full duration of the timer, in seconds. Editable by the user. */
  durationSeconds: number;
  status: TimerStatus;
  /** Authoritative remaining time while paused or ready. */
  remainingSeconds: number;
  /** Epoch milliseconds at which the timer reaches zero, while running. */
  deadline: number | null;
}

/** Longest timer the user can set: six hours is generous for a fry-up. */
export const MAX_DURATION_SECONDS = 6 * 60 * 60;

/** The timers offered by the tool. */
export const TIMER_DEFINITIONS: readonly TimerDefinition[] = [
  { id: 'sausages', name: 'Sausages (Pan Sear)', durationSeconds: 18 * 60 },
  { id: 'hashbrowns', name: 'Hash Browns', durationSeconds: 12 * 60 },
  { id: 'blackpudding', name: 'Black Pudding Slices', durationSeconds: 6 * 60 },
  { id: 'bacon', name: 'Back Bacon Rashers', durationSeconds: 5 * 60 },
  { id: 'eggs', name: 'Fried Eggs (Runny Yolk)', durationSeconds: 3 * 60 }
];

/** A state change worth telling a screen reader about. */
export type TimerEvent =
  | { type: 'started'; timer: TimerState }
  | { type: 'resumed'; timer: TimerState }
  | { type: 'paused'; timer: TimerState }
  | { type: 'reset'; timer: TimerState }
  | { type: 'edited'; timer: TimerState }
  | { type: 'finished'; timer: TimerState };

/** The result of any timer transition. */
export interface Transition {
  timers: TimerState[];
  events: TimerEvent[];
}

/** Build the initial (not yet started) timer list. */
export function createTimers(definitions: readonly TimerDefinition[] = TIMER_DEFINITIONS): TimerState[] {
  return definitions.map((definition) => ({
    id: definition.id,
    name: definition.name,
    durationSeconds: definition.durationSeconds,
    status: 'ready' as TimerStatus,
    remainingSeconds: definition.durationSeconds,
    deadline: null
  }));
}

/** Find one timer by id. */
export function findTimer(timers: readonly TimerState[], id: string): TimerState | undefined {
  return timers.find((timer) => timer.id === id);
}

function replaceTimer(timers: readonly TimerState[], next: TimerState): TimerState[] {
  return timers.map((timer) => (timer.id === next.id ? next : timer));
}

/**
 * Remaining seconds for a timer at a given instant.
 *
 * While running this is derived from the deadline, so it is correct however
 * long it has been since the last interval tick fired.
 */
export function remainingSecondsAt(timer: TimerState, nowMs: number): number {
  if (timer.status === 'running' && timer.deadline !== null) {
    return Math.max(0, Math.ceil((timer.deadline - nowMs) / 1000));
  }
  return Math.max(0, timer.remainingSeconds);
}

/**
 * Start, resume or restart a timer.
 *
 * Starting a timer that is already running is a no-op, so a repeated click
 * cannot produce a second announcement or a second deadline.
 */
export function startTimer(timers: readonly TimerState[], id: string, nowMs: number): Transition {
  const timer = findTimer(timers, id);
  if (!timer || timer.status === 'running') {
    return { timers: [...timers], events: [] };
  }

  const baseSeconds = timer.status === 'finished' ? timer.durationSeconds : timer.remainingSeconds;
  const running: TimerState = {
    ...timer,
    status: 'running',
    remainingSeconds: baseSeconds,
    deadline: nowMs + baseSeconds * 1000
  };

  // Zero-duration boundary: the timer is over the moment it starts.
  if (baseSeconds <= 0) {
    const finished: TimerState = { ...running, status: 'finished', remainingSeconds: 0, deadline: null };
    return { timers: replaceTimer(timers, finished), events: [{ type: 'finished', timer: finished }] };
  }

  const type = timer.status === 'paused' ? 'resumed' : 'started';
  return { timers: replaceTimer(timers, running), events: [{ type, timer: running }] };
}

/**
 * Pause a running timer, freezing the time that is left.
 *
 * Pausing a timer that is not running is a no-op.
 */
export function pauseTimer(timers: readonly TimerState[], id: string, nowMs: number): Transition {
  const timer = findTimer(timers, id);
  if (!timer || timer.status !== 'running') {
    return { timers: [...timers], events: [] };
  }

  const paused: TimerState = {
    ...timer,
    status: 'paused',
    remainingSeconds: remainingSecondsAt(timer, nowMs),
    deadline: null
  };
  return { timers: replaceTimer(timers, paused), events: [{ type: 'paused', timer: paused }] };
}

/**
 * Return a timer to its full duration and stop it.
 *
 * Resetting a timer that is already ready is a no-op.
 */
export function resetTimer(timers: readonly TimerState[], id: string): Transition {
  const timer = findTimer(timers, id);
  if (!timer) {
    return { timers: [...timers], events: [] };
  }
  if (timer.status === 'ready' && timer.remainingSeconds === timer.durationSeconds) {
    return { timers: [...timers], events: [] };
  }

  const reset: TimerState = {
    ...timer,
    status: 'ready',
    remainingSeconds: timer.durationSeconds,
    deadline: null
  };
  return { timers: replaceTimer(timers, reset), events: [{ type: 'reset', timer: reset }] };
}

/**
 * Set a new duration for a timer.
 *
 * Editing stops the timer and returns it to the new duration, ready to start
 * again. A duration of zero is allowed: the timer then finishes as soon as it
 * is started.
 */
export function setTimerDuration(timers: readonly TimerState[], id: string, seconds: number): Transition {
  const timer = findTimer(timers, id);
  if (!timer) {
    return { timers: [...timers], events: [] };
  }

  const duration = Math.min(MAX_DURATION_SECONDS, Math.max(0, Math.round(seconds)));
  if (
    timer.status === 'ready' &&
    timer.remainingSeconds === duration &&
    timer.durationSeconds === duration
  ) {
    return { timers: [...timers], events: [] };
  }

  const edited: TimerState = {
    ...timer,
    durationSeconds: duration,
    remainingSeconds: duration,
    status: 'ready',
    deadline: null
  };
  return { timers: replaceTimer(timers, edited), events: [{ type: 'edited', timer: edited }] };
}

/**
 * Complete every timer whose deadline has passed.
 *
 * This is what makes completion independent of the interval: a timer that ran
 * out while the tab was throttled is still marked finished the first time the
 * clock is read, and several timers that finished together are all reported.
 */
export function completeDueTimers(timers: readonly TimerState[], nowMs: number): Transition {
  const events: TimerEvent[] = [];
  const next = timers.map((timer) => {
    if (timer.status === 'running' && timer.deadline !== null && timer.deadline <= nowMs) {
      const finished: TimerState = { ...timer, status: 'finished', remainingSeconds: 0, deadline: null };
      events.push({ type: 'finished', timer: finished });
      return finished;
    }
    return timer;
  });

  if (events.length === 0) {
    return { timers: [...timers], events: [] };
  }
  return { timers: next, events };
}

/** Format seconds as a clock value, for example `18:00`. */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Format seconds in words, for example `17 minutes and 30 seconds`. */
export function formatSpoken(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  if (seconds === 0) {
    return 'no time';
  }

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  const parts: string[] = [];
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  }
  if (rest > 0) {
    parts.push(`${rest} second${rest === 1 ? '' : 's'}`);
  }
  return parts.join(' and ');
}

/**
 * Format a duration in words, for example `18 minutes` or `12 minutes and 30 seconds`.
 *
 * A duration of zero is spoken as `0 minutes`, which reads better than `no time`
 * when the cook is being told what they just set.
 */
export function formatDurationSpoken(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  if (seconds === 0) {
    return '0 minutes';
  }
  return formatSpoken(seconds);
}

/**
 * The sentence a screen reader hears for a state change.
 *
 * These messages report what the timer did. They never claim that food is
 * safe to eat or fully cooked: a timer only measures time.
 */
export function announcementFor(event: TimerEvent): string {
  const name = event.timer.name;

  switch (event.type) {
    case 'started':
      return `${name} timer started. ${formatSpoken(event.timer.remainingSeconds)} remaining.`;
    case 'resumed':
      return `${name} timer resumed. ${formatSpoken(event.timer.remainingSeconds)} remaining.`;
    case 'paused':
      return `${name} timer paused. ${formatSpoken(event.timer.remainingSeconds)} remaining.`;
    case 'reset':
      return `${name} timer reset. ${formatSpoken(event.timer.durationSeconds)} remaining.`;
    case 'edited':
      return `${name} duration set to ${formatDurationSpoken(event.timer.durationSeconds)}.`;
    case 'finished':
      return (
        `${name} timer finished. The time on this timer is up. ` +
        'Check each item is cooked through before serving.'
      );
  }
}

/** The visible label of the primary action button. */
export function primaryActionLabel(timer: TimerState): string {
  switch (timer.status) {
    case 'running':
      return 'Pause';
    case 'paused':
      return 'Resume';
    case 'finished':
      return 'Start again';
    default:
      return 'Start';
  }
}

/**
 * The accessible name of the primary action button.
 *
 * Every button names the timer it belongs to, so five timers running at once
 * never produce five controls called "Start".
 */
export function primaryActionAccessibleName(timer: TimerState): string {
  switch (timer.status) {
    case 'running':
      return `Pause ${timer.name} timer`;
    case 'paused':
      return `Resume ${timer.name} timer`;
    case 'finished':
      return `Start again for ${timer.name} timer`;
    default:
      return `Start ${timer.name} timer`;
  }
}

/** The visible status of a timer. */
export function statusLabel(timer: TimerState): string {
  switch (timer.status) {
    case 'running':
      return 'Running';
    case 'paused':
      return 'Paused';
    case 'finished':
      return 'Finished';
    default:
      return 'Ready';
  }
}

/** Accessible name of the reset button. */
export function resetAccessibleName(timer: TimerState): string {
  return `Reset ${timer.name} timer`;
}

/** Accessible name of the button that applies an edited duration. */
export function setDurationAccessibleName(timer: TimerState): string {
  return `Set duration for ${timer.name} timer`;
}

/** Accessible name of the minutes input. */
export function minutesAccessibleName(timer: TimerState): string {
  return `Minutes duration for ${timer.name} timer`;
}

/** Accessible name of the seconds input. */
export function secondsAccessibleName(timer: TimerState): string {
  return `Seconds duration for ${timer.name} timer`;
}

/**
 * Accessible name of the countdown readout.
 *
 * It repeats the visible clock value so the visible label and the accessible
 * identity stay aligned, and adds the timer name and status for context.
 */
export function timerAccessibleName(timer: TimerState, remainingSeconds: number): string {
  return `${timer.name} timer: ${formatClock(remainingSeconds)} remaining, ${statusLabel(timer)}`;
}
