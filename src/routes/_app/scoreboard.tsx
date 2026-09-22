import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/scoreboard")({
  beforeLoad: () => {
    throw redirect({ to: "/", search: { board: "sales" } });
  },
});
