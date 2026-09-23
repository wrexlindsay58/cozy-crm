import { useSyncExternalStore } from "react";
import { seedThread, type ThreadMessage } from "@/lib/file-data";
import { SHOP_ACTOR } from "@/lib/chrome";

let messages: ThreadMessage[] = [...seedThread];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getMessages() {
  return messages;
}

export function sendMessage(
  personId: string,
  text: string,
  lane: boolean | "sms" | "internal" | "note" | "email" = false,
  extra?: {
    subject?: string;
    nest?: ThreadMessage["nest"];
    replyTo?: string;
    files?: ThreadMessage["files"];
    actionId?: string;
    actionKind?: ThreadMessage["actionKind"];
  },
) {
  const trimmed = text.trim();
  if (!trimmed && !extra?.files?.length) return;
  const now = new Date();
  const at = now.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const channel: ThreadMessage["channel"] =
    extra?.nest || lane === true || lane === "internal" ? "internal" : lane === "note" ? "note" : lane === "email" ? "email" : "sms";
  const actionId = extra?.actionId ?? extra?.nest?.id;
  const actionKind = extra?.actionKind ?? extra?.nest?.kind;
  const row: ThreadMessage = {
    id: `M-${messages.length + 1}`,
    personId,
    channel: extra?.nest ? "internal" : channel,
    from: "shop",
    by: SHOP_ACTOR,
    at,
    text: trimmed || (extra?.files?.length ? `Sent ${extra.files.map((f) => f.name).join(", ")}.` : ""),
    subject: extra?.subject?.trim() || undefined,
    nest: extra?.nest,
    replyTo: extra?.replyTo,
    files: extra?.files,
    actionId,
    actionKind,
  };
  messages = [...messages, row];
  emit();
  return row;
}

export function toggleReaction(id: string, emoji: string, by = SHOP_ACTOR) {
  messages = messages.map((m) => {
    if (m.id !== id) return m;
    const cur = m.reactions ?? [];
    const mine = cur.some((r) => r.emoji === emoji && r.by === by);
    const next = mine ? cur.filter((r) => !(r.emoji === emoji && r.by === by)) : [...cur, { emoji, by }];
    return { ...m, reactions: next };
  });
  emit();
}

export function useComments(personId: string, kind: string, nestId: string) {
  const snap = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getMessages,
    getMessages,
  );
  return snap.filter((m) => m.personId === personId && m.nest?.kind === kind && m.nest.id === nestId);
}

export function logCallMessage(
  personId: string,
  text: string,
  extra?: {
    durationSec?: number;
    direction?: "Out" | "In";
    result?: "Answered" | "VM" | "No answer";
    actionId?: string;
    actionKind?: ThreadMessage["actionKind"];
  },
) {
  const now = new Date();
  const at = now.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  messages = [
    ...messages,
    {
      id: `M-${messages.length + 1}`,
      personId,
      channel: "call",
      from: "shop",
      by: SHOP_ACTOR,
      at,
      text,
      durationSec: extra?.durationSec,
      direction: extra?.direction,
      result: extra?.result,
      actionId: extra?.actionId,
      actionKind: extra?.actionKind,
    },
  ];
  emit();
}

let starred = new Set<string>(["L-4821"]);
let read = new Set<string>();

export function toggleStar(personId: string) {
  const next = new Set(starred);
  if (next.has(personId)) next.delete(personId);
  else next.add(personId);
  starred = next;
  emit();
}

export function markRead(personId: string) {
  if (read.has(personId)) return;
  const next = new Set(read);
  next.add(personId);
  read = next;
  emit();
}

export function isStarred(personId: string) {
  return starred.has(personId);
}

export function isRead(personId: string) {
  return read.has(personId);
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
