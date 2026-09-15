import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/buckets")({
  component: () => (
    <SettingsPage title="Pipeline buckets">
      <NamedRows title="Buckets" bucket="buckets" />
    </SettingsPage>
  ),
});
