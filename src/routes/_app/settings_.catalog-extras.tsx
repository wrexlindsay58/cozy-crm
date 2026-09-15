import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/catalog-extras")({
  component: () => (
    <SettingsPage title="Catalog extras">
      <div className="space-y-3">
        <NamedRows title="Product types" bucket="productTypes" />
        <NamedRows title="Manufacturers" bucket="makers" />
        <NamedRows title="Utilities" bucket="utilities" />
      </div>
    </SettingsPage>
  ),
});
