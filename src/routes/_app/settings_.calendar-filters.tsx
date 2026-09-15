import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/calendar-filters")({
  component: () => (
    <SettingsPage title="Calendar filters and tabs">
      <NamedRows title="Calendar filters and tabs" bucket="calFilters" />
    </SettingsPage>
  ),
});
