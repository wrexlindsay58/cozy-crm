import { PacketList } from "./packets";
import { completeAssessment } from "./store";
import type { Assessment as File } from "./types";

export function AssessmentWorkspace({ file }: { file: File }) {
  return (
    <div className="space-y-3">
      <section className="rounded-md border border-line bg-card p-4">
        <h2 className="mb-2 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Site</h2>
        <p className="text-sm">{file.address}</p>
        <p className="text-sm text-muted">{file.status}</p>
        {file.status === "Open" ? (
          <button type="button" onClick={() => completeAssessment(file.id)} className="mt-3 h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">
            Complete assessment
          </button>
        ) : (
          <p className="mt-3 text-sm font-semibold text-up">Complete · Opportunity {file.oppId}</p>
        )}
      </section>
      <PacketList file={file} />
    </div>
  );
}
export { completeAssessment };
