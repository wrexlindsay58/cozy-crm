import { catalog, type Catalog } from "./part-01";

export function discountsOf(c: Catalog = catalog) {
  return c.items.filter((i) => i.kind === "discount" && !i.rebate && i.active);
}
