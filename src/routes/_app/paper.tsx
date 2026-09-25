import { createFileRoute } from "@tanstack/react-router";
import { PaperPage } from "@/features/paper/paper-page";
import { PAPER_KINDS, type PaperKind } from "@/features/paper/model";

export const Route = createFileRoute("/_app/paper")({
  validateSearch: (s: Record<string, unknown>): { kind?: PaperKind; job?: string } => {
    const kind = PAPER_KINDS.includes(s.kind as PaperKind) ? (s.kind as PaperKind) : undefined;
    const job = typeof s.job === "string" && s.job ? s.job : undefined;
    return { ...(kind ? { kind } : {}), ...(job ? { job } : {}) };
  },
  component: PaperRoute,
});

function PaperRoute() {
  const { kind, job } = Route.useSearch();
  return <PaperPage initialKind={kind} initialJob={job} />;
}
