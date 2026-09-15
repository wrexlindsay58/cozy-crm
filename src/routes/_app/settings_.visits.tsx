import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/features/settings/page";
import { VisitsForm } from "@/features/settings/visits-form";

export const Route = createFileRoute("/_app/settings_/visits")({
  component: () => (
    <SettingsPage title="Visits and memberships">
      <VisitsForm />
    </SettingsPage>
  ),
});
