import { createFileRoute } from "@tanstack/react-router";
import { Leaderboard } from "@/features/leaderboard/board";

export const Route = createFileRoute("/_app/leaderboard")({
  component: Leaderboard,
});
