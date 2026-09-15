import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/pins")({
  component: () => (
    <SettingsPage title="Canvass pins">
      <NamedRows title="Canvass pins" bucket="pins" />
    </SettingsPage>
  ),
});
