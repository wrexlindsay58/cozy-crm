import { cashOut, dayGoals, referrals, reviews, snapshot, surveys } from "@/lib/snapshot";
import type { Lead } from "@/lib/crm-data";
import type { Resource } from "@/features/book/roster";
import { familyOf, isWatch, type BookEvent } from "@/features/book/types";
import { hourOf } from "@/features/book/time";
import { STEEL, WASH, MID, LIVE, pack, valueOf, prep_buildToday2, type Mark, type Rank, type FlowBar, type FieldNow } from "./part-01";
import { stepFns } from "./step-fns";
import { step_01 } from "./step_01";
import { step_02 } from "./step_02";
import { step_03 } from "./step_03";

export function buildToday(opts: {
  events: BookEvent[];
  leads: Lead[];
  roster: Resource[];
  dayKey: string;
  yestKey: string;
  hour: number;
  office: "all" | "PHX" | "DFW";
}) {
  const ctx: any = {};
  ctx.opts = opts;
  const __h0 = stepFns(ctx);
  if (__h0 && __h0.__halt) return __h0.__ret;
  const __h1 = step_01(ctx);
  if (__h1 && __h1.__halt) return __h1.__ret;
  const __h2 = step_02(ctx);
  if (__h2 && __h2.__halt) return __h2.__ret;
  const __h3 = step_03(ctx);
  if (__h3 && __h3.__halt) return __h3.__ret;
}
