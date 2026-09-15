import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/rate-plans")({
  component: () => (
    <SettingsPage title="Membership plans">
      <NamedRows title="Rate plans" bucket="plans" />
    </SettingsPage>
  ),
});
