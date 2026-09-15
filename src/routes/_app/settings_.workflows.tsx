import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/workflows")({
  component: () => (
    <SettingsPage title="Workflows and forms">
      <div className="space-y-3">
        <NamedRows title="Assessment workflows" bucket="workflows" />
        <NamedRows title="Install forms" bucket="forms" />
      </div>
    </SettingsPage>
  ),
});
