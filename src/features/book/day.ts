import { useSyncExternalStore } from "react";
import { TODAY } from "./time";

let cursor = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function useBookDay() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => cursor,
  );
}

export function setBookDay(d: Date) {
  cursor = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  emit();
}

export function shiftBookDay(n: number) {
  const next = new Date(cursor);
  next.setDate(next.getDate() + n);
  setBookDay(next);
}
