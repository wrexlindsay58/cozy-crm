import { span, metric, PMS, CREWS, pm, crew } from "./part-01";
import { six } from "./part-02";

export const __rows2 = [
{
    id: "pms",
    label: "PMs",
    who: "PM",
    people: PMS,
    metrics: [
      metric({
        id: "moving",
        label: "Most jobs moving",
        kind: "num",
        sample: "job",
        noun: "moving",
        periods: six((id) => {
          if (id === "day") return { history: [pm([["Evan", 4, 4], ["Tasha", 3, 3]])], current: pm([["Tasha", 4, 4], ["Evan", 3, 3]]) };
          if (id === "wtd") return { history: [pm([["Tasha", 6, 6], ["Evan", 6, 6]])], current: pm([["Tasha", 7, 7], ["Evan", 5, 5]]) };
          if (id === "mtd") return { history: [pm([["Evan", 9, 9], ["Tasha", 8, 8]])], current: pm([["Tasha", 11, 11], ["Evan", 8, 8]]) };
          if (id === "qtd") return { history: [pm([["Tasha", 18, 18], ["Evan", 16, 16]])], current: pm([["Tasha", 22, 22], ["Evan", 17, 17]]) };
          if (id === "ytd") return { history: [pm([["Evan", 40, 40], ["Tasha", 36, 36]])], current: pm([["Tasha", 48, 48], ["Evan", 41, 41]]) };
          return { history: [pm([["Tasha", 90, 90], ["Evan", 84, 84]])], current: pm([["Tasha", 120, 120], ["Evan", 104, 104]]) };
        }),
      }),
      metric({
        id: "holds",
        label: "Fewest holds",
        kind: "num",
        fewest: true,
        sample: "job",
        noun: "holds",
        periods: [
          span("day", "day", [pm([["Tasha", 1, 3], ["Evan", 0, 4]])], pm([["Evan", 1, 3], ["Tasha", 0, 4]])),
          span("wtd", "week", [pm([["Evan", 2, 6], ["Tasha", 1, 6]])], pm([["Tasha", 1, 7], ["Evan", 2, 5]])),
          span("mtd", "month", [pm([["Tasha", 3, 8], ["Evan", 2, 9]])], pm([["Tasha", 1, 11], ["Evan", 3, 8]])),
          span("qtd", "quarter", [pm([["Evan", 4, 16], ["Tasha", 3, 18]])], pm([["Tasha", 2, 22], ["Evan", 4, 17]])),
          span("ytd", "year", [pm([["Tasha", 6, 36], ["Evan", 7, 40]])], pm([["Tasha", 4, 48], ["Evan", 7, 41]])),
          span("ltd", "year", [pm([["Evan", 12, 84], ["Tasha", 14, 90]])], pm([["Tasha", 10, 120], ["Evan", 16, 104]])),
        ],
      }),
      metric({
        id: "days",
        label: "Fewest days to close",
        kind: "days",
        fewest: true,
        min: 3,
        sample: "job",
        noun: "to close",
        periods: [
          span("day", "day", [], pm([["Tasha", 12, 1], ["Evan", 18, 1]])),
          span("wtd", "week", [pm([["Evan", 16, 4], ["Tasha", 14, 5]])], pm([["Tasha", 11, 4], ["Evan", 15, 3]])),
          span("mtd", "month", [pm([["Tasha", 14, 6], ["Evan", 17, 6]])], pm([["Tasha", 12, 8], ["Evan", 16, 6]])),
          span("qtd", "quarter", [pm([["Evan", 15, 12], ["Tasha", 13, 14]])], pm([["Tasha", 12, 16], ["Evan", 15, 13]])),
          span("ytd", "year", [pm([["Tasha", 13, 30], ["Evan", 16, 32]])], pm([["Tasha", 12, 36], ["Evan", 15, 34]])),
          span("ltd", "year", [pm([["Evan", 16, 70], ["Tasha", 14, 80]])], pm([["Tasha", 13, 96], ["Evan", 16, 88]])),
        ],
      }),
    ],
  },
];

export const __rows3 = [
{
    id: "crews",
    label: "Crews",
    who: "crew",
    people: CREWS,
    metrics: [
      metric({
        id: "finished",
        label: "Most jobs finished",
        kind: "num",
        sample: "job",
        noun: "finished",
        periods: six((id) => {
          if (id === "day") return { history: [crew([["C2", 1, 1], ["C1", 1, 1]])], current: crew([["C1", 1, 1], ["C3", 1, 1]]) };
          if (id === "wtd") return { history: [crew([["C1", 3, 3], ["C2", 2, 2], ["C3", 2, 2]])], current: crew([["C2", 3, 3], ["C1", 2, 2], ["C3", 2, 2]]) };
          if (id === "mtd") return { history: [crew([["C1", 6, 6], ["C3", 5, 5], ["C2", 4, 4]])], current: crew([["C1", 7, 7], ["C2", 6, 6], ["C3", 4, 4]]) };
          if (id === "qtd") return { history: [crew([["C2", 12, 12], ["C1", 11, 11], ["C3", 9, 9]])], current: crew([["C1", 14, 14], ["C2", 12, 12], ["C3", 9, 9]]) };
          if (id === "ytd") return { history: [crew([["C1", 28, 28], ["C2", 24, 24], ["C3", 20, 20]])], current: crew([["C1", 32, 32], ["C2", 27, 27], ["C3", 21, 21]]) };
          return { history: [crew([["C1", 70, 70], ["C2", 64, 64], ["C3", 48, 48]])], current: crew([["C1", 88, 88], ["C2", 76, 76], ["C3", 54, 54]]) };
        }),
      }),
      metric({
        id: "qc",
        label: "Highest QC pass",
        kind: "pct",
        min: 3,
        sample: "job",
        noun: "passed",
        periods: [
          span("day", "day", [], crew([["C1", 100, 1], ["C3", 100, 1]])),
          span("wtd", "week", [crew([["C2", 100, 3], ["C1", 67, 3], ["C3", 50, 2]])], crew([["C2", 100, 3], ["C1", 50, 2], ["C3", 50, 2]])),
          span("mtd", "month", [crew([["C1", 83, 6], ["C2", 75, 4], ["C3", 80, 5]])], crew([["C2", 100, 6], ["C1", 86, 7], ["C3", 75, 4]])),
          span("qtd", "quarter", [crew([["C2", 92, 12], ["C1", 82, 11], ["C3", 78, 9]])], crew([["C2", 92, 12], ["C1", 86, 14], ["C3", 78, 9]])),
          span("ytd", "year", [crew([["C1", 89, 28], ["C2", 88, 24], ["C3", 80, 20]])], crew([["C2", 93, 27], ["C1", 88, 32], ["C3", 81, 21]])),
          span("ltd", "year", [crew([["C1", 86, 70], ["C2", 85, 64], ["C3", 78, 48]])], crew([["C2", 91, 76], ["C1", 87, 88], ["C3", 80, 54]])),
        ],
      }),
      metric({
        id: "callbacks",
        label: "Fewest callbacks",
        kind: "num",
        fewest: true,
        sample: "job",
        noun: "callbacks",
        periods: [
          span("day", "day", [crew([["C1", 0, 1]])], crew([["C1", 0, 1], ["C3", 1, 1]])),
          span("wtd", "week", [crew([["C2", 0, 3], ["C1", 1, 3], ["C3", 1, 2]])], crew([["C2", 0, 3], ["C1", 1, 2], ["C3", 1, 2]])),
          span("mtd", "month", [crew([["C1", 1, 6], ["C3", 1, 5], ["C2", 2, 4]])], crew([["C2", 0, 6], ["C1", 1, 7], ["C3", 2, 4]])),
          span("qtd", "quarter", [crew([["C2", 1, 12], ["C1", 2, 11], ["C3", 2, 9]])], crew([["C2", 1, 12], ["C1", 2, 14], ["C3", 3, 9]])),
          span("ytd", "year", [crew([["C1", 3, 28], ["C2", 3, 24], ["C3", 4, 20]])], crew([["C2", 2, 27], ["C1", 4, 32], ["C3", 5, 21]])),
          span("ltd", "year", [crew([["C2", 6, 64], ["C1", 8, 70], ["C3", 9, 48]])], crew([["C2", 6, 76], ["C1", 9, 88], ["C3", 11, 54]])),
        ],
      }),
      metric({
        id: "reviews",
        label: "Most reviews",
        kind: "num",
        sample: "review",
        noun: "reviews",
        periods: six((id) => {
          if (id === "day") return { history: [crew([["C2", 1, 1]])], current: crew([["C3", 1, 1]]) };
          if (id === "wtd") return { history: [crew([["C1", 2, 2], ["C2", 1, 1]])], current: crew([["C2", 2, 2], ["C1", 1, 1], ["C3", 1, 1]]) };
          if (id === "mtd") return { history: [crew([["C1", 3, 3], ["C3", 2, 2], ["C2", 1, 1]])], current: crew([["C1", 4, 4], ["C2", 3, 3], ["C3", 1, 1]]) };
          if (id === "qtd") return { history: [crew([["C2", 6, 6], ["C1", 5, 5], ["C3", 3, 3]])], current: crew([["C1", 7, 7], ["C2", 6, 6], ["C3", 3, 3]]) };
          if (id === "ytd") return { history: [crew([["C1", 12, 12], ["C2", 10, 10], ["C3", 6, 6]])], current: crew([["C1", 14, 14], ["C2", 11, 11], ["C3", 7, 7]]) };
          return { history: [crew([["C1", 30, 30], ["C2", 26, 26], ["C3", 14, 14]])], current: crew([["C1", 36, 36], ["C2", 30, 30], ["C3", 16, 16]]) };
        }),
      }),
    ],
  },
];
