import { createFileRoute } from "@tanstack/react-router";
import { DispatchPage } from "./dispatch.parts/part-01";

export const Route = createFileRoute("/_app/dispatch")({
  component: DispatchPage,
});

export * from "./dispatch.parts/part-01";
export * from "./dispatch.parts/part-02";
export * from "./dispatch.parts/part-03";
export * from "./dispatch.parts/part-04";
export * from "./dispatch.parts/part-05";
export * from "./dispatch.parts/part-06";
