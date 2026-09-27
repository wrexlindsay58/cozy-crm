import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { callTool, isConnectorTokenReady } from "../client.server.ts";
import { ConnectorType, GoogleCalendarTools, type ToolArgs, type CallToolResult } from "../types.ts";
import { isLoginRequired } from "../login.ts";
import { fakeJwt, withStubbedGate } from "./part-01";

describe("callTool in the workspace preview vs deployed", () => {
  const options = { connectorType: ConnectorType.GoogleDrive };
  const savedEnvToken = process.env.GROK_CONNECTOR_ACCESS_TOKEN;

  beforeEach(() => {
    delete process.env.GROK_CONNECTOR_ACCESS_TOKEN;
    delete process.env.GROK_PROJECT_ID;
  });
  afterEach(() => {
    if (savedEnvToken === undefined) {
      delete process.env.GROK_CONNECTOR_ACCESS_TOKEN;
    } else {
      process.env.GROK_CONNECTOR_ACCESS_TOKEN = savedEnvToken;
    }
    delete process.env.GROK_PROJECT_ID;
  });

  it("returns pending (no loginRequired) when the preview has no token yet", async () => {
    const result = await callTool("google_drive_search", {}, options);
    assert.equal(result.ok, false);
    assert.equal(result.pending, true);
    assert.equal(result.loginRequired, undefined);
    assert.match(result.errorMessage ?? "", /^connector_token_pending/);
  });

  it("returns a plain error (no sign-in CTA) when a deployed app has no token", async () => {
    process.env.GROK_PROJECT_ID = "proj-1";
    const result = await callTool("google_drive_search", {}, options);
    assert.equal(result.ok, false);
    assert.equal(result.loginRequired, undefined);
    assert.equal(result.loginUrl, undefined);
    assert.equal(result.pending, undefined);
    assert.match(result.errorMessage ?? "", /^missing_connector_token/);
  });

  it("treats a gate 401 in the preview as pending and parks the rejected token", async () => {
    await withStubbedGate(401, { errorMessage: "login required" }, async (calls) => {
      process.env.GROK_CONNECTOR_ACCESS_TOKEN = fakeJwt({ sub: "p", iat: 1, exp: 2 });
      assert.equal(isConnectorTokenReady(), true);

      const result = await callTool("google_drive_search", {}, options);
      assert.equal(result.pending, true);
      assert.equal(result.loginRequired, undefined);
      assert.match(result.errorMessage ?? "", /^connector_token_pending/);
      assert.equal(calls(), 1);
      assert.equal(isConnectorTokenReady(), false);

      process.env.GROK_CONNECTOR_ACCESS_TOKEN = fakeJwt({ sub: "p", iat: 3, exp: 4 });
      assert.equal(isConnectorTokenReady(), true);
    });
  });

  it("keeps loginRequired for a gate 401 on a deployed app", async () => {
    process.env.GROK_PROJECT_ID = "proj-1";
    await withStubbedGate(401, { errorMessage: "login required" }, async () => {
      const result = await callTool("google_drive_search", {}, {
        ...options,
        token: fakeJwt({ sub: "d", iat: 1, exp: 2 }),
      });
      assert.equal(result.loginRequired, true);
      assert.equal(result.pending, undefined);
    });
  });
});

describe("callTool", () => {
  it("resolves ok:false for non-serializable args instead of rejecting", async () => {
    process.env.GROK_CONNECTORS_URL = "https://connectors.invalid.example";
    try {
      const circular: Record<string, unknown> = {};
      circular.self = circular;
      const result = await callTool(
        "google_drive_search",
        circular as ToolArgs,
        {
          connectorType: ConnectorType.GoogleDrive,
          token: "opaque-token",
        },
      );
      assert.equal(result.ok, false);
      assert.match(result.errorMessage ?? "", /circular/i);
    } finally {
      delete process.env.GROK_CONNECTORS_URL;
    }
  });
});

describe("isLoginRequired", () => {
  it("is true only for login-required failures", () => {
    assert.equal(
      isLoginRequired({ ok: false, data: null, loginRequired: true }),
      true,
    );
    assert.equal(isLoginRequired({ ok: false, data: null }), false);
    assert.equal(
      isLoginRequired({ ok: false, data: null, errorMessage: "access_denied" }),
      false,
    );
    assert.equal(
      isLoginRequired({
        ok: true,
        data: {},
        loginRequired: true,
      } as CallToolResult),
      false,
    );
  });
});

describe("GoogleCalendarTools", () => {
  it("does not expose a list_events name", () => {
    assert.equal(GoogleCalendarTools.search, "google_calendar_search");
    assert.equal(GoogleCalendarTools.listCalendars, "google_calendar_list_calendars");
    const toolNames: readonly string[] = Object.values(GoogleCalendarTools);
    assert.equal(toolNames.includes("google_calendar_list_events"), false);
  });
});
