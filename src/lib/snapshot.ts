export type Flag = "go" | "watch" | "stop" | "info" | "none";

export const snapshot = {
  date: "Mon Sep 14",
  salesToday: 0,
  salesYesterday: 28640,
  salesWeek: 412400,
  salesLastWeek: 388100,
  cancelsWeek: 18200,
  margin: 31,
  marginTarget: 34,
  cashInToday: 0,
  cashOutToday: 8440,
  cashInWeek: 20770,
  unread: 5,
  unmarked: 2,
  leadsInWeek: 47,
  leadsCalled: 36,
  leadsNotCalled: 11,
  nextInstall: "Whitaker · Fri Sep 18",
  reviewScore: 4.8,
  reviewCount: 214,
  referralsWeek: 6,
};

export const runs = {
  scheduled: 5,
  ran: 0,
  noSit: 0,
  booked: 9,
  inside72: 8,
};

export const bookMix = [
  { label: "Sun", n: 1, pct: 11 },
  { label: "Mon", n: 5, pct: 56 },
  { label: "Tue", n: 2, pct: 22 },
  { label: "Later", n: 1, pct: 11 },
];

export const tonightRuns = [
  { id: "B-4", time: "4:30p", name: "Alvarez sister", closer: "Marco Velez", city: "Glendale" },
  { id: "B-3", time: "5:00p", name: "Patterson neighbor", closer: "Cole Brennan", city: "Fort Worth" },
  { id: "B-2", time: "6:00p", name: "Elena Vargas", closer: "Marco Velez", city: "Surprise", leadId: "L-4821" },
  { id: "B-5", time: "6:30p", name: "Owen Briggs", closer: "Cole Brennan", city: "Fort Worth", leadId: "L-4754" },
  { id: "B-6", time: "7:00p", name: "Cho referral", closer: "Dana Ortiz", city: "Scottsdale" },
];

export const bookedToday = [
  { id: "B-1", name: "Nina Patel", when: "Sun 4:00p", day: "Sun", closer: "Luis Haddad", leadId: "L-4774" },
  { id: "B-2", name: "Elena Vargas", when: "Mon 6:00p", day: "Mon", closer: "Marco Velez", leadId: "L-4821" },
  { id: "B-3", name: "Patterson neighbor", when: "Mon 5:00p", day: "Mon", closer: "Cole Brennan" },
  { id: "B-4", name: "Alvarez sister", when: "Mon 4:30p", day: "Mon", closer: "Marco Velez" },
  { id: "B-5", name: "Owen Briggs", when: "Mon 6:30p", day: "Mon", closer: "Cole Brennan", leadId: "L-4754" },
  { id: "B-6", name: "Cho referral", when: "Mon 7:00p", day: "Mon", closer: "Dana Ortiz" },
  { id: "B-7", name: "Marcus Bell", when: "Tue 5:30p", day: "Tue", closer: "Luis Haddad", leadId: "L-4814" },
  { id: "B-8", name: "Rahman office", when: "Tue 6:00p", day: "Tue", closer: "Luis Haddad" },
  { id: "B-9", name: "Jamal Ortiz", when: "Wed 6:00p", day: "Later", closer: "Cole Brennan", leadId: "L-4802" },
];

export const jobsToday = [
  {
    id: "AP-76",
    hour: 16,
    time: "4:00p",
    leadId: "L-4774",
    name: "Nina Patel",
    job: "Air sealing",
    city: "Dallas",
    who: "Luis Haddad",
    role: "Closer",
    amount: 9800,
    pay: "Card",
    status: "No sit",
    flag: "stop" as Flag,
  },
  {
    id: "AP-77",
    hour: 17,
    time: "5:00p",
    leadId: "L-4819",
    name: "Todd & Kim Hale",
    job: "HVAC 4-ton + ducts",
    city: "Scottsdale",
    who: "Dana Ortiz",
    role: "Closer",
    amount: 28640,
    pay: "Financing",
    status: "Ran",
    flag: "go" as Flag,
  },
];

export const payToday = [
  { type: "Financing", amount: 28640 },
  { type: "Card", amount: 9800 },
];

export const cashOut = [
  { name: "ABC Supply", amount: 6120, pay: "ACH" },
  { name: "Fuel cards", amount: 2320, pay: "Fleet" },
];

export const incomingWeek = [
  { name: "Cho deposit", amount: 10400, when: "Mon", pay: "ACH" },
  { name: "Whitaker progress", amount: 8230, when: "Tue", pay: "Check" },
  { name: "Cole Trust remainder", amount: 2140, when: "Wed", pay: "Card" },
];

export const weekDays = [
  { d: 13, label: "Sun", n: 2, mine: true },
  { d: 14, label: "Mon", n: 5 },
  { d: 15, label: "Tue", n: 2 },
  { d: 16, label: "Wed", n: 1 },
  { d: 17, label: "Thu", n: 1 },
  { d: 18, label: "Fri", n: 1 },
  { d: 19, label: "Sat", n: 1 },
];

export const incidents = [
  {
    id: "I-14",
    flag: "stop" as Flag,
    title: "Sharon Nguyen unmarked 5 days",
    detail: "Waited 40 min. Nothing in the file.",
    to: "/leads/$leadId" as const,
    params: { leadId: "L-4808" },
  },
  {
    id: "I-13",
    flag: "stop" as Flag,
    title: "Chris Duran missed Sep 10",
    detail: "Asked to reset. Still not on the book.",
    to: "/leads/$leadId" as const,
    params: { leadId: "L-4769" },
  },
  {
    id: "I-12",
    flag: "watch" as Flag,
    title: "Nina Patel no sit",
    detail: "4:00p Dallas. Luis. Not home.",
    to: "/leads/$leadId" as const,
    params: { leadId: "L-4774" },
  },
];

export const notCalled = [
  { id: "L-4754", name: "Owen Briggs", age: "2d", source: "Canvass" },
  { id: "L-4740", name: "Greg Fontaine", age: "3d", source: "Google" },
  { id: "L-4814", name: "Marcus Bell", age: "1d", source: "Referral" },
];

export const crews = [
  { name: "AZ-1 Tasha", job: "Off" },
  { name: "AZ-2 Evan", job: "Off" },
  { name: "DFW-1 Luis", job: "Off" },
];

export const weekClosers = [
  { name: "Dana Ortiz", sold: 4, rev: 86420 },
  { name: "Marco Velez", sold: 3, rev: 61200 },
  { name: "Luis Haddad", sold: 2, rev: 33180 },
  { name: "Nate Solis", sold: 0, rev: 0 },
];

export const weekSetters = [
  { name: "Priya Shah", set: 18, ran: 11 },
  { name: "Amber Quinn", set: 14, ran: 9 },
];

export const reviews = [
  { id: "R-4", stars: 5, name: "Ben Cho", text: "Crew showed at 7. Attic was clean.", flag: "go" as Flag },
  { id: "R-3", stars: 5, name: "The Whitakers", text: "Second job with Cozy. Same quality.", flag: "go" as Flag },
  { id: "R-2", stars: 5, name: "Renee Alvarez", text: "House is quieter. Worth it.", flag: "go" as Flag },
  { id: "R-1", stars: 1, name: "Sharon Nguyen", text: "Nobody showed. I waited 40 minutes.", flag: "stop" as Flag },
];

export const referrals = [
  { id: "F-6", from: "Whitakers", to: "Marcus Bell", status: "Set" },
  { id: "F-5", from: "Cho", to: "Patterson neighbor", status: "Set" },
  { id: "F-4", from: "Alvarez", to: "Sister in Glendale", status: "Set" },
  { id: "F-3", from: "Rahman", to: "Office manager", status: "Set" },
];
