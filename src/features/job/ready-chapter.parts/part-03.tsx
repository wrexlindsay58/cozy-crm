import { Check as CheckIcon, Plus } from "lucide-react";
import { addSurveyRoom, attachPlanFile, patchSurveyRoom, skipSurvey } from "../store";
import { cn } from "@/lib/cn";
import { FillField, FillRow, FILL_IN, SEC_HEAD } from "../fill-row";

export function Check({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-10 items-center gap-1.5 text-[12px] font-semibold">
      <span className={cn("grid size-5 place-items-center rounded-sm border", on ? "border-navy bg-navy text-card" : "border-line")}>{on ? <CheckIcon className="size-3.5" strokeWidth={2.5} /> : null}</span>
      {label}
    </button>
  );
}

export function SurveyCardView(props: { bag: { rooms: any; job: any; id: any } }) {
  const { rooms, job, id } = props.bag;
  return (
    <div>
          <p className={SEC_HEAD}>Rooms and registers</p>
          <ul className="mt-2 space-y-2">
            {(rooms ?? []).map((r: any) => (
              <li key={r.id}>
                <FillRow>
                  <FillField label="Room">
                    <input value={r.name} onChange={(e) => patchSurveyRoom(job.jobId, id, r.id, { name: e.target.value })} className={FILL_IN} />
                  </FillField>
                  <FillField label="Area (sqft)">
                    <input value={r.area} onChange={(e) => patchSurveyRoom(job.jobId, id, r.id, { area: e.target.value })} className={FILL_IN} />
                  </FillField>
                  <FillField label="Registers">
                    <input value={r.registers} onChange={(e) => patchSurveyRoom(job.jobId, id, r.id, { registers: e.target.value })} className={FILL_IN} />
                  </FillField>
                </FillRow>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => addSurveyRoom(job.jobId, id)} className="mt-2 inline-flex h-8 items-center gap-1 rounded-md border border-line px-2 text-[12px] font-semibold">
            <Plus className="size-3.5" />
            Add room
          </button>
        </div>
  );
}

export function SurveyCardView2(props: { bag: { job: any; id: any; why: any; setWhy: any; setSkipOpen: any } }) {
  const { job, id, why, setWhy, setSkipOpen } = props.bag;
  return (
    <form
            className="mt-3 flex min-w-0 flex-wrap items-end gap-2 border-t border-line pt-3"
            onSubmit={(e) => {
              e.preventDefault();
              skipSurvey(job.jobId, id, why);
              setWhy("");
              setSkipOpen(false);
            }}
          >
            <FillField label="Why we're skipping" className="min-w-0 flex-1">
              <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Need a real reason" className={FILL_IN} />
            </FillField>
            <button type="submit" disabled={!why.trim()} className="h-10 rounded-md border border-line px-3 text-sm font-semibold disabled:opacity-40">
              Skip survey
            </button>
          </form>
  );
}

export function SurveyCardView3(props: { bag: { job: any; id: any; planFile: any } }) {
  const { job, id, planFile } = props.bag;
  return (
    <div className="mt-3 border-t border-line pt-3">
          <p className={SEC_HEAD}>Design file</p>
          <label className="mt-1.5 inline-flex h-8 cursor-pointer items-center rounded-md border border-line px-2 text-[12px] font-semibold">
            Upload
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) attachPlanFile(job.jobId, id, f);
                e.target.value = "";
              }}
            />
          </label>
          {planFile ? <p className="mt-1 truncate text-[12px] text-navy">{planFile}</p> : <p className="mt-1 text-[12px] text-muted">No file yet.</p>}
        </div>
  );
}
