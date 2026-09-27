import { SHOP_BY, __rows0, __rows2 } from "./part-02";
import { __rows1 } from "./part-03";

export type PersonRef = { name: string; role: string };

export type FileKind = "photo" | "video" | "audio" | "pdf" | "file";

export type Photo = {
  id: string;
  personId: string;
  caption: string;
  tone: "idle" | "info";
  src?: string;
  kind?: FileKind;
  name?: string;
  actionId?: string;
  pipeline?: string;
  by?: string;
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
  by?: string;
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
    { id: "PH-8", personId: "A-198", caption: "Prior air-seal register", tone: "info", kind: "photo", src: "/brand/slides/interior.jpg", pipeline: "Account", by: "Dana Ortiz" },
  ],
  "L-4788": [
    { id: "PH-cho-1", personId: "L-4788", caption: "Front of the house", tone: "info", kind: "photo", src: "/brand/slides/house.jpg", pipeline: "Lead", by: "Amber Quinn" },
    { id: "PH-cho-2", personId: "L-4788", caption: "Attic · Cellulose, joists showing", tone: "info", kind: "photo", src: "/brand/slides/interior.jpg", pipeline: "Assessment", by: "Dana Ortiz" },
    { id: "PH-cho-3", personId: "L-4788", caption: "Install · Condenser pad before the swap", tone: "info", kind: "photo", src: "/brand/slides/house-2.jpg", pipeline: "Job", by: "Tasha Reed" },
    { id: "PH-cho-4", personId: "L-4788", caption: "Install · Attic after the blow", tone: "info", kind: "photo", src: "/brand/slides/house-3.jpg", pipeline: "Job", by: "Tasha Reed" },
    { id: "PH-cho-5", personId: "L-4788", caption: "Service · Supply register in the west bedroom", tone: "info", kind: "photo", src: "/brand/slides/interior.jpg", pipeline: "Account", by: "Evan Cole" },
  ],
  "L-4761": [
    { id: "PH-wh-1", personId: "L-4761", caption: "Yard sign the neighbor mentioned", tone: "info", kind: "photo", src: "/brand/slides/house-3.jpg", pipeline: "Lead", by: "Amber Quinn" },
    { id: "PH-wh-2", personId: "L-4761", caption: "Attic · Hatch in the hall", tone: "info", kind: "photo", src: "/brand/slides/interior.jpg", pipeline: "Assessment", by: "Dana Ortiz" },
    { id: "PH-wh-3", personId: "L-4761", caption: "Install · Envelope before", tone: "info", kind: "photo", src: "/brand/slides/house.jpg", pipeline: "Job", by: "Tasha Reed" },
    { id: "PH-wh-4", personId: "L-4761", caption: "Warranty · Register touch-up", tone: "info", kind: "photo", src: "/brand/slides/house-2.jpg", pipeline: "Account", by: "Dana Ortiz" },
  ],
  "L-4733": [
    { id: "PH-rah-1", personId: "L-4733", caption: "Street view", tone: "info", kind: "photo", src: "/brand/slides/house-2.jpg", pipeline: "Lead", by: "Priya Shah" },
    { id: "PH-rah-2", personId: "L-4733", caption: "Attic · Old cellulose", tone: "info", kind: "photo", src: "/brand/slides/interior.jpg", pipeline: "Assessment", by: "Luis Haddad" },
    { id: "PH-rah-3", personId: "L-4733", caption: "Install · Aeroseal setup", tone: "info", kind: "photo", src: "/brand/slides/house.jpg", pipeline: "Job", by: "Evan Cole" },
    { id: "PH-rah-4", personId: "L-4733", caption: "Rebate form", tone: "info", kind: "pdf", name: "Rahman-rebate.pdf", pipeline: "Account", by: "Luis Haddad" },
  ],
  "A-184": [
    { id: "PH-cole-1", personId: "A-184", caption: "Front elevation", tone: "info", kind: "photo", src: "/brand/slides/house.jpg", pipeline: "Lead", by: "Priya Shah" },
    { id: "PH-cole-2", personId: "A-184", caption: "Ducts · Return in the hall", tone: "info", kind: "photo", src: "/brand/slides/interior.jpg", pipeline: "Assessment", by: "Marco Velez" },
    { id: "PH-cole-3", personId: "A-184", caption: "Install · Duct sealing in progress", tone: "info", kind: "photo", src: "/brand/slides/house-2.jpg", pipeline: "Job", by: "Tasha Reed" },
    { id: "PH-cole-4", personId: "A-184", caption: "Walkthrough video", tone: "info", kind: "video", name: "cole-walkthrough.mp4", pipeline: "Job", by: "Tasha Reed" },
  ],
  "A-176": [
    { id: "PH-alv-1", personId: "A-176", caption: "House from the driveway", tone: "info", kind: "photo", src: "/brand/slides/house-3.jpg", pipeline: "Lead", by: "Priya Shah" },
    { id: "PH-alv-2", personId: "A-176", caption: "Attic · Depth before removal", tone: "info", kind: "photo", src: "/brand/slides/interior.jpg", pipeline: "Assessment", by: "Marco Velez" },
    { id: "PH-alv-3", personId: "A-176", caption: "Install · After the R-49 blow", tone: "info", kind: "photo", src: "/brand/slides/house.jpg", pipeline: "Job", by: "Evan Cole" },
    { id: "PH-alv-4", personId: "A-176", caption: "Review request photo", tone: "info", kind: "photo", src: "/brand/slides/house-2.jpg", pipeline: "Account", by: "Marco Velez" },
  ],
  "A-169": [
    { id: "PH-pat-1", personId: "A-169", caption: "Front porch", tone: "info", kind: "photo", src: "/brand/slides/house-2.jpg", pipeline: "Lead", by: "Amber Quinn" },
    { id: "PH-pat-2", personId: "A-169", caption: "Attic · Gable hatch", tone: "info", kind: "photo", src: "/brand/slides/interior.jpg", pipeline: "Assessment", by: "Cole Brennan" },
    { id: "PH-pat-3", personId: "A-169", caption: "Install · Finished attic", tone: "info", kind: "photo", src: "/brand/slides/house-3.jpg", pipeline: "Job", by: "Evan Cole" },
    { id: "PH-pat-4", personId: "A-169", caption: "Customer voice note", tone: "info", kind: "audio", name: "patterson-note.m4a", pipeline: "Account", by: "Cole Brennan" },
  ],
  "A-161": [
    { id: "PH-hoa-1", personId: "A-161", caption: "Building 12, north side", tone: "info", kind: "photo", src: "/brand/slides/house.jpg", pipeline: "Lead", by: "Wrex Lindsay" },
    { id: "PH-hoa-2", personId: "A-161", caption: "Unit attic access", tone: "info", kind: "photo", src: "/brand/slides/interior.jpg", pipeline: "Assessment", by: "Marco Velez" },
    { id: "PH-hoa-3", personId: "A-161", caption: "HOA approval letter", tone: "info", kind: "pdf", name: "north-canyon-hoa.pdf", pipeline: "Job", by: "Tasha Reed" },
    { id: "PH-hoa-4", personId: "A-161", caption: "Hold · Dumpster placement", tone: "info", kind: "photo", src: "/brand/slides/house-2.jpg", pipeline: "Job", by: "Tasha Reed" },
  ],
  "A-154": [
    { id: "PH-kerr-1", personId: "A-154", caption: "Prior job, front", tone: "info", kind: "photo", src: "/brand/slides/house-3.jpg", pipeline: "Lead", by: "Amber Quinn" },
    { id: "PH-kerr-2", personId: "A-154", caption: "Attic · Air seal from March", tone: "info", kind: "photo", src: "/brand/slides/interior.jpg", pipeline: "Job", by: "Dana Ortiz" },
    { id: "PH-kerr-3", personId: "A-154", caption: "Warranty visit photo", tone: "info", kind: "photo", src: "/brand/slides/house.jpg", pipeline: "Account", by: "Dana Ortiz" },
    { id: "PH-kerr-4", personId: "A-154", caption: "Membership tune-up", tone: "info", kind: "photo", src: "/brand/slides/house-2.jpg", pipeline: "Membership", by: "Evan Cole" },
  ],
};

const threadSeed = [...__rows0, ...__rows1, ...__rows2] as ThreadMessage[];

export const seedThread: ThreadMessage[] = threadSeed.map((m) =>
  m.from === "shop" ? { ...m, by: SHOP_BY[m.id] ?? "Wrex Lindsay" } : m,
);
