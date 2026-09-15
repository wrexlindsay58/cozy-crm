import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/dealership")({
  component: () => (
    <SettingsPage title="Dealership profile">
      <NamedRows title="Dealership profile" bucket="dealership" />
    </SettingsPage>
  ),
});
