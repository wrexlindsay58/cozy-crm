export type PersonRef = { name: string; role: string };

export type FileKind = "photo" | "video" | "pdf" | "file";

export type Photo = {
  id: string;
  personId: string;
  caption: string;
  tone: "idle" | "info";
  src?: string;
  kind?: FileKind;
  name?: string;
};

export type NestKind = "ticket" | "task" | "note" | "media";

export type ThreadNest = {
  kind: NestKind;
  id: string;
  title: string;
};

export type ThreadMessage = {
  id: string;
  personId: string;
  channel: "sms" | "call" | "email" | "internal" | "note";
  from: "shop" | "customer";
  at: string;
  text: string;
  subject?: string;
  durationSec?: number;
  direction?: "Out" | "In";
  result?: "Answered" | "VM" | "No answer";
  nest?: ThreadNest;
  replyTo?: string;
};

export const followersByPerson: Record<string, PersonRef[]> = {
  "L-4821": [
    { name: "Priya Shah", role: "Setter" },
    { name: "Wrex Lindsay", role: "Owner" },
  ],
  "L-4819": [
    { name: "Amber Quinn", role: "Setter" },
    { name: "Wrex Lindsay", role: "Owner" },
  ],
  "L-4761": [
    { name: "Amber Quinn", role: "Setter" },
    { name: "Tasha Reed", role: "PM" },
  ],
  "A-204": [
    { name: "Dana Ortiz", role: "Closer" },
    { name: "Wrex Lindsay", role: "Owner" },
  ],
  "A-198": [
    { name: "Dana Ortiz", role: "Closer" },
    { name: "Tasha Reed", role: "PM" },
  ],
};

export const photosByPerson: Record<string, Photo[]> = {
  "L-4821": [
    { id: "PH-1", personId: "L-4821", caption: "Attic hatch, east hall", tone: "info", kind: "photo" },
    { id: "PH-2", personId: "L-4821", caption: "Can lights in great room", tone: "idle", kind: "photo" },
    { id: "PH-3", personId: "L-4821", caption: "HOA letter", tone: "info", kind: "pdf", name: "HOA-letter.pdf" },
  ],
  "A-198": [
    { id: "PH-8", personId: "A-198", caption: "Prior air-seal register", tone: "info" },
  ],
};

export const seedThread: ThreadMessage[] = [
  {
    id: "M-1",
    personId: "L-4821",
    channel: "sms",
    from: "shop",
    at: "Sep 11 4:08p",
    text: "Elena, Priya from Cozy. Confirmed Sunday 6:00p with Marco. Both of you home?",
  },
  {
    id: "M-1c",
    personId: "L-4821",
    channel: "call",
    from: "shop",
    at: "Sep 11 4:22p",
    text: "Call Out · Answered · 4 min",
    durationSec: 247,
    direction: "Out",
    result: "Answered",
  },
  {
    id: "M-2",
    personId: "L-4821",
    channel: "sms",
    from: "customer",
    at: "Sep 11 4:19p",
    text: "Yes both of us. Dog will be in the backyard.",
  },
  {
    id: "M-3",
    personId: "L-4821",
    channel: "sms",
    from: "shop",
    at: "Sep 12 8:14a",
    text: "Reminder set. Marco will text when he is 20 min out.",
  },
  {
    id: "M-3e",
    personId: "L-4821",
    channel: "email",
    from: "shop",
    at: "Sep 12 8:20a",
    subject: "Sunday 6:00p confirmed",
    text: "Elena, confirming Marco Sunday at 6:00p for attic and air seal. Both of you home. Dog in the backyard is fine.",
  },
  {
    id: "M-4",
    personId: "L-4819",
    channel: "email",
    from: "shop",
    at: "Sep 12 9:44p",
    subject: "Proposal: HVAC + ducts",
    text: "Proposal for HVAC + ducts emailed. Cash and 12-month tiles on the file.",
  },
  {
    id: "M-5",
    personId: "A-198",
    channel: "sms",
    from: "shop",
    at: "Sep 6 10:02a",
    text: "Install window Sep 18. Tasha will call the day before.",
  },
  {
    id: "M-6",
    personId: "L-4821",
    channel: "internal",
    from: "shop",
    at: "Sep 12 8:20a",
    text: "Both spouses required. Do not run if only one is home.",
  },
  {
    id: "M-7",
    personId: "L-4821",
    channel: "note",
    from: "shop",
    at: "Sep 11 4:05p",
    text: "Both spouses need to be home. Dog in backyard.",
  },
  {
    id: "M-8",
    personId: "L-4821",
    channel: "internal",
    from: "shop",
    at: "Sep 14 9:12a",
    text: "HOA wants tan, not white.",
    nest: { kind: "ticket", id: "T-91", title: "HOA baffle color" },
  },
  {
    id: "M-9",
    personId: "L-4821",
    channel: "internal",
    from: "shop",
    at: "Sep 14 9:40a",
    text: "Got it. Sending the swatch.",
    nest: { kind: "ticket", id: "T-91", title: "HOA baffle color" },
    replyTo: "M-8",
  },
];
