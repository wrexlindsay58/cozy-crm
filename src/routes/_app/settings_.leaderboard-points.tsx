import { createFileRoute } from "@tanstack/react-router";
import { NamedRows } from "@/features/settings/admin-lists";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/leaderboard-points")({
  component: () => (
    <SettingsPage title="Leaderboard points">
      <NamedRows title="Scoring" bucket="points" />
    </SettingsPage>
  ),
});
