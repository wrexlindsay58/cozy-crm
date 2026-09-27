import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { applyListPatch, listSearch, readListSearch } from "./url-search.ts";

const parse = listSearch(["Unpaid", "Due", "Active"] as const, ["rank", "name", "price"] as const);

describe("list search params", () => {
  it("drops unknown filters and omits defaults from the URL object", () => {
    assert.deepEqual(parse({ view: "Nope", sort: "secret", dir: "sideways", q: 4, owner: "Dana" }), {
      owner: "Dana",
    });
    assert.deepEqual(readListSearch(parse({})), {
      view: "All",
      q: "",
      owner: "",
      office: "",
      sort: "rank",
      dir: "asc",
    });
  });

  it("writes the next filter into the search object the router stores", () => {
    const start = readListSearch(parse({}));
    const unpaid = parse(applyListPatch(start, { view: "Unpaid", q: "ann", owner: "Dana Ortiz", sort: "name", dir: "desc" }));
    assert.deepEqual(unpaid, { view: "Unpaid", q: "ann", owner: "Dana Ortiz", sort: "name", dir: "desc" });
    assert.equal(readListSearch(unpaid).view, "Unpaid");

    const cleared = parse(applyListPatch(readListSearch(unpaid), { view: "All", q: "" }));
    assert.deepEqual(cleared, { owner: "Dana Ortiz", sort: "name", dir: "desc" });
    assert.equal(readListSearch(cleared).view, "All");
    assert.equal(readListSearch(cleared).q, "");
  });
});
