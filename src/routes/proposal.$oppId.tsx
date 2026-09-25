import { createFileRoute } from "@tanstack/react-router";
import { Present } from "@/features/opportunity/present";
import { SignCeremony } from "@/features/opportunity/sign-ceremony";
import { useProposal } from "@/features/opportunity/store";

export const Route = createFileRoute("/proposal/$oppId")({
  validateSearch: (s: Record<string, unknown>): { mode?: "present"; sign?: string } => ({
    mode: s.mode === "present" ? "present" : undefined,
    sign: typeof s.sign === "string" ? s.sign : undefined,
  }),
  component: PresentPage,
});

function PresentPage() {
  const { oppId } = Route.useParams();
  const { mode, sign } = Route.useSearch();
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
  return <Present proposal={proposal} mode={mode === "present" ? "present" : "customer"} />;
}