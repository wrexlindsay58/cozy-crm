import { createFileRoute } from "@tanstack/react-router";
import { TodayBoard } from "@/components/today-board";

export const Route = createFileRoute("/_app/")({
  component: TodayBoard,
});
