import { createFileRoute } from "@tanstack/react-router";
import { addDisposition, useStaff } from "@/features/staff/store";
import { SettingsPage } from "@/features/settings/page";
import { WordList } from "@/features/settings/word-list";

export const Route = createFileRoute("/_app/settings_/dispositions")({
  component: Page,
});

function Page() {
  const { dispositions } = useStaff();
  return (
    <SettingsPage title="Dispositions">
      <WordList items={dispositions} onAdd={addDisposition} />
    </SettingsPage>
  );
}
