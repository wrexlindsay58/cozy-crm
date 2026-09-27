import { useSyncExternalStore } from "react";

let presence: Record<string, string> = {};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function setPresence(id: string, user: string | null) {
  if (!user) {
    if (!(id in presence)) return;
    const next = { ...presence };
    delete next[id];
    presence = next;
  } else if (presence[id] === user) {
    return;
  } else {
    presence = { ...presence, [id]: user };
  }
  emit();
}

export function presenceNow() {
  return presence;
}

const EMPTY: Record<string, string> = {};

export function usePresence() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => presence,
    () => EMPTY,
  );
}
