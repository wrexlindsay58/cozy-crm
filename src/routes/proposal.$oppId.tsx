import { createFileRoute } from "@tanstack/react-router";
import { Present } from "@/features/opportunity/present";
import { AssessmentReport } from "@/features/opportunity/report";
import { PacketFile } from "@/features/opportunity/packet";
import { SignCeremony } from "@/features/opportunity/sign-ceremony";
import { useProposal } from "@/features/opportunity/store";

export const Route = createFileRoute("/proposal/$oppId")({
  validateSearch: (s: Record<string, unknown>): { mode?: "present"; sign?: string; doc?: "report" | "packet" | "proposal" } => ({
    mode: s.mode === "present" ? "present" : undefined,
    sign: typeof s.sign === "string" ? s.sign : undefined,
    doc: s.doc === "report" || s.doc === "packet" || s.doc === "proposal" ? s.doc : undefined,
  }),
  component: PresentPage,
});

function PresentPage() {
  const { oppId } = Route.useParams();
  const { mode, sign, doc } = Route.useSearch();
  const proposal = useProposal(oppId);
  if (!proposal) return <main className="p-8 text-sm text-muted">Proposal not found.</main>;
  if (sign) {
    const optionId = proposal.agreement?.token === sign ? proposal.agreement.optionId : proposal.accepted ?? proposal.options[0]?.id ?? "";
    return (
      <main className="min-h-dvh bg-page">
        <SignCeremony proposal={proposal} mode="email" optionId={optionId} token={sign} />
      </main>
    );
  }
  if (doc === "report") return <AssessmentReport personId={proposal.personId} closer={proposal.closer} oppId={proposal.oppId} audience={mode === "present" ? "staff" : "customer"} />;
  if (doc === "packet") return <PacketFile proposal={proposal} />;
  return <Present proposal={proposal} mode={mode === "present" ? "present" : "customer"} scope={doc === "proposal" ? "proposal" : "both"} />;
}