import { createFileRoute } from "@tanstack/react-router";
import { CompanyForm } from "@/features/settings/company-form";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/company")({
  component: () => (
    <SettingsPage title="Company">
      <CompanyForm />
    </SettingsPage>
  ),
});
