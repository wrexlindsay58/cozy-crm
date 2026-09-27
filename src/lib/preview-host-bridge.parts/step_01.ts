import { CONNECTOR_TOKEN_READY_EVENT } from "../app-data/types";
import { PREVIEW_BRIDGE_CHANNEL, PREVIEW_BRIDGE_VERSION, EnvelopeSchema, HelloSchema, NavigateSchema, HistorySchema, ConnectorTokenReadySchema, isSafeBridgePath, resolveCurrentEmbedderOrigin, type PreviewHostBridgeOptions } from "./part-01";

export function step_01(ctx: any): any {
ctx.parentOrigin = resolveCurrentEmbedderOrigin();
if (ctx.parentOrigin === null) return { __halt: true as const, __ret: () => {} }
ctx.ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
ctx.originalPushState = window.history.pushState.bind(window.history);
ctx.originalReplaceState = window.history.replaceState.bind(window.history);
ctx.isAtHistoryRoot = () => {
    const state = window.history.state;
    return Boolean(
      state && typeof state === "object" && state[ctx.ROOT_STATE_KEY] === true,
    );
  };
try {
    const current = window.history.state;
    const alreadyTagged =
      current !== null &&
      typeof current === "object" &&
      Object.prototype.hasOwnProperty.call(current, ctx.ROOT_STATE_KEY);
    if (!alreadyTagged) {
      const isRoot = window.history.length <= 1;
      const marked =
        current && typeof current === "object"
          ? { ...current, [ctx.ROOT_STATE_KEY]: isRoot }
          : { [ctx.ROOT_STATE_KEY]: isRoot };
      ctx.originalReplaceState(marked, "", window.location.href);
    }
  } catch {
    // ignore if the document cannot be marked
  }
ctx.post = (message: object) => {
    window.parent.postMessage(message, ctx.parentOrigin);
  };
ctx.reportLocation = () => {
    ctx.post({
      channel: PREVIEW_BRIDGE_CHANNEL,
      version: PREVIEW_BRIDGE_VERSION,
      type: "location",
      path: window.location.pathname || "/",
      search: window.location.search,
      hash: window.location.hash,
    });
  };
ctx.reportRoutes = () => {
    const paths = ctx.options.getRoutePaths?.() ?? [];
    ctx.post({
      channel: PREVIEW_BRIDGE_CHANNEL,
      version: PREVIEW_BRIDGE_VERSION,
      type: "routes",
      paths,
    });
  };
ctx.defaultNavigate = (path: string) => {
    if (!isSafeBridgePath(path)) return;
    try {
      const url = new URL(path, window.location.origin);
      if (url.origin !== window.location.origin) return;
      const next = `${url.pathname}${url.search}${url.hash}`;
      window.history.pushState(window.history.state, "", next);
      window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
    } catch {
      // ignore malformed paths
    }
  };
ctx.navigate = (path: string) => {
    if (!isSafeBridgePath(path)) return;
    if (ctx.options.navigate) {
      ctx.options.navigate(path);
      return;
    }
    ctx.defaultNavigate(path);
  };
ctx.announce = () => {
    ctx.reportLocation();
    ctx.reportRoutes();
    ctx.post({
      channel: PREVIEW_BRIDGE_CHANNEL,
      version: PREVIEW_BRIDGE_VERSION,
      type: "ready",
    });
  };
ctx.onHello = (data: unknown) => {
    if (!HelloSchema.safeParse(data).success) return;
    ctx.announce();
  };
ctx.onNavigate = (data: unknown) => {
    const parsed = NavigateSchema.safeParse(data);
    if (!parsed.success) return;
    ctx.navigate(parsed.data.path);
    // Router navigations often update location asynchronously; report after a tick.
    queueMicrotask(ctx.reportLocation);
  };
ctx.onHistory = (data: unknown) => {
    const parsed = HistorySchema.safeParse(data);
    if (!parsed.success) return;
    // Do not history.go(-1) off the first entry — that leaves the preview.
    if (parsed.data.delta === -1 && ctx.isAtHistoryRoot()) return;
    // Location sync comes from the popstate listener once history settles.
    window.history.go(parsed.data.delta);
  };
}
