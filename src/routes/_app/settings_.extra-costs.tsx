import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/extra-costs")({
  component: () => (
    <SettingsPage title="Additional costs">
      <NamedRows title="Pass-throughs" bucket="extraCosts" />
    </SettingsPage>
  ),
});
