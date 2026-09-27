import { Plus, Trash2 } from "lucide-react";
import { addVisitPart, dropVisitPart, patchVisitPart } from "../store";
import type { MembershipFile, MemberVisit } from "../types";

export const field = "h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";

export const line = "h-10 min-w-0 rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";

export function clock(time: string) {
  const [h, m] = time.split(":").map(Number);
  if (!h && h !== 0) return time;
  const hour = h % 12 || 12;
  return `${hour}:${String(m || 0).padStart(2, "0")}${h >= 12 ? "p" : "a"}`;
}

export function includedIds(visits: MemberVisit[], perYear: number) {
  const byYear = new Map<number, MemberVisit[]>();
  for (const visit of [...visits].sort((a, b) => a.on.localeCompare(b.on))) {
    const year = Number(visit.on.slice(0, 4));
    const list = byYear.get(year) ?? [];
    list.push(visit);
    byYear.set(year, list);
  }
  const ids = new Set<string>();
  for (const list of byYear.values()) list.slice(0, perYear).forEach((visit) => ids.add(visit.id));
  return ids;
}

export function showDay(on: string) {
  const [y, m, d] = on.split("-").map(Number);
  if (!y || !m || !d) return on;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function posted(visit: MemberVisit) {
  return visit.status !== "Set" && visit.status !== "Open";
}

export function visitDue(file: MembershipFile) {
  if (file.status !== "Active" && file.status !== "Continued") return false;
  const year = new Date().getFullYear();
  const visits = file.visits ?? [];
  const done = visits.filter((visit) => Number(visit.on.slice(0, 4)) === year && posted(visit)).length;
  const set = visits.filter((visit) => Number(visit.on.slice(0, 4)) === year && visit.status === "Set").length;
  return done + set < file.visitsPerYear;
}

export function openVisitRepairs(file: MembershipFile) {
  return (file.visits ?? []).flatMap((visit) => {
    if (!posted(visit)) return [];
    return visit.repairs.filter((repair) => repair.status === "Open" && !repair.covered).map((repair) => ({ on: visit.on, repair }));
  });
}

export function visitsDone(file: MembershipFile) {
  const year = new Date().getFullYear();
  const visits = file.visits ?? [];
  const used = visits.filter((visit) => Number(visit.on.slice(0, 4)) === year && posted(visit)).length;
  const open = visits.some((visit) => posted(visit) && visit.repairs.some((repair) => repair.status === "Open" && !repair.covered));
  return (file.status === "Active" || file.status === "Continued") && used >= file.visitsPerYear && !open;
}

export function visitMark(visit: MemberVisit, included: boolean) {
  if (visit.status === "Set") return "On the book";
  if (visit.status === "Open") return "Not posted";
  return included ? "Included" : "Extra";
}

export const HOURS = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

export function VisitCardView2(props: { bag: { changing: any; draft: any; setDraft: any; file: any; visit: any; source: any } }) {
  const { changing, draft, setDraft, file, visit, source } = props.bag;
  return (
    <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="type-label">Used</p>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1 text-sm font-semibold text-navy"
            onClick={() => {
              if (changing && draft) setDraft({ ...draft, parts: [...draft.parts, { id: `VP-${Date.now()}`, name: "", qty: 1 }] });
              else addVisitPart(file.id, visit.id);
            }}
          >
            <Plus className="h-4 w-4" />
            Part
          </button>
        </div>
        <ul className="space-y-2">
          {source.parts.map((part: any) => (
            <li key={part.id} className="flex items-center gap-2">
              <input
                value={part.name}
                placeholder="Part"
                aria-label="Part"
                onChange={(e) => {
                  const name = e.target.value;
                  if (changing && draft) setDraft({ ...draft, parts: draft.parts.map((row: any) => (row.id === part.id ? { ...row, name } : row)) });
                  else patchVisitPart(file.id, visit.id, part.id, { name });
                }}
                className={`${line} flex-1`}
              />
              <input
                value={part.qty}
                inputMode="numeric"
                aria-label="Quantity"
                onChange={(e) => {
                  const qty = Math.max(1, Number(e.target.value) || 1);
                  if (changing && draft) setDraft({ ...draft, parts: draft.parts.map((row: any) => (row.id === part.id ? { ...row, qty } : row)) });
                  else patchVisitPart(file.id, visit.id, part.id, { qty });
                }}
                className={`${line} w-16 shrink-0 text-center`}
              />
              <button
                type="button"
                aria-label="Remove part"
                className="grid h-10 w-10 shrink-0 place-items-center text-muted"
                onClick={() => {
                  if (changing && draft) setDraft({ ...draft, parts: draft.parts.filter((row: any) => row.id !== part.id) });
                  else dropVisitPart(file.id, visit.id, part.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
  );
}
