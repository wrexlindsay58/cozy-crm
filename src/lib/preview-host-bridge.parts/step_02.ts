import { CONNECTOR_TOKEN_READY_EVENT } from "../app-data/types";
import { PREVIEW_BRIDGE_CHANNEL, PREVIEW_BRIDGE_VERSION, EnvelopeSchema, HelloSchema, NavigateSchema, HistorySchema, ConnectorTokenReadySchema, isSafeBridgePath, resolveCurrentEmbedderOrigin, type PreviewHostBridgeOptions } from "./part-01";

export function step_02(ctx: any): any {
ctx.onConnectorTokenReady = (data: unknown) => {
    if (!ConnectorTokenReadySchema.safeParse(data).success) return;
    window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
  };
ctx.hostMessageHandlers = new Map<string, (data: unknown) => void>([
    ["hello", ctx.onHello],
    ["navigate", ctx.onNavigate],
    ["history", ctx.onHistory],
    ["connector-token-ready", ctx.onConnectorTokenReady],
  ]);
ctx.onMessage = (event: MessageEvent) => {
    if (event.source !== window.parent) return;
    if (event.origin !== ctx.parentOrigin) return;

    const envelope = EnvelopeSchema.safeParse(event.data);
    if (!envelope.success || envelope.data.version !== PREVIEW_BRIDGE_VERSION) return;
    ctx.hostMessageHandlers.get(envelope.data.type)?.(event.data);
  };
ctx.onPopState = () => {
    ctx.reportLocation();
  };
ctx.onHashChange = () => {
    ctx.reportLocation();
  };
window.history.pushState = (data, unused, url) => {
    const next =
      data && typeof data === "object"
        ? { ...data, [ctx.ROOT_STATE_KEY]: false }
        : data;
    ctx.originalPushState(next, unused, url);
    ctx.reportLocation();
  };
window.history.replaceState = (data, unused, url) => {
    const next =
      ctx.isAtHistoryRoot()
        ? {
            ...(data && typeof data === "object" ? data : {}),
            [ctx.ROOT_STATE_KEY]: true,
          }
        : data;
    ctx.originalReplaceState(next, unused, url);
    ctx.reportLocation();
  };
window.addEventListener("message", ctx.onMessage);
window.addEventListener("popstate", ctx.onPopState);
window.addEventListener("hashchange", ctx.onHashChange);
ctx.announce();
return { __halt: true as const, __ret: () => {
    window.removeEventListener("message", ctx.onMessage);
    window.removeEventListener("popstate", ctx.onPopState);
    window.removeEventListener("hashchange", ctx.onHashChange);
    window.history.pushState = ctx.originalPushState;
    window.history.replaceState = ctx.originalReplaceState;
  } }
}
