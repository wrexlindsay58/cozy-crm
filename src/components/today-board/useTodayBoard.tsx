import { TODAY, addDays, toIso } from "@/features/book/time";
import { useBook } from "@/features/book/store";
import { rollsOn } from "@/features/job/prep";
import { useJobs } from "@/features/job/store";
import { useRoster } from "@/features/book/roster";
import { useOps } from "@/features/ops/store";
import { buildToday } from "@/features/today/live";
import { useMemo, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

export function useTodayBoard() {
const jobs = useJobs();

const events = useBook().filter((e) => rollsOn(e.jobId ? jobs[e.jobId] : undefined, e.start.slice(0, 10)));

const roster = useRoster();

const { leads } = useOps();

const [office, setOffice] = useState<"all" | "PHX" | "DFW">("all");

const dayKey = toIso(TODAY).slice(0, 10);

const yestKey = toIso(addDays(TODAY, -1)).slice(0, 10);

const t = useMemo(
    () => buildToday({ events, leads, roster, dayKey, yestKey, hour: 18, office }),
    [events, leads, roster, dayKey, yestKey, office],
  );

const [feed, setFeed] = useState(false);

const [salesSlot, setSalesSlot] = useState<HTMLDivElement | null>(null);

const navigate = useNavigate();

const sales = useRouterState({ select: (s) => (s.location.search as { board?: string }).board === "sales" });

function pickBoard(next: "live" | "sales") {
    void navigate({ to: "/", search: next === "sales" ? { board: "sales" } : {} });
  }

const flowMax = Math.max(...t.flow.map((s: any) => Math.max(s.now, s.yest)), 1);

const mktX = t.marketingSpend ? Math.round(t.marketingSold / t.marketingSpend) : 0;

const collectedOf = t.cashIn + t.expected;

const collectedPct = collectedOf ? Math.round((t.cashIn / collectedOf) * 100) : 0;
  return { jobs, events, roster, leads, office, setOffice, dayKey, yestKey, t, feed, setFeed, salesSlot, setSalesSlot, navigate, sales, pickBoard, flowMax, mktX, collectedOf, collectedPct };
}
