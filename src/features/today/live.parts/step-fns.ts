import { cashOut, dayGoals, referrals, reviews, snapshot, surveys } from "@/lib/snapshot";
import type { Lead } from "@/lib/crm-data";
import type { Resource } from "@/features/book/roster";
import { familyOf, isWatch, type BookEvent } from "@/features/book/types";
import { hourOf } from "@/features/book/time";
import { STEEL, WASH, MID, LIVE, pack, valueOf, prep_buildToday2, type Mark, type Rank, type FlowBar, type FieldNow } from "./part-01";

export function stepFns(ctx: any): any {
ctx.ends = function ends(list: Rank[]) {
    if (!list.length) return { top: [] as Rank[], bottom: [] as Rank[] };
    const top = list[0].amount > 0 ? [list[0]] : [];
    const last = list[list.length - 1];
    const bottom = last && last.id !== top[0]?.id ? [last] : [];
    return { top, bottom };
  };
}
