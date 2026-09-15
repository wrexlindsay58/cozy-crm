import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/goals")({
  component: () => (
    <SettingsPage title="Goals">
      <NamedRows title="Goals" bucket="goals" />
    </SettingsPage>
  ),
});
