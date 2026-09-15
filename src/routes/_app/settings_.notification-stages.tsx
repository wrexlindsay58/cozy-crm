import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/notification-stages")({
  component: () => (
    <SettingsPage title="Notification stages">
      <NamedRows title="Who gets the text" bucket="stages" />
    </SettingsPage>
  ),
});
