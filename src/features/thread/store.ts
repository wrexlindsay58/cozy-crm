import { useSyncExternalStore } from "react";
import { seedThread, type ThreadMessage } from "@/lib/file-data";

let messages: ThreadMessage[] = [...seedThread];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getMessages() {
  return messages;
}

export function sendMessage(personId: string, text: string, lane: boolean | "sms" | "internal" | "note" | "email" = false) {
  const trimmed = text.trim();
  if (!trimmed) return;
  const now = new Date();
  const at = now.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const channel: ThreadMessage["channel"] =
    lane === true || lane === "internal" ? "internal" : lane === "note" ? "note" : lane === "email" ? "email" : "sms";
  messages = [
    ...messages,
    {
      id: `M-${messages.length + 1}`,
      personId,
      channel,
      from: "shop",
      at,
      text: trimmed,
    },
  ];
  emit();
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
