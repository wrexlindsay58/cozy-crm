import { Download, X } from "lucide-react";
import { CozyWordmark } from "@/components/cozy-mark";
import { money } from "@/lib/crm-data";
import { placeLine } from "@/lib/place";
import { cn } from "@/lib/cn";
import { downloadReportPdf, GradeMark } from "./part-01";
import { AssessmentReportView } from "./part-03";

export function AssessmentReportView2(props: { bag: { embedded: any; cozyBlue: any; oppId: any; navigate: any; assess: any; lead: any; today: any; closer: any; figures: any; mentionProposal: any; chapters: any; album: any; onContinue: any; brand: any } }) {
  const { embedded, cozyBlue, oppId, navigate, assess, lead, today, closer, figures, mentionProposal, chapters, album, onContinue, brand } = props.bag;
  return (
    <article id="home-report" className={embedded ? "bg-white text-[var(--cozy)]" : "min-h-dvh bg-white text-[var(--cozy)]"} style={{ ...cozyBlue, fontFamily: '"Google Sans", "Noto Sans", sans-serif' }}>
      {embedded ? null : (
        <header className="no-print sticky top-0 z-20 flex items-center gap-2 border-b border-line bg-white px-3 py-2">
          <button
            type="button"
            className="grid size-11 place-items-center text-muted"
            aria-label="Close report"
            onClick={() =>
              oppId
                ? navigate({ to: "/opportunities/$oppId", params: { oppId } })
                : assess
                  ? navigate({ to: "/assessments/$assessmentId", params: { assessmentId: assess.id }, search: { section: "report" } })
                  : navigate({ to: "/assessments" })
            }
          >
            <X className="size-5" />
          </button>
          <CozyWordmark className="h-7 w-24" />
          <button type="button" className="no-print ml-auto inline-flex h-11 items-center gap-1.5 px-2 text-[11px] font-semibold tracking-widest uppercase" onClick={downloadReportPdf}>
            <Download className="size-4" />
            PDF
          </button>
        </header>
      )}
      <header className={cn("border-b-[3px] border-[#C2162E] bg-[var(--cozy)] py-5 text-white", embedded ? "px-5 sm:px-8" : "px-10 sm:px-[3.25rem]")}>
        <div className="flex items-center justify-between gap-3">
          <CozyWordmark className="h-11 w-auto" house="#C2162E" word="#FFFFFF" />
          {embedded ? (
            <button type="button" className="no-print inline-flex h-9 items-center gap-1.5 border border-white/50 px-3 text-sm font-semibold text-white" onClick={downloadReportPdf}>
              <Download className="size-4" />
              PDF
            </button>
          ) : null}
        </div>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-['Oswald',sans-serif] text-[12px] tracking-[0.16em] text-white/80 uppercase">Home performance report</p>
            <h1 className="mt-1 font-['Teko',sans-serif] text-4xl leading-none font-semibold tracking-wide @min-[30rem]:text-5xl">{lead?.name ?? assess?.name ?? "This house"}</h1>
            <p className="mt-2 text-sm text-white/90">{lead ? placeLine(lead.address, lead.city, lead.office) : assess?.address}</p>
            <p className="mt-0.5 text-[13px] text-white/70">
              {today} · {assess?.closer || closer}
              {figures?.bill?.actual != null ? ` · Peak bill ${money(figures.bill.actual)}` : ""}
            </p>
          </div>
          {figures ? <GradeMark letter={figures.overall} label="House" large onDark /> : null}
        </div>
      </header>
      <AssessmentReportView bag={{ embedded, mentionProposal, figures, chapters, album, onContinue }} />
      <footer className={cn("flex items-center justify-between gap-4 border-t-[3px] border-[#C2162E] bg-[var(--cozy)] py-5 text-white", embedded ? "px-5 sm:px-8" : "px-10 sm:px-[3.25rem]")}>
        <CozyWordmark className="h-9 w-auto shrink-0" house="#C2162E" word="#FFFFFF" />
        <p className="text-right text-[11px] leading-relaxed text-white/80">
          {brand.name}
          <br />
          {brand.license}
          <br />
          {brand.phone}
        </p>
      </footer>
    </article>
  );
}
