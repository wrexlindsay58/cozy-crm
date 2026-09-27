import { useState } from "react";
import { Trash2 } from "lucide-react";
import { canOverrideFee, useStaff } from "@/features/staff/store";
import { postVisit, amendVisit, dropVisit, patchVisit } from "../store";
import type { MembershipFile, MemberVisit } from "../types";
import { posted, HOURS } from "./part-01";
import { VisitLedger } from "./part-03";
import { VisitCardView4 } from "./part-06";

export function VisitCard({
  file,
  visit,
  techs,
  included,
  onCharge,
}: {
  file: MembershipFile;
  visit: MemberVisit;
  techs: string[];
  included: boolean;
  onCharge: (repair: MemberVisit["repairs"][number]) => void;
}) {
  useStaff();
  const admin = canOverrideFee();
  const isPosted = posted(visit);
  const [changing, setChanging] = useState(false);
  const [draft, setDraft] = useState<MemberVisit | null>(null);
  const [why, setWhy] = useState("");
  const [miss, setMiss] = useState("");
  const source = changing && draft ? draft : visit;
  const techOptions = techs.includes(source.tech) || !source.tech ? techs : [source.tech, ...techs];
  const hours = source.time && !HOURS.includes(source.time) ? [source.time, ...HOURS] : HOURS;
  const paid = source.repairs.some((repair) => repair.status === "Paid");

  function startChange() {
    setDraft({
      ...visit,
      checks: (visit.checks ?? []).map((check) => ({ ...check })),
      parts: visit.parts.map((part) => ({ ...part })),
      repairs: visit.repairs.map((repair) => ({ ...repair })),
    });
    setWhy("");
    setMiss("");
    setChanging(true);
  }

  function write(patch: Partial<Pick<MemberVisit, "on" | "time" | "tech" | "did" | "customerNote" | "serviceNote" | "failing">>) {
    if (changing && draft) setDraft({ ...draft, ...patch });
    else patchVisit(file.id, visit.id, patch);
  }

  if (isPosted && !changing) {
    return <VisitLedger file={file} visit={visit} included={included} onChange={admin ? startChange : undefined} onCharge={onCharge} />;
  }

  return (
    <VisitCardView4 bag={{ source, changing, visit, included, write, hours, techOptions, draft, setDraft, file, onCharge, why, setWhy, setMiss, setChanging, paid, miss }} />
  );
}

export function VisitCardView3(props: { bag: { changing: any; draft: any; file: any; visit: any; why: any; setMiss: any; setChanging: any; setDraft: any; paid: any } }) {
  const { changing, draft, file, visit, why, setMiss, setChanging, setDraft, paid } = props.bag;
  return (
    <div className="flex flex-wrap items-center gap-3">
        {changing ? (
          <button
            type="button"
            className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card"
            onClick={() => {
              if (!draft) return;
              const result = amendVisit(file.id, visit.id, why, {
                on: draft.on,
                time: draft.time,
                tech: draft.tech,
                did: draft.did,
                customerNote: draft.customerNote,
                serviceNote: draft.serviceNote,
                failing: draft.failing,
                checks: draft.checks,
                parts: draft.parts,
                repairs: draft.repairs,
              });
              setMiss(result === "why" ? "The reason stays on the record." : result === "admin" ? "Only an admin can change a posted visit." : result === "ok" ? "" : "Date and tech are required.");
              if (result === "ok") {
                setChanging(false);
                setDraft(null);
              }
            }}
          >
            Save
          </button>
        ) : (
          <button
            type="button"
            className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card"
            onClick={() => {
              const result = postVisit(file.id, visit.id);
              setMiss(result === "tech" ? "A tech has to be on the visit before it can be posted." : result === "ok" ? "" : "The date is required.");
            }}
          >
            Post
          </button>
        )}
        {!changing && !paid ? (
          <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-muted" onClick={() => dropVisit(file.id, visit.id)}>
            <Trash2 className="h-4 w-4" />
            Remove visit
          </button>
        ) : null}
        {changing ? (
          <button type="button" className="text-sm font-semibold text-muted" onClick={() => { setChanging(false); setDraft(null); setMiss(""); }}>
            Cancel
          </button>
        ) : null}
      </div>
  );
}
