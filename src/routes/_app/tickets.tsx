import { createFileRoute } from "@tanstack/react-router";
import { ActionQueue } from "@/features/action/queue";

export const Route = createFileRoute("/_app/tickets")({
  component: ActionsPage,
});

function ActionsPage() {
  return <ActionQueue />;
}
