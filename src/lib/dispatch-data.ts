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

export const units: Unit[] = [
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
  {
    id: "priya",
    name: "Priya Shah",
    role: "Setter",
    office: "PHX",
    phone: "(623) 555-0102",
    status: "idle",
    lastPing: "4:41p",
    speed: "0",
    next: "Confirm Elena 5:15p",
    note: "Office. Working the board.",
    initials: "PS",
    lat: 33.6155,
    lng: -112.3305,
  },
  {
    id: "luis",
    name: "Luis Haddad",
    role: "Closer",
    office: "DFW",
    phone: "(214) 555-0188",
    status: "done",
    lastPing: "4:20p",
    speed: "12 mph",
    next: "Marcus Bell Tue 5:30p",
    note: "Nina no sit. Rolling to shop.",
    initials: "LH",
    lat: 32.81,
    lng: -96.79,
  },
  {
    id: "cole",
    name: "Cole Brennan",
    role: "Closer",
    office: "DFW",
    phone: "(817) 555-0122",
    status: "idle",
    lastPing: "4:05p",
    speed: "0",
    next: "Jamal Wed 6:00p",
    note: "Fort Worth. No sit tonight.",
    initials: "CB",
    lat: 32.755,
    lng: -97.331,
  },
];

export const stops: Record<string, Stop[]> = {
  marco: [
    {
      id: "S-elena",
      leadId: "L-4821",
      name: "Elena Vargas",
      job: "Attic R-49 + air seal",
      time: "6:00p",
      hour: 18,
      hours: 2,
      address: "18422 W Bell Rd",
      city: "Surprise",
      amount: 18420,
      pay: "Financing",
      status: "Confirmed",
      kind: "run",
      lat: 33.6384,
      lng: -112.456,
    },
  ],
  dana: [
    {
      id: "S-hale",
      leadId: "L-4819",
      name: "Todd & Kim Hale",
      job: "HVAC 4-ton + ducts",
      time: "5:00p Sun",
      hour: 17,
      hours: 2,
      address: "7721 E Via de Ventura",
      city: "Scottsdale",
      amount: 28640,
      pay: "Financing",
      status: "Ran",
      kind: "run",
      lat: 33.555,
      lng: -111.893,
    },
  ],
  luis: [
    {
      id: "S-nina",
      leadId: "L-4774",
      name: "Nina Patel",
      job: "Air sealing",
      time: "4:00p Sun",
      hour: 16,
      hours: 2,
      address: "4418 Swiss Ave",
      city: "Dallas",
      amount: 9800,
      pay: "Card",
      status: "No sit",
      kind: "run",
      lat: 32.794,
      lng: -96.765,
    },
  ],
  nate: [],
  tasha: [
    {
      id: "S-whit",
      leadId: "L-4761",
      name: "Whitaker",
      job: "Envelope package",
      time: "Fri 7:30a",
      hour: 7,
      hours: 8,
      address: "Scottsdale",
      city: "Scottsdale",
      amount: 24680,
      pay: "Check",
      status: "Scheduled",
      kind: "install",
      lat: 33.494,
      lng: -111.922,
    },
  ],
  evan: [],
  priya: [],
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

export const routes: Record<string, [number, number][]> = {
  marco: [
    [-112.332, 33.615],
    [-112.37, 33.628],
    [-112.41, 33.636],
    [-112.456, 33.6384],
  ],
  luis: [
    [-96.765, 32.794],
    [-96.79, 32.81],
    [-96.84, 32.92],
  ],
};

export const boardHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export type BoardBlock = {
  personId: string;
  day: number;
  hour: number;
  hours: number;
  name: string;
  job: string;
  kind: "run" | "install" | "follow-up";
  status: string;
  leadId: string;
  amount: number;
  city: string;
};

export const board: BoardBlock[] = [
  { personId: "luis", day: 13, hour: 16, hours: 2, name: "Nina Patel", job: "Air sealing", kind: "run", status: "No sit", leadId: "L-4774", amount: 9800, city: "Dallas" },
  { personId: "dana", day: 13, hour: 17, hours: 2, name: "Todd & Kim Hale", job: "HVAC 4-ton", kind: "run", status: "Ran", leadId: "L-4819", amount: 28640, city: "Scottsdale" },
  { personId: "marco", day: 14, hour: 18, hours: 2, name: "Elena Vargas", job: "Attic R-49", kind: "run", status: "Confirmed", leadId: "L-4821", amount: 18420, city: "Surprise" },
  { personId: "cole", day: 14, hour: 17, hours: 2, name: "Patterson neighbor", job: "Attic", kind: "run", status: "Set", leadId: "L-4754", amount: 9800, city: "Fort Worth" },
  { personId: "marco", day: 14, hour: 16, hours: 2, name: "Alvarez sister", job: "Air seal", kind: "run", status: "Set", leadId: "L-4821", amount: 6400, city: "Glendale" },
  { personId: "dana", day: 14, hour: 19, hours: 1, name: "Cho referral", job: "Attic", kind: "run", status: "Set", leadId: "L-4788", amount: 12400, city: "Scottsdale" },
  { personId: "luis", day: 15, hour: 17, hours: 2, name: "Marcus Bell", job: "Aeroseal + attic", kind: "run", status: "Confirmed", leadId: "L-4814", amount: 12480, city: "Dallas" },
  { personId: "luis", day: 15, hour: 18, hours: 2, name: "Rahman office", job: "Attic", kind: "run", status: "Set", leadId: "L-4733", amount: 11200, city: "Dallas" },
  { personId: "cole", day: 16, hour: 18, hours: 2, name: "Jamal Ortiz", job: "Attic R-49", kind: "follow-up", status: "Follow-up", leadId: "L-4802", amount: 9800, city: "Fort Worth" },
  { personId: "cole", day: 17, hour: 18, hours: 2, name: "Owen Briggs", job: "Aeroseal", kind: "run", status: "Set", leadId: "L-4754", amount: 6400, city: "Fort Worth" },
  { personId: "tasha", day: 18, hour: 7, hours: 8, name: "Whitaker", job: "Envelope", kind: "install", status: "Install", leadId: "L-4761", amount: 24680, city: "Scottsdale" },
  { personId: "dana", day: 19, hour: 11, hours: 2, name: "Kerr", job: "Windows", kind: "run", status: "Reset", leadId: "L-4726", amount: 18400, city: "Scottsdale" },
  { personId: "tasha", day: 22, hour: 7, hours: 8, name: "Cho", job: "Attic + HVAC", kind: "install", status: "Install", leadId: "L-4788", amount: 31250, city: "Scottsdale" },
];

export function statusTone(s: UnitStatus | string) {
  if (s === "late" || s === "No sit" || s === "Unmarked" || s === "Missed") return "stop" as const;
  if (s === "en-route" || s === "Set" || s === "Unconfirmed" || s === "Reset" || s === "Follow-up") return "watch" as const;
  if (s === "done" || s === "Ran" || s === "Install") return "go" as const;
  if (s === "on-site" || s === "Confirmed") return "info" as const;
  return "none" as const;
}

export function statusLabel(s: UnitStatus) {
  if (s === "en-route") return "En route";
  if (s === "on-site") return "On site";
  if (s === "late") return "Late";
  if (s === "done") return "Done";
  return "Idle";
}
