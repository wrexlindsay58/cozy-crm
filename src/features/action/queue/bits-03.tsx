import { SortKey } from "./bits-01";
import { dueMs } from "./bits-02";
import { ACTION_LABEL } from "@/features/action/types";
import type { ShopAction } from "@/features/action/types";
import { houseOf } from "@/features/action/house";
import { useOps } from "@/features/ops/store";
import { liveStatus } from "@/lib/chrome";

export function ageHours(age?: string) {
  if (!age || age === "now") return 0;
  const m = age.match(/^(\d+)\s*h/i);
  if (m) return Number(m[1]);
  const d = age.match(/^(\d+)\s*d/i);
  if (d) return Number(d[1]) * 24;
  return 9999;
}

export function compareActions(a: ShopAction, b: ShopAction, sort: SortKey, leads: ReturnType<typeof useOps>["leads"]) {
  if (sort === "past") {
    const rank = (row: ShopAction) => {
      const s = liveStatus(row.status, row.due);
      if (s === "Past Due") return 0;
      if (s === "Due Soon") return 1;
      return 2;
    };
    const ap = rank(a);
    const bp = rank(b);
    if (ap !== bp) return ap - bp;
    return dueMs(a.due) - dueMs(b.due);
  }
  if (sort === "due") return dueMs(a.due) - dueMs(b.due) || a.title.localeCompare(b.title);
  if (sort === "newest") return ageHours(a.age) - ageHours(b.age);
  if (sort === "house") return houseOf(a.personId, leads).name.localeCompare(houseOf(b.personId, leads).name);
  if (sort === "owner") return a.owner.localeCompare(b.owner) || a.title.localeCompare(b.title);
  if (sort === "kind") return ACTION_LABEL[a.kind].localeCompare(ACTION_LABEL[b.kind]) || a.title.localeCompare(b.title);
  return 0;
}
