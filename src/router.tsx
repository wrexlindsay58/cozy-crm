import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

function RoutePending() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="h-14 shrink-0 border-b border-line bg-card" />
      <div className="min-h-0 flex-1 bg-page" />
    </div>
  );
}

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPendingComponent: RoutePending,
    defaultPendingMs: 200,
    defaultErrorComponent: AppErrorComponent,
  });
}
