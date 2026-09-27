import { createHash } from "node:crypto";
import { assertSameSiteRequest, CrossSiteRequestError } from "../../auth/isolation.server.ts";
import { isWorkspacePreview } from "../../env.server.ts";
import type { CallToolResult } from "../types.ts";
import { noteTokenRejected, gateSigninUrl, PENDING_TOKEN_MISSING, PENDING_TOKEN_REJECTED, pendingTokenResult, FAILURE_MEMO_TTL_MS, failureMemo, type InboundContext, type GateJson } from "./part-01";

export async function gatePost(
  ctx: InboundContext,
  body: Record<string, unknown>,
  token: string,
): Promise<{ status: number; json: GateJson }> {
  const base = ctx.connectorsBase;
  if (!base) {
    throw new Error(
      "cannot resolve gate host (missing x-forwarded-host/host on the server request); " +
        "open the app through the gated public URL so the gate can proxy and inject credentials",
    );
  }

  if (!/^https?:\/\//i.test(base)) {
    throw new Error(
      `gate base must be absolute http(s) URL (got ${base}); refusing relative fetch`,
    );
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    accept: "application/json",
    authorization: `Bearer ${token}`,
  };
  if (ctx.publicHost) {
    headers["x-forwarded-host"] = ctx.publicHost;
  }

  const res = await fetch(`${base}/call-tool`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    redirect: "manual",
  });

  let json: GateJson = {};
  const text = await res.text();
  if (text) {
    try {
      json = JSON.parse(text) as GateJson;
    } catch {
      json = {
        ok: false,
        errorMessage: `gate non-JSON response (HTTP ${res.status}): ${text.slice(0, 200)}`,
      };
    }
  }

  return { status: res.status, json };
}

export // Deployed apps only reach here when the request bypassed the gate (the gate
// injects the token on every proxied request), so a sign-in redirect cannot
// fix it: no loginRequired / loginUrl.
function missingAuthResult(): CallToolResult {
  if (isWorkspacePreview()) return pendingTokenResult(PENDING_TOKEN_MISSING);
  return {
    ok: false,
    data: null,
    errorMessage:
      "missing_connector_token: open this app through the edge gate " +
      "(the server must receive x-connector-access-token on the inbound request)",
  };
}

export function unauthorizedResult(
  ctx: InboundContext,
  json: GateJson,
  token: string,
): CallToolResult {
  if (isWorkspacePreview()) {
    noteTokenRejected(token);
    return pendingTokenResult(PENDING_TOKEN_REJECTED);
  }
  const loginUrl =
    gateSigninUrl(ctx) ??
    (typeof json.loginUrl === "string" && json.loginUrl
      ? json.loginUrl
      : undefined);
  return {
    ok: false,
    data: null,
    loginRequired: true,
    errorMessage: json.errorMessage ?? "login required",
    ...(loginUrl ? { loginUrl } : {}),
  };
}

export function crossSiteBlockedResult(): CallToolResult | null {
  try {
    assertSameSiteRequest();
    return null;
  } catch (e) {
    if (e instanceof CrossSiteRequestError) {
      return { ok: false, data: null, errorMessage: e.message };
    }
    return null;
  }
}

export function tokenIdentityKey(token: string): string {
  const payload = token.split(".")[1];
  if (payload) {
    try {
      const claims: unknown = JSON.parse(
        Buffer.from(payload, "base64url").toString("utf8"),
      );
      if (claims && typeof claims === "object" && !Array.isArray(claims)) {
        const { sub, team_id: teamId } = claims as {
          sub?: unknown;
          team_id?: unknown;
        };
        if (typeof sub === "string" && sub) {
          return createHash("sha256")
            .update(
              JSON.stringify([sub, typeof teamId === "string" ? teamId : null]),
            )
            .digest("base64url");
        }
      }
    } catch { /* ignore a token that is not valid JSON */ }
  }
  return createHash("sha256").update(token).digest("base64url");
}

export function memoizedFailure(key: string | null): CallToolResult | null {
  if (!key) return null;
  const hit = failureMemo.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > FAILURE_MEMO_TTL_MS) {
    failureMemo.delete(key);
    return null;
  }
  return hit.result;
}

export function failureMemoSize(): number {
  return failureMemo.size;
}
