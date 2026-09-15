import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/my-team")({
  component: () => (
    <SettingsPage title="My team">
      <NamedRows title="My team" bucket="myTeam" />
    </SettingsPage>
  ),
});
