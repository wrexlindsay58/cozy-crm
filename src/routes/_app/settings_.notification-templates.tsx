import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/notification-templates")({
  component: () => (
    <SettingsPage title="Notification templates">
      <NamedRows title="Notification templates" bucket="notifyTemplates" />
    </SettingsPage>
  ),
});
