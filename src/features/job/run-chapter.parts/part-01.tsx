import { useState } from "react";
import { addPunch, addScopeMedia, crewsOnJob, setCheckCallout, setEquip, togglePost, togglePre, togglePunch, type JobFile } from "../store";
import { catFromTag, isAccepted, punchHours } from "../types";
import { CheckSign } from "../check-sign";
import { CheckLine } from "../callouts";
import { profileById } from "../profiles";
import { cn } from "@/lib/cn";
import { JobCard } from "../job-card";
import { FillField, FillRow, FILL_IN } from "../fill-row";
import { MediaStrip } from "../media-strip";
import { Brought, Issues, FieldChange } from "./part-02";
import { FieldExtras } from "./part-03";
import { RunChapterView } from "./part-04";

export function RunChapter({ job }: { job: JobFile }) {
  const est = job.scope.reduce((s, r) => s + r.estHours, 0);
  const actual = job.punches.reduce((s, p) => s + punchHours(p).total, 0);
  const crews = crewsOnJob(job);
  const [crew, setCrew] = useState(crews[0] || "");
  const day = job.assignments.find((a) => a.crew === crew)?.day || job.events[0]?.day || "";
  const [item, setItem] = useState("");
  const products = job.scope.filter((s) => s.kind === "product");
  const photoProducts = products;
  const closed = job.punches.length > 0 && job.punches.every((p) => p.back);
  const needsSerial = products.some((s) => profileById(s.categoryId)?.needsSerial);
  const accepted = isAccepted(job);

  return (
    <div className="space-y-2">
      {!accepted ? <p className="rounded-md border border-line bg-card px-4 py-3 text-sm">Acceptance is still open. The crew does not roll until the office accepts the job.</p> : null}
      <Walk job={job} kind="pre" title="Pre-install walk" locked={!accepted} />
      <RunChapterView bag={{ closed, est, actual, job, accepted, day, crew, setCrew, crews }} />
      <Brought job={job} locked={!accepted} />
      {photoProducts.map((line) => (
        <JobCard key={line.id} kicker="Photos" title={line.label}>
          <MediaStrip
            files={line.media.filter((m) => m.cat === "Before" || m.cat === "During" || m.cat === "After" || m.purpose === "Pre-install")}
            onAdd={(f, meta) => {
              if (!accepted) return;
              addScopeMedia(job.jobId, line.id, f, catFromTag(meta.tag), { caption: meta.caption, purpose: meta.tag, name: meta.name });
            }}
            label="Install photos"
          />
        </JobCard>
      ))}

      {needsSerial ? (
        <JobCard kicker="Equipment" title="Serials">
          <ul className="space-y-2">
            {job.equipment.map((e) => (
              <li key={e.id}>
                <FillRow>
                  <FillField label="Unit">
                    <p className="flex h-10 items-center text-sm font-semibold normal-case tracking-normal">{e.name}</p>
                  </FillField>
                  <FillField label="Serial">
                    <input disabled={!accepted} value={e.serial} onChange={(ev) => setEquip(job.jobId, e.id, { serial: ev.target.value })} className={FILL_IN} />
                  </FillField>
                  <FillField label="AHRI">
                    <input disabled={!accepted} value={e.ahri} onChange={(ev) => setEquip(job.jobId, e.id, { ahri: ev.target.value })} className={FILL_IN} />
                  </FillField>
                </FillRow>
              </li>
            ))}
          </ul>
        </JobCard>
      ) : null}

      <Walk job={job} kind="post" title="Post-install walk" locked={!accepted} />

      <JobCard kicker="Punch" title="Open items" done={job.punch.length > 0 && job.punch.every((p) => p.status === "Done")}>
        <ul>
          {job.punch.map((p) => (
            <li key={p.id}>
              <button type="button" disabled={!accepted} onClick={() => togglePunch(job.jobId, p.id)} className={cn("flex h-10 w-full items-center justify-between text-left text-sm disabled:opacity-40", p.status === "Done" && "text-muted line-through")}>
                {p.item}
                <span className="text-[11px] font-bold uppercase">{p.status}</span>
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!accepted || !item.trim()) return;
            addPunch(job.jobId, item);
            setItem("");
          }}
        >
          <input disabled={!accepted} value={item} onChange={(e) => setItem(e.target.value)} placeholder="What’s left" className={cn(FILL_IN, "flex-1")} />
          <button type="submit" disabled={!accepted || !item.trim()} className="h-10 shrink-0 rounded-md border border-line px-3 text-sm font-semibold disabled:opacity-40">
            Add
          </button>
        </form>
      </JobCard>

      <FieldExtras job={job} locked={!accepted} />
      <Issues job={job} locked={!accepted} />
      <FieldChange job={job} locked={!accepted} />
    </div>
  );
}

export function labelDay(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso || "No date";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function Walk({ job, kind, title, locked }: { job: JobFile; kind: "pre" | "post"; title: string; locked?: boolean }) {
  const check = kind === "pre" ? job.preCheck : job.postCheck;
  return (
    <JobCard kicker={kind === "pre" ? "Start" : "End"} title={title} aside={check.signedAt ? `Signed ${check.signedBy}` : "Open"} done={Boolean(check.signedAt)}>
      <ul>
        {check.items.map((i) => (
          <CheckLine
            key={i.id}
            label={i.label}
            on={i.on}
            who={i.by}
            callout={i.callout}
            onToggle={() => {
              if (locked) return;
              if (kind === "pre") togglePre(job.jobId, i.id);
              else togglePost(job.jobId, i.id);
            }}
            onCallout={(v) => {
              if (locked) return;
              setCheckCallout(job.jobId, kind, i.id, v);
            }}
          />
        ))}
      </ul>
      <CheckSign job={job} kind={kind} locked={locked} />
    </JobCard>
  );
}
