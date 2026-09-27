import { upsertItem } from "@/features/catalog/store";
import { flags, dealers, discounts, rebates, extraCosts, productTypes, makers, utilities, taskCats, stages, workflows, forms, crews, positions, points, buckets, plans, salesforce, departments, myTeam, calFilters, goals, installers, sections, qualify, notifyTemplates, reduction, pins, snap, type Row, write_snap, write_flags, write_dealers, write_rebates, write_extraCosts, write_productTypes, write_makers, write_utilities, write_taskCats, write_stages, write_workflows, write_forms, write_positions, write_points, write_buckets, write_plans, write_myTeam, write_calFilters, write_goals, write_installers, write_sections, write_qualify, write_notifyTemplates, write_reduction, write_pins, write_salesforce, write_discounts, write_crews, write_departments } from "./part-01";
import { dealership, listeners, write_dealership } from "./part-02";
import { pack } from "./part-03";

function emit() {
  write_snap(pack());
  listeners.forEach((l) => l());
}

export function toggleFlag(id: string) {
  write_flags(flags.map((f) => (f.id === id ? { ...f, on: !f.on } : f)));
  emit();
}

export function addRow(bucket: keyof ReturnType<typeof pack>, name: string, note: string) {
  const n = name.trim();
  if (!n || bucket === "flags" || bucket === "salesforce") return;
  const list = snap[bucket] as Row[];
  const next = [...list, { id: `${bucket}-${list.length + 1}`, name: n, note: note.trim() }];
  if (bucket === "dealers") write_dealers(next);
  if (bucket === "discounts") write_discounts(next);
  if (bucket === "rebates") {
    write_rebates(next);
    const dollars = Math.abs(Number(note.replace(/[^0-9.]/g, "")) || 0);
    upsertItem({ sku: n.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label: n, sell: -dollars, cost: 0, kind: "discount", rebate: true, rebateWhen: "after", active: true });
  }
  if (bucket === "extraCosts") write_extraCosts(next);
  if (bucket === "productTypes") write_productTypes(next);
  if (bucket === "makers") write_makers(next);
  if (bucket === "utilities") write_utilities(next);
  if (bucket === "taskCats") write_taskCats(next);
  if (bucket === "stages") write_stages(next);
  if (bucket === "workflows") write_workflows(next);
  if (bucket === "forms") write_forms(next);
  if (bucket === "crews") write_crews(next);
  if (bucket === "positions") write_positions(next);
  if (bucket === "points") write_points(next);
  if (bucket === "buckets") write_buckets(next);
  if (bucket === "plans") write_plans(next);
  if (bucket === "departments") write_departments(next);
  if (bucket === "myTeam") write_myTeam(next);
  if (bucket === "calFilters") write_calFilters(next);
  if (bucket === "goals") write_goals(next);
  if (bucket === "installers") write_installers(next);
  if (bucket === "sections") write_sections(next);
  if (bucket === "qualify") write_qualify(next);
  if (bucket === "notifyTemplates") write_notifyTemplates(next);
  if (bucket === "reduction") write_reduction(next);
  if (bucket === "pins") write_pins(next);
  if (bucket === "dealership") write_dealership(next);
  emit();
}

export function setSalesforce(org: string, on: boolean) {
  write_salesforce({ org, on });
  emit();
}
