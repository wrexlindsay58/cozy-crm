import { createFileRoute } from "@tanstack/react-router";
import { ROLES } from "@/features/staff/store";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/roles")({
  component: () => (
    <SettingsPage title="Roles">
      <ul className="divide-y divide-line rounded-md border border-line bg-card">
        {ROLES.map((r) => (
          <li key={r} className="px-4 py-3 text-sm font-semibold">
            {r}
          </li>
        ))}
      </ul>
    </SettingsPage>
  ),
});
