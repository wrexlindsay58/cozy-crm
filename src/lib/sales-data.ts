export type Kid = { n: string; l: string; z?: boolean; a?: boolean; stop?: boolean };

export type Drill = {
  title: string;
  note: string;
  grid: "g3" | "g4";
  items: Kid[];
  more?: Kid[];
};

export const months = [
  { label: "Jan", h: 38 },
  { label: "Feb", h: 44 },
  { label: "Mar", h: 52 },
  { label: "Apr", h: 61 },
  { label: "May", h: 78 },
  { label: "Jun", h: 100, peak: true },
  { label: "Jul", h: 96 },
  { label: "Aug", h: 88 },
  { label: "Sep", h: 71 },
];

export const products = [
  { name: "Attic insulation R-49", pct: 100, amt: "$1.18M" },
  { name: "HVAC replacement", pct: 74, amt: "$874k" },
  { name: "Air sealing / envelope", pct: 52, amt: "$612k" },
  { name: "Aeroseal duct sealing", pct: 38, amt: "$448k" },
  { name: "Insulation removal", pct: 26, amt: "$306k" },
  { name: "Windows / air scrubbers", pct: 18, amt: "$214k" },
];

export const offices = [
  { name: "Phoenix", pct: 100, amt: "$1.42M" },
  { name: "Scottsdale", pct: 78, amt: "$1.11M" },
  { name: "Dallas", pct: 52, amt: "$742k" },
  { name: "Fort Worth", pct: 28, amt: "$398k" },
  { name: "North Phoenix", pct: 12, amt: "$177k" },
];

export const funnel = [
  { n: "1,842", l: "Leads", r: "100%" },
  { n: "926", l: "Appts", r: "50%" },
  { n: "710", l: "Runs", r: "77%" },
  { n: "270", l: "Sold", r: "38%" },
  { n: "186", l: "Jobs", r: "69%" },
];

export const rates = [
  { l: "Appt", pct: 50, v: "50%" },
  { l: "Run", pct: 77, v: "77%" },
  { l: "Close", pct: 38, v: "38%" },
  { l: "Cancel", pct: 4, v: "4%" },
];

export const kpis: { key: string; n: string; l: string; flag?: "stop" | "watch" | "none" }[] = [
  { key: "appointments", n: "926", l: "Appointments" },
  { key: "leads", n: "1,842", l: "Leads" },
  { key: "opportunities", n: "284", l: "Opportunities" },
  { key: "projects", n: "186", l: "Jobs" },
];

export const drills: Record<string, Drill> = {
  activities: {
    title: "Activities",
    note: "Most volume is text. Calls are the setter channel.",
    grid: "g3",
    items: [
      { n: "11,420", l: "Texts" },
      { n: "3,108", l: "Calls" },
      { n: "334", l: "Pins" },
    ],
  },
  leads: {
    title: "Leads",
    note: "Source mix is setter + web + partner. 41 still need a disposition.",
    grid: "g4",
    items: [
      { n: "710", l: "Ran" },
      { n: "216", l: "Confirmed" },
      { n: "88", l: "Pending" },
      { n: "41", l: "Unmarked", a: true },
    ],
  },
  appointments: {
    title: "Appointments",
    note: "926 set this year.",
    grid: "g4",
    items: [
      { n: "41", l: "Unmarked", a: true, z: false, stop: true },
      { n: "18", l: "No sit" },
      { n: "14", l: "Missed" },
      { n: "9", l: "One legger" },
    ],
    more: [
      { n: "710", l: "Runs" },
      { n: "96", l: "Did not run" },
      { n: "28", l: "Pending" },
      { n: "22", l: "Cancelled" },
    ],
  },
  opportunities: {
    title: "Opportunities",
    note: "Open proposals plus jobs already in production.",
    grid: "g3",
    items: [
      { n: "284", l: "Open opps" },
      { n: "186", l: "Tied to a project" },
      { n: "98", l: "Proposal out" },
    ],
  },
  projects: {
    title: "Projects",
    note: "Production load across AZ and DFW.",
    grid: "g3",
    items: [
      { n: "42", l: "Active / scheduled" },
      { n: "138", l: "Closed / billed" },
      { n: "6", l: "On hold" },
    ],
  },
  accounts: {
    title: "Accounts",
    note: "Accounts that bought at least one package this year.",
    grid: "g3",
    items: [
      { n: "141", l: "New accounts" },
      { n: "23", l: "Repeat accounts" },
      { n: "164", l: "Total accounts" },
    ],
  },
};

export const ranges = ["Year", "Quarter", "Month", "Week", "Today"] as const;
