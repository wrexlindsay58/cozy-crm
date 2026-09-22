import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/appointments")({
  beforeLoad: () => {
    throw redirect({ to: "/leads" });
  },
});