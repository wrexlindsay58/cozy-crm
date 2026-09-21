import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/sections")({
  component: () => (
    <SettingsPage title="File sections">
      <div className="space-y-3">
        <NamedRows title="File sections" bucket="sections" />
        <NamedRows title="Qualifying questions" bucket="qualify" />
      </div>
    </SettingsPage>
  ),
});
