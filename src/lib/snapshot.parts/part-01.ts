export type Flag = "go" | "watch" | "stop" | "info" | "none";

export const snapshot = {
  date: "Mon Sep 14",
  salesToday: 40150,
  salesYesterday: 50920,
  salesWeek: 412400,
  salesLastWeek: 388100,
  cancelsWeek: 18200,
  margin: 31,
  marginTarget: 34,
  cashInToday: 18640,
  cashOutToday: 8440,
  cashInWeek: 20770,
  expectedInToday: 14940,
  marketingToday: 1860,
  marketingYesterday: 1420,
  payrollToday: 6240,
  payrollYesterday: 5980,
  ticketsAddedToday: 3,
  ticketsClosedToday: 1,
  ticketsOpenYest: 9,
  ticketsAddedYest: 2,
  ticketsClosedYest: 4,
  cashInYest: 16220,
  cashOutYest: 7900,
  leadsToday: 18,
  leadsYest: 14,
  calledToday: 12,
  notCalledToday: 6,
  calledYest: 10,
  notCalledYest: 4,
  cancelledToday: 1,
  cancelledYest: 0,
  referralsToday: 2,
  referralsYest: 0,
  reviewsToday: 3,
  reviewsYest: 2,
  marketingSoldYest: 24680,
  unread: 5,
  unmarked: 2,
  leadsInWeek: 47,
  leadsCalled: 36,
  leadsNotCalled: 11,
  nextInstall: "Whitaker · Fri Sep 18",
  reviewScore: 4.8,
  reviewCount: 214,
  referralsWeek: 6,
  qcFailed: 1,
  qcDone: 3,
  qcFixed: 1,
  qcPending: 2,
  qcReason: "Register blow-by",
  actionCat: "HOA",
  qcTechs: 3,
  surveysToday: 5,
  surveysYest: 3,
  membersToday: 2,
  membersYest: 1,
  memberSoldToday: 1872,
  memberSoldYest: 936,
};

export const dayGoals = {
  sales: 52000,
  close: 40,
  cashIn: 22000,
  cashOut: 9000,
  leads: 8,
  sits: 10,
  jobs: 5,
  ticketsClosed: 3,
  payroll: 7000,
  marketing: 28000,
  ticket: 12000,
  reviews: 4,
  referrals: 2,
  demand: 110,
  deals: 4,
  surveys: 6,
  members: 3,
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

export const weekSetters = [
  { name: "Priya Shah", set: 18, ran: 11 },
  { name: "Amber Quinn", set: 14, ran: 9 },
];
