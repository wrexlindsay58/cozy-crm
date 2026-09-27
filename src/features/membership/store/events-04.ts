import { parseDay } from "../renew";
import type { MembershipFile } from "../types";

export function amountLeft(file: MembershipFile) {
  if (file.pay === "prepaid") {
    const start = parseDay(file.start);
    const end = parseDay(file.end);
    if (!start || !end) return 0;
    const total = end.getTime() - start.getTime();
    const left = end.getTime() - Date.now();
    if (total <= 0 || left <= 0) return 0;
    return Math.round((file.termPrice * left) / total);
  }
  return (file.ledger ?? []).filter((row) => row.status === "Open" && !row.note.startsWith("Repair")).reduce((sum, row) => sum + row.amount, 0);
}
