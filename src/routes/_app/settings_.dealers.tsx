import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/dealers")({
  component: () => (
    <SettingsPage title="Dealers">
      <NamedRows title="Shops" bucket="dealers" />
    </SettingsPage>
  ),
});
