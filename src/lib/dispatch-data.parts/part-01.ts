import { __rows1 } from "./part-02";

export type UnitStatus = "idle" | "en-route" | "on-site" | "late" | "done";

export type Geo = { lat: number; lng: number };

export type Stop = {
  id: string;
  leadId?: string;
  name: string;
  job: string;
  time: string;
  hour: number;
  hours: number;
  address: string;
  city: string;
  amount: number;
  pay: string;
  status: string;
  kind: "run" | "install" | "follow-up";
} & Geo;

export type Unit = {
  id: string;
  name: string;
  role: "Closer" | "Setter" | "Crew";
  office: "PHX" | "DFW";
  phone: string;
  status: UnitStatus;
  lastPing: string;
  speed: string;
  eta?: string;
  next?: string;
  note: string;
  initials: string;
} & Geo;

export const offices = {
  PHX: { label: "Phoenix", lat: 33.58, lng: -112.12, zoom: 10.2 },
  DFW: { label: "Dallas", lat: 32.82, lng: -96.84, zoom: 10.4 },
} as const;

export const shop = {
  PHX: { lat: 33.615, lng: -112.332, name: "PHX shop" },
  DFW: { lat: 32.92, lng: -96.84, name: "DFW shop" },
};

const __rows0 = [
{
    id: "marco",
    name: "Marco Velez",
    role: "Closer",
    office: "PHX",
    phone: "(602) 555-0141",
    status: "en-route",
    lastPing: "4:42p",
    speed: "31 mph",
    eta: "18 min",
    next: "Elena Vargas 6:00p",
    note: "West on Bell. On time.",
    initials: "MV",
    lat: 33.636,
    lng: -112.41,
  },
{
    id: "dana",
    name: "Dana Ortiz",
    role: "Closer",
    office: "PHX",
    phone: "(480) 555-0118",
    status: "done",
    lastPing: "4:38p",
    speed: "0",
    next: "Clear",
    note: "Hale ran. Proposal out. Sitting at shop.",
    initials: "DO",
    lat: 33.616,
    lng: -112.331,
  },
{
    id: "nate",
    name: "Nate Solis",
    role: "Closer",
    office: "PHX",
    phone: "(602) 555-0194",
    status: "idle",
    lastPing: "4:40p",
    speed: "0",
    next: "No run",
    note: "At shop. Book empty.",
    initials: "NS",
    lat: 33.614,
    lng: -112.329,
  },
{
    id: "tasha",
    name: "AZ-1 Tasha",
    role: "Crew",
    office: "PHX",
    phone: "(623) 555-0160",
    status: "idle",
    lastPing: "4:15p",
    speed: "0",
    next: "Whitaker Fri 7:30a",
    note: "Truck at shop. Materials loaded.",
    initials: "AZ1",
    lat: 33.613,
    lng: -112.334,
  },
{
    id: "evan",
    name: "AZ-2 Evan",
    role: "Crew",
    office: "PHX",
    phone: "(623) 555-0161",
    status: "idle",
    lastPing: "3:50p",
    speed: "0",
    next: "Cho Mon 9/22",
    note: "Off the clock.",
    initials: "AZ2",
    lat: 33.612,
    lng: -112.336,
  },
];

export const units = [...__rows0, ...__rows1] as Unit[];

export const __bag1 = {
cole: [
    {
      id: "S-jamal",
      leadId: "L-4802",
      name: "Jamal Ortiz",
      job: "Attic R-49",
      time: "Wed 6:00p",
      hour: 18,
      hours: 2,
      address: "Fort Worth",
      city: "Fort Worth",
      amount: 9800,
      pay: "Card",
      status: "Follow-up",
      kind: "run",
      lat: 32.735,
      lng: -97.328,
    },
  ],
};
