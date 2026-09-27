import { useAccount } from "@/features/account/store";
import { canSeeCost } from "@/features/staff/store";
import { opportunities } from "@/lib/crm-data";
import { useProposals } from "@/features/opportunity/store";
import { Bits } from "@/features/record-shell/file-sheet";
import type { JobFile } from "@/features/job/types";
import { JobRecordView6 } from "./part-04";

export function when(job: JobFile) {
  return job.window.split("·")[0]?.trim() || job.window || "Job";
}

export function shortDay(raw: string) {
  if (!raw) return "";
  if (!raw.includes("-")) return raw;
  const d = new Date(`${raw}T12:00:00`);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function clock(raw: string) {
  const [h, m] = raw.split(":").map(Number);
  if (Number.isNaN(h)) return raw;
  const hr = h % 12 || 12;
  return `${hr}:${String(m || 0).padStart(2, "0")}${h < 12 ? "a" : "p"}`;
}

function mins(raw: string) {
  const [h, m] = raw.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  return h * 60 + (m || 0);
}

export function span(from: string, to: string) {
  const a = mins(from);
  const b = mins(to);
  if (a == null || b == null || b < a) return "";
  const d = b - a;
  const h = Math.floor(d / 60);
  const m = d % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

export function dur(min: number) {
  if (min <= 0) return "0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

export function JobRecord({ job }: { job: JobFile }) {
  const costs = canSeeCost();
  const account = useAccount(job.accountId);
  const proposals = useProposals();
  const opp = opportunities.find((o) => o.leadId === job.leadId);
  const proposal = opp ? proposals[opp.id] : undefined;
  const customerInvoices = job.invoices.filter((i) => costs || (i.party !== "pay" && i.kind !== "Commission" && i.kind !== "Piece"));
  const start = job.assignments.reduce((min, a) => (min && a.start > min ? min : a.start), job.assignments[0]?.start ?? "");
  const finish = job.assignments.reduce((max, a) => (a.end > max ? a.end : max), job.assignments[0]?.end ?? "");
  const onSite = job.assignments[0]?.day ? shortDay(job.assignments[0].day) : when(job);
  const materials = job.scope.flatMap((s) => s.bom.map((b) => ({ ...b, scope: s.label })));
  const qcDone = job.checks.length > 0 && job.checks.every((c) => c.on);
  const estHours = job.scope.reduce((s, line) => s + (line.estHours || 0), 0);
  const travelMin = job.punches.reduce((s, p) => s + (mins(p.onSite) != null && mins(p.leftYard) != null ? (mins(p.onSite)! - mins(p.leftYard)!) : 0) + (mins(p.back) != null && mins(p.complete) != null ? (mins(p.back)! - mins(p.complete)!) : 0), 0);
  const siteMin = job.punches.reduce((s, p) => s + (mins(p.complete) != null && mins(p.onSite) != null ? mins(p.complete)! - mins(p.onSite)! : 0), 0);
  const jobMin = job.punches.reduce((s, p) => s + (mins(p.back) != null && mins(p.leftYard) != null ? mins(p.back)! - mins(p.leftYard)! : 0), 0);

  return (
    <JobRecordView6 bag={{ job, onSite, start, finish, account, siteMin, travelMin, jobMin, estHours, proposal, materials, qcDone, customerInvoices }} />
  );
}

export function CheckList({
  title,
  signedAt,
  signedBy,
  relation,
  signature,
  photos,
  items,
}: {
  title: string;
  signedAt: string;
  signedBy: string;
  relation?: string;
  signature?: string;
  photos?: { id: string; name: string; url: string; kind: string }[];
  items: { id: string; label: string; on: boolean; callout?: string }[];
}) {
  return (
    <div className="rounded-md bg-page px-4 py-4">
      <p className="type-group">{title}</p>
      <Bits items={[{ label: "Signed", value: signedAt || "Not signed" }, { label: "By", value: signedBy || "—" }, ...(relation ? [{ label: "Relation", value: relation }] : [])]} />
      {signature ? <img src={signature} alt="Signature" className="mt-3 h-16 rounded-md border border-line bg-white" /> : null}
      {photos?.length ? (
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <li key={photo.id}>
              {photo.kind === "photo" ? <img src={photo.url} alt={photo.name} className="h-16 w-full rounded-md border border-line object-cover" /> : <p className="type-meta">{photo.name}</p>}
            </li>
          ))}
        </ul>
      ) : null}
      <ul className="mt-3 space-y-2">
        {items.map((i) => (
          <li key={i.id}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="type-body">{i.label}</span>
              <span className={i.on ? "type-value text-up" : "type-meta"}>{i.on ? "Done" : "Open"}</span>
            </div>
            {i.callout ? <p className="type-meta mt-0.5">{i.callout}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
