import { useSyncExternalStore } from "react";

const KEY = "cozy-head-open-v2";
let open: boolean | null = null;
const subs = new Set<() => void>();

function current() {
  if (open !== null) return open;
  try {
    open = sessionStorage.getItem(KEY) === "1";
  } catch {
    open = false;
  }
  return open;
}

function subscribe(fn: () => void) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export function setHeadOpen(next: boolean) {
  open = next;
  try {
    sessionStorage.setItem(KEY, next ? "1" : "0");
  } catch {
    /* private mode */
  }
  subs.forEach((fn) => fn());
}

export function useHeadOpen() {
  return useSyncExternalStore(subscribe, current, () => false);
}
