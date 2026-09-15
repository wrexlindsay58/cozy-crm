import { createFileRoute } from "@tanstack/react-router";
import { AssessmentCategorySettings } from "@/features/assessment/category-settings";
import { SettingsPage } from "@/features/settings/page";

export const Route = createFileRoute("/_app/settings_/assessments")({
  component: () => (
    <SettingsPage title="Assessment categories">
      <AssessmentCategorySettings />
    </SettingsPage>
  ),
});
