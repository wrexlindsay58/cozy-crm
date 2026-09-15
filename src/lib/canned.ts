export type Canned = {
  id: string;
  label: string;
  channel: "sms" | "email" | "both";
  subject?: string;
  body: string;
};

export const CANNED: Canned[] = [
  { id: "confirm", label: "Confirm both home", channel: "sms", body: "Confirmed Sunday 6:00p. Both of you home?" },
  { id: "onway", label: "On my way", channel: "sms", body: "On my way. See you in about 15." },
  { id: "late", label: "Running late", channel: "sms", body: "Running about 15 late. Still good?" },
  { id: "reset", label: "Need to reset", channel: "sms", body: "We missed you. Want me to reset for this week?" },
  { id: "thanks", label: "Thanks for the time", channel: "both", body: "Thanks for the time tonight. I'll send next steps in the morning." },
  { id: "proposal", label: "Proposal sent", channel: "email", subject: "Your Cozy proposal", body: "Proposal is attached. Cash and 12-month options are on page 2. Reply with questions." },
  { id: "hoa", label: "HOA packet", channel: "email", subject: "HOA packet", body: "HOA packet is attached. Color match is on page 3." },
  { id: "confirm-email", label: "Confirm the sit", channel: "email", subject: "Sunday at 6:00p", body: "Confirming Sunday at 6:00p for attic and air seal. Both of you home. Dog in the backyard is fine." },
];

export function cannedFor(channel: "sms" | "email") {
  return CANNED.filter((c) => c.channel === channel || c.channel === "both");
}
