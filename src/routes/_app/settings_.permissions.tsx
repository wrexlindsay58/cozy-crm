import { createFileRoute } from "@tanstack/react-router";
import { PermissionsMatrix } from "@/features/settings/permissions-matrix";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/permissions")({
  component: () => (
    <SettingsPage title="Permissions">
      <PermissionsMatrix />
    </SettingsPage>
  ),
});
