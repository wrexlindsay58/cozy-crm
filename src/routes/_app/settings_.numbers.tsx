import { createFileRoute } from "@tanstack/react-router";
import { NumbersSkin } from "@/features/settings/comms-skins";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/numbers")({
  component: () => (
    <SettingsPage title="From-numbers">
      <p className="mb-3 text-sm text-muted">Skin only. No live Twilio.</p>
      <NumbersSkin />
    </SettingsPage>
  ),
});
