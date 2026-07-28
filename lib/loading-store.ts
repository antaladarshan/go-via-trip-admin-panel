const DELAY_MS = 200;

let count = 0;
let visible = false;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(l => l());
}

export function start() {
  if (typeof window === 'undefined') return;
  count++;
  if (count === 1 && !visible && !timer) {
    timer = setTimeout(() => {
      timer = null;
      if (count > 0) {
        visible = true;
        emit();
      }
    }, DELAY_MS);
  }
}

export function stop() {
  if (typeof window === 'undefined') return;
  count = Math.max(0, count - 1);
  if (count === 0) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (visible) {
      visible = false;
      emit();
    }
  }
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getSnapshot() {
  return visible;
}
