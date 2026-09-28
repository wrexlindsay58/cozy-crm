import type { WorkStatus } from "@/lib/chrome";

export type Tone = "navy" | "up" | "alert" | "muted";

export type DndChannel = "text" | "call" | "email";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  source: string;
  status: string;
  tone: Tone;
  setter: string;
  closer: string;
  office: string;
  created: string;
  next: string;
  product: string;
  value: number;
  notes: string;
  interests?: string[];
  otherInterest?: string;
  secondaryName?: string;
  secondaryPhone?: string;
  secondaryEmail?: string;
  referrerName?: string;
  referrerPhone?: string;
  dropReason?: string;
  tags?: string[];
  dnd?: DndChannel[];
  workflows?: string[];
  formName?: string;
  formAnswers?: { q: string; a: string }[];
  yearBuilt?: string;
  stories?: string;
  sqft?: string;
  utility?: string;
  hoa?: string;
  access?: string;
  bothHome?: boolean;
  finance?: string;
  rebate?: boolean;
  qualify?: Record<string, string>;
  pain?: string;
  hotRooms?: string;
  coldRooms?: string;
};

export type Opportunity = {
  id: string;
  leadId: string;
  name: string;
  product: string;
  stage: string;
  tone: Tone;
  amount: number;
  closer: string;
  office: string;
  updated: string;
  closeBy: string;
};

export type Project = {
  id: string;
  accountId: string;
  name: string;
  product: string;
  status: string;
  tone: Tone;
  amount: number;
  office: string;
  pm: string;
  install: string;
};

export type Account = {
  id: string;
  name: string;
  secondaryName?: string;
  phone?: string;
  email?: string;
  type: "New" | "Repeat";
  address?: string;
  city: string;
  owner: string;
  jobs: number;
  lifetime: number;
  last: string;
};

export type EventKind = "Sales" | "Assessment" | "Site survey" | "Install" | "Service" | "Warranty" | "Go-back" | "Callback";

export type Appointment = {
  id: string;
  leadId: string;
  name: string;
  day: number;
  time: string;
  status: string;
  tone: Tone;
  setter: string;
  closer: string;
  product: string;
  city: string;
  kind?: EventKind;
  notes?: string;
  setBy?: string;
  crew?: string;
  duration?: string;
  scope?: string;
  pipeline?: string;
};

export type Ticket = {
  id: string;
  title: string;
  related: string;
  owner: string;
  priority: "High" | "Normal" | "Low";
  status: WorkStatus;
  age: string;
  description?: string;
  due?: string;
  followers?: string[];
};

export type Activity = {
  at: string;
  who: string;
  what: string;
};

export const reps: { name: string; role: string; office: string; sold: number; rev: number; close: number; set?: number }[] = [
  { name: "Marco Velez", role: "Closer", office: "Phoenix", sold: 42, rev: 868000, close: 41 },
  { name: "Dana Ortiz", role: "Closer", office: "Scottsdale", sold: 38, rev: 792000, close: 44 },
  { name: "Luis Haddad", role: "Closer", office: "Dallas", sold: 31, rev: 641000, close: 36 },
  { name: "Priya Shah", role: "Setter", office: "Phoenix", sold: 0, rev: 0, close: 0, set: 214 },
  { name: "Cole Brennan", role: "Closer", office: "Fort Worth", sold: 22, rev: 454000, close: 33 },
  { name: "Amber Quinn", role: "Setter", office: "Scottsdale", sold: 0, rev: 0, close: 0, set: 186 },
  { name: "Nate Solis", role: "Closer", office: "North Phoenix", sold: 18, rev: 372000, close: 29 },
  { name: "Wrex Lindsay", role: "Owner", office: "Phoenix", sold: 9, rev: 214000, close: 52 },
];

export const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export type Channel = "sms" | "call" | "email" | "note";
