import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/installers")({
  component: () => (
    <SettingsPage title="Installers">
      <NamedRows title="Installers" bucket="installers" />
    </SettingsPage>
  ),
});
