import { REPORT_FEE, type GradeLetter } from "@/features/assessment/figures";
import { CozyWordmark } from "@/components/cozy-mark";
import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { useAssessmentReport } from "../part-02";
import { AssessmentReportView2 } from "../part-04";

export function downloadReportPdf() {
  const node = document.getElementById("home-report");
  if (!node) return;
  const clone = node.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(".no-print").forEach((el) => el.remove());
  let css = "";
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) css += rule.cssText;
    } catch {
      /* A cross-origin sheet cannot be read. Skip it. */
    }
  }
  const frame = document.createElement("iframe");
  frame.setAttribute("title", "Home performance report");
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:8.5in;height:11in;border:0;background:#fff";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    return;
  }
  const safeCss = css.replaceAll("</", "<\\/");
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Cozy Home Performance Report</title><style>${safeCss}</style><style>@page{margin:0.5in;size:letter}html,body{margin:0;background:#fff}*{ -webkit-print-color-adjust:exact;print-color-adjust:exact}</style></head><body>${clone.outerHTML}</body></html>`);
  doc.close();
  let gone = false;
  const cleanup = () => {
    if (gone) return;
    gone = true;
    frame.remove();
  };
  win.addEventListener("afterprint", cleanup);
  win.focus();
  win.print();
  window.setTimeout(cleanup, 120000);
}

export function AssessmentReport({
  personId,
  closer,
  embedded = false,
  oppId,
  mentionProposal = true,
  onContinue,
  audience = "staff",
}: {
  personId: string;
  closer: string;
  embedded?: boolean;
  oppId?: string;
  mentionProposal?: boolean;
  onContinue?: () => void;
  audience?: "staff" | "customer";
}) {
  const { photos, assess, locked, cozyBlue, navigate, lead, today, figures, chapters, brand } = useAssessmentReport(personId, closer, embedded, oppId, mentionProposal, onContinue, audience);

  const album = [
    ...photos.filter((photo) => photo.src),
    ...(assess?.packets ?? []).flatMap((packet) => packet.photos.filter((photo) => photo.src && !photos.some((row) => row.id === photo.id))),
  ];

  if (locked) {
    return (
      <article className="min-h-dvh bg-white text-[var(--cozy)]" style={cozyBlue}>
        <div className="mx-auto max-w-3xl px-5 py-12">
          <CozyWordmark className="h-8 w-28" />
          <h1 className="mt-8 text-3xl font-semibold tracking-tight">The report is ready.</h1>
          <p className="mt-3 max-w-xl text-sm">
            This visit did not meet the free report. It is {money(REPORT_FEE)}. That amount comes off the job if you buy. Your assessor collects it, then this link opens.
          </p>
          {onContinue ? (
            <button type="button" className="mt-8 h-12 bg-[var(--cozy)] px-8 text-sm font-semibold text-card" onClick={onContinue}>
              The proposal
            </button>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <AssessmentReportView2 bag={{ embedded, cozyBlue, oppId, navigate, assess, lead, today, closer, figures, mentionProposal, chapters, album, onContinue, brand }} />
  );
}

export function GradeMark({ letter, label, large = false, onDark = false }: { letter: GradeLetter; label?: string; large?: boolean; onDark?: boolean }) {
  const bad = letter === "D" || letter === "F";
  const mid = letter === "C";
  return (
    <span className="inline-flex shrink-0 flex-col items-center gap-1">
      <span
        className={cn(
          "grid place-items-center rounded-full font-['Teko',sans-serif] leading-none",
          large ? "size-16 text-3xl" : "size-10 text-2xl",
          bad ? "bg-alert text-white" : onDark ? (mid ? "border border-white text-white" : "bg-white text-[var(--cozy)]") : mid ? "border border-[var(--cozy)] text-[var(--cozy)]" : "bg-[var(--cozy)] text-white",
        )}
      >
        {letter}
      </span>
      {label ? <span className={cn("font-['Oswald',sans-serif] text-[10px] tracking-widest uppercase", onDark ? "text-white/70" : "text-muted")}>{label}</span> : null}
    </span>
  );
}
