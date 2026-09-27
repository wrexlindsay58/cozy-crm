import type { Channel } from "./part-01";

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

export const __rows0 = [
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
];

export const __rows1 = [
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
