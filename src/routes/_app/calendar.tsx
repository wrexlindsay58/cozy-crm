import { createFileRoute } from "@tanstack/react-router";
import { CalendarPage } from "./calendar.parts/part-01";

export const Route = createFileRoute("/_app/calendar")({
  component: CalendarPage,
});

export * from "./calendar.parts/part-01";
export * from "./calendar.parts/part-02";
export * from "./calendar.parts/part-03";
