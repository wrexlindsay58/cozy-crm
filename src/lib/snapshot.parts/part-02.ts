import type { Flag } from "./part-01";

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
    status: "No run",
    flag: "stop" as Flag,
  },
  {
    id: "AP-77",
    hour: 17,
    time: "5:00p",
    leadId: "L-4819",
    name: "Todd Hale",
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
    title: "Nina Patel no run",
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

export const reviews = [
  { id: "R-4", stars: 5, name: "Ben Cho", text: "Crew showed at 7. Attic was clean.", flag: "go" as Flag },
  { id: "R-3", stars: 5, name: "Ann Whitaker", text: "Second job with Cozy. Same quality.", flag: "go" as Flag },
  { id: "R-2", stars: 5, name: "Renee Alvarez", text: "House is quieter. Worth it.", flag: "go" as Flag },
  { id: "R-1", stars: 1, name: "Sharon Nguyen", text: "Nobody showed. I waited 40 minutes.", flag: "stop" as Flag },
];

export const referrals = [
  { id: "F-6", from: "Ann Whitaker", to: "Marcus Bell", status: "Set" },
  { id: "F-5", from: "Cho", to: "Patterson neighbor", status: "Set" },
  { id: "F-4", from: "Alvarez", to: "Sister in Glendale", status: "Set" },
  { id: "F-3", from: "Rahman", to: "Office manager", status: "Set" },
];

export const surveys = [
  { id: "S-4", name: "Ben Cho", score: 5, note: "Crew on time. Attic clean." },
  { id: "S-3", name: "Ann Whitaker", score: 5, note: "Second job. Same quality." },
  { id: "S-2", name: "Renee Alvarez", score: 4, note: "House is quieter." },
  { id: "S-1", name: "Owen Briggs", score: 5, note: "Would refer a neighbor." },
];
