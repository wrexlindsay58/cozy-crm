import { createFileRoute } from "@tanstack/react-router";
import { PeopleList } from "@/features/settings/people-list";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/people")({
  component: () => (
    <SettingsPage title="People">
      <PeopleList />
    </SettingsPage>
  ),
});
