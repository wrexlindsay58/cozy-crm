import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";
import { SettingsHub } from "@/features/settings/hub";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsIndex,
});

function SettingsIndex() {
  return (
    <main className="mx-auto max-w-3xl p-4 pb-10 md:p-5">
      <PageHeader kicker="Company" title="Settings" />
      <SettingsHub />
    </main>
  );
}
