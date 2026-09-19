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
  actionId?: string;
};

export type NestKind = "ticket" | "task" | "request" | "note" | "media";

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
  reactions?: { emoji: string; by: string }[];
  files?: { name: string; kind?: FileKind; src?: string }[];
  actionId?: string;
  actionKind?: NestKind;
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
    { id: "PH-1", personId: "L-4821", caption: "Attic hatch, east hall", tone: "info", kind: "photo", src: "/brand/slides/interior.jpg", actionId: "T-91" },
    { id: "PH-2", personId: "L-4821", caption: "Can lights in great room", tone: "idle", kind: "photo", src: "/brand/slides/house-2.jpg" },
    { id: "PH-3", personId: "L-4821", caption: "HOA letter", tone: "info", kind: "pdf", name: "HOA-letter.pdf", actionId: "R-12" },
    { id: "PH-4", personId: "L-4821", caption: "Approved baffle color", tone: "info", kind: "photo", src: "/brand/slides/house-3.jpg", actionId: "K-1" },
  ],
  "L-4819": [
    { id: "PH-5", personId: "L-4819", caption: "Existing condenser", tone: "info", kind: "photo", src: "/brand/slides/house.jpg", actionId: "K-3" },
  ],
  "A-198": [
    { id: "PH-8", personId: "A-198", caption: "Prior air-seal register", tone: "info", kind: "photo", src: "/brand/slides/interior.jpg" },
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
    reactions: [{ emoji: "👍", by: "Marco Velez" }, { emoji: "✅", by: "Priya Shah" }],
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
    actionId: "T-91",
    actionKind: "ticket",
    reactions: [{ emoji: "👍", by: "Marco Velez" }],
  },
  {
    id: "M-9",
    personId: "L-4821",
    channel: "internal",
    from: "shop",
    at: "Sep 14 9:40a",
    text: "Got it. Sending the swatch.",
    nest: { kind: "ticket", id: "T-91", title: "HOA baffle color" },
    actionId: "T-91",
    actionKind: "ticket",
    replyTo: "M-8",
  },
  {
    id: "M-91a",
    personId: "L-4821",
    channel: "sms",
    from: "shop",
    at: "Sep 14 9:05a",
    text: "Elena, HOA wants the baffle to match the vents. Can you shoot the approved color from the letter?",
    actionId: "T-91",
    actionKind: "ticket",
  },
  {
    id: "M-91b",
    personId: "L-4821",
    channel: "sms",
    from: "customer",
    at: "Sep 14 9:22a",
    text: "Tan on the letter. I'll text a photo when I'm home.",
    actionId: "T-91",
    actionKind: "ticket",
  },
  {
    id: "M-91c",
    personId: "L-4821",
    channel: "sms",
    from: "shop",
    at: "Sep 14 9:28a",
    text: "Got it. Priya will send the swatch to the board.",
    actionId: "T-91",
    actionKind: "ticket",
  },
  {
    id: "M-91k",
    personId: "L-4821",
    channel: "internal",
    from: "shop",
    at: "Sep 14 10:02a",
    text: "Need the hatch photo before we order.",
    nest: { kind: "task", id: "K-1", title: "Photo of approved baffle" },
    actionId: "K-1",
    actionKind: "task",
  },
  {
    id: "M-91r",
    personId: "L-4821",
    channel: "internal",
    from: "shop",
    at: "Sep 14 11:10a",
    text: "Board packet is on the portal. Need Elena's signature.",
    nest: { kind: "request", id: "R-12", title: "HOA architectural form" },
    actionId: "R-12",
    actionKind: "request",
  },
  {
    id: "M-10",
    personId: "L-4774",
    channel: "sms",
    from: "customer",
    at: "Sep 15 11:02a",
    text: "Can we move Sunday? Kids have a game.",
  },
];
