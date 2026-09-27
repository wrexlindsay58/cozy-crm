import { CONNECTOR_TOKEN_READY_EVENT } from "../app-data/types";
import { PREVIEW_BRIDGE_CHANNEL, PREVIEW_BRIDGE_VERSION, EnvelopeSchema, HelloSchema, NavigateSchema, HistorySchema, ConnectorTokenReadySchema, isSafeBridgePath, resolveCurrentEmbedderOrigin, type PreviewHostBridgeOptions } from "./part-01";
import { step_01 } from "./step_01";
import { step_02 } from "./step_02";

export function installPreviewHostBridge(options: PreviewHostBridgeOptions = {}): () => void {
  const ctx: any = {};
  ctx.options = options;
  const __h0 = step_01(ctx);
  if (__h0 && __h0.__halt) return __h0.__ret;
  const __h1 = step_02(ctx);
  if (__h1 && __h1.__halt) return __h1.__ret;
  return () => {};
}
