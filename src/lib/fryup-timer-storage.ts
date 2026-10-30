/**
 * Persistence for the Fryup.UK multi-timer.
 *
 * The timer state is stored on the device only, under a versioned envelope, so
 * that a reload restores what the cook was doing. Restoring is defensive by
 * design: a malformed, stale or unreadable payload falls back to the default
 * timers instead of breaking the tool, and storage that is unavailable (a
 * browser with cookies blocked, or a full quota) never throws.
 */

import {
  MAX_DURATION_SECONDS,
  createTimers,
  remainingSecondsAt,
  type TimerState,
  type TimerStatus
} from './fryup-timer';

/** Storage key for the multi-timer state. */
export const TIMER_STORAGE_KEY = 'fryup_multi_timer_state';

/** Schema version of the stored payload. Bump when the shape changes. */
export const TIMER_STORAGE_VERSION = 1;

/** Stored state older than this is treated as stale and discarded. */
export const MAX_STATE_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** The part of the Web Storage API this module needs. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** One timer as stored on disk. */
export interface PersistedTimer {
  id: string;
  durationSeconds: number;
  status: TimerStatus;
  remainingSeconds: number;
  deadline: number | null;
}

/** The versioned envelope written to storage. */
export interface PersistedTimerState {
  version: number;
  savedAt: number;
  timers: PersistedTimer[];
}

/** Outcome of a restore attempt. */
export interface RestoreResult {
  /** Timers to use, either restored or the defaults. */
  timers: TimerState[];
  /** True when a valid versioned payload was applied. */
  restored: boolean;
  /** Timers that were running and finished while the page was closed. */
  completedWhileAway: TimerState[];
}

const VALID_STATUSES: readonly TimerStatus[] = ['ready', 'running', 'paused', 'finished'];

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isStatus(value: unknown): value is TimerStatus {
  return typeof value === 'string' && (VALID_STATUSES as readonly string[]).includes(value);
}

/**
 * The browser storage, or null when it cannot be used at all.
 *
 * Reading `window.localStorage` throws in some privacy modes, so the access
 * itself is guarded.
 */
export function getStorage(): StorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

/** Read the stored payload, or null when storage is missing or blocked. */
export function readStoredTimerState(storage: StorageLike | null): string | null {
  if (!storage) {
    return null;
  }
  try {
    return storage.getItem(TIMER_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Write the timer state, reporting whether it was stored. */
export function writeStoredTimerState(
  storage: StorageLike | null,
  timers: readonly TimerState[],
  nowMs: number
): boolean {
  if (!storage) {
    return false;
  }
  try {
    storage.setItem(TIMER_STORAGE_KEY, serializeTimerState(timers, nowMs));
    return true;
  } catch {
    return false;
  }
}

/** Remove the stored payload, ignoring storage that cannot be written. */
export function clearStoredTimerState(storage: StorageLike | null): void {
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(TIMER_STORAGE_KEY);
  } catch {
    // Nothing to do: the state simply stays where it is.
  }
}

/** Build the versioned payload for the given timers. */
export function serializeTimerState(timers: readonly TimerState[], nowMs: number): string {
  const payload: PersistedTimerState = {
    version: TIMER_STORAGE_VERSION,
    savedAt: nowMs,
    timers: timers.map((timer) => ({
      id: timer.id,
      durationSeconds: timer.durationSeconds,
      status: timer.status,
      remainingSeconds: timer.remainingSeconds,
      deadline: timer.deadline
    }))
  };
  return JSON.stringify(payload);
}

/**
 * Restore the timers from a stored payload.
 *
 * Anything unexpected falls back to the default timers. A payload that is
 * valid but whose timers are individually broken keeps the healthy timers and
 * repairs only the broken ones.
 */
export function restoreTimerState(raw: string | null, nowMs: number): RestoreResult {
  const defaults = createTimers();

  if (typeof raw !== 'string' || raw.trim() === '') {
    return { timers: defaults, restored: false, completedWhileAway: [] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { timers: defaults, restored: false, completedWhileAway: [] };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { timers: defaults, restored: false, completedWhileAway: [] };
  }

  const envelope = parsed as Partial<PersistedTimerState>;

  // A different schema version is stale: start again rather than guess.
  if (envelope.version !== TIMER_STORAGE_VERSION) {
    return { timers: defaults, restored: false, completedWhileAway: [] };
  }
  if (!isFiniteNumber(envelope.savedAt) || envelope.savedAt < 0) {
    return { timers: defaults, restored: false, completedWhileAway: [] };
  }
  if (nowMs - envelope.savedAt > MAX_STATE_AGE_MS) {
    return { timers: defaults, restored: false, completedWhileAway: [] };
  }
  if (!Array.isArray(envelope.timers)) {
    return { timers: defaults, restored: false, completedWhileAway: [] };
  }

  const completedWhileAway: TimerState[] = [];
  const byId = new Map<string, PersistedTimer>();
  for (const entry of envelope.timers) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const candidate = entry as Partial<PersistedTimer>;
    if (typeof candidate.id !== 'string') {
      continue;
    }
    byId.set(candidate.id, candidate as PersistedTimer);
  }

  const restored = defaults.map((fallback) => {
    const entry = byId.get(fallback.id);
    if (!entry) {
      return fallback;
    }
    return restoreTimer(entry, fallback, nowMs, completedWhileAway);
  });

  return { timers: restored, restored: true, completedWhileAway };
}

/** Rebuild one timer from its stored entry, falling back to the default. */
function restoreTimer(
  entry: PersistedTimer,
  fallback: TimerState,
  nowMs: number,
  completedWhileAway: TimerState[]
): TimerState {
  if (!isStatus(entry.status)) {
    return fallback;
  }

  const durationSeconds = isFiniteNumber(entry.durationSeconds)
    ? Math.min(MAX_DURATION_SECONDS, Math.max(0, Math.round(entry.durationSeconds)))
    : fallback.durationSeconds;

  if (entry.status === 'running') {
    if (!isFiniteNumber(entry.deadline) || entry.deadline <= 0) {
      return fallback;
    }
    const running: TimerState = {
      ...fallback,
      durationSeconds,
      status: 'running',
      deadline: entry.deadline,
      remainingSeconds: remainingSecondsAt(
        { ...fallback, durationSeconds, status: 'running', deadline: entry.deadline },
        nowMs
      )
    };
    const remaining = remainingSecondsAt(running, nowMs);
    if (remaining <= 0) {
      const finished: TimerState = { ...running, status: 'finished', remainingSeconds: 0, deadline: null };
      completedWhileAway.push(finished);
      return finished;
    }
    return running;
  }

  if (entry.status === 'paused') {
    const remainingSeconds = isFiniteNumber(entry.remainingSeconds)
      ? Math.min(durationSeconds, Math.max(0, Math.round(entry.remainingSeconds)))
      : durationSeconds;
    return { ...fallback, durationSeconds, status: 'paused', remainingSeconds, deadline: null };
  }

  if (entry.status === 'finished') {
    return { ...fallback, durationSeconds, status: 'finished', remainingSeconds: 0, deadline: null };
  }

  return { ...fallback, durationSeconds, status: 'ready', remainingSeconds: durationSeconds, deadline: null };
}
