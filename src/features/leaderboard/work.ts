import type { Metric } from "@/features/leaderboard/catalog";
import { money, leads } from "@/lib/crm-data";
import type { RangeId } from "@/lib/sales-data";

export type WorkLine = {
  id: string;
  title: string;
  detail: string;
  figure: string;
  href?: string;
  hot?: boolean;
};

const WHEN = ["Today", "Yesterday", "Sep 11", "Sep 10", "Sep 9", "Sep 8", "Sep 5", "Sep 4", "Sep 3", "Sep 2", "Aug 28", "Aug 26"];

function hash(text: string) {
  let h = 0;
  for (const c of text) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return h;
}

function parts(total: number, count: number, seed: number) {
  if (count <= 0) return [];
  if (count === 1) return [total];
  const weights = Array.from({ length: count }, (_, i) => ((seed + i * 17) % 7) + 2);
  const sum = weights.reduce((a, b) => a + b, 0);
  const out = weights.map((w) => Math.max(0, Math.round((total * w) / sum)));
  out[count - 1] += total - out.reduce((a, b) => a + b, 0);
  return out;
}

function customers(person: string, seed: number) {
  const mine = leads.filter((l) => l.closer === person || l.setter === person);
  const source = mine.length ? mine : leads;
  const start = seed % source.length;
  return [...source.slice(start), ...source.slice(0, start)];
}

export function workFor(person: string, metric: Metric, range: RangeId, score: number, n: number) {
  const seed = hash(`${person}:${metric.id}:${range}`);
  const show = Math.min(n, 12);
  const people = customers(person, seed);
  const hits = Math.round((score / 100) * show);
  const amounts = parts(metric.kind === "money" && metric.min > 1 ? score * show : metric.kind === "pct" && metric.id !== "close" && metric.id !== "show" && metric.id !== "qc" && metric.id !== "attach" ? score * show : score, show, seed);
  const lines: WorkLine[] = [];

  for (let i = 0; i < show; i += 1) {
    const lead = people[i % people.length];
    const city = lead.city.split(",")[0];
    const when = range === "day" && i === 0 ? "Today" : WHEN[i % WHEN.length];
    const hit = i < (metric.fewest ? Math.min(score, show) : hits);
    const id = `${lead.id}-${metric.id}-${i}`;
    const href = `/leads/${lead.id}`;
    const base = { id, title: lead.name, href, detail: `${when} · ${city}` };

    if (metric.id === "sold" || metric.id === "ticket") {
      lines.push({ ...base, detail: `${when} · ${lead.product || city}`, figure: money(Math.max(0, amounts[i] ?? 0)) });
    } else if (metric.id === "nra") {
      const amount = Math.max(0, amounts[i] ?? 0);
      lines.push({ ...base, detail: `${when} · ${amount ? lead.product || "Sold" : "No deal"}`, figure: amount ? money(amount) : "No deal", hot: amount > 0 });
    } else if (metric.id === "ran") {
      lines.push({ ...base, figure: "Ran" });
    } else if (metric.id === "sets") {
      lines.push({ ...base, figure: "Set" });
    } else if (metric.id === "close" || metric.id === "show") {
      const word = hit ? (metric.id === "show" ? "Showed" : "Sold") : metric.id === "show" ? "No-show" : "No deal";
      lines.push({ ...base, figure: word });
    } else if (metric.id === "discount") {
      const pct = Math.max(0, amounts[i] ?? 0);
      lines.push({ ...base, detail: `${when} · ${lead.product || city}`, figure: `${pct}%`, hot: pct > 0 });
    } else if (metric.id === "attach") {
      lines.push({ ...base, figure: hit ? "Membership" : "No membership", hot: hit });
    } else if (metric.id === "holds") {
      lines.push({ ...base, detail: `${when} · ${lead.product || "Job"}`, figure: hit ? "On hold" : "Clear", hot: hit });
    } else if (metric.id === "days") {
      lines.push({ ...base, detail: `${when} · ${lead.product || "Job"}`, figure: `${Math.max(1, amounts[i] ?? score)} days` });
    } else if (metric.id === "qc") {
      lines.push({ ...base, detail: `${when} · ${lead.product || "Install"}`, figure: hit ? "Passed" : "Failed", hot: !hit });
    } else if (metric.id === "callbacks" || metric.id === "fails") {
      lines.push({ ...base, detail: `${when} · ${lead.product || "Install"}`, figure: hit ? (metric.id === "fails" ? "Failed" : "Callback") : "Clean", hot: hit });
    } else if (metric.id === "hours") {
      lines.push({ ...base, title: lead.name, detail: `${when} · on site`, figure: `${Math.max(1, amounts[i] ?? 0)} hours` });
    } else if (metric.id === "visits") {
      lines.push({ ...base, figure: "Visit" });
    } else if (metric.id === "repairs") {
      lines.push({ ...base, figure: money(Math.max(0, amounts[i] ?? 0)) });
    } else if (metric.id === "failed") {
      lines.push({ ...base, figure: hit ? "Failed" : "Fixed", hot: hit });
    } else if (metric.id === "closed") {
      lines.push({ ...base, figure: "Closed" });
    } else if (metric.id === "speed") {
      lines.push({ ...base, figure: `${Math.max(1, amounts[i] ?? score)} min` });
    } else if (metric.id === "sat") {
      lines.push({ ...base, figure: "Sat" });
    } else if (metric.id === "deals") {
      lines.push({ ...base, figure: "Deal" });
    } else if (metric.id === "hires" || metric.id === "trained" || metric.id === "solo" || metric.id === "kept") {
      const trainees = ["Alex Mora", "Ben Cole", "Cara Diaz", "Drew Shah", "Erin Blake", "Finn Ortiz", "Gina Park", "Hugo Nguyen", "Iris Cho", "Jules Hart", "Kim Walsh", "Lana Ruiz"];
      const trainee = trainees[(seed + i) % trainees.length];
      const figure = metric.id === "hires" ? "Hired" : metric.id === "trained" ? "Trained" : metric.id === "solo" ? `${Math.max(1, amounts[i] ?? score)} days` : `${Math.max(0, amounts[i] ?? 0)}%`;
      lines.push({ id, title: trainee, detail: when, figure, hot: metric.id === "kept" && (amounts[i] ?? 0) < 60 });
    } else if (metric.id === "reviews") {
      lines.push({ ...base, figure: "5 stars", hot: true });
    } else {
      lines.push({ ...base, detail: `${when} · ${lead.product || city}`, figure: metric.id === "moving" ? "In progress" : "Done" });
    }
  }

  if (metric.id === "hours") {
    const chunks: WorkLine[] = [];
    let left = score;
    let i = 0;
    while (left > 0 && chunks.length < 12) {
      const take = Math.min(left, 6 + ((seed + i) % 5));
      chunks.push({
        id: `hour-${i}`,
        title: WHEN[i % WHEN.length],
        detail: "On site",
        figure: `${take} hours`,
      });
      left -= take;
      i += 1;
    }
    return { lines: chunks, more: left > 0 ? `${left} more hours` : "" };
  }

  const more = n > show ? `${n - show} more this period` : "";
  return { lines, more };
}
