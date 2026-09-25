import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/invoices")({
  beforeLoad: () => {
    throw redirect({ to: "/paper", search: { kind: "invoice" } });
  },
});
