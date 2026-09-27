import type { BookEvent } from "../types";
import { row, __rows0 } from "./part-01";

const __rows1 = [
row("BK-21d", "Sales", "Briggs confirm", "cole", "2026-09-21T18:00", "2026-09-21T19:00", { personId: "L-4754", city: "Fort Worth" }),
row("BK-22a", "Install", "Cho attic blow", "crew-tasha", "2026-09-22T07:00", "2026-09-22T15:00", { jobId: "P-331", personId: "L-4788", city: "Scottsdale", woSigned: false, status: "Set" }),
row("BK-22b", "Install", "Cho HVAC", "crew-evan", "2026-09-22T08:00", "2026-09-22T16:00", { jobId: "P-331", city: "Scottsdale", woSigned: false, status: "Set" }),
row("BK-22c", "Permit", "Cho inspector", "tasha", "2026-09-22T10:00", "2026-09-22T11:00", { jobId: "P-331", city: "Scottsdale" }),
row("BK-22d", "Sales", "New canvass", "marco", "2026-09-22T17:00", "2026-09-22T19:00", { personId: "L-4821", city: "Surprise", status: "Set" }),
row("BK-22e", "Membership", "Whitaker Comfort", "crew-marco", "2026-09-22T09:00", "2026-09-22T10:00", { jobId: "P-328", city: "Scottsdale", woSigned: true }),
row("BK-22f", "Install", "Rahman finish", "crew-dallas", "2026-09-22T07:00", "2026-09-22T15:00", { jobId: "P-322", city: "Dallas", woSigned: true, status: "Dispatched" }),
row("BK-23a", "Test-out", "Cho numbers", "crew-tasha", "2026-09-23T08:00", "2026-09-23T12:00", { jobId: "P-331", city: "Scottsdale", woSigned: true }),
row("BK-23b", "Punch", "Cho punch", "crew-evan", "2026-09-23T08:00", "2026-09-23T11:00", { jobId: "P-331", city: "Scottsdale", woSigned: true }),
row("BK-23c", "Inspection", "Cho final", "tasha", "2026-09-23T13:00", "2026-09-23T14:30", { jobId: "P-331", city: "Scottsdale" }),
row("BK-23d", "Sales", "Night sit", "dana", "2026-09-23T17:30", "2026-09-23T19:30", { personId: "L-4819", city: "Scottsdale", status: "Set" }),
row("BK-23e", "Time-off", "Amber PTO", "amber", "2026-09-23T08:00", "2026-09-23T17:00", { city: "Scottsdale" }),
row("BK-24a", "Install", "Rahman attic", "crew-dallas", "2026-09-24T08:00", "2026-09-24T16:00", { personId: "L-4733", jobId: "P-322", city: "Dallas", status: "Confirmed", woSigned: true }),
row("BK-24b", "Dump", "Rahman dump", "crew-dallas", "2026-09-24T16:00", "2026-09-24T17:00", { jobId: "P-322", city: "Dallas", woSigned: true }),
row("BK-24c", "Sales", "Dallas sit", "luis", "2026-09-24T17:00", "2026-09-24T19:00", { personId: "L-4774", city: "Dallas", status: "Set" }),
row("BK-24d", "Service", "Whitaker after", "crew-tasha", "2026-09-24T08:00", "2026-09-24T10:00", { jobId: "P-328", city: "Scottsdale", woSigned: true }),
row("BK-24e", "Go-back", "Cho register", "crew-evan", "2026-09-24T09:00", "2026-09-24T12:00", { jobId: "P-331", city: "Scottsdale", woSigned: true }),
row("BK-25a", "Office", "Month close", "priya", "2026-09-25T09:00", "2026-09-25T12:00", { city: "Phoenix" }),
row("BK-25b", "Training", "Crew OSHA", "tasha", "2026-09-25T07:00", "2026-09-25T09:00", { city: "Phoenix" }),
row("BK-26a", "Membership", "North Canyon", "crew-marco", "2026-09-26T09:00", "2026-09-26T11:00", { jobId: "P-297", city: "Phoenix", woSigned: true }),
row("BK-28a", "Sales", "Week close", "marco", "2026-09-28T17:00", "2026-09-28T19:00", { personId: "L-4748", city: "Surprise", status: "Set" }),
row("BK-29a", "Callback", "Kerr check", "dana", "2026-09-29T16:00", "2026-09-29T16:30", { personId: "L-4726", city: "Scottsdale" }),
row("BK-30a", "Inspection", "Rahman final", "crew-dallas", "2026-09-30T09:00", "2026-09-30T11:00", { jobId: "P-322", city: "Dallas", woSigned: true }),
];

export const extraBook: BookEvent[] = [...__rows0, ...__rows1];
