import { membershipSeeds } from "./seed";
import { decorateMembership } from "./seed-02";
import type { MembershipFile } from "../types";

export const bridge: Record<string, (...args: any[]) => any> = {};

export let seq = 105;

export let files: MembershipFile[] = membershipSeeds.map(decorateMembership);

export const listeners = new Set<() => void>();

export let rolling = false;

export function rollDueBills() {
  if (rolling) return;
  rolling = true;
  queueMicrotask(() => {
    try {
      for (const file of [...files]) bridge.rollBills(file.id);
    } finally {
      rolling = false;
    }
  });
}

export function emit() {
  listeners.forEach((l) => l());
  rollDueBills();
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  rollDueBills();
  return () => listeners.delete(cb);
}

export function snap() {
  return files;
}

export function write_files(next: typeof files) {
  files = next;
  return next;
}

export function write_seq(next: typeof seq) {
  seq = next;
  return next;
}

export function write_rolling(next: typeof rolling) {
  rolling = next;
  return next;
}

export function take_seq() {
  return seq++;
}
