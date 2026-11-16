export function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    totalSeconds,
  };
}

export function startCountdown({ getTarget, onTick }) {
  let intervalId;
  let timeoutId;
  let lastNotifiedTarget = null;

  const update = () => {
    const target = getTarget();
    const now = Date.now();

    if (!target) {
      onTick(null);
      return;
    }

    const remaining = target.getTime() - now;
    onTick({ target, remaining: Math.max(0, remaining) });

    if (remaining <= 0 && lastNotifiedTarget !== target.getTime()) {
      lastNotifiedTarget = target.getTime();
      return;
    }

    if (remaining > 0 && lastNotifiedTarget !== target.getTime()) {
      lastNotifiedTarget = target.getTime();
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onTick({ target, remaining: 0, started: true });
      }, remaining);
    }
  };

  update();
  intervalId = setInterval(update, 1000);

  return () => {
    clearInterval(intervalId);
    clearTimeout(timeoutId);
  };
}
