export type FeedTab = "chat" | "activity";
export type Reacts = Record<string, string[]>;

export type ChatLine = {
  id: string;
  who: string;
  text: string;
  at: string;
  media?: { name: string };
  replies?: ChatLine[];
  reacts?: Reacts;
};
export type ActivityLine = { id: string; who: string; text: string; at: string; reacts?: Reacts };

export const seedChat: ChatLine[] = [
  {
    id: "c1",
    who: "Priya Shah",
    text: "Cho is 10 out. Gate code 4412.",
    at: "4:14p",
    reacts: { "✅": ["Tasha Reed"] },
  },
  { id: "c2", who: "Tasha Reed", text: "Rolling Scottsdale now.", at: "4:12p", reacts: { "🔥": ["Priya Shah", "Evan Cole"] } },
  {
    id: "c3",
    who: "Dana Ortiz",
    text: "Hale agreement is out. Waiting on both owners.",
    at: "4:06p",
    replies: [{ id: "c3r", who: "Marco Velez", text: "I'll ping them if it's still open at 5.", at: "4:08p" }],
  },
  { id: "c4", who: "Evan Cole", text: "Whitaker WO signed. Dumpster is on the street.", at: "3:58p" },
  { id: "c5", who: "Marco Velez", text: "Need a second sit tomorrow in Gilbert if anyone's light.", at: "3:41p" },
  { id: "c6", who: "Luis Haddad", text: "Dallas sit ran. No-sit, wife wasn't home.", at: "3:22p" },
];

export const seedActivity: ActivityLine[] = [
  { id: "a1", who: "Dana Ortiz", text: "sent the agreement to Hale.", at: "4:12p", reacts: { "🔥": ["Marco Velez"] } },
  { id: "a2", who: "Crew 2 — Tasha", text: "rolled Scottsdale for Cho install.", at: "4:08p" },
  { id: "a3", who: "Marco Velez", text: "signed $18,400 with Rahman.", at: "3:55p", reacts: { "🔥": ["Priya Shah", "Dana Ortiz"] } },
  { id: "a4", who: "Priya Shah", text: "set Patterson for tomorrow 5:00p.", at: "3:44p" },
  { id: "a5", who: "Omar Diaz", text: "closed the HOA baffle ticket.", at: "3:31p" },
  { id: "a6", who: "Crew 1 — Evan", text: "got a 5-star from the Whitakers.", at: "3:18p", reacts: { "👍": ["Tasha Reed"] } },
  { id: "a7", who: "Amber Quinn", text: "set Bell in Dallas for Friday.", at: "2:56p" },
  { id: "a8", who: "Crew 3 — Dallas", text: "dispatched Fort Worth for Alvarez.", at: "2:40p" },
  { id: "a9", who: "Luis Haddad", text: "sent the agreement to Nguyen.", at: "2:21p" },
  { id: "a10", who: "Tasha Reed", text: "QC fail on Cho — register blow-by.", at: "1:58p" },
];
