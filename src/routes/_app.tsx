import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { readDock } from "@/lib/dock";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => ({ dock: await readDock() }),
  component: function AppLayout() {
    const { dock } = Route.useRouteContext();
    return (
      <AppShell dock={dock}>
        <Outlet />
      </AppShell>
    );
  },
});
