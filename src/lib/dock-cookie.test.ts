import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dockCookieValue, dockFromCookie } from "./dock-cookie.ts";

describe("dock cookie", () => {
  it("treats a missing cookie as open", () => {
    assert.equal(dockFromCookie(undefined), "open");
    assert.equal(dockFromCookie(""), "open");
    assert.equal(dockFromCookie("session=abc"), "open");
  });

  it("reads shut without caring about other cookies", () => {
    assert.equal(dockFromCookie("session=abc; cozy-nav=shut"), "shut");
    assert.equal(dockFromCookie("cozy-nav=open; theme=navy"), "open");
    assert.equal(dockFromCookie("cozy-nav=wide"), "open");
  });

  it("writes a path-wide cookie the next request can read", () => {
    const shut = dockCookieValue("shut");
    assert.match(shut, /^cozy-nav=shut;/);
    assert.equal(dockFromCookie(shut), "shut");
    assert.equal(dockFromCookie(dockCookieValue("open")), "open");
  });
});
