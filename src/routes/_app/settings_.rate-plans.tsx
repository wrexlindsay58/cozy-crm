import { createFileRoute } from "@tanstack/react-router";
import { CatalogForm } from "@/features/membership/catalog-form";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/rate-plans")({
  component: () => (
    <SettingsPage title="Membership plans">
      <CatalogForm />
    </SettingsPage>
  ),
});
