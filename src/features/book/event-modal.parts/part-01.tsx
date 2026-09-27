import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { useOps } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import { useJobs } from "@/features/job/store";
import { familyOf, type BookLink, type BookProduct, type BookStatus, type BookType } from "../types";
import { toIso } from "../time";
import { hoursFor as rosterHours } from "../roster";

export const field = "mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-navy";

export const label = "block text-[11px] font-bold tracking-wide text-muted uppercase";

type Repeat = "none" | "daily" | "weekdays" | "weekly";

export function whoFor(t: BookType) {
  const fam = familyOf(t);
  if (fam === "sales") return "sales" as const;
  if (fam === "production" || t === "Materials") return "production" as const;
  return "person" as const;
}

export function seriesStarts(start: string, kind: Repeat, count: number) {
  const out: string[] = [];
  const d = new Date(start);
  while (out.length < Math.max(1, count)) {
    const day = d.getDay();
    if (kind === "weekdays" && (day === 0 || day === 6)) {
      d.setDate(d.getDate() + 1);
      continue;
    }
    out.push(toIso(d));
    if (kind === "none") break;
    d.setDate(d.getDate() + (kind === "weekly" ? 7 : 1));
  }
  return out;
}

export function useEventModal(resources: any, preset: any, event: any, onClose: any) {
  const { leads } = useOps();
  const jobs = useJobs();
  const { actorName: setBy } = useStaff();
  const editing = Boolean(event);
  const clicked = resources.find((r: any) => r.id === (event?.resourceId || preset?.resourceId));
  const [blank, setBlank] = useState(event?.blank ?? false);
  const [type, setType] = useState<BookType>(event?.type && event.type !== "Open" ? event.type : preset?.type ?? (clicked?.kind === "crew" ? "Install" : "Sales"));
  const [status, setStatus] = useState<BookStatus>(event?.status ?? "Confirmed");
  const [assigneeId, setAssigneeId] = useState(event?.assigneeId || (clicked?.kind === "closer" || clicked?.kind === "setter" ? clicked.id : ""));
  const [techId, setTechId] = useState(event?.techId || (clicked?.role === "PM" || clicked?.role === "Owner" ? clicked.id : ""));
  const [crewId, setCrewId] = useState(event?.crewId || (clicked?.kind === "crew" ? clicked.id : ""));
  const [leadId, setLeadId] = useState(event?.personId ?? "");
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState(event?.title ?? "");
  const [length, setLength] = useState(() => {
    if (!event) return familyOf(type) === "production" ? "All day" : "2h";
    const hrs = (new Date(event.end).getTime() - new Date(event.start).getTime()) / 36e5;
    if (hrs >= 7) return "All day";
    if (hrs === 0.5) return "30m";
    return `${hrs}h`;
  });
  const [notes, setNotes] = useState(event?.notes ?? "");
  const [start, setStart] = useState(event?.start ?? preset?.start ?? "");
  const [links, setLinks] = useState<BookLink[]>(event?.links ?? []);
  const [linkDraft, setLinkDraft] = useState("");
  const [products, setProducts] = useState<BookProduct[]>(event?.products ?? []);
  const [sow, setSow] = useState(event?.scope ?? "");
  const [leadSource, setLeadSource] = useState(event?.leadSource ?? "");
  const [repeat, setRepeat] = useState<Repeat>("none");
  const [repeatCount, setRepeatCount] = useState(4);
  const hours = useMemo(() => rosterHours(resources), [resources]);
  const who = whoFor(type);
  const sales = resources.filter((r: any) => r.kind === "closer" || r.kind === "setter" || r.role === "Owner");
  const individuals = resources.filter((r: any) => r.kind !== "crew" && (r.role === "PM" || r.role === "Crew" || r.role === "Owner"));
  const shopPeople = resources.filter((r: any) => r.kind !== "crew");
  const crews = resources.filter((r: any) => r.kind === "crew");
  const lead = leads.find((l) => l.id === leadId);
  const job = Object.values(jobs).find((j) => j.personId === leadId || j.leadId === leadId);
  const hits = query.trim()
    ? leads.filter((l) => `${l.name} ${l.city} ${l.phone} ${l.address}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];
  return { leads, setLeadId, setQuery, setTitle, setLeadSource, setNotes, jobs, setProducts, setSow, setType, setCrewId, setTechId, setAssigneeId, length, who, assigneeId, crewId, techId, type, blank, title, lead, notes, setBy, links, status, leadSource, products, sow, job, editing, repeat, start, repeatCount, setBlank, setStatus, sales, shopPeople, individuals, crews, query, hits, setLength, hours, setStart, setRepeat, setRepeatCount, linkDraft, setLinkDraft, setLinks };
}

export function EventModalView3(props: { bag: { who: any; assigneeId: any; setAssigneeId: any; sales: any; techId: any; setTechId: any; shopPeople: any; individuals: any; crewId: any; setCrewId: any; crews: any } }) {
  const { who, assigneeId, setAssigneeId, sales, techId, setTechId, shopPeople, individuals, crewId, setCrewId, crews } = props.bag;
  return (
    <div className={cn("grid gap-3", who === "production" ? "sm:grid-cols-2" : "")}>
            {who === "sales" ? (
              <label className={label}>
                Sales
                <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={field}>
                  <option value="">None</option>
                  {sales.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {who === "production" || who === "person" ? (
              <label className={label}>
                Person
                <select value={techId} onChange={(e) => setTechId(e.target.value)} className={field}>
                  <option value="">None</option>
                  {(who === "person" ? shopPeople : individuals).map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {who === "production" ? (
              <label className={label}>
                Crew
                <select value={crewId} onChange={(e) => setCrewId(e.target.value)} className={field}>
                  <option value="">None</option>
                  {crews.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
  );
}
