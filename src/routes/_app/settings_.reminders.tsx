import { createFileRoute } from "@tanstack/react-router";
import { ReminderSkin } from "@/features/settings/comms-skins";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/reminders")({
  component: () => (
    <SettingsPage title="Reminders">
      <ReminderSkin />
    </SettingsPage>
  ),
});
