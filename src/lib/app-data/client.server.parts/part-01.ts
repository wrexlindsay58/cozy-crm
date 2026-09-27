import { createHash } from "node:crypto";
import { getRequest } from "@tanstack/react-start/server";
import { env } from "../../env.server.ts";
import { assertAppDataServerOnly } from "../server-only.ts";
import { CONNECTOR_TOKEN_HEADER, CONNECTOR_TOKEN_PENDING_CODE, type CallToolResult } from "../types.ts";

assertAppDataServerOnly("app-data/client.server");

export const CONNECTORS_HOST_STAGING = "connectors.app-builder-testing.com";

export const CONNECTORS_HOST_PROD = "connectors.grok.me";

function isLoopbackHost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

export type InboundContext = {
  token: string | null;
  publicHost: string | null;
  connectorsBase: string | null;
};

function connectorsBaseFor(publicHost: string | null): string | null {
  const explicit = env("GROK_CONNECTORS_URL");
  if (explicit) return explicit.replace(/\/+$/, "");

  const host = publicHost?.toLowerCase();
  if (!host || isLoopbackHost(host)) return null;
  if (
    host === "app-builder-testing.com" ||
    host.endsWith(".app-builder-testing.com")
  ) {
    return `https://${CONNECTORS_HOST_STAGING}`;
  }
  if (host === "grok.me" || host.endsWith(".grok.me")) {
    return `https://${CONNECTORS_HOST_PROD}`;
  }
  return null;
}

export function tryGetRequest(): Request | null {
  try {
    return getRequest() ?? null;
  } catch {
    return null;
  }
}

export function inboundContext(): InboundContext {
  const req = tryGetRequest();
  const xf = req?.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const publicHost =
    (xf || req?.headers.get("host") || "").split(":")[0]?.trim() || null;
  const headerToken = req?.headers.get(CONNECTOR_TOKEN_HEADER)?.trim() || null;
  const envToken =
    process.env.NODE_ENV === "production"
      ? null
      : (env("GROK_CONNECTOR_ACCESS_TOKEN") ?? null);
  return {
    token: headerToken ?? envToken,
    publicHost,
    connectorsBase: connectorsBaseFor(publicHost),
  };
}

export function resolveGateAppDataBase(): string | null {
  return inboundContext().connectorsBase;
}

export function getConnectorAccessToken(): string | null {
  return inboundContext().token;
}

// Digest of the last preview token the gate answered 401 for. The readiness
// probe reports "not ready" while that exact token is still the one on the
// request, so the client waits for the preview panel to push a fresh token
// instead of re-calling the gate with a token already known to be rejected.
let rejectedTokenDigest: string | null = null;

function tokenDigest(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

export function noteTokenRejected(token: string): void {
  rejectedTokenDigest = tokenDigest(token);
}

export function noteTokenAccepted(token: string): void {
  if (rejectedTokenDigest === tokenDigest(token)) rejectedTokenDigest = null;
}

/**
 * True when the inbound request carries a connector token the gate has not
 * rejected. This is what the preview readiness probe reports; it never calls
 * the gate.
 */
export function isConnectorTokenReady(): boolean {
  const token = inboundContext().token;
  return token !== null && tokenDigest(token) !== rejectedTokenDigest;
}

export type GateJson = {
  ok?: boolean;
  data?: unknown;
  errorMessage?: string;
  loginUrl?: string;
};

export function gateSigninUrl(ctx: InboundContext): string | undefined {
  const base = ctx.connectorsBase;
  if (!base) return undefined;
  try {
    const connectorsHost = new URL(base).host.toLowerCase();
    const gateHost = connectorsHost.replace(/^connectors\./, "gate.");
    if (gateHost === connectorsHost) return undefined;
    const publicHost = ctx.publicHost?.toLowerCase();
    const gated =
      publicHost && !isLoopbackHost(publicHost)
        ? `https://${publicHost}`
        : undefined;
    const signin = `https://${gateHost}/__gate/signin`;
    return gated
      ? `${signin}?return_to=${encodeURIComponent(gated)}`
      : signin;
  } catch {
    return undefined;
  }
}

export const PENDING_TOKEN_MISSING =
  "the preview has not received the connector token yet; it arrives once " +
  "the connector grant is approved";

export const PENDING_TOKEN_REJECTED =
  "the gate rejected the current preview token; the preview panel pushes a " +
  "fresh one on its own schedule";

export function pendingTokenResult(reason: string): CallToolResult {
  return {
    ok: false,
    data: null,
    pending: true,
    errorMessage: `${CONNECTOR_TOKEN_PENDING_CODE}: ${reason}`,
  };
}

export const FAILURE_MEMO_TTL_MS = 5_000;

export const failureMemo = new Map<string, { at: number; result: CallToolResult }>();
