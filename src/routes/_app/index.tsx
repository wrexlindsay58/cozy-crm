import { createFileRoute } from "@tanstack/react-router";
import { TodayBoard } from "@/components/today-board";

export const Route = createFileRoute("/_app/")({
  validateSearch: (s: Record<string, unknown>): { board?: "sales" } => {
    return s.board === "sales" ? { board: "sales" } : {};
  },
  component: TodayBoard,
});
