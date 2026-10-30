import { describe, it, expect } from 'vitest';
import {
  TIMER_DEFINITIONS,
  announcementFor,
  completeDueTimers,
  createTimers,
  findTimer,
  formatClock,
  formatSpoken,
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
  type TimerState
} from '../../src/lib/fryup-timer';

/**
 * A controlled clock. The timer logic never reads the wall clock itself, so
 * every test drives it with an explicit instant.
 */
function clockAt(startMs: number) {
  let current = startMs;
  return {
    now: () => current,
    advance: (ms: number) => {
      current += ms;
      return current;
    },
    set: (ms: number) => {
      current = ms;
      return current;
    }
  };
}

const T0 = 1_700_000_000_000;

describe('Multi-timer clock behaviour', () => {
  it('measures elapsed time from the deadline, not from interval ticks', () => {
    const clock = clockAt(T0);
    const timers = createTimers();

    const started = startTimer(timers, 'sausages', clock.now());
    const running = findTimer(started.timers, 'sausages')!;
    expect(running.status).toBe('running');
    expect(running.deadline).toBe(T0 + 18 * 60 * 1000);

    // 90 seconds pass and only one tick fires: the timer must still show 90
    // seconds less, not one second less.
    clock.advance(90_000);
    expect(remainingSecondsAt(running, clock.now())).toBe(18 * 60 - 90);
  });

  it('does not lose time when the tab is throttled for minutes', () => {
    const clock = clockAt(T0);
    const timers = createTimers();
    const started = startTimer(timers, 'hashbrowns', clock.now());
    const running = findTimer(started.timers, 'hashbrowns')!;

    // A throttled background tab might fire once a minute.
    clock.advance(5 * 60_000);
    expect(remainingSecondsAt(running, clock.now())).toBe(12 * 60 - 5 * 60);
    expect(formatClock(remainingSecondsAt(running, clock.now()))).toBe('07:00');
  });

  it('does not lose time when the device sleeps', () => {
    const clock = clockAt(T0);
    const timers = createTimers();
    const started = startTimer(timers, 'bacon', clock.now());
    const running = findTimer(started.timers, 'bacon')!;

    // The laptop lid is closed for two hours.
    clock.advance(2 * 60 * 60 * 1000);
    expect(remainingSecondsAt(running, clock.now())).toBe(0);
  });

  it('completes a timer whose deadline passed, even without a tick', () => {
    const clock = clockAt(T0);
    const timers = createTimers();
    const started = startTimer(timers, 'eggs', clock.now());

    clock.advance(3 * 60_000 + 1);
    const due = completeDueTimers(started.timers, clock.now());

    expect(due.events).toHaveLength(1);
    expect(due.events[0].type).toBe('finished');
    expect(findTimer(due.timers, 'eggs')!.status).toBe('finished');
    expect(findTimer(due.timers, 'eggs')!.remainingSeconds).toBe(0);
  });

  it('reports every timer that finished at the same moment', () => {
    const clock = clockAt(T0);
    const timers = createTimers();
    let running = startTimer(timers, 'eggs', clock.now()).timers;
    // Give the black pudding the same deadline as the eggs.
    running = running.map((timer) =>
      timer.id === 'blackpudding'
        ? { ...timer, status: 'running', remainingSeconds: 180, deadline: T0 + 180_000 }
        : timer
    );

    clock.advance(181_000);
    const due = completeDueTimers(running, clock.now());

    expect(due.events.map((event) => event.timer.id).sort()).toEqual(['blackpudding', 'eggs']);
    expect(due.events.every((event) => event.type === 'finished')).toBe(true);
    expect(due.timers.filter((timer) => timer.status === 'finished')).toHaveLength(2);
  });

  it('leaves timers alone when nothing is due', () => {
    const clock = clockAt(T0);
    const started = startTimer(createTimers(), 'eggs', clock.now());
    clock.advance(10_000);

    const due = completeDueTimers(started.timers, clock.now());
    expect(due.events).toHaveLength(0);
    expect(findTimer(due.timers, 'eggs')!.status).toBe('running');
  });
});

describe('Timer actions', () => {
  it('starts a timer and reports the event', () => {
    const transition = startTimer(createTimers(), 'sausages', T0);
    expect(transition.events).toHaveLength(1);
    expect(transition.events[0].type).toBe('started');
    expect(findTimer(transition.timers, 'sausages')!.status).toBe('running');
  });

  it('ignores a repeated start on a running timer', () => {
    const clock = clockAt(T0);
    const started = startTimer(createTimers(), 'sausages', clock.now());
    const again = startTimer(started.timers, 'sausages', clock.now());

    expect(again.events).toHaveLength(0);
    expect(findTimer(again.timers, 'sausages')!.deadline).toBe(
      findTimer(started.timers, 'sausages')!.deadline
    );
  });

  it('pauses a timer and freezes the time that is left', () => {
    const clock = clockAt(T0);
    const started = startTimer(createTimers(), 'hashbrowns', clock.now());
    clock.advance(90_000);

    const paused = pauseTimer(started.timers, 'hashbrowns', clock.now());
    expect(paused.events[0].type).toBe('paused');

    const timer = findTimer(paused.timers, 'hashbrowns')!;
    expect(timer.status).toBe('paused');
    expect(timer.remainingSeconds).toBe(12 * 60 - 90);
    expect(timer.deadline).toBeNull();

    // Paused time does not tick away.
    clock.advance(60_000);
    expect(remainingSecondsAt(timer, clock.now())).toBe(12 * 60 - 90);
  });

  it('ignores a repeated pause', () => {
    const clock = clockAt(T0);
    const started = startTimer(createTimers(), 'hashbrowns', clock.now());
    const paused = pauseTimer(started.timers, 'hashbrowns', clock.now());
    const again = pauseTimer(paused.timers, 'hashbrowns', clock.now());

    expect(again.events).toHaveLength(0);
  });

  it('resumes a paused timer from the time that is left', () => {
    const clock = clockAt(T0);
    const started = startTimer(createTimers(), 'bacon', clock.now());
    clock.advance(60_000);
    const paused = pauseTimer(started.timers, 'bacon', clock.now());

    const resumed = startTimer(paused.timers, 'bacon', clock.now());
    expect(resumed.events[0].type).toBe('resumed');

    const timer = findTimer(resumed.timers, 'bacon')!;
    expect(timer.deadline).toBe(clock.now() + (5 * 60 - 60) * 1000);
  });

  it('resets a timer back to its full duration', () => {
    const clock = clockAt(T0);
    const started = startTimer(createTimers(), 'blackpudding', clock.now());
    clock.advance(60_000);

    const reset = resetTimer(started.timers, 'blackpudding');
    expect(reset.events[0].type).toBe('reset');

    const timer = findTimer(reset.timers, 'blackpudding')!;
    expect(timer.status).toBe('ready');
    expect(timer.remainingSeconds).toBe(6 * 60);
    expect(timer.deadline).toBeNull();
  });

  it('ignores a repeated reset', () => {
    const reset = resetTimer(createTimers(), 'blackpudding');
    expect(reset.events).toHaveLength(0);
  });

  it('starts a finished timer again', () => {
    const clock = clockAt(T0);
    const started = startTimer(createTimers(), 'eggs', clock.now());
    clock.advance(3 * 60_000 + 1);
    const finished = completeDueTimers(started.timers, clock.now());

    const restarted = startTimer(finished.timers, 'eggs', clock.now());
    expect(restarted.events[0].type).toBe('started');
    expect(findTimer(restarted.timers, 'eggs')!.status).toBe('running');
  });

  it('finishes a zero-duration timer the moment it starts', () => {
    const timers = createTimers();
    const edited = setTimerDuration(timers, 'eggs', 0);
    expect(findTimer(edited.timers, 'eggs')!.remainingSeconds).toBe(0);

    const started = startTimer(edited.timers, 'eggs', T0);
    expect(started.events).toHaveLength(1);
    expect(started.events[0].type).toBe('finished');
    expect(findTimer(started.timers, 'eggs')!.status).toBe('finished');
  });

  it('edits a duration and returns the timer to ready', () => {
    const clock = clockAt(T0);
    const started = startTimer(createTimers(), 'sausages', clock.now());
    clock.advance(30_000);

    const edited = setTimerDuration(started.timers, 'sausages', 12 * 60 + 30);
    expect(edited.events[0].type).toBe('edited');

    const timer = findTimer(edited.timers, 'sausages')!;
    expect(timer.durationSeconds).toBe(12 * 60 + 30);
    expect(timer.remainingSeconds).toBe(12 * 60 + 30);
    expect(timer.status).toBe('ready');
    expect(timer.deadline).toBeNull();
  });

  it('clamps an edited duration to a sane range', () => {
    const edited = setTimerDuration(createTimers(), 'eggs', -30);
    expect(findTimer(edited.timers, 'eggs')!.durationSeconds).toBe(0);

    const huge = setTimerDuration(createTimers(), 'eggs', 999_999);
    expect(findTimer(huge.timers, 'eggs')!.durationSeconds).toBe(6 * 60 * 60);
  });

  it('ignores an edit that changes nothing', () => {
    const edited = setTimerDuration(createTimers(), 'eggs', 3 * 60);
    expect(edited.events).toHaveLength(0);
  });

  it('keeps each timer independent', () => {
    const clock = clockAt(T0);
    const timers = createTimers();

    let next = startTimer(timers, 'sausages', clock.now()).timers;
    next = startTimer(next, 'eggs', clock.now()).timers;
    next = pauseTimer(next, 'eggs', clock.now()).timers;

    expect(findTimer(next, 'sausages')!.status).toBe('running');
    expect(findTimer(next, 'eggs')!.status).toBe('paused');
    expect(findTimer(next, 'hashbrowns')!.status).toBe('ready');
    expect(findTimer(next, 'bacon')!.status).toBe('ready');
    expect(findTimer(next, 'blackpudding')!.status).toBe('ready');
  });
});

describe('Accessible names', () => {
  const timers = createTimers();

  it('gives every timer a unique primary action name', () => {
    const names = timers.map((timer) => primaryActionAccessibleName(timer));
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain('Start Sausages (Pan Sear) timer');
    expect(names).toContain('Start Black Pudding Slices timer');

    const resetNames = timers.map((timer) => resetAccessibleName(timer));
    expect(new Set(resetNames).size).toBe(resetNames.length);
    expect(resetNames).toContain('Reset Black Pudding Slices timer');
  });

  it('keeps the visible label inside the accessible name', () => {
    for (const timer of timers) {
      const visible = primaryActionLabel(timer);
      const accessible = primaryActionAccessibleName(timer);
      expect(accessible.toLowerCase()).toContain(visible.toLowerCase());
      expect(accessible).toContain(timer.name);
    }
  });

  it('names the action for the state the timer is in', () => {
    const running = startTimer(timers, 'sausages', T0).timers;
    expect(primaryActionLabel(findTimer(running, 'sausages')!)).toBe('Pause');
    expect(primaryActionAccessibleName(findTimer(running, 'sausages')!)).toBe(
      'Pause Sausages (Pan Sear) timer'
    );

    const paused = pauseTimer(running, 'sausages', T0).timers;
    expect(primaryActionLabel(findTimer(paused, 'sausages')!)).toBe('Resume');
    expect(primaryActionAccessibleName(findTimer(paused, 'sausages')!)).toBe(
      'Resume Sausages (Pan Sear) timer'
    );

    const finished = completeDueTimers(running, T0 + 19 * 60_000).timers;
    expect(primaryActionLabel(findTimer(finished, 'sausages')!)).toBe('Start again');
    expect(primaryActionAccessibleName(findTimer(finished, 'sausages')!)).toBe(
      'Start again for Sausages (Pan Sear) timer'
    );
  });

  it('names every control of every timer distinctly', () => {
    const names: string[] = [];
    for (const timer of timers) {
      names.push(primaryActionAccessibleName(timer));
      names.push(resetAccessibleName(timer));
      names.push(setDurationAccessibleName(timer));
      names.push(minutesAccessibleName(timer));
      names.push(secondsAccessibleName(timer));
    }

    expect(new Set(names).size).toBe(names.length);
    expect(names).toHaveLength(timers.length * 5);
  });

  it('names the reset, duration and input controls with the timer name', () => {
    const timer = timers[0];
    expect(resetAccessibleName(timer)).toContain('Reset');
    expect(resetAccessibleName(timer)).toContain(timer.name);
    expect(setDurationAccessibleName(timer)).toContain('Set duration');
    expect(setDurationAccessibleName(timer)).toContain(timer.name);
    expect(minutesAccessibleName(timer)).toContain('Minutes');
    expect(secondsAccessibleName(timer)).toContain('Seconds');
  });

  it('keeps the countdown readout aligned with the visible value', () => {
    const timer: TimerState = timers[0];
    const name = timerAccessibleName(timer, 1080);
    expect(name).toContain('18:00');
    expect(name).toContain(timer.name);
    expect(name).toContain(statusLabel(timer));
  });
});

describe('Announcements', () => {
  it('announces meaningful state changes', () => {
    const started = startTimer(createTimers(), 'sausages', T0);
    expect(announcementFor(started.events[0])).toBe(
      'Sausages (Pan Sear) timer started. 18 minutes remaining.'
    );

    const paused = pauseTimer(started.timers, 'sausages', T0 + 30_000);
    expect(announcementFor(paused.events[0])).toBe(
      'Sausages (Pan Sear) timer paused. 17 minutes and 30 seconds remaining.'
    );

    const reset = resetTimer(started.timers, 'sausages');
    expect(announcementFor(reset.events[0])).toBe(
      'Sausages (Pan Sear) timer reset. 18 minutes remaining.'
    );

    const edited = setTimerDuration(createTimers(), 'sausages', 15 * 60);
    expect(announcementFor(edited.events[0])).toBe('Sausages (Pan Sear) duration set to 15 minutes.');
  });

  it('speaks an edited duration of zero as a duration, not as missing time', () => {
    const edited = setTimerDuration(createTimers(), 'eggs', 0);
    expect(announcementFor(edited.events[0])).toBe(
      'Fried Eggs (Runny Yolk) duration set to 0 minutes.'
    );
  });

  it('announces a completion without claiming the food is safe to eat', () => {
    const started = startTimer(createTimers(), 'sausages', T0);
    const finished = completeDueTimers(started.timers, T0 + 18 * 60_000);
    const message = announcementFor(finished.events[0]);

    expect(message).toContain('Sausages (Pan Sear) timer finished.');
    for (const claim of [
      'safe to eat',
      'is safe',
      'safe to serve',
      'fully cooked',
      'ready to eat',
      'ready to serve',
      'guaranteed'
    ]) {
      expect(message.toLowerCase()).not.toContain(claim);
    }
  });

  it('names the timer when two timers finish together', () => {
    const started = startTimer(createTimers(), 'eggs', T0);
    const both = started.timers.map((timer) =>
      timer.id === 'blackpudding'
        ? { ...timer, status: 'running' as const, remainingSeconds: 180, deadline: T0 + 180_000 }
        : timer
    );
    const due = completeDueTimers(both, T0 + 181_000);

    const messages = due.events.map((event) => announcementFor(event));
    expect(messages).toHaveLength(2);
    expect(messages.some((message) => message.includes('Black Pudding Slices'))).toBe(true);
    expect(messages.some((message) => message.includes('Fried Eggs (Runny Yolk)'))).toBe(true);
  });

  it('produces no announcement for a tick', () => {
    const started = startTimer(createTimers(), 'eggs', T0);
    const ticked = completeDueTimers(started.timers, T0 + 1_000);
    expect(ticked.events).toHaveLength(0);
  });
});

describe('Formatting', () => {
  it('formats a clock value', () => {
    expect(formatClock(18 * 60)).toBe('18:00');
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(65)).toBe('01:05');
  });

  it('formats a spoken duration', () => {
    expect(formatSpoken(18 * 60)).toBe('18 minutes');
    expect(formatSpoken(90)).toBe('1 minute and 30 seconds');
    expect(formatSpoken(1)).toBe('1 second');
    expect(formatSpoken(0)).toBe('no time');
  });

  it('offers five timers', () => {
    expect(TIMER_DEFINITIONS).toHaveLength(5);
    expect(new Set(TIMER_DEFINITIONS.map((definition) => definition.id)).size).toBe(5);
  });
});
