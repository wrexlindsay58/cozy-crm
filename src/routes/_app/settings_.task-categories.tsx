import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/task-categories")({
  component: () => (
    <SettingsPage title="Task categories">
      <NamedRows title="Task types" bucket="taskCats" />
    </SettingsPage>
  ),
});
