import { useSyncExternalStore } from "react";
import type { ThreadMessage } from "@/lib/file-data";
import { messages, listeners, emit, getMessages, write_messages } from "./part-01";

let blocked = new Set<string>();

let hidden = new Set<string>();

export function isBlocked(personId: string) {
  return blocked.has(personId);
}

export function isHidden(personId: string) {
  return hidden.has(personId);
}

export function blockContacts(ids: string[]) {
  const next = new Set(blocked);
  for (const id of ids) if (id) next.add(id);
  blocked = next;
  emit();
}

export function unblockContacts(ids: string[]) {
  const next = new Set(blocked);
  for (const id of ids) next.delete(id);
  blocked = next;
  emit();
}

export function blockAndDelete(ids: string[]) {
  const keep = new Set(ids.filter(Boolean));
  const nextBlocked = new Set(blocked);
  const nextHidden = new Set(hidden);
  for (const id of keep) {
    nextBlocked.add(id);
    nextHidden.add(id);
  }
  blocked = nextBlocked;
  hidden = nextHidden;
  write_messages(messages.filter((m) => !keep.has(m.personId)));
  emit();
}

export function useMessages() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getMessages,
    getMessages,
  );
}

export function tiedActionId(m: ThreadMessage) {
  return m.actionId ?? m.nest?.id;
}

export function useThread(
  personId: string,
  lane: "customer" | "internal" | "notes" | boolean = false,
  actionIds?: string[],
) {
  const snap = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getMessages,
    getMessages,
  );
  return snap.filter((m) => {
    if (m.personId !== personId) return false;
    if (actionIds?.length) {
      const id = tiedActionId(m);
      if (!id || !actionIds.includes(id)) return false;
    }
    if (lane === true || lane === "internal") return m.channel === "internal";
    if (lane === "notes") return m.channel === "note";
    return m.channel === "sms" || m.channel === "call" || m.channel === "email";
  });
}
