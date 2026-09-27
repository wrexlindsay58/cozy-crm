import type { BomLine } from "../part-01";

export function bomAssumed(l: BomLine) {
  return l.estQty * l.unitCost;
}
