import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/positions")({
  component: () => (
    <SettingsPage title="Positions">
      <NamedRows title="Employee positions" bucket="positions" />
    </SettingsPage>
  ),
});
