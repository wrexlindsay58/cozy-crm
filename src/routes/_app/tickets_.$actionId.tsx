import { createFileRoute } from "@tanstack/react-router";
import { ActionQueue } from "@/features/action/queue";

export const Route = createFileRoute("/_app/tickets_/$actionId")({ component: ActionFile });

function ActionFile() {
  const { actionId } = Route.useParams();
  return <ActionQueue selectedId={actionId} />;
}
