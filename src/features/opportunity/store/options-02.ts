import { proposals, write_proposals, emit } from "./core";
import { linesFrom, lineKey } from "./seed";
import type { OptCard } from "./types";
import { optionTotal } from "./options";
import { voided, withAgreement } from "./present";
import { addHistory } from "@/features/ops/store";
import { PACKAGES, type PackageId } from "../packages";
import { actingName } from "@/features/staff/store";
import { money } from "@/lib/crm-data";

export function addOption(oppId: string, pkg?: PackageId) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  const letters = "ABCDEFGH";
  const id = letters[p.options.length] ?? `O${p.options.length + 1}`;
  const pack = pkg ? PACKAGES.find((x) => x.id === pkg) : undefined;
  const lines = pack ? linesFrom([...pack.skus]) : [];
  const next: OptCard = { id, name: pack?.label ?? `Option ${id}`, lines };
  write_proposals({ ...proposals, [oppId]: { ...p, options: [...p.options, next] } });
  emit();
}

export function applyPackage(oppId: string, optId: string, pkg: PackageId) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  const pack = PACKAGES.find((x) => x.id === pkg);
  if (!pack) return;
  const lines = linesFrom([...pack.skus]);
  write_proposals({
    ...proposals,
    [oppId]: {
      ...p,
      options: p.options.map((o) => (o.id === optId ? { ...o, name: pack.label, lines } : o)),
    },
  });
  emit();
}

export function removeOption(oppId: string, optId: string) {
  const p = proposals[oppId];
  if (!p || p.accepted || p.options.length < 2) return;
  write_proposals({ ...proposals, [oppId]: { ...p, options: p.options.filter((o) => o.id !== optId) } });
  emit();
}

export function renameOption(oppId: string, optId: string, name: string) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  write_proposals({ ...proposals, [oppId]: { ...p, options: p.options.map((o) => (o.id === optId ? { ...o, name } : o)) } });
  emit();
}

export function toggleLine(oppId: string, optId: string, sku: string) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  write_proposals({
    ...proposals,
    [oppId]: {
      ...p,
      options: p.options.map((o) => (o.id === optId ? { ...o, lines: o.lines.map((l) => (l.sku === sku ? { ...l, on: !l.on } : l)) } : o)),
    },
  });
  emit();
}

export function setQty(oppId: string, optId: string, sku: string, qty: number) {
  const p = proposals[oppId];
  if (!p || p.accepted) return;
  const next = Math.max(1, Math.min(99, qty));
  write_proposals({
    ...proposals,
    [oppId]: {
      ...p,
      options: p.options.map((o) => (o.id === optId ? { ...o, lines: o.lines.map((l) => (lineKey(l) === sku ? { ...l, qty: next } : l)) } : o)),
    },
  });
  emit();
}

export function acceptOption(oppId: string, optId: string) {
  const p = proposals[oppId];
  if (!p) return;
  const opt = p.options.find((o) => o.id === optId);
  if (!opt) return;
  write_proposals({ ...proposals, [oppId]: { ...p, accepted: optId } });
  addHistory(p.personId, actingName(), `Accepted ${opt.name} at ${money(optionTotal(opt))}.`);
  emit();
}

export function unacceptOption(oppId: string) {
  const p = proposals[oppId];
  if (!p || !p.accepted) return;
  const agreement = p.agreement && p.agreement.status !== "Void" ? voided(p.agreement, p.closer, "The accepted option was taken back.") : p.agreement;
  write_proposals({ ...proposals, [oppId]: agreement ? withAgreement(p, agreement, { accepted: undefined, signStatus: agreement.status === "Void" ? "Void" : "—" }) : { ...p, accepted: undefined, signStatus: "—" } });
  addHistory(p.personId, actingName(), "Undid the accepted option.");
  emit();
}

export function setPayPick(oppId: string, offerId: string, term?: number, apr?: number) {
  const p = proposals[oppId];
  if (!p) return;
  write_proposals({ ...proposals, [oppId]: { ...p, payPick: { offerId, term, apr } } });
  emit();
}
