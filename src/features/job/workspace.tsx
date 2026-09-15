import { CostingBoard } from "./costing-board";
import { CrewBlock, FinanceBlock, ScopeBlock } from "./crew-finance";
import { Documents } from "./documents";
import { StageBar } from "./stage-bar";
import type { JobFile } from "./store";

export function JobWorkspace({ job, focus }: { job: JobFile; focus?: "co" | "invoice" | null }) {
  return (
    <div className="space-y-3">
      <StageBar job={job} />
      <div className="grid gap-3 lg:grid-cols-2">
        <ScopeBlock job={job} />
        <CrewBlock job={job} />
      </div>
      <CostingBoard job={job} />
      <FinanceBlock job={job} />
      <Documents job={job} focus={focus} />
    </div>
  );
}
