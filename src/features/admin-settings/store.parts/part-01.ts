import { pack } from "./part-03";
type Flag = { id: string; label: string; on: boolean };
export type Row = { id: string; name: string; note: string };
export let flags: Flag[] = [
  { id: "two-party", label: "Require both spouses on the run", on: true },
  { id: "dealer-fee-on-proposal", label: "Show dealer fee on proposal", on: true },
  { id: "hide-cost-crew", label: "Hide cost from crew by default", on: true },
];
export let dealers: Row[] = [
  { id: "D-1", name: "Cozy Home Performance", note: "Phoenix + Scottsdale" },
  { id: "D-2", name: "Cozy Texas", note: "Dallas + Fort Worth" },
];
export let discounts: Row[] = [
  { id: "C-1", name: "Veteran", note: "$500 off" },
  { id: "C-2", name: "Same-day close", note: "$250 off" },
];
export let rebates: Row[] = [
  { id: "R-1", name: "APS rebate", note: "$300" },
  { id: "R-2", name: "Oncor rebate", note: "$400" },
];
export let extraCosts: Row[] = [
  { id: "X-1", name: "Permit", note: "Pass-through" },
  { id: "X-2", name: "Dump run", note: "Job extra" },
];
export let productTypes: Row[] = [
  { id: "PT-1", name: "HVAC", note: "Equipment" },
  { id: "PT-2", name: "Envelope", note: "Attic / air seal" },
];
export let makers: Row[] = [
  { id: "M-1", name: "Goodman", note: "HVAC" },
  { id: "M-2", name: "CertainTeed", note: "Insulation" },
];
export let utilities: Row[] = [
  { id: "U-1", name: "APS", note: "Phoenix" },
  { id: "U-2", name: "Oncor", note: "Dallas" },
];
export let taskCats: Row[] = [
  { id: "TC-1", name: "Follow-up", note: "Sales" },
  { id: "TC-2", name: "HOA packet", note: "Production" },
];
export let stages: Row[] = [
  { id: "NS-1", name: "Booked", note: "Setter + closer" },
  { id: "NS-2", name: "Sold", note: "PM + owner" },
];
export let workflows: Row[] = [
  { id: "W-1", name: "Attic assessment", note: "R-value, baffles, photos" },
  { id: "W-2", name: "HVAC assessment", note: "Tonnage, ducts, photos" },
];
export let forms: Row[] = [
  { id: "F-1", name: "Start job", note: "Installation" },
  { id: "F-2", name: "Completion", note: "Installation" },
];
export let crews: Row[] = [
  { id: "CR-1", name: "Crew A", note: "Truck 12 · Phoenix" },
  { id: "CR-2", name: "Crew B", note: "Truck 4 · Scottsdale" },
];
export let positions: Row[] = [
  { id: "P-1", name: "Closer", note: "Can take card" },
  { id: "P-2", name: "PM", note: "Sees cost" },
];
export let points: Row[] = [
  { id: "LB-1", name: "Sold", note: "10 pts" },
  { id: "LB-2", name: "Set that ran", note: "2 pts" },
];
export let buckets: Row[] = [
  { id: "B-1", name: "Needs disposition", note: "Appointments" },
  { id: "B-2", name: "Proposal out", note: "Opportunities" },
];
export let plans: Row[] = [
  { id: "RP-1", name: "Comfort", note: "$29 / mo" },
  { id: "RP-2", name: "Comfort Plus", note: "$49 / mo · 1 visit" },
];
export let salesforce = { org: "", on: false };
export let departments: Row[] = [
  { id: "DP-1", name: "Sales", note: "Setters + closers" },
  { id: "DP-2", name: "Production", note: "PMs + crews" },
];
export let myTeam: Row[] = [
  { id: "MT-1", name: "Wrex Lindsay", note: "Sees Phoenix + Scottsdale" },
  { id: "MT-2", name: "Dana Ortiz", note: "Sees Scottsdale closers" },
];
export let calFilters: Row[] = [
  { id: "CF-1", name: "My book", note: "Default tab" },
  { id: "CF-2", name: "Office", note: "Phoenix tab" },
];
export let goals: Row[] = [
  { id: "G-1", name: "Phoenix sold", note: "12 / week" },
  { id: "G-2", name: "Sets that run", note: "80%" },
];
export let installers: Row[] = [
  { id: "IN-1", name: "In-house Crew A", note: "Attic + HVAC" },
  { id: "IN-2", name: "Sub — Desert Air", note: "Overflow HVAC" },
];
export let sections: Row[] = [
  { id: "S-1", name: "Property", note: "Assessment file" },
  { id: "S-2", name: "Qualifying", note: "Assessment file" },
];
export let qualify: Row[] = [
  { id: "Q-1", name: "Credit over 650", note: "Required" },
  { id: "Q-2", name: "All decision makers", note: "Required" },
  { id: "Q-3", name: "Homeowner", note: "Required" },
  { id: "Q-6", name: "Age of home", note: "Required" },
  { id: "Q-7", name: "Pain points", note: "Optional" },
  { id: "Q-8", name: "Products they want", note: "Optional" },
  { id: "Q-9", name: "Power bill", note: "Optional" },
];
export let notifyTemplates: Row[] = [
  { id: "NT-1", name: "Booked SMS", note: "You're on the book {day} {time}" },
  { id: "NT-2", name: "Sold SMS", note: "Welcome. PM will text next." },
];
export function write_flags(__v: any) { flags = __v; }
export function write_dealers(__v: any) { dealers = __v; }
export function write_rebates(__v: any) { rebates = __v; }
export function write_extraCosts(__v: any) { extraCosts = __v; }
export function write_productTypes(__v: any) { productTypes = __v; }
export function write_makers(__v: any) { makers = __v; }
export function write_utilities(__v: any) { utilities = __v; }
export function write_taskCats(__v: any) { taskCats = __v; }
export function write_stages(__v: any) { stages = __v; }
export function write_workflows(__v: any) { workflows = __v; }
export function write_forms(__v: any) { forms = __v; }
export function write_positions(__v: any) { positions = __v; }
export function write_points(__v: any) { points = __v; }
export function write_buckets(__v: any) { buckets = __v; }
export function write_plans(__v: any) { plans = __v; }
export function write_salesforce(__v: any) { salesforce = __v; }
export function write_myTeam(__v: any) { myTeam = __v; }
export function write_calFilters(__v: any) { calFilters = __v; }
export function write_goals(__v: any) { goals = __v; }
export function write_installers(__v: any) { installers = __v; }
export function write_sections(__v: any) { sections = __v; }
export function write_qualify(__v: any) { qualify = __v; }
export function write_notifyTemplates(__v: any) { notifyTemplates = __v; }
export function write_discounts(__v: any) { discounts = __v; }
export function write_crews(__v: any) { crews = __v; }
export function write_departments(__v: any) { departments = __v; }
export { reduction, pins, write_reduction, write_pins } from "./part-01-x1";

// After every list above is assigned. pack() reads those live bindings, so this cannot move earlier or into a module part-01 imports.
export let snap = pack();

export function write_snap(__v: ReturnType<typeof pack>) {
  snap = __v;
}
