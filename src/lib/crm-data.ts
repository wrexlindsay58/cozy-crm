export type Tone = "navy" | "up" | "alert" | "muted";

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
  dnc?: boolean;
  workflows?: string[];
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
  type: "New" | "Repeat";
  city: string;
  owner: string;
  jobs: number;
  lifetime: number;
  last: string;
};

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
};

export type Ticket = {
  id: string;
  title: string;
  related: string;
  owner: string;
  priority: "High" | "Normal" | "Low";
  status: "Open" | "Waiting" | "Done";
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

export const leads: Lead[] = [
  { id: "L-4821", name: "Elena Vargas", phone: "(623) 555-0144", email: "elena.vargas@gmail.com", address: "18422 W Bell Rd", city: "Surprise, AZ", source: "Canvass", status: "Set, no run", tone: "alert", setter: "Priya Shah", closer: "Marco Velez", office: "Phoenix", created: "Sep 11", next: "Sep 14 6:00p", product: "Attic R-49 + air seal", value: 18420, notes: "Both spouses need to be home. Dog in backyard.", tags: ["HOA", "Air seal"] },
  { id: "L-4819", name: "Todd & Kim Hale", phone: "(480) 555-0198", email: "khale@cox.net", address: "7721 E Via de Ventura", city: "Scottsdale, AZ", source: "Google", status: "Ran", tone: "up", setter: "Amber Quinn", closer: "Dana Ortiz", office: "Scottsdale", created: "Sep 10", next: "Proposal out", product: "HVAC 4-ton + ducts", value: 28640, notes: "Existing 16-year Goodman. Interested in financing." },
  { id: "L-4814", name: "Marcus Bell", phone: "(214) 555-0112", email: "mbell@outlook.com", address: "4418 Swiss Ave", city: "Dallas, TX", source: "Referral", status: "Pending", tone: "muted", setter: "Priya Shah", closer: "Luis Haddad", office: "Dallas", created: "Sep 9", next: "Sep 15 5:30p", product: "Aeroseal + attic", value: 12480, notes: "Referred by the Whitakers. Utility rebate eligible.", referrerName: "The Whitakers", referrerPhone: "(480) 555-0121" },
  { id: "L-4808", name: "Sharon Nguyen", phone: "(623) 555-0177", email: "snguyen@yahoo.com", address: "14001 N Prasada Pkwy", city: "Surprise, AZ", source: "Website", status: "Unmarked", tone: "alert", setter: "Priya Shah", closer: "Marco Velez", office: "Phoenix", created: "Sep 8", next: "Needs disposition", product: "Insulation removal", value: 6400, notes: "Setter said run happened. No outcome logged." },
  { id: "L-4802", name: "Jamal Ortiz", phone: "(817) 555-0133", email: "j.ortiz@gmail.com", address: "2901 W 7th St", city: "Fort Worth, TX", source: "Partner", status: "Ran", tone: "up", setter: "Amber Quinn", closer: "Cole Brennan", office: "Fort Worth", created: "Sep 7", next: "Follow-up Sep 16", product: "Attic R-49", value: 9800, notes: "One-legger, spouse out of town. Wants weekend close." },
  { id: "L-4796", name: "Rita Colson", phone: "(602) 555-0160", email: "rita.colson@gmail.com", address: "3122 E Camelback Rd", city: "Phoenix, AZ", source: "Canvass", status: "Cancelled", tone: "muted", setter: "Priya Shah", closer: "Nate Solis", office: "Phoenix", created: "Sep 6", next: "None", product: "Windows", value: 21400, notes: "Cancelled 2 hours before run. Reschedule later." },
  { id: "L-4788", name: "Ben & Alyssa Cho", phone: "(480) 555-0104", email: "alyssa.cho@icloud.com", address: "9812 N 90th St", city: "Scottsdale, AZ", source: "Google", status: "Sold", tone: "up", setter: "Amber Quinn", closer: "Dana Ortiz", office: "Scottsdale", created: "Sep 4", next: "Install Sep 22", product: "Attic + HVAC", value: 31250, notes: "Cash. Production already assigned." },
  { id: "L-4781", name: "Harold Price", phone: "(623) 555-0129", email: "hprice52@aol.com", address: "16840 W Greenway Rd", city: "Surprise, AZ", source: "Canvass", status: "Not qualified", tone: "muted", setter: "Priya Shah", closer: "Marco Velez", office: "Phoenix", created: "Sep 3", next: "None", product: "Attic R-49", value: 0, notes: "Renter. Landlord will not approve." },
  { id: "L-4774", name: "Nina Patel", phone: "(214) 555-0188", email: "nina.patel@gmail.com", address: "7220 Hillcrest Ave", city: "Dallas, TX", source: "Website", status: "Set, no run", tone: "alert", setter: "Amber Quinn", closer: "Luis Haddad", office: "Dallas", created: "Sep 2", next: "Sep 13 4:00p", product: "Air sealing", value: 7200, notes: "Confirmed twice. High no-show risk historically in that zip." },
  { id: "L-4769", name: "Chris Duran", phone: "(602) 555-0155", email: "cduran@gmail.com", address: "4421 N 24th St", city: "Phoenix, AZ", source: "Referral", status: "Missed", tone: "alert", setter: "Priya Shah", closer: "Nate Solis", office: "Phoenix", created: "Sep 1", next: "Reset needed", product: "HVAC replacement", value: 19400, notes: "Closer sat 40 min. Homeowner never arrived." },
  { id: "L-4761", name: "The Whitakers", phone: "(480) 555-0121", email: "ann.whitaker@gmail.com", address: "11820 E Shea Blvd", city: "Scottsdale, AZ", source: "Partner", status: "Sold", tone: "up", setter: "Amber Quinn", closer: "Dana Ortiz", office: "Scottsdale", created: "Aug 28", next: "Install Sep 18", product: "Envelope package", value: 24680, notes: "Repeat. Did air seal last year, now attic + HVAC." },
  { id: "L-4754", name: "Owen Briggs", phone: "(817) 555-0190", email: "owen.briggs@gmail.com", address: "1408 S Main St", city: "Fort Worth, TX", source: "Canvass", status: "Pending", tone: "muted", setter: "Priya Shah", closer: "Cole Brennan", office: "Fort Worth", created: "Aug 27", next: "Sep 17 6:30p", product: "Aeroseal", value: 5400, notes: "Phone confirmed. Prefers evening." },
  { id: "L-4748", name: "Lila Moreno", phone: "(623) 555-0182", email: "lila.moreno@gmail.com", address: "15520 W Cactus Rd", city: "Surprise, AZ", source: "Google", status: "Ran", tone: "up", setter: "Priya Shah", closer: "Marco Velez", office: "Phoenix", created: "Aug 26", next: "Proposal out", product: "Attic R-49 + removal", value: 14220, notes: "Wants both cash and 12-month options." },
  { id: "L-4740", name: "Greg Fontaine", phone: "(602) 555-0118", email: "gfontaine@msn.com", address: "7810 N 16th St", city: "Phoenix, AZ", source: "Website", status: "One legger", tone: "alert", setter: "Amber Quinn", closer: "Wrex Lindsay", office: "Phoenix", created: "Aug 25", next: "Spouse callback", product: "HVAC 3.5-ton", value: 16880, notes: "Decision maker is traveling until Thursday." },
  { id: "L-4733", name: "Aisha Rahman", phone: "(214) 555-0147", email: "aisha.r@gmail.com", address: "3900 Gaston Ave", city: "Dallas, TX", source: "Referral", status: "Sold", tone: "up", setter: "Priya Shah", closer: "Luis Haddad", office: "Dallas", created: "Aug 22", next: "Install Sep 24", product: "Attic + Aeroseal", value: 16740, notes: "Utility rebate paperwork started." },
  { id: "L-4726", name: "Paul & Diane Kerr", phone: "(480) 555-0174", email: "dkerr@cox.net", address: "6402 E Thunderbird Rd", city: "Scottsdale, AZ", source: "Canvass", status: "No-show", tone: "alert", setter: "Amber Quinn", closer: "Dana Ortiz", office: "Scottsdale", created: "Aug 21", next: "Reset Sep 19", product: "Windows + air seal", value: 22100, notes: "Texted apology. Asked for Saturday." },
  { id: "L-4718", name: "Miguel Santos", phone: "(623) 555-0109", email: "msantos@gmail.com", address: "17201 W Waddell Rd", city: "Surprise, AZ", source: "Partner", status: "Ran", tone: "up", setter: "Priya Shah", closer: "Marco Velez", office: "Phoenix", created: "Aug 19", next: "Waiting on HOA", product: "Attic R-49", value: 8900, notes: "HOA wants color-matched baffles. 3-day review." },
  { id: "L-4711", name: "Carol Jensen", phone: "(602) 555-0136", email: "cjensen@gmail.com", address: "510 W Encanto Blvd", city: "Phoenix, AZ", source: "Google", status: "Abandoned", tone: "muted", setter: "Amber Quinn", closer: "Nate Solis", office: "Phoenix", created: "Aug 18", next: "None", product: "Air scrubber", value: 2800, notes: "Stopped answering after quote." },
];

export const opportunities: Opportunity[] = [
  { id: "O-1182", leadId: "L-4819", name: "Todd & Kim Hale", product: "HVAC 4-ton + ducts", stage: "Proposal out", tone: "navy", amount: 28640, closer: "Dana Ortiz", office: "Scottsdale", updated: "Sep 12", closeBy: "Sep 18" },
  { id: "O-1178", leadId: "L-4748", name: "Lila Moreno", product: "Attic R-49 + removal", stage: "Proposal out", tone: "navy", amount: 14220, closer: "Marco Velez", office: "Phoenix", updated: "Sep 11", closeBy: "Sep 16" },
  { id: "O-1171", leadId: "L-4718", name: "Miguel Santos", product: "Attic R-49", stage: "Waiting HOA", tone: "alert", amount: 8900, closer: "Marco Velez", office: "Phoenix", updated: "Sep 10", closeBy: "Sep 20" },
  { id: "O-1164", leadId: "L-4802", name: "Jamal Ortiz", product: "Attic R-49", stage: "Spouse follow-up", tone: "alert", amount: 9800, closer: "Cole Brennan", office: "Fort Worth", updated: "Sep 9", closeBy: "Sep 16" },
  { id: "O-1158", leadId: "L-4788", name: "Ben & Alyssa Cho", product: "Attic + HVAC", stage: "Won, production", tone: "up", amount: 31250, closer: "Dana Ortiz", office: "Scottsdale", updated: "Sep 8", closeBy: "Signed" },
  { id: "O-1152", leadId: "L-4761", name: "The Whitakers", product: "Envelope package", stage: "Won, production", tone: "up", amount: 24680, closer: "Dana Ortiz", office: "Scottsdale", updated: "Sep 6", closeBy: "Signed" },
  { id: "O-1146", leadId: "L-4733", name: "Aisha Rahman", product: "Attic + Aeroseal", stage: "Won, production", tone: "up", amount: 16740, closer: "Luis Haddad", office: "Dallas", updated: "Sep 4", closeBy: "Signed" },
  { id: "O-1139", leadId: "L-4740", name: "Greg Fontaine", product: "HVAC 3.5-ton", stage: "One legger", tone: "alert", amount: 16880, closer: "Wrex Lindsay", office: "Phoenix", updated: "Sep 3", closeBy: "Sep 19" },
  { id: "O-1131", leadId: "L-4814", name: "Marcus Bell", product: "Aeroseal + attic", stage: "Appt set", tone: "muted", amount: 12480, closer: "Luis Haddad", office: "Dallas", updated: "Sep 9", closeBy: "Sep 15" },
  { id: "O-1124", leadId: "L-4821", name: "Elena Vargas", product: "Attic R-49 + air seal", stage: "Appt set", tone: "muted", amount: 18420, closer: "Marco Velez", office: "Phoenix", updated: "Sep 11", closeBy: "Sep 14" },
];

export const accounts: Account[] = [
  { id: "A-204", name: "Ben & Alyssa Cho", type: "New", city: "Scottsdale, AZ", owner: "Dana Ortiz", jobs: 1, lifetime: 31250, last: "Sep 8" },
  { id: "A-198", name: "The Whitakers", type: "Repeat", city: "Scottsdale, AZ", owner: "Dana Ortiz", jobs: 2, lifetime: 41880, last: "Sep 6" },
  { id: "A-191", name: "Aisha Rahman", type: "New", city: "Dallas, TX", owner: "Luis Haddad", jobs: 1, lifetime: 16740, last: "Sep 4" },
  { id: "A-184", name: "Cole Family Trust", type: "Repeat", city: "Phoenix, AZ", owner: "Marco Velez", jobs: 3, lifetime: 54210, last: "Aug 30" },
  { id: "A-176", name: "Renee Alvarez", type: "New", city: "Surprise, AZ", owner: "Marco Velez", jobs: 1, lifetime: 13240, last: "Aug 22" },
  { id: "A-169", name: "Patterson Residence", type: "New", city: "Fort Worth, TX", owner: "Cole Brennan", jobs: 1, lifetime: 9800, last: "Aug 18" },
  { id: "A-161", name: "North Canyon HOA #12", type: "Repeat", city: "Phoenix, AZ", owner: "Wrex Lindsay", jobs: 4, lifetime: 76400, last: "Aug 12" },
  { id: "A-154", name: "The Kerrs (prior)", type: "Repeat", city: "Scottsdale, AZ", owner: "Dana Ortiz", jobs: 1, lifetime: 6400, last: "Mar 2" },
];

export const projects: Project[] = [
  { id: "P-331", accountId: "A-204", name: "Cho, attic + HVAC", product: "Attic + HVAC", status: "Scheduled", tone: "navy", amount: 31250, office: "Scottsdale", pm: "Tasha Reed", install: "Sep 22" },
  { id: "P-328", accountId: "A-198", name: "Whitaker, envelope", product: "Envelope package", status: "Scheduled", tone: "navy", amount: 24680, office: "Scottsdale", pm: "Tasha Reed", install: "Sep 18" },
  { id: "P-322", accountId: "A-191", name: "Rahman, attic + Aeroseal", product: "Attic + Aeroseal", status: "Materials", tone: "muted", amount: 16740, office: "Dallas", pm: "Evan Cole", install: "Sep 24" },
  { id: "P-318", accountId: "A-184", name: "Cole Trust, duct sealing", product: "Aeroseal", status: "In progress", tone: "up", amount: 6400, office: "Phoenix", pm: "Tasha Reed", install: "Sep 12" },
  { id: "P-311", accountId: "A-176", name: "Alvarez, attic R-49", product: "Attic R-49", status: "Closed", tone: "up", amount: 13240, office: "Phoenix", pm: "Evan Cole", install: "Aug 28" },
  { id: "P-304", accountId: "A-169", name: "Patterson, attic", product: "Attic R-49", status: "Closed", tone: "up", amount: 9800, office: "Fort Worth", pm: "Evan Cole", install: "Aug 21" },
  { id: "P-297", accountId: "A-161", name: "North Canyon unit 12", product: "Air sealing", status: "On hold", tone: "alert", amount: 11200, office: "Phoenix", pm: "Tasha Reed", install: "Hold, HOA" },
  { id: "P-290", accountId: "A-184", name: "Cole Trust, attic", product: "Attic R-49", status: "Closed", tone: "up", amount: 14880, office: "Phoenix", pm: "Tasha Reed", install: "Jun 14" },
];

export const appointments: Appointment[] = [
  { id: "AP-91", leadId: "L-4821", name: "Elena Vargas", day: 14, time: "6:00p", status: "Confirmed", tone: "navy", setter: "Priya Shah", closer: "Marco Velez", product: "Attic R-49 + air seal", city: "Surprise" },
  { id: "AP-90", leadId: "L-4814", name: "Marcus Bell", day: 15, time: "5:30p", status: "Confirmed", tone: "navy", setter: "Priya Shah", closer: "Luis Haddad", product: "Aeroseal + attic", city: "Dallas" },
  { id: "AP-88", leadId: "L-4802", name: "Jamal Ortiz", day: 16, time: "6:00p", status: "Follow-up", tone: "muted", setter: "Amber Quinn", closer: "Cole Brennan", product: "Attic R-49", city: "Fort Worth" },
  { id: "AP-86", leadId: "L-4754", name: "Owen Briggs", day: 17, time: "6:30p", status: "Set", tone: "muted", setter: "Priya Shah", closer: "Cole Brennan", product: "Aeroseal", city: "Fort Worth" },
  { id: "AP-84", leadId: "L-4761", name: "Whitaker install", day: 18, time: "7:30a", status: "Install", tone: "up", setter: "None", closer: "Dana Ortiz", product: "Envelope package", city: "Scottsdale" },
  { id: "AP-82", leadId: "L-4726", name: "Paul & Diane Kerr", day: 19, time: "11:00a", status: "Reset", tone: "alert", setter: "Amber Quinn", closer: "Dana Ortiz", product: "Windows + air seal", city: "Scottsdale" },
  { id: "AP-80", leadId: "L-4788", name: "Cho install", day: 22, time: "7:00a", status: "Install", tone: "up", setter: "None", closer: "Dana Ortiz", product: "Attic + HVAC", city: "Scottsdale" },
  { id: "AP-78", leadId: "L-4733", name: "Rahman install", day: 24, time: "8:00a", status: "Install", tone: "up", setter: "None", closer: "Luis Haddad", product: "Attic + Aeroseal", city: "Dallas" },
  { id: "AP-77", leadId: "L-4819", name: "Hale proposal review", day: 13, time: "5:00p", status: "Today", tone: "navy", setter: "Amber Quinn", closer: "Dana Ortiz", product: "HVAC 4-ton + ducts", city: "Scottsdale" },
  { id: "AP-76", leadId: "L-4774", name: "Nina Patel", day: 13, time: "4:00p", status: "No sit", tone: "alert", setter: "Amber Quinn", closer: "Luis Haddad", product: "Air sealing", city: "Dallas" },
  { id: "AP-74", leadId: "L-4808", name: "Sharon Nguyen", day: 8, time: "6:00p", status: "Unmarked", tone: "alert", setter: "Priya Shah", closer: "Marco Velez", product: "Insulation removal", city: "Surprise" },
  { id: "AP-71", leadId: "L-4769", name: "Chris Duran", day: 10, time: "5:30p", status: "Missed", tone: "alert", setter: "Priya Shah", closer: "Nate Solis", product: "HVAC replacement", city: "Phoenix" },
  { id: "AP-70", leadId: "L-4740", name: "Greg Fontaine", day: 11, time: "5:00p", status: "One legger", tone: "alert", setter: "Amber Quinn", closer: "Wrex Lindsay", product: "HVAC 3.5-ton", city: "Phoenix" },
  { id: "AP-68", leadId: "L-4769", name: "Chris Duran", day: 12, time: "5:30p", status: "Reschedule", tone: "navy", setter: "Priya Shah", closer: "Nate Solis", product: "HVAC replacement", city: "Phoenix" },
];

export const tickets: Ticket[] = [
  { id: "T-91", title: "HOA baffle color", related: "L-4821", owner: "Marco Velez", priority: "Normal", status: "Open", age: "1d", description: "HOA wants baffle color to match the vents. Need a photo of the approved color.", due: "Sep 18", followers: ["Priya Shah"] },
  { id: "T-88", title: "Unmarked run, Sharon Nguyen", related: "L-4808", owner: "Marco Velez", priority: "High", status: "Open", age: "5d" },
  { id: "T-86", title: "HOA baffle color for Santos", related: "L-4718", owner: "Tasha Reed", priority: "High", status: "Waiting", age: "3d" },
  { id: "T-84", title: "Rebate packet, Rahman", related: "P-322", owner: "Evan Cole", priority: "Normal", status: "Open", age: "2d" },
  { id: "T-81", title: "Fix Briggs email in file", related: "L-4754", owner: "Priya Shah", priority: "Low", status: "Open", age: "1d" },
  { id: "T-79", title: "North Canyon hold, unit 12", related: "P-297", owner: "Wrex Lindsay", priority: "High", status: "Waiting", age: "8d" },
  { id: "T-74", title: "Reset Kerr Saturday run", related: "L-4726", owner: "Amber Quinn", priority: "Normal", status: "Open", age: "12h" },
  { id: "T-70", title: "Commission dispute, Cho HVAC adder", related: "P-331", owner: "Dana Ortiz", priority: "Normal", status: "Waiting", age: "4d" },
  { id: "T-66", title: "Closed, Alvarez photo packet", related: "P-311", owner: "Evan Cole", priority: "Low", status: "Done", age: "None" },
];

export const activities: Record<string, Activity[]> = {
  "L-4821": [
    { at: "Sep 12 8:14a", who: "Priya Shah", what: "Confirmed both spouses for Sunday 6:00p. Sent reminder text." },
    { at: "Sep 11 4:02p", who: "Priya Shah", what: "Canvass set. Interest in attic + air seal. 1998 build." },
  ],
  "L-4819": [
    { at: "Sep 12 9:40p", who: "Dana Ortiz", what: "Ran. Presented $28,640 HVAC + ducts. Proposal emailed." },
    { at: "Sep 10 11:20a", who: "Amber Quinn", what: "Google inbound. Booked evening run." },
  ],
  "L-4808": [
    { at: "Sep 8 7:12p", who: "Priya Shah", what: "Setter marked ran. No closer notes. Needs disposition." },
  ],
};

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function byId<T extends { id: string }>(rows: T[], id: string) {
  return rows.find((r) => r.id === id);
}

export type Channel = "sms" | "call" | "email" | "note";

export type ChatMsg = {
  id: string;
  at: string;
  dir: "in" | "out";
  channel: Channel;
  text: string;
  who: string;
};

export type Conversation = {
  id: string;
  leadId: string;
  unread: number;
  lastAt: string;
  assigned: string;
  channel: Channel;
  messages: ChatMsg[];
};

export const conversations: Conversation[] = [
  {
    id: "C-12",
    leadId: "L-4821",
    unread: 2,
    lastAt: "2m",
    assigned: "Priya Shah",
    channel: "sms",
    messages: [
      { id: "m1", at: "Sat 4:02p", dir: "out", channel: "sms", who: "Priya Shah", text: "Elena, this is Priya with Cozy. Confirming Sunday 6:00p for attic + air seal. Both of you home?" },
      { id: "m2", at: "Sat 4:11p", dir: "in", channel: "sms", who: "Elena Vargas", text: "Yes both of us. Dog will be in the backyard." },
      { id: "m3", at: "Sun 8:14a", dir: "out", channel: "sms", who: "Priya Shah", text: "Perfect. Marco will be there at 6. Text if anything changes." },
      { id: "m4", at: "2m", dir: "in", channel: "sms", who: "Elena Vargas", text: "Can we start at 6:30 instead? Kids pickup ran late." },
      { id: "m5", at: "2m", dir: "in", channel: "sms", who: "Elena Vargas", text: "Also is it ok if my brother sits in? He did insulation last year." },
    ],
  },
  {
    id: "C-11",
    leadId: "L-4819",
    unread: 1,
    lastAt: "18m",
    assigned: "Dana Ortiz",
    channel: "sms",
    messages: [
      { id: "m1", at: "Fri 9:40p", dir: "out", channel: "email", who: "Dana Ortiz", text: "Kim, proposal attached. HVAC 4-ton + ducts $28,640 cash or 12-month. Happy to walk it tonight." },
      { id: "m2", at: "18m", dir: "in", channel: "sms", who: "Todd Hale", text: "Kim is traveling. Can you call me after 7?" },
    ],
  },
  {
    id: "C-10",
    leadId: "L-4808",
    unread: 3,
    lastAt: "1h",
    assigned: "Marco Velez",
    channel: "sms",
    messages: [
      { id: "m1", at: "Mon 7:12p", dir: "out", channel: "sms", who: "Priya Shah", text: "Sharon, checking in after yesterday’s visit. Did Marco cover everything?" },
      { id: "m2", at: "1h", dir: "in", channel: "sms", who: "Sharon Nguyen", text: "Nobody showed??" },
      { id: "m3", at: "1h", dir: "in", channel: "sms", who: "Sharon Nguyen", text: "I waited 40 min." },
      { id: "m4", at: "1h", dir: "in", channel: "sms", who: "Sharon Nguyen", text: "Please call me." },
    ],
  },
  {
    id: "C-09",
    leadId: "L-4774",
    unread: 1,
    lastAt: "3h",
    assigned: "Luis Haddad",
    channel: "sms",
    messages: [
      { id: "m1", at: "Today 1:02p", dir: "out", channel: "sms", who: "Amber Quinn", text: "Nina, 4:00p still good in Dallas? Air sealing consult." },
      { id: "m2", at: "3h", dir: "in", channel: "sms", who: "Nina Patel", text: "Running behind. Might be 4:20." },
    ],
  },
  {
    id: "C-08",
    leadId: "L-4726",
    unread: 0,
    lastAt: "5h",
    assigned: "Amber Quinn",
    channel: "sms",
    messages: [
      { id: "m1", at: "Yesterday", dir: "in", channel: "sms", who: "Diane Kerr", text: "So sorry we missed you. Saturday morning?" },
      { id: "m2", at: "5h", dir: "out", channel: "sms", who: "Amber Quinn", text: "All good. Saturday 11:00a is on Dana’s book. Confirmation going out now." },
    ],
  },
  {
    id: "C-07",
    leadId: "L-4748",
    unread: 0,
    lastAt: "Yesterday",
    assigned: "Marco Velez",
    channel: "email",
    messages: [
      { id: "m1", at: "Yesterday", dir: "out", channel: "email", who: "Marco Velez", text: "Lila, cash $14,220 vs 12-month. Both options in the PDF. Reply with which you want and we lock install." },
    ],
  },
  {
    id: "C-06",
    leadId: "L-4769",
    unread: 1,
    lastAt: "Yesterday",
    assigned: "Nate Solis",
    channel: "call",
    messages: [
      { id: "m1", at: "Sep 10 5:30p", dir: "out", channel: "call", who: "Nate Solis", text: "Outbound · no answer · 0:42 ring" },
      { id: "m2", at: "Yesterday", dir: "in", channel: "sms", who: "Chris Duran", text: "I got stuck at work. Can we reset?" },
    ],
  },
  {
    id: "C-05",
    leadId: "L-4718",
    unread: 0,
    lastAt: "Tue",
    assigned: "Marco Velez",
    channel: "note",
    messages: [
      { id: "m1", at: "Tue", dir: "out", channel: "note", who: "Tasha Reed", text: "HOA wants color-matched baffles. 3-day review. Do not schedule install until Tasha clears." },
      { id: "m2", at: "Tue", dir: "out", channel: "sms", who: "Marco Velez", text: "Miguel, HOA has the baffle spec. We’ll text as soon as they stamp it." },
    ],
  },
  {
    id: "C-04",
    leadId: "L-4788",
    unread: 0,
    lastAt: "Mon",
    assigned: "Dana Ortiz",
    channel: "sms",
    messages: [
      { id: "m1", at: "Mon", dir: "out", channel: "sms", who: "Tasha Reed", text: "Install locked Sep 22 7:00a. Crew of 4. Please have attic hatch clear." },
      { id: "m2", at: "Mon", dir: "in", channel: "sms", who: "Alyssa Cho", text: "We’ll be home. Gate code 4419." },
    ],
  },
  {
    id: "C-03",
    leadId: "L-4740",
    unread: 0,
    lastAt: "Sun",
    assigned: "Wrex Lindsay",
    channel: "call",
    messages: [
      { id: "m1", at: "Sun", dir: "out", channel: "call", who: "Wrex Lindsay", text: "Outbound · connected · 6:12 · spouse traveling until Thursday" },
    ],
  },
];

export const unreadConversations = conversations.reduce((n, c) => n + (c.unread > 0 ? 1 : 0), 0);

