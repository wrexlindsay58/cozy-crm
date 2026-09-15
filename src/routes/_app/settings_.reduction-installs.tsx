import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/reduction-installs")({
  component: () => (
    <SettingsPage title="Reduction installs">
      <NamedRows title="Reduction installs" bucket="reduction" />
    </SettingsPage>
  ),
});
