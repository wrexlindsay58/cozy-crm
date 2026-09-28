import { __bag1, type UnitStatus, type Stop } from "./part-01";
import { __bag0 } from "./part-02";

export const stops = { ...__bag0, ...__bag1 } as Record<string, Stop[]>;

export type BoardBlock = {
  personId: string;
  day: number;
  hour: number;
  hours: number;
  name: string;
  job: string;
  kind: "run" | "install" | "follow-up";
  status: string;
  leadId: string;
  amount: number;
  city: string;
};

export const board: BoardBlock[] = [
  { personId: "luis", day: 13, hour: 16, hours: 2, name: "Nina Patel", job: "Air sealing", kind: "run", status: "No run", leadId: "L-4774", amount: 9800, city: "Dallas" },
  { personId: "dana", day: 13, hour: 17, hours: 2, name: "Todd Hale", job: "HVAC 4-ton", kind: "run", status: "Ran", leadId: "L-4819", amount: 28640, city: "Scottsdale" },
  { personId: "marco", day: 14, hour: 18, hours: 2, name: "Elena Vargas", job: "Attic R-49", kind: "run", status: "Confirmed", leadId: "L-4821", amount: 18420, city: "Surprise" },
  { personId: "cole", day: 14, hour: 17, hours: 2, name: "Patterson neighbor", job: "Attic", kind: "run", status: "Set", leadId: "L-4754", amount: 9800, city: "Fort Worth" },
  { personId: "marco", day: 14, hour: 16, hours: 2, name: "Alvarez sister", job: "Air seal", kind: "run", status: "Set", leadId: "L-4821", amount: 6400, city: "Glendale" },
  { personId: "dana", day: 14, hour: 19, hours: 1, name: "Cho referral", job: "Attic", kind: "run", status: "Set", leadId: "L-4788", amount: 12400, city: "Scottsdale" },
  { personId: "luis", day: 15, hour: 17, hours: 2, name: "Marcus Bell", job: "Aeroseal + attic", kind: "run", status: "Confirmed", leadId: "L-4814", amount: 12480, city: "Dallas" },
  { personId: "luis", day: 15, hour: 18, hours: 2, name: "Rahman office", job: "Attic", kind: "run", status: "Set", leadId: "L-4733", amount: 11200, city: "Dallas" },
  { personId: "cole", day: 16, hour: 18, hours: 2, name: "Jamal Ortiz", job: "Attic R-49", kind: "follow-up", status: "Follow-up", leadId: "L-4802", amount: 9800, city: "Fort Worth" },
  { personId: "cole", day: 17, hour: 18, hours: 2, name: "Owen Briggs", job: "Aeroseal", kind: "run", status: "Set", leadId: "L-4754", amount: 6400, city: "Fort Worth" },
  { personId: "tasha", day: 18, hour: 7, hours: 8, name: "Whitaker", job: "Envelope", kind: "install", status: "Install", leadId: "L-4761", amount: 24680, city: "Scottsdale" },
  { personId: "dana", day: 19, hour: 11, hours: 2, name: "Kerr", job: "Windows", kind: "run", status: "Reset", leadId: "L-4726", amount: 18400, city: "Scottsdale" },
  { personId: "tasha", day: 22, hour: 7, hours: 8, name: "Cho", job: "Attic + HVAC", kind: "install", status: "Install", leadId: "L-4788", amount: 31250, city: "Scottsdale" },
];

export function statusTone(s: UnitStatus | string) {
  if (s === "late" || s === "No run" || s === "Unmarked" || s === "Missed") return "stop" as const;
  if (s === "en-route" || s === "Set" || s === "Unconfirmed" || s === "Reset" || s === "Follow-up") return "watch" as const;
  if (s === "done" || s === "Ran" || s === "Install") return "go" as const;
  if (s === "on-site" || s === "Confirmed") return "info" as const;
  return "none" as const;
}

export function statusLabel(s: UnitStatus) {
  if (s === "en-route") return "En route";
  if (s === "on-site") return "On site";
  if (s === "late") return "Late";
  if (s === "done") return "Done";
  return "Idle";
}
