import { span, metric, HANDS, hand, TECHS, tech } from "./part-01";
import { grown, six } from "./part-02";

export const __rows4 = [
{
    id: "hands",
    label: "Crew members",
    who: "crew member",
    people: HANDS,
    metrics: [
      metric({
        id: "work",
        label: "Most work completed",
        kind: "num",
        sample: "job",
        noun: "completed",
        periods: six((id) => {
          if (id === "day") return { history: [hand([["Omar", 2, 2], ["Luis", 1, 1]])], current: hand([["Luis", 2, 2], ["Rico", 1, 1], ["Sam", 1, 1]]) };
          if (id === "wtd") return { history: [hand([["Omar", 4, 4], ["Luis", 3, 3], ["Rico", 3, 3], ["Sam", 2, 2]])], current: hand([["Omar", 5, 5], ["Luis", 4, 4], ["Rico", 3, 3], ["Sam", 2, 2]]) };
          if (id === "mtd") return { history: [hand([["Luis", 8, 8], ["Omar", 7, 7], ["Sam", 6, 6], ["Rico", 5, 5]])], current: hand([["Omar", 9, 9], ["Luis", 8, 8], ["Rico", 6, 6], ["Sam", 5, 5]]) };
          if (id === "qtd") return { history: [hand([["Omar", 16, 16], ["Luis", 14, 14], ["Rico", 12, 12], ["Sam", 10, 10]])], current: hand([["Omar", 18, 18], ["Luis", 16, 16], ["Rico", 13, 13], ["Sam", 11, 11]]) };
          if (id === "ytd") return { history: [hand([["Luis", 30, 30], ["Omar", 28, 28], ["Rico", 22, 22], ["Sam", 20, 20]])], current: hand([["Omar", 34, 34], ["Luis", 31, 31], ["Rico", 24, 24], ["Sam", 22, 22]]) };
          return { history: [hand([["Omar", 70, 70], ["Luis", 66, 66], ["Rico", 48, 48], ["Sam", 44, 44]])], current: hand([["Omar", 88, 88], ["Luis", 80, 80], ["Rico", 58, 58], ["Sam", 52, 52]]) };
        }),
      }),
      metric({
        id: "hours",
        label: "Most hours",
        kind: "num",
        sample: "hour",
        noun: "hours",
        periods: [
          span("day", "day", [hand([["Omar", 8, 8], ["Luis", 8, 8], ["Rico", 6, 6]])], hand([["Luis", 9, 9], ["Omar", 8, 8], ["Rico", 7, 7], ["Sam", 4, 4]])),
          span("wtd", "week", [hand([["Omar", 36, 36], ["Luis", 34, 34], ["Rico", 30, 30], ["Sam", 28, 28]])], hand([["Luis", 38, 38], ["Omar", 36, 36], ["Rico", 32, 32], ["Sam", 24, 24]])),
          span("mtd", "month", [hand([["Omar", 140, 140], ["Luis", 132, 132], ["Sam", 120, 120], ["Rico", 118, 118]])], hand([["Omar", 152, 152], ["Luis", 148, 148], ["Rico", 130, 130], ["Sam", 110, 110]])),
          span("qtd", "quarter", [hand([["Luis", 400, 400], ["Omar", 390, 390], ["Rico", 340, 340], ["Sam", 320, 320]])], hand([["Omar", 420, 420], ["Luis", 410, 410], ["Rico", 360, 360], ["Sam", 330, 330]])),
          span("ytd", "year", [hand([["Omar", 1500, 1500], ["Luis", 1460, 1460], ["Rico", 1200, 1200], ["Sam", 1180, 1180]])], hand([["Omar", 1620, 1620], ["Luis", 1580, 1580], ["Rico", 1310, 1310], ["Sam", 1240, 1240]])),
          span("ltd", "year", [hand([["Luis", 4200, 4200], ["Omar", 4000, 4000], ["Rico", 3100, 3100], ["Sam", 3000, 3000]])], hand([["Omar", 4800, 4800], ["Luis", 4600, 4600], ["Rico", 3500, 3500], ["Sam", 3300, 3300]])),
        ],
      }),
      metric({
        id: "fails",
        label: "Fewest QC fails",
        kind: "num",
        fewest: true,
        sample: "check",
        noun: "fails",
        periods: [
          span("day", "day", [hand([["Omar", 0, 2], ["Luis", 1, 2]])], hand([["Luis", 0, 2], ["Rico", 0, 1], ["Sam", 1, 1]])),
          span("wtd", "week", [hand([["Sam", 0, 3], ["Omar", 1, 4], ["Luis", 1, 4], ["Rico", 1, 3]])], hand([["Omar", 0, 5], ["Luis", 1, 4], ["Rico", 1, 3], ["Sam", 1, 2]])),
          span("mtd", "month", [hand([["Omar", 1, 8], ["Luis", 1, 8], ["Rico", 2, 6], ["Sam", 2, 6]])], hand([["Luis", 0, 8], ["Omar", 1, 9], ["Rico", 1, 6], ["Sam", 2, 5]])),
          span("qtd", "quarter", [hand([["Luis", 1, 14], ["Omar", 2, 16], ["Sam", 2, 10], ["Rico", 3, 12]])], hand([["Luis", 1, 16], ["Omar", 2, 18], ["Rico", 2, 13], ["Sam", 3, 11]])),
          span("ytd", "year", [hand([["Omar", 3, 28], ["Luis", 4, 30], ["Rico", 4, 22], ["Sam", 5, 20]])], hand([["Luis", 2, 31], ["Omar", 3, 34], ["Rico", 4, 24], ["Sam", 6, 22]])),
          span("ltd", "year", [hand([["Luis", 8, 66], ["Omar", 9, 70], ["Rico", 10, 48], ["Sam", 12, 44]])], hand([["Luis", 8, 80], ["Omar", 10, 88], ["Rico", 11, 58], ["Sam", 14, 52]])),
        ],
      }),
    ],
  },
{
    id: "techs",
    label: "Service techs",
    who: "tech",
    people: TECHS,
    metrics: [
      metric({
        id: "visits",
        label: "Most visits completed",
        kind: "num",
        sample: "visit",
        noun: "completed",
        periods: six((id) => grown(tech([["Diego", 5, 5], ["Hannah", 4, 4], ["Marcus", 3, 3]]), id)),
      }),
      metric({
        id: "repairs",
        label: "Most repairs collected",
        kind: "money",
        sample: "repair",
        noun: "collected",
        periods: six((id) => grown(tech([["Diego", 2400, 3], ["Hannah", 1800, 2], ["Marcus", 900, 1]]), id)),
      }),
      metric({
        id: "failed",
        label: "Fewest failed visits",
        kind: "num",
        fewest: true,
        sample: "visit",
        noun: "failed",
        periods: six((id) => grown(tech([["Marcus", 2, 3], ["Diego", 1, 5], ["Hannah", 0, 4]]), id)),
      }),
    ],
  },
];
