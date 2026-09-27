import { rosterAccountLeads, rosterAccounts, rosterAssessmentLeads, rosterLeads, rosterOpportunities, rosterOpportunityLeads, rosterProjectAccounts, rosterProjectLeads, rosterProjects } from "@/lib/roster";
import type { Lead, Opportunity, Project, Account, Appointment, Ticket, Activity } from "../part-01";

export const activities: Record<string, Activity[]> = {
  "L-4821": [
    { at: "Sep 12 8:14a", who: "Priya Shah", what: "Confirmed both spouses for Sunday 6:00p. Sent reminder text." },
    { at: "Sep 11 4:02p", who: "Priya Shah", what: "Canvass set. Interest in attic + air seal. 1998 build." },
  ],
  "L-4819": [
    { at: "Sep 12 9:40p", who: "Dana Ortiz", what: "Ran. Presented $28,640 HVAC + ducts. Proposal emailed." },
    { at: "Sep 10 11:20a", who: "Amber Quinn", what: "Google inbound. Booked evening run." },
    { at: "Sep 10 11:02a", who: "Form", what: "Landing form submitted: Google HVAC form." },
  ],
  "L-4808": [
    { at: "Sep 8 7:12p", who: "Priya Shah", what: "Setter marked ran. No closer notes. Needs disposition." },
  ],
};

export function byId<T extends { id: string }>(rows: T[], id: string) {
  return rows.find((r) => r.id === id);
}
