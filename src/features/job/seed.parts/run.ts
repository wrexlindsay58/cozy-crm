import { accounts, leads, projects } from "@/lib/crm-data";
import { cashLoan, defaultChecks, defaultPacket, defaultPost, defaultPre, emptyPermit, emptyRebate, emptyTest, type JobFile, type Stage } from "../types";
import { atticBefore, prep_seedJobs, stampJob, withPrep, withAccept } from "./part-01";
import { step_01 } from "./step_01";
import { step_02 } from "./step_02";
import { step_03 } from "./step_03";

export function seedJobs(): JobFile[] {
  const ctx: any = {};
  
  const __h0 = step_01(ctx);
  if (__h0 && __h0.__halt) return __h0.__ret;
  const __h1 = step_02(ctx);
  if (__h1 && __h1.__halt) return __h1.__ret;
  const __h2 = step_03(ctx);
  if (__h2 && __h2.__halt) return __h2.__ret;
  return undefined as unknown as JobFile[];
}
