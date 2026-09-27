import { CLOSER_PEOPLE, CLOSER_SOLD } from "@/features/leaderboard/closers";
import { span, metric, c, type Board } from "./part-01";
import { __rows1 } from "./part-02";
import { __rows2, __rows3 } from "./part-04";
import { __rows4 } from "./part-05";
import { __rows5 } from "./part-06";
import { __rows6 } from "./part-07";

const __rows0 = [
{
    id: "closers",
    label: "Closers",
    who: "closer",
    people: CLOSER_PEOPLE,
    metrics: [
      metric({ id: "sold", label: "Most sold", kind: "money", sample: "deal", noun: "sold", periods: CLOSER_SOLD }),
      metric({
        id: "close",
        label: "Highest close rate",
        kind: "pct",
        min: 3,
        sample: "sit",
        noun: "close",
        periods: [
          span("day", "day", [c([["Dana", 50, 2], ["Marco", 100, 1]])], c([["Dana", 100, 1], ["Marco", 0, 1], ["Cole", 100, 1]])),
          span("wtd", "week", [c([["Marco", 42, 12], ["Dana", 38, 8], ["Luis", 33, 6], ["Cole", 40, 5]]), c([["Dana", 50, 8], ["Marco", 45, 11]])], c([["Dana", 44, 9], ["Marco", 41, 12], ["Luis", 36, 8], ["Cole", 33, 6], ["Nate", 100, 2]])),
          span("mtd", "month", [c([["Marco", 40, 20], ["Dana", 39, 18], ["Luis", 34, 12], ["Cole", 30, 10], ["Nate", 28, 7]])], c([["Dana", 46, 24], ["Marco", 41, 22], ["Luis", 35, 14], ["Cole", 31, 11], ["Nate", 22, 9]])),
          span("qtd", "quarter", [c([["Dana", 44, 48], ["Marco", 41, 52], ["Luis", 36, 30], ["Cole", 33, 24], ["Nate", 29, 18]])], c([["Dana", 44, 52], ["Marco", 41, 58], ["Luis", 36, 33], ["Cole", 33, 27], ["Nate", 29, 20]])),
          span("ytd", "year", [c([["Dana", 44, 90], ["Marco", 41, 110], ["Luis", 36, 86], ["Cole", 33, 70], ["Nate", 29, 62]])], c([["Dana", 44, 96], ["Marco", 41, 118], ["Luis", 36, 92], ["Cole", 33, 74], ["Nate", 29, 66]])),
          span("ltd", "year", [c([["Dana", 43, 240], ["Marco", 40, 280], ["Luis", 35, 200], ["Cole", 32, 160], ["Nate", 28, 140]])], c([["Dana", 44, 280], ["Marco", 41, 320], ["Luis", 36, 230], ["Cole", 33, 190], ["Nate", 29, 170]])),
        ],
      }),
      metric({
        id: "nra",
        label: "Highest NRA",
        kind: "money",
        min: 3,
        sample: "sit",
        noun: "per sit",
        periods: [
          span("day", "day", [], c([["Dana", 18600, 1], ["Marco", 14200, 1], ["Cole", 9800, 1]])),
          span("wtd", "week", [c([["Dana", 4200, 8], ["Marco", 3800, 12], ["Luis", 3600, 6], ["Cole", 3100, 5]])], c([["Dana", 4400, 9], ["Luis", 4147, 8], ["Marco", 3600, 12], ["Cole", 3667, 6], ["Nate", 7500, 2]])),
          span("mtd", "month", [c([["Dana", 4100, 18], ["Marco", 3900, 22], ["Luis", 3700, 12]])], c([["Dana", 4300, 24], ["Luis", 4000, 14], ["Marco", 3760, 22], ["Cole", 3400, 11], ["Nate", 2000, 9]])),
          span("qtd", "quarter", [c([["Dana", 4000, 48], ["Marco", 3700, 52]])], c([["Dana", 4100, 52], ["Marco", 3800, 58], ["Luis", 3600, 33], ["Cole", 3300, 27], ["Nate", 3100, 20]])),
          span("ytd", "year", [c([["Marco", 3900, 110], ["Dana", 4100, 90]])], c([["Dana", 4125, 96], ["Marco", 3680, 118], ["Luis", 3480, 92], ["Cole", 3070, 74], ["Nate", 2820, 66]])),
          span("ltd", "year", [c([["Dana", 3900, 240], ["Marco", 3600, 280]])], c([["Dana", 4000, 280], ["Marco", 3650, 320], ["Luis", 3400, 230], ["Cole", 3100, 190], ["Nate", 2900, 170]])),
        ],
      }),
      metric({
        id: "ticket",
        label: "Highest average ticket",
        kind: "money",
        min: 3,
        sample: "deal",
        noun: "a deal",
        periods: [
          span("day", "day", [], c([["Dana", 18600, 1], ["Marco", 14200, 1], ["Cole", 9800, 1]])),
          span("wtd", "week", [c([["Dana", 21000, 3], ["Marco", 18000, 4], ["Luis", 16000, 2]])], c([["Luis", 22000, 1], ["Dana", 19800, 4], ["Marco", 17280, 5], ["Cole", 11000, 2]])),
          span("mtd", "month", [c([["Dana", 20000, 6], ["Marco", 18500, 6], ["Luis", 17000, 4], ["Cole", 15000, 3]])], c([["Dana", 23667, 6], ["Marco", 25600, 5], ["Luis", 21333, 3], ["Cole", 20500, 2], ["Nate", 18000, 1]])),
          span("qtd", "quarter", [c([["Marco", 21000, 18], ["Dana", 20500, 16]])], c([["Dana", 24118, 17], ["Marco", 22778, 18], ["Luis", 22222, 9], ["Cole", 22143, 7], ["Nate", 24500, 4]])),
          span("ytd", "year", [c([["Dana", 20769, 39], ["Marco", 20789, 38]])], c([["Dana", 20842, 38], ["Marco", 20667, 42], ["Luis", 20677, 31], ["Cole", 20636, 22], ["Nate", 20667, 18]])),
          span("ltd", "year", [c([["Dana", 21000, 112], ["Marco", 20800, 118]])], c([["Dana", 21013, 150], ["Marco", 20925, 160], ["Luis", 20540, 113], ["Cole", 21000, 74], ["Nate", 20765, 68]])),
        ],
      }),
      metric({
        id: "discount",
        label: "Lowest true discount",
        kind: "pct",
        fewest: true,
        min: 3,
        sample: "deal",
        noun: "true discount",
        periods: [
          span("day", "day", [], c([["Dana", 0, 1], ["Marco", 4, 1], ["Cole", 8, 1]])),
          span("wtd", "week", [c([["Luis", 6, 4], ["Dana", 8, 6], ["Marco", 11, 8], ["Cole", 12, 3]])], c([["Luis", 4, 4], ["Dana", 6, 6], ["Marco", 9, 8], ["Cole", 11, 3], ["Nate", 0, 1]])),
          span("mtd", "month", [c([["Dana", 7, 8], ["Luis", 8, 6], ["Marco", 10, 10], ["Cole", 12, 4]])], c([["Luis", 5, 6], ["Dana", 7, 9], ["Marco", 9, 11], ["Cole", 12, 5], ["Nate", 14, 3]])),
          span("qtd", "quarter", [c([["Dana", 8, 16], ["Luis", 9, 9], ["Marco", 11, 18]])], c([["Luis", 6, 9], ["Dana", 7, 17], ["Marco", 10, 18], ["Cole", 12, 7], ["Nate", 13, 4]])),
          span("ytd", "year", [c([["Dana", 8, 39], ["Marco", 10, 38], ["Luis", 9, 28]])], c([["Luis", 7, 31], ["Dana", 8, 38], ["Marco", 10, 42], ["Cole", 12, 22], ["Nate", 13, 18]])),
          span("ltd", "year", [c([["Dana", 9, 112], ["Luis", 9, 82], ["Marco", 11, 118]])], c([["Luis", 8, 113], ["Dana", 9, 150], ["Marco", 11, 160], ["Cole", 12, 74], ["Nate", 13, 68]])),
        ],
      }),
      metric({
        id: "attach",
        label: "Highest membership attachment",
        kind: "pct",
        min: 3,
        sample: "job",
        noun: "attachment",
        periods: [
          span("day", "day", [], c([["Dana", 100, 1], ["Marco", 0, 1]])),
          span("wtd", "week", [c([["Marco", 40, 5], ["Dana", 33, 3], ["Luis", 25, 4]])], c([["Dana", 50, 4], ["Marco", 40, 5], ["Cole", 0, 2], ["Luis", 25, 4]])),
          span("mtd", "month", [c([["Dana", 45, 8], ["Marco", 38, 8], ["Luis", 30, 6], ["Cole", 20, 4]])], c([["Dana", 50, 6], ["Marco", 40, 5], ["Luis", 33, 3], ["Cole", 0, 2], ["Nate", 0, 1]])),
          span("qtd", "quarter", [c([["Dana", 42, 16], ["Marco", 36, 18]])], c([["Dana", 47, 17], ["Marco", 39, 18], ["Luis", 33, 9], ["Cole", 29, 7], ["Nate", 25, 4]])),
          span("ytd", "year", [c([["Dana", 40, 39], ["Marco", 35, 38]])], c([["Dana", 42, 38], ["Marco", 36, 42], ["Luis", 32, 31], ["Cole", 27, 22], ["Nate", 22, 18]])),
          span("ltd", "year", [c([["Dana", 38, 112], ["Marco", 34, 118]])], c([["Dana", 40, 150], ["Marco", 35, 160], ["Luis", 30, 113], ["Cole", 26, 74], ["Nate", 22, 68]])),
        ],
      }),
    ],
  },
];

export const BOARDS: Board[] = [...__rows0, ...__rows1, ...__rows2, ...__rows3, ...__rows4, ...__rows5, ...__rows6];
