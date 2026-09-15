import { createFileRoute } from "@tanstack/react-router";
import { Conversations } from "@/components/conversations";

export const Route = createFileRoute("/_app/conversations")({
  component: Conversations,
});
