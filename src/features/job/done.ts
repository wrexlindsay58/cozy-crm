import { profileById } from "./profiles";
import { contractTotal, type Chapter, type JobFile } from "./types";

export function sectionDone(job: JobFile, id: string): boolean {
  if (job.cancelled && id !== "close") return false;
  if (id === "contact" || id === "assess" || id === "opp") return true;
  if (id === "sold") return job.scope.some((s) => s.kind === "product");
  if (id === "survey") {
    const need = job.scope.filter((s) => s.surveyOn || profileById(s.categoryId)?.needsSurvey);
    const extras = job.surveys ?? [];
    if (!need.length && !extras.length) return true;
    return need.every((s) => s.surveyDone || Boolean(s.surveySkip)) && extras.every((s) => s.surveyDone);
  }
  if (id === "ready") {
    const bom = job.scope.filter((s) => s.bom.length);
    return Boolean(job.preCheck.signedAt) && bom.every((s) => s.bom.every((b) => b.ordered));
  }
  if (id === "crew") return job.assignments.length > 0 && job.assignments.every((a) => a.woId) && job.events.length > 0;
  if (id === "run") {
    const punchOk = !job.punch.length || job.punch.every((p) => p.status === "Done");
    return job.punches.length > 0 && punchOk;
  }
  if (id === "money") {
    const inHand = job.invoices.reduce((s, i) => s + i.paid, 0) + (job.loan.vendor === "GoodLeap" ? job.loan.fundedAmount : 0);
    return inHand >= contractTotal(job);
  }
  if (id === "close") return job.stage === "Closed" || Boolean(job.cancelled);
  if (id === "book") return job.events.length > 0 || job.assignments.some((a) => a.day);
  if (id === "pipeline" || id === "media") return true;
  return false;
}

export function sectionStarted(job: JobFile, id: string): boolean {
  if (sectionDone(job, id)) return true;
  if (id === "sold") return job.scope.length > 0;
  if (id === "survey") {
    const extras = job.surveys ?? [];
    return (
      extras.length > 0 ||
      job.scope.some((s) => s.surveyOn || s.surveyDone || Boolean(s.surveySkip) || Object.keys(s.surveyFacts ?? {}).length > 0 || (s.surveyRooms ?? []).length > 0)
    );
  }
  if (id === "ready") {
    return job.scope.some((s) => s.bom.some((b) => b.ordered || b.received || b.usedQty > 0)) || Boolean(job.preCheck.signedAt) || Boolean(job.permit.number);
  }
  if (id === "crew") return job.assignments.length > 0;
  if (id === "run") {
    return job.punches.length > 0 || job.punch.length > 0 || Object.keys(job.testOut.results ?? {}).length > 0 || Object.keys(job.testOut.checks ?? {}).length > 0;
  }
  if (id === "money") {
    return job.invoices.length > 0 || job.pos.length > 0 || (job.loan.status !== "None" && Boolean(job.loan.status)) || (job.costHits ?? []).length > 0;
  }
  if (id === "close") return Boolean(job.packet.sent) || Boolean(job.packet.sentAt);
  if (id === "book") return job.assignments.some((a) => a.day) || job.events.length > 0;
  if (id === "contact" || id === "assess" || id === "opp") return true;
  return false;
}

export function sectionTone(job: JobFile, id: string): "idle" | "open" | "done" {
  if (sectionDone(job, id)) return "done";
  if (sectionStarted(job, id)) return "open";
  return "idle";
}

export function chapterDone(job: JobFile, chap: Chapter) {
  return sectionDone(job, chap);
}

function prettyDate(d?: string) {
  if (!d) return undefined;
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
    const [y, m, day] = d.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return d;
}

export function sectionDoneAt(job: JobFile, id: string): string | undefined {
  if (!sectionDone(job, id)) return undefined;
  if (id === "sold") return prettyDate(job.soldAt);
  if (id === "ready") return prettyDate(job.preCheck.signedAt);
  if (id === "crew") {
    const days = job.assignments.map((a) => a.day).filter(Boolean).sort();
    return prettyDate(days[0]);
  }
  if (id === "run") {
    const punchDays = job.punches.map((p) => p.day).filter(Boolean).sort();
    return prettyDate(job.postCheck.signedAt) || prettyDate(punchDays.at(-1));
  }
  if (id === "money") return prettyDate(job.loan.payReceivedAt);
  if (id === "close") return prettyDate(job.packet.sentAt) || prettyDate(job.cancelledAt);
  if (id === "book") {
    const days = [...job.events.map((e) => e.day), ...job.assignments.map((a) => a.day)].filter(Boolean).sort();
    return prettyDate(days[0]);
  }
  return undefined;
}
