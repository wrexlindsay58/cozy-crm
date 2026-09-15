import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/discounts")({
  component: () => (
    <SettingsPage title="Discounts and rebates">
      <div className="space-y-3">
        <NamedRows title="Discounts" bucket="discounts" />
        <NamedRows title="Rebates / subsidies" bucket="rebates" />
      </div>
    </SettingsPage>
  ),
});
