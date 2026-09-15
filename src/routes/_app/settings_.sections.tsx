import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/sections")({
  component: () => (
    <SettingsPage title="File sections">
      <NamedRows title="File sections" bucket="sections" />
    </SettingsPage>
  ),
});
