import { createFileRoute } from "@tanstack/react-router";
import { TemplatesList } from "@/features/settings/comms-skins";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/templates")({
  component: () => (
    <SettingsPage title="Document templates">
      <TemplatesList />
    </SettingsPage>
  ),
});
