import { createFileRoute } from "@tanstack/react-router";
import { PricebookEditor } from "@/features/settings/pricebook-editor";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/pricebook")({
  component: () => (
    <SettingsPage title="Products and pricing">
      <PricebookEditor />
    </SettingsPage>
  ),
});
