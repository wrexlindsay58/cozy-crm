import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseAIPayload, readSSEData } from "./schema.ts";
import { parseRealtimeEvent } from "../realtime/schema.ts";
import { reconcileRecord } from "../realtime/editing.ts";

describe("AI stream payloads", () => {
  it("accepts a step and ignores a partial JSON line", () => {
    const step = parseAIPayload('{"type":"step","id":"s1","label":"Tool: Searching leads...","status":"running"}');
    assert.equal(step?.type, "step");
    assert.equal(parseAIPayload('{"type":"token","text":'), null);
    assert.equal(readSSEData("event: step\ndata: {\"type\":\"token\",\"text\":\"Hi\"}"), '{"type":"token","text":"Hi"}');
  });
});

describe("realtime reconciliation", () => {
  it("keeps fields the local user changed and takes the rest", () => {
    const snapshot = { id: "L-1", name: "Ann", city: "Phoenix" };
    const current = { id: "L-1", name: "Ann Whitaker", city: "Phoenix" };
    const next = reconcileRecord(snapshot, current, { name: "Someone else", city: "Scottsdale" });
    assert.equal(next.name, "Ann Whitaker");
    assert.equal(next.city, "Scottsdale");
  });

  it("drops an invalid realtime frame", () => {
    assert.equal(parseRealtimeEvent('{"type":"record.updated","channel":"lead","id":"L-1","patch":{"city":"Mesa"}}')?.type, "record.updated");
    assert.equal(parseRealtimeEvent('{"type":"nope"}'), null);
    assert.equal(parseRealtimeEvent("{"), null);
  });
});
