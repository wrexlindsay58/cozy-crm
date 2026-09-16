import { createFileRoute } from "@tanstack/react-router";
import { Present } from "@/features/opportunity/present";
import { useProposal } from "@/features/opportunity/store";

export const Route = createFileRoute("/proposal/$oppId")({
  component: PresentPage,
});

function PresentPage() {
  const { oppId } = Route.useParams();
  const proposal = useProposal(oppId);
  if (!proposal) return <main className="p-8 text-sm text-muted">Proposal not found.</main>;
  return <Present proposal={proposal} />;
}
