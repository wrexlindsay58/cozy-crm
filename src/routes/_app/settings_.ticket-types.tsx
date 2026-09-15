import { createFileRoute } from "@tanstack/react-router";
import { addTicketCat, useStaff } from "@/features/staff/store";
import { SettingsPage } from "@/features/settings/page";
import { WordList } from "@/features/settings/word-list";

export const Route = createFileRoute("/_app/settings_/ticket-types")({
  component: Page,
});

function Page() {
  const { ticketCats } = useStaff();
  return (
    <SettingsPage title="Ticket categories">
      <WordList items={ticketCats} onAdd={addTicketCat} />
    </SettingsPage>
  );
}
