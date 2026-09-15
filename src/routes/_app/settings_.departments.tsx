import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/departments")({
  component: () => (
    <SettingsPage title="Departments">
      <NamedRows title="Departments" bucket="departments" />
    </SettingsPage>
  ),
});
