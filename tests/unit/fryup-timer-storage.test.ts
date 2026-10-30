import { describe, it, expect } from 'vitest';
import {
  MAX_STATE_AGE_MS,
  TIMER_STORAGE_KEY,
  TIMER_STORAGE_VERSION,
  clearStoredTimerState,
  readStoredTimerState,
  restoreTimerState,
  writeStoredTimerState,
  type StorageLike
} from '../../src/lib/fryup-timer-storage';
import { createTimers, findTimer, startTimer } from '../../src/lib/fryup-timer';

const T0 = 1_700_000_000_000;

/** An in-memory stand-in for localStorage. */
function memoryStorage(seed: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...seed };
  return {
    data,
    getItem: (key: string) => (key in data ? data[key] : null),
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
    removeItem: (key: string) => {
      delete data[key];
    }
  };
}

/** Storage that refuses to cooperate, as a browser with blocked cookies does. */
function blockedStorage(): StorageLike {
  return {
    getItem: () => {
      throw new Error('SecurityError: storage is blocked');
    },
    setItem: () => {
      throw new Error('SecurityError: storage is blocked');
    },
    removeItem: () => {
      throw new Error('SecurityError: storage is blocked');
    }
  };
}

/** Storage that is present but has no room left. */
function fullStorage(): StorageLike {
  return {
    getItem: () => null,
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
    removeItem: () => {}
  };
}

describe('Timer state persistence', () => {
  it('writes a versioned payload under the expected key', () => {
    const storage = memoryStorage();
    const timers = createTimers();

    expect(writeStoredTimerState(storage, timers, T0)).toBe(true);
    expect(storage.data[TIMER_STORAGE_KEY]).toBeDefined();

    const payload = JSON.parse(storage.data[TIMER_STORAGE_KEY]);
    expect(payload.version).toBe(TIMER_STORAGE_VERSION);
    expect(payload.savedAt).toBe(T0);
    expect(payload.timers).toHaveLength(5);
  });

  it('restores what was saved', () => {
    const storage = memoryStorage();
    const started = startTimer(createTimers(), 'sausages', T0).timers;

    writeStoredTimerState(storage, started, T0);
    const restored = restoreTimerState(readStoredTimerState(storage), T0 + 1_000);

    expect(restored.restored).toBe(true);
    expect(restored.completedWhileAway).toHaveLength(0);
    expect(findTimer(restored.timers, 'sausages')!.status).toBe('running');
    expect(findTimer(restored.timers, 'sausages')!.deadline).toBe(T0 + 18 * 60 * 1000);
  });

  it('restores an edited duration', () => {
    const storage = memoryStorage();
    const edited = createTimers().map((timer) =>
      timer.id === 'eggs' ? { ...timer, durationSeconds: 90, remainingSeconds: 90 } : timer
    );

    writeStoredTimerState(storage, edited, T0);
    const restored = restoreTimerState(readStoredTimerState(storage), T0);

    expect(findTimer(restored.timers, 'eggs')!.durationSeconds).toBe(90);
    expect(findTimer(restored.timers, 'eggs')!.remainingSeconds).toBe(90);
  });

  it('restores a running timer against the wall clock, not the saved number', () => {
    const storage = memoryStorage();
    const started = startTimer(createTimers(), 'hashbrowns', T0).timers;

    writeStoredTimerState(storage, started, T0);

    // The tab was closed for four minutes.
    const restored = restoreTimerState(readStoredTimerState(storage), T0 + 4 * 60_000);
    expect(findTimer(restored.timers, 'hashbrowns')!.status).toBe('running');
    expect(findTimer(restored.timers, 'hashbrowns')!.remainingSeconds).toBe(12 * 60 - 4 * 60);
  });

  it('reports a timer that finished while the page was closed', () => {
    const storage = memoryStorage();
    const started = startTimer(createTimers(), 'eggs', T0).timers;

    writeStoredTimerState(storage, started, T0);
    const restored = restoreTimerState(readStoredTimerState(storage), T0 + 10 * 60_000);

    expect(restored.completedWhileAway).toHaveLength(1);
    expect(restored.completedWhileAway[0].id).toBe('eggs');
    expect(findTimer(restored.timers, 'eggs')!.status).toBe('finished');
    expect(findTimer(restored.timers, 'eggs')!.remainingSeconds).toBe(0);
  });

  it('keeps a paused timer paused, with the time that was left', () => {
    const storage = memoryStorage();
    const paused = createTimers().map((timer) =>
      timer.id === 'bacon'
        ? { ...timer, status: 'paused' as const, remainingSeconds: 120, deadline: null }
        : timer
    );

    writeStoredTimerState(storage, paused, T0);
    const restored = restoreTimerState(readStoredTimerState(storage), T0 + 60 * 60_000);

    expect(findTimer(restored.timers, 'bacon')!.status).toBe('paused');
    expect(findTimer(restored.timers, 'bacon')!.remainingSeconds).toBe(120);
  });
});

describe('Unusable stored state', () => {
  it('falls back to the defaults when there is nothing stored', () => {
    const restored = restoreTimerState(null, T0);
    expect(restored.restored).toBe(false);
    expect(restored.timers).toHaveLength(5);
    expect(findTimer(restored.timers, 'eggs')!.status).toBe('ready');
  });

  it('falls back to the defaults for malformed JSON', () => {
    const restored = restoreTimerState('{ this is not json', T0);
    expect(restored.restored).toBe(false);
    expect(findTimer(restored.timers, 'eggs')!.remainingSeconds).toBe(3 * 60);
  });

  it('falls back to the defaults for a payload of the wrong shape', () => {
    for (const raw of ['"a string"', '42', 'null', '[]', '{"version":1}']) {
      const restored = restoreTimerState(raw, T0);
      expect(restored.restored).toBe(false);
      expect(restored.timers).toHaveLength(5);
    }
  });

  it('treats a different schema version as stale', () => {
    const storage = memoryStorage();
    const started = startTimer(createTimers(), 'sausages', T0).timers;
    writeStoredTimerState(storage, started, T0);

    const payload = JSON.parse(storage.data[TIMER_STORAGE_KEY]);
    payload.version = TIMER_STORAGE_VERSION + 1;
    storage.data[TIMER_STORAGE_KEY] = JSON.stringify(payload);

    const restored = restoreTimerState(readStoredTimerState(storage), T0 + 1_000);
    expect(restored.restored).toBe(false);
    expect(findTimer(restored.timers, 'sausages')!.status).toBe('ready');
  });

  it('treats an expired payload as stale', () => {
    const storage = memoryStorage();
    const started = startTimer(createTimers(), 'sausages', T0).timers;
    writeStoredTimerState(storage, started, T0);

    const restored = restoreTimerState(
      readStoredTimerState(storage),
      T0 + MAX_STATE_AGE_MS + 60_000
    );
    expect(restored.restored).toBe(false);
    expect(findTimer(restored.timers, 'sausages')!.status).toBe('ready');
  });

  it('repairs a single broken timer without losing the healthy ones', () => {
    const storage = memoryStorage();
    const started = startTimer(createTimers(), 'sausages', T0).timers;
    writeStoredTimerState(storage, started, T0);

    const payload = JSON.parse(storage.data[TIMER_STORAGE_KEY]);
    payload.timers = payload.timers.map((timer: Record<string, unknown>) =>
      timer.id === 'eggs'
        ? { ...timer, status: 'nonsense', durationSeconds: 'lots', remainingSeconds: null }
        : timer
    );
    storage.data[TIMER_STORAGE_KEY] = JSON.stringify(payload);

    const restored = restoreTimerState(readStoredTimerState(storage), T0 + 1_000);

    expect(restored.restored).toBe(true);
    expect(findTimer(restored.timers, 'sausages')!.status).toBe('running');
    expect(findTimer(restored.timers, 'eggs')!.status).toBe('ready');
    expect(findTimer(restored.timers, 'eggs')!.durationSeconds).toBe(3 * 60);
  });

  it('ignores a stored timer that is not one of the five', () => {
    const storage = memoryStorage();
    const started = startTimer(createTimers(), 'sausages', T0).timers;
    writeStoredTimerState(storage, started, T0);

    const payload = JSON.parse(storage.data[TIMER_STORAGE_KEY]);
    payload.timers.push({
      id: 'ghost',
      durationSeconds: 60,
      status: 'running',
      remainingSeconds: 60,
      deadline: T0 + 60_000
    });
    storage.data[TIMER_STORAGE_KEY] = JSON.stringify(payload);

    const restored = restoreTimerState(readStoredTimerState(storage), T0 + 1_000);
    expect(restored.timers).toHaveLength(5);
    expect(restored.timers.find((timer) => timer.id === 'ghost')).toBeUndefined();
  });
});

describe('Unavailable storage', () => {
  it('reads nothing and does not throw when storage is blocked', () => {
    const storage = blockedStorage();
    expect(readStoredTimerState(storage)).toBeNull();
    expect(() => clearStoredTimerState(storage)).not.toThrow();
  });

  it('reports a failed write without throwing', () => {
    expect(writeStoredTimerState(blockedStorage(), createTimers(), T0)).toBe(false);
    expect(writeStoredTimerState(fullStorage(), createTimers(), T0)).toBe(false);
  });

  it('reports a failed write when there is no storage at all', () => {
    expect(writeStoredTimerState(null, createTimers(), T0)).toBe(false);
    expect(readStoredTimerState(null)).toBeNull();
  });

  it('still restores the defaults when storage is unavailable', () => {
    const restored = restoreTimerState(readStoredTimerState(blockedStorage()), T0);
    expect(restored.restored).toBe(false);
    expect(restored.timers).toHaveLength(5);
    expect(findTimer(restored.timers, 'eggs')!.remainingSeconds).toBe(3 * 60);
  });

  it('survives a reload cycle with blocked storage', () => {
    const storage = blockedStorage();
    const started = startTimer(createTimers(), 'sausages', T0).timers;

    writeStoredTimerState(storage, started, T0);
    const restored = restoreTimerState(readStoredTimerState(storage), T0 + 1_000);

    expect(restored.restored).toBe(false);
    expect(findTimer(restored.timers, 'sausages')!.status).toBe('ready');
  });
});
