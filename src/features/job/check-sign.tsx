import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { SignPad } from "@/features/opportunity/sign-pad";
import { useProposals } from "@/features/opportunity/store";
import { useLead } from "@/features/ops/store";
import { MediaAdd } from "./media-strip";
import { addCheckMedia, signPost, signPre } from "./store";
import type { JobFile } from "./types";

function knownSigner(name: string, names: string[]) {
  const typed = name.trim().toLowerCase();
  if (typed.length < 3) return false;
  return names.some((raw) =>
    raw
      .split(/&|,| and /i)
      .map((part) => part.trim().toLowerCase())
      .filter((part) => part.length > 2)
      .some((part) => part === typed),
  );
}

export function CheckSign({ job, kind }: { job: JobFile; kind: "pre" | "post" }) {
  const check = kind === "pre" ? job.preCheck : job.postCheck;
  const lead = useLead(job.leadId);
  const proposals = useProposals();
  const packet = Object.values(proposals).find((p) => p.personId === job.leadId)?.agreement;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const names = [lead?.name, lead?.secondaryName, packet?.signerName, packet?.coSigner?.name].filter((n): n is string => Boolean(n));
  const other = name.trim().length > 2 && !knownSigner(name, names);
  const ready = name.trim().length > 2 && Boolean(signature) && (!other || relation.trim().length > 2);

  if (check.signedAt) {
    return (
      <div className="mt-3 space-y-3">
        <AckPhotos job={job} kind={kind} />
        <p className="text-sm font-semibold text-up">
          Acknowledged by {check.signedBy}
          {check.relation ? ` · ${check.relation}` : ""} · {check.signedAt}
        </p>
        {check.signature ? <img src={check.signature} alt="Signature" className="h-16 rounded-md border border-line bg-white" /> : null}
      </div>
    );
  }

  function sign() {
    if (!signature) return;
    const input = { name, signature, relation: other ? relation.trim() : undefined };
    if (kind === "pre") signPre(job.jobId, input);
    else signPost(job.jobId, input);
    setOpen(false);
  }

  return (
    <div className="mt-3 space-y-3">
      <AckPhotos job={job} kind={kind} />
      <button type="button" className="h-10 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => setOpen(true)}>
        Acknowledge in person
      </button>
      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 p-4" role="dialog" aria-modal="true">
              <div className="max-h-[92vh] w-full max-w-lg overflow-auto rounded-md bg-card p-5 shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="type-label">{kind === "pre" ? "Pre-install" : "Post-install"}</p>
                    <h2 className="type-section mt-1">Sign in person</h2>
                  </div>
                  <button type="button" aria-label="Close" className="grid size-10 place-items-center text-muted" onClick={() => setOpen(false)}>
                    <X className="size-5" />
                  </button>
                </div>
                <p className="type-body mt-3">This acknowledges the checklist and the photos. The homeowner authorized whoever is at the property for the crew to sign.</p>
                <ul className="mt-3 space-y-1">
                  {check.items.map((item) => (
                    <li key={item.id} className="type-meta">
                      {item.on ? "Done" : "Open"} · {item.label}
                    </li>
                  ))}
                </ul>
                <label className="mt-4 block text-[11px] font-bold tracking-wide text-muted uppercase">
                  Name
                  <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line px-3 text-base font-normal tracking-normal" />
                </label>
                {other ? (
                  <label className="mt-3 block text-[11px] font-bold tracking-wide text-muted uppercase">
                    Relation to the homeowner
                    <input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="Spouse, adult in the home, property manager" className="mt-1 h-11 w-full rounded-md border border-line px-3 text-base font-normal tracking-normal normal-case" />
                  </label>
                ) : null}
                <div className="mt-4">
                  <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Signature</p>
                  <div className="mt-1">
                    <SignPad onChange={setSignature} />
                  </div>
                </div>
                <button type="button" disabled={!ready} className="mt-4 h-12 w-full rounded-md bg-navy text-sm font-semibold text-card disabled:opacity-40" onClick={sign}>
                  Sign acknowledgement
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function AckPhotos({ job, kind }: { job: JobFile; kind: "pre" | "post" }) {
  const photos = (kind === "pre" ? job.preCheck.photos : job.postCheck.photos) ?? [];
  return (
    <div>
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Acknowledgement photos</p>
      {photos.length ? (
        <ul className="mt-2 grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <li key={photo.id}>
              {photo.kind === "photo" ? <img src={photo.url} alt={photo.name} className="h-20 w-full rounded-md border border-line object-cover" /> : <p className="type-meta">{photo.name}</p>}
              <p className="type-meta mt-1 truncate">{photo.name}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="type-meta mt-1">No photos yet.</p>
      )}
      <div className="mt-2">
        <MediaAdd onAdd={(file, meta) => addCheckMedia(job.jobId, kind, file, meta)} />
      </div>
    </div>
  );
}
