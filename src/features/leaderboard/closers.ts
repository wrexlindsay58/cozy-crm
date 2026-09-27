import type { Period, Person, Snap } from "@/features/leaderboard/rank";

export const CLOSER_PEOPLE: Person[] = [
  { name: "Dana Ortiz", office: "Scottsdale" },
  { name: "Marco Velez", office: "Phoenix" },
  { name: "Luis Haddad", office: "Dallas" },
  { name: "Cole Brennan", office: "Fort Worth" },
  { name: "Nate Solis", office: "North Phoenix" },
  { name: "Elena Ruiz", office: "Phoenix" },
  { name: "Chris Patel", office: "Scottsdale" },
  { name: "Andre Brooks", office: "Dallas" },
  { name: "Maya Chen", office: "Mesa" },
  { name: "Jonah Reed", office: "Tucson" },
  { name: "Sofia Alvarez", office: "Fort Worth" },
  { name: "Ben Carter", office: "North Phoenix" },
  { name: "Holly Grant", office: "Phoenix" },
];

type Key = "Dana" | "Marco" | "Luis" | "Cole" | "Nate";

const NAME: Record<Key, string> = {
  Dana: "Dana Ortiz",
  Marco: "Marco Velez",
  Luis: "Luis Haddad",
  Cole: "Cole Brennan",
  Nate: "Nate Solis",
};

export function closerSnap(rows: [Key, number, number][]): Snap[] {
  return rows.map(([key, score, n]) => ({ name: NAME[key], score, n }));
}

function period(id: Period["id"], grain: Period["grain"], history: Snap[][], current: Snap[]): Period {
  return { id, grain, history, current };
}

const s = closerSnap;

export const CLOSER_SOLD: Period[] = [
  period("day", "day", [
    s([["Marco", 20100, 1], ["Dana", 11000, 1], ["Cole", 9000, 1], ["Luis", 4000, 1]]),
    s([["Dana", 18000, 1], ["Marco", 17000, 1], ["Cole", 6000, 1]]),
    s([["Dana", 15000, 1], ["Marco", 14000, 1], ["Luis", 9000, 1], ["Cole", 2000, 1]]),
    s([["Dana", 19000, 1], ["Marco", 12000, 1], ["Cole", 11000, 1]]),
    s([["Marco", 22100, 1], ["Dana", 16400, 1], ["Cole", 8000, 1]]),
  ], s([["Dana", 18600, 1], ["Marco", 14200, 1], ["Cole", 9800, 1]])),
  period("wtd", "week", [
    s([["Marco", 70000, 3], ["Dana", 68000, 2], ["Luis", 40000, 2], ["Cole", 20000, 1], ["Nate", 10000, 1]]),
    s([["Marco", 80000, 3], ["Dana", 60000, 2], ["Luis", 30000, 1], ["Cole", 28000, 1]]),
    s([["Marco", 90000, 4], ["Dana", 74000, 3], ["Cole", 30000, 1], ["Luis", 22000, 1], ["Nate", 15000, 1]]),
  ], s([["Marco", 86400, 3], ["Dana", 79200, 2], ["Luis", 33180, 1], ["Cole", 22000, 1]])),
  period("mtd", "month", [
    s([["Dana", 130000, 5], ["Marco", 120000, 5], ["Luis", 70000, 3], ["Nate", 40000, 2], ["Cole", 22000, 1]]),
    s([["Dana", 150000, 6], ["Marco", 110000, 4], ["Luis", 60000, 2], ["Cole", 30000, 1]]),
    s([["Dana", 136000, 5], ["Marco", 134000, 5], ["Luis", 58000, 2], ["Cole", 36000, 2]]),
  ], s([["Dana", 142000, 6], ["Marco", 128000, 5], ["Luis", 64000, 3], ["Cole", 41000, 2], ["Nate", 18000, 1]])),
  period("qtd", "quarter", [
    s([["Marco", 390000, 16], ["Dana", 360000, 14], ["Luis", 210000, 9], ["Cole", 140000, 6], ["Nate", 90000, 4]]),
    s([["Marco", 420000, 18], ["Dana", 400000, 16], ["Luis", 190000, 8], ["Cole", 160000, 7], ["Nate", 110000, 5]]),
  ], s([["Dana", 410000, 17], ["Marco", 410000, 18], ["Luis", 200000, 9], ["Cole", 155000, 7], ["Nate", 98000, 4]])),
  period("ytd", "year", [
    s([["Dana", 700000, 34], ["Marco", 640000, 30], ["Luis", 500000, 24], ["Cole", 380000, 18], ["Nate", 200000, 10]]),
    s([["Dana", 810000, 39], ["Marco", 790000, 38], ["Luis", 600000, 28], ["Cole", 400000, 19], ["Nate", 350000, 16]]),
  ], s([["Marco", 868000, 42], ["Dana", 792000, 38], ["Luis", 641000, 31], ["Cole", 454000, 22], ["Nate", 372000, 18]])),
  period("ltd", "year", [
    s([["Marco", 2100000, 102], ["Dana", 1980000, 96], ["Luis", 1400000, 70], ["Nate", 900000, 44], ["Cole", 880000, 42]]),
    s([["Marco", 2480000, 118], ["Dana", 2360000, 112], ["Luis", 1680000, 82], ["Cole", 1100000, 52], ["Nate", 1040000, 50]]),
  ], s([["Marco", 3348000, 160], ["Dana", 3152000, 150], ["Luis", 2321000, 113], ["Cole", 1554000, 74], ["Nate", 1412000, 68]])),
];
