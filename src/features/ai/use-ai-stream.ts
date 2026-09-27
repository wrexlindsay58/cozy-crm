import { useEffect, useSyncExternalStore } from "react";
import { parseAIPayload, readSSEData, type AIEvent } from "./schema";

export type AIStreamStatus = "idle" | "streaming" | "done" | "error";

export type AIStreamState = {
  status: AIStreamStatus;
  step: string;
  text: string;
  error: string;
};

const IDLE: AIStreamState = { status: "idle", step: "", text: "", error: "" };
let state: AIStreamState = IDLE;
const listeners = new Set<() => void>();
let active: AbortController | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<AIStreamState>) {
  state = { ...state, ...patch };
  emit();
}

function applyEvent(event: AIEvent) {
  if (event.type === "step") {
    setState({ status: "streaming", step: event.label, error: event.status === "error" ? event.label : "" });
    return;
  }
  if (event.type === "token") {
    setState({ status: "streaming", text: state.text + event.text });
    return;
  }
  if (event.type === "done") {
    setState({ status: "done", text: event.text ?? state.text, step: "" });
    return;
  }
  setState({ status: "error", error: event.message, step: "" });
}

export function stopAIStream() {
  active?.abort();
  active = null;
  state = IDLE;
  emit();
}

export async function consumeAIStream(url: string, signal: AbortSignal) {
  const response = await fetch(url, {
    signal,
    headers: { accept: "text/event-stream" },
  });
  if (!response.ok || !response.body) {
    throw new Error(response.ok ? "AI stream had no body" : `AI stream HTTP ${response.status}`);
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
    for (const block of blocks) {
      const data = readSSEData(block);
      if (!data) continue;
      const event = parseAIPayload(data);
      if (event) applyEvent(event);
    }
  }
}

export function beginAIStream(url: string) {
  stopAIStream();
  const controller = new AbortController();
  active = controller;
  const timer = setTimeout(() => controller.abort(), 20_000);
  setState({ status: "streaming", step: "Connecting", text: "", error: "" });
  void consumeAIStream(url, controller.signal)
    .then(() => {
      if (controller.signal.aborted || state.status === "error") return;
      if (state.status === "streaming") setState({ status: "done", step: "" });
    })
    .catch((error: unknown) => {
      if (controller.signal.aborted) return;
      const message = error instanceof Error ? error.message : "The assistant did not answer.";
      setState({ status: "error", error: message, step: "" });
    })
    .finally(() => clearTimeout(timer));
  return () => {
    clearTimeout(timer);
    if (active === controller) stopAIStream();
  };
}

export function useAIStream(url: string | null) {
  useEffect(() => {
    if (!url) return;
    return beginAIStream(url);
  }, [url]);
  return useAIStreamState();
}

export function useAIStreamState() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => IDLE,
  );
}
