import { useEffect } from "react";
import { applyRemoteJobDelete, applyRemoteJobPatch } from "@/features/job/store";
import { applyRemoteMembershipDelete, applyRemoteMembershipPatch } from "@/features/membership/store";
import { applyRemoteLeadDelete, applyRemoteLeadPatch } from "@/features/ops/store";
import { holdRemote, isLocallyEditing } from "./editing";
import { setPresence } from "./presence";
import { parseRealtimeEvent, type RealtimeEvent } from "./schema";

function applyNow(event: RealtimeEvent) {
  if (event.type === "presence") {
    setPresence(event.id, event.active ? event.user : null);
    return;
  }
  if (isLocallyEditing(event.id)) {
    holdRemote(event.id, event.type === "record.deleted" ? { kind: "delete" } : { kind: "upsert", patch: event.patch });
    return;
  }
  if (event.type === "record.deleted") {
    if (event.channel === "lead") applyRemoteLeadDelete(event.id);
    if (event.channel === "job") applyRemoteJobDelete(event.id);
    if (event.channel === "membership") applyRemoteMembershipDelete(event.id);
    setPresence(event.id, null);
    return;
  }
  if (event.channel === "lead") applyRemoteLeadPatch(event.id, event.patch);
  if (event.channel === "job") applyRemoteJobPatch(event.id, event.patch);
  if (event.channel === "membership") applyRemoteMembershipPatch(event.id, event.patch);
}

export function applyRealtimePayload(raw: string) {
  const data = raw
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n")
    .trim();
  const event = parseRealtimeEvent(data || raw.trim());
  if (event) applyNow(event);
}

async function readSSE(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal, headers: { accept: "text/event-stream" } });
  if (!response.ok || !response.body) {
    throw new Error(response.ok ? "Realtime stream had no body" : `Realtime HTTP ${response.status}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (!signal.aborted) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) applyRealtimePayload(block);
  }
}

function readSocket(url: string, signal: AbortSignal, onFail: () => void) {
  const socket = new WebSocket(url);
  socket.onmessage = (event) => applyRealtimePayload(String(event.data));
  socket.onerror = () => onFail();
  socket.onclose = () => {
    if (!signal.aborted) onFail();
  };
  signal.addEventListener("abort", () => socket.close());
}

export function useRealtimeSync(url = import.meta.env.VITE_REALTIME_URL as string | undefined) {
  useEffect(() => {
    if (!url) return;
    let stopped = false;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | null = null;

    const connect = () => {
      if (stopped) return;
      controller = new AbortController();
      const fail = () => {
        controller?.abort();
        if (stopped) return;
        const wait = Math.min(15_000, 1_000 * 2 ** attempt);
        attempt += 1;
        timer = setTimeout(connect, wait);
      };
      if (url.startsWith("ws")) {
        readSocket(url, controller.signal, fail);
        return;
      }
      void readSSE(url, controller.signal)
        .then(() => fail())
        .catch(() => fail());
    };

    connect();
    return () => {
      stopped = true;
      controller?.abort();
      if (timer) clearTimeout(timer);
    };
  }, [url]);
}
