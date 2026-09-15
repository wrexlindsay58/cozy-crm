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
  extra?: { subject?: string; nest?: ThreadMessage["nest"]; replyTo?: string; files?: ThreadMessage["files"] },
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
  const row: ThreadMessage = {
    id: `M-${messages.length + 1}`,
    personId,
    channel: extra?.nest ? "internal" : channel,
    from: "shop",
    at,
    text: trimmed || (extra?.files?.length ? `Sent ${extra.files.map((f) => f.name).join(", ")}.` : ""),
    subject: extra?.subject?.trim() || undefined,
    nest: extra?.nest,
    replyTo: extra?.replyTo,
    files: extra?.files,
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
  extra?: { durationSec?: number; direction?: "Out" | "In"; result?: "Answered" | "VM" | "No answer" },
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
      at,
      text,
      durationSec: extra?.durationSec,
      direction: extra?.direction,
      result: extra?.result,
    },
  ];
  emit();
}

export function useThread(personId: string, lane: "customer" | "internal" | "notes" | boolean = false) {
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
    if (lane === true || lane === "internal") return m.channel === "internal";
    if (lane === "notes") return m.channel === "note";
    return m.channel === "sms" || m.channel === "call" || m.channel === "email";
  });
}
