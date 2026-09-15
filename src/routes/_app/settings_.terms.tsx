import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/features/settings/page";
import { TermsList } from "@/features/settings/terms-list";

export const Route = createFileRoute("/_app/settings_/terms")({
  component: () => (
    <SettingsPage title="Payment terms">
      <TermsList />
    </SettingsPage>
  ),
});
