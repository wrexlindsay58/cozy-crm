import { createFileRoute } from "@tanstack/react-router";
import { addSource, useStaff } from "@/features/staff/store";
import { SettingsPage } from "@/features/settings/page";
import { WordList } from "@/features/settings/word-list";

export const Route = createFileRoute("/_app/settings_/sources")({
  component: Page,
});

function Page() {
  const { sources } = useStaff();
  return (
    <SettingsPage title="Sources">
      <WordList items={sources} onAdd={addSource} />
    </SettingsPage>
  );
}
