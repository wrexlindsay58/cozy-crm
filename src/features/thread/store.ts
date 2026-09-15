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

export function sendMessage(personId: string, text: string, internal = false) {
  const trimmed = text.trim();
  if (!trimmed) return;
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
      channel: internal ? "internal" : "sms",
      from: "shop",
      at,
      text: trimmed,
    },
  ];
  emit();
}

export function useThread(personId: string, internal = false) {
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
    return internal ? m.channel === "internal" : m.channel !== "internal";
  });
}
