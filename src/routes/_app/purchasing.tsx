import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/purchasing")({
  beforeLoad: () => {
    throw redirect({ to: "/paper", search: { kind: "purchase" } });
  },
});
