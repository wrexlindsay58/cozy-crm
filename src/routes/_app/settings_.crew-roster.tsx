import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/crew-roster")({
  component: () => (
    <SettingsPage title="Crew roster">
      <NamedRows title="Trucks" bucket="crews" />
    </SettingsPage>
  ),
});
