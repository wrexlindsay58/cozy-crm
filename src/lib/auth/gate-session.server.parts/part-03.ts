import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { setRequestCookie, setSessionCookie } from "better-auth/cookies";
import { handleOAuthUserInfo } from "better-auth/oauth2";
import { GATE_IDENTITY_HEADER, gateIdentityEnabled, gateIdentityFromHeaders, gateIdentityUserInfo, sessionBoundToGateIdentity } from "../gate-identity.server";
import { GATE_PROVIDER_ID, GATE_ACCOUNT_ISSUER, LOG, emitSessionCookie, expireSessionDataCookie, removeRequestCookie, type GateAccount } from "./part-01";
import { writeGateMarkerCookie, clearGateMarkerIfPresent } from "./part-02";

export function gateIdentitySessions() {
    const __id = {
  id: "grok-gate-identity",
  };
    const __match = {
  matcher: (ctx: { path?: string }) => ctx.path === "/get-session",
  };
  const __handler = {
  handler: createAuthMiddleware(async (ctx) => {
                if (!gateIdentityEnabled()) return;
                const inbound = ctx.request?.headers ?? ctx.headers;
                if (!inbound) {
                  console.error(`${LOG} no request headers on /get-session`);
                  return;
                }
                // Bearer auth (live-preview popup) already carries a session — leave it alone.
                if (inbound.get("authorization")) return;
                if (!inbound.get(GATE_IDENTITY_HEADER)) {
                  await clearGateMarkerIfPresent(ctx, inbound);
                  return;
                }

                const identity = await gateIdentityFromHeaders(inbound);
                if (!identity) {
                  console.error(
                    `${LOG} ${GATE_IDENTITY_HEADER} present but verification failed`,
                  );
                  return;
                }

                const sessionCookieName = ctx.context.authCookies.sessionToken.name;
                const cookieHeader = inbound.get("cookie") ?? "";
                if (cookieHeader.includes(`${sessionCookieName}=`)) {
                  const existing = await getSessionFromCtx(ctx).catch((err) => {
                    console.error(`${LOG} getSessionFromCtx failed`, err);
                    return null;
                  });
                  if (existing?.session && existing.user) {
                    const accounts = await ctx.context.internalAdapter
                      .findAccounts(existing.user.id)
                      .catch((err) => {
                        console.error(`${LOG} findAccounts failed`, err);
                        return null;
                      });
                    if (!accounts) {
                      console.error(
                        `${LOG} could not load accounts for existing session user`,
                        { userId: existing.user.id },
                      );
                      return;
                    }
                    if (
                      sessionBoundToGateIdentity(
                        accounts,
                        identity.sub,
                        GATE_PROVIDER_ID,
                      )
                    ) {
                      await writeGateMarkerCookie(ctx, false);
                      return;
                    }
                    await ctx.context.internalAdapter
                      .deleteSession(existing.session.token)
                      .catch((err) => {
                        console.error(
                          `${LOG} deleteSession (stale non-gate session) failed`,
                          err,
                        );
                        return null;
                      });
                  }
                }

                try {
                  const result = await handleOAuthUserInfo(ctx, {
                    userInfo: gateIdentityUserInfo(identity),
                    account: {
                      providerId: GATE_PROVIDER_ID,
                      issuer: GATE_ACCOUNT_ISSUER,
                      accountId: identity.sub,
                    } as GateAccount,
                  });
                  if (result.error || !result.data) {
                    console.error(`${LOG} handleOAuthUserInfo failed`, {
                      error: result.error,
                      hasData: Boolean(result.data),
                      sub: identity.sub,
                    });
                    return;
                  }

                  // Persist session rows + internal newSession state.
                  await setSessionCookie(ctx, result.data);

                  // Explicitly sign the token and emit Set-Cookie — do NOT rely on
                  // reading it back from ctx.context.responseHeaders (often empty
                  // here, which previously caused a silent signed-out render).
                  const sessionValue = await emitSessionCookie(
                    ctx,
                    sessionCookieName,
                    result.data.session.token,
                  );
                  if (!sessionValue) {
                    console.error(
                      `${LOG} session created in DB but cookie was not emitted`,
                      { userId: result.data.user.id },
                    );
                    return;
                  }

                  await writeGateMarkerCookie(ctx, false);

                  const sessionDataCookie = ctx.context.authCookies.sessionData;
                  await expireSessionDataCookie(ctx, sessionDataCookie);

                  // Inject the cookie into this request so the rest of /get-session
                  // resolves the newly created session in the same round-trip.
                  const headers = new Headers(
                    Object.fromEntries(inbound.entries()),
                  );
                  setRequestCookie(headers, sessionCookieName, sessionValue);
                  removeRequestCookie(headers, sessionDataCookie.name);
                  return { context: { headers } };
                } catch (err) {
                  console.error(`${LOG} gate identity session hook threw`, err);
                  return;
                }
              }),
  };
  const __hooks = {
  hooks: {
        before: [
          {...__id, ...__match, ...__handler},
        ],
      },
  };
  return {...__id, ...__hooks} satisfies BetterAuthPlugin;
}
