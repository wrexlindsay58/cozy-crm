import { useSyncExternalStore } from "react";
import { getFromEmails, getFromNumbers } from "@/features/money-settings/store";

let smsFrom = getFromNumbers()[0]?.number ?? "";
let emailFrom = getFromEmails()[0]?.email ?? "";
let callFrom = getFromNumbers()[0]?.number ?? "";

let cached = pack();
const listeners = new Set<() => void>();
function pack() {
  return { smsFrom, emailFrom, callFrom };
}
function emit() {
  cached = pack();
  listeners.forEach((l) => l());
}

export function useFrom() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => cached,
    () => cached,
  );
}

export function setSmsFrom(n: string) {
  smsFrom = n;
  emit();
}
export function setEmailFrom(n: string) {
  emailFrom = n;
  emit();
}
export function setCallFrom(n: string) {
  callFrom = n;
  emit();
}
