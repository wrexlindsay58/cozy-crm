import { createFileRoute } from "@tanstack/react-router";
import { FlagList } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/general")({
  component: () => (
    <SettingsPage title="General">
      <FlagList />
    </SettingsPage>
  ),
});
