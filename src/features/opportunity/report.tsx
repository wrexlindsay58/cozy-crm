import { useNavigate } from "@tanstack/react-router";
import { Download, X } from "lucide-react";
import type { CSSProperties } from "react";
import { assessmentForLead, useAssessments } from "@/features/assessment/store";
import { returnSizeFacts, hatchFacts } from "@/features/assessment/packets";
import { fieldCaption, useAssessCategories } from "@/features/assessment/categories";
import { buildFigures, REPORT_FEE, type CostSlice, type GradeLetter } from "@/features/assessment/figures";
import { useReportAccess } from "@/features/assessment/fee-card";
import { useOps } from "@/features/ops/store";
import { usePhotos } from "@/features/photos/store";
import { useBrand } from "@/features/brand/store";
import { CozyWordmark } from "@/components/cozy-mark";
import { money } from "@/lib/crm-data";
import { placeLine } from "@/lib/place";
import { cn } from "@/lib/cn";

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
  useAssessments();
  const brand = useBrand();
  const navigate = useNavigate();
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === personId);
  const assess = assessmentForLead(personId);
  const cats = useAssessCategories();
  const photos = usePhotos(personId);
  const access = useReportAccess(
    assess ?? {
      id: "",
      leadId: personId,
      name: "",
      address: "",
      closer,
      status: "Open",
      packets: [],
      property: { occupancy: "", bothHome: "", yearBuilt: "", sqft: "", stories: "", hoa: "", access: "", electrical: "", notes: "", utility: "", hotRooms: "", coldRooms: "", indoorTemp: "", outdoorTemp: "", occupants: "", peakBill: "" },
      qualify: {},
      intent: "",
      reportPaid: false,
      reportWaivedBy: "",
      reportWaiveReason: "",
    },
  );
  const locked = audience === "customer" && !access.unlocked;
  const cozyBlue = {
    ["--cozy" as string]: brand.navy,
    ["--cozy-soft" as string]: `color-mix(in srgb, ${brand.navy} 11%, white)`,
  } as CSSProperties;
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const figures = assess
    ? buildFigures({
        sqft: assess.property.sqft,
        stories: assess.property.stories,
        occupants: assess.property.occupants,
        peakBill: assess.property.peakBill,
        utility: assess.property.utility,
        hotRooms: assess.property.hotRooms,
        coldRooms: assess.property.coldRooms,
        indoorTemp: assess.property.indoorTemp,
        outdoorTemp: assess.property.outdoorTemp,
        packets: assess.packets,
      })
    : null;
  const chapterOrder = ["attic", "hvac", "ducts", "windows"];
  const chapters = (assess?.packets ?? [])
    .filter((packet) => packet.id !== "air-seal")
    .map((packet) => {
      const cat = cats.find((c) => c.id === packet.id);
      const facts = (cat?.fields ?? [])
        .map((field) => ({ label: fieldCaption(field), value: (packet.fields[field.label] || packet.fields[field.id] || "").trim() }))
        .filter((row) => row.value);
      if (packet.id === "attic") {
        const legacy = assess?.packets.find((row) => row.id === "air-seal");
        if (legacy) {
          for (const [label, value] of Object.entries(legacy.fields)) {
            const clean = value.trim();
            if (clean && !facts.some((row) => row.label === label)) facts.push({ label, value: clean });
          }
        }
        for (const row of hatchFacts(packet)) {
          if (!facts.some((item) => item.label === row.label)) facts.push(row);
        }
      }
      if (packet.id === "windows") {
        const outside = (assess?.property.outdoorTemp || packet.fields["Outside temperature (°F)"] || "").trim();
        if (outside && !facts.some((row) => row.label === "Outside temperature (°F)")) facts.push({ label: "Outside temperature (°F)", value: outside });
      }
      if (packet.id === "ducts") {
        for (const row of returnSizeFacts(packet)) {
          if (!facts.some((item) => item.label === row.label)) facts.push(row);
        }
        for (const label of ["Jump ducts", "Transfer grilles"] as const) {
          const old = label === "Jump ducts" ? "Jump ducts (count)" : "Air transfers (count)";
          const value = (packet.fields[label] || packet.fields[old] || "").trim();
          if (value && !facts.some((item) => item.label === label)) facts.push({ label, value });
        }
      }
      return { id: packet.id, label: cat?.label ?? packet.id, facts, notes: packet.notes.trim() };
    })
    .filter((chapter) => chapter.facts.length || chapter.notes)
    .sort((a, b) => chapterOrder.indexOf(a.id) - chapterOrder.indexOf(b.id));
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
      <div className={embedded ? "@container px-5 py-5 text-[var(--cozy)] sm:px-8" : "mx-auto max-w-5xl px-4 py-6 @container md:px-6"}>
        <p className="mt-3 text-sm text-muted">
          {mentionProposal ? "Measurements and estimates. Prices are in the proposal, which is a separate document." : "Measurements and estimates from the assessment. No prices."}
        </p>

        {figures && figures.grades.length ? (
          <ul className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-2">
            {figures.grades.map((item) => (
              <li key={item.id} className="flex items-center gap-2 bg-[var(--cozy-soft)] px-2.5 py-2">
                <GradeMark letter={item.letter} />
                <span className="min-w-0 text-sm font-semibold">{item.label}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {figures && (figures.slices.length || figures.concerns.length) ? (
          <section className="mt-5 grid gap-6 border-t border-[var(--cozy)]/20 pt-5 @min-[47.5rem]:grid-cols-[220px_1fr]">
            {figures.slices.length ? (
              <div className="bg-[var(--cozy-soft)] px-3 py-3">
                <h2 className="text-center text-[11px] font-bold tracking-[0.14em] text-[var(--cozy)] uppercase">Estimated add</h2>
                <CostDonut slices={figures.slices} />
                <p className="text-center text-[11px] text-muted">Peak month. Not the bill.</p>
              </div>
            ) : null}
            <div className="min-w-0">
              {figures.concerns.length ? (
                <>
                  <h2 className="font-['Oswald',sans-serif] text-lg tracking-wide uppercase">Main areas of concern</h2>
                  <ol className="mt-2 space-y-1.5 text-sm">
                    {figures.concerns.map((line, index) => (
                      <li key={line} className="flex gap-2">
                        <span className="font-semibold text-[var(--cozy)]">{index + 1}</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ol>
                </>
              ) : null}
              {figures.bill ? <p className="mt-3 text-sm text-muted">{figures.bill.note} A house this size should land near {money(figures.bill.low)}–{money(figures.bill.high)}.</p> : null}
              {figures.dust.length || figures.comfort.length ? (
                <ul className="mt-3 space-y-1 text-sm">
                  {figures.dust.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                  {figures.comfort.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
              {figures.slices.length ? (
                <ul className="mt-4 divide-y divide-line border-y border-line">
                  {figures.slices.map((slice) => (
                    <li key={slice.id} className="grid gap-0.5 py-2 @min-[40rem]:grid-cols-[9rem_6.5rem_1fr] @min-[40rem]:items-baseline @min-[40rem]:gap-3">
                      <p className="text-sm font-semibold">{slice.label}</p>
                      <p className="text-sm font-semibold text-[var(--cozy)]">{money(slice.low)}–{money(slice.high)}</p>
                      <p className="text-[12px] text-muted">{slice.note}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ) : null}

        {chapters.length ? (
          <div className="mt-5 grid gap-3 @min-[45rem]:grid-cols-2">
            {chapters.map((chapter) => {
              const item = figures?.grades.find((row) => row.id === chapter.id);
              return (
                <section key={chapter.id} className="flex flex-col border border-line">
                  <header className="bg-[var(--cozy-soft)] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-['Oswald',sans-serif] text-sm tracking-wide uppercase">{chapter.label}</h2>
                      {item ? <GradeMark letter={item.letter} /> : null}
                    </div>
                    {item ? (
                      <div className="mt-2 h-1.5 bg-white">
                        <div className={cn("h-full", item.letter === "D" || item.letter === "F" ? "bg-alert" : "bg-[var(--cozy)]")} style={{ width: `${item.score}%` }} />
                      </div>
                    ) : null}
                  </header>
                  <div className="flex flex-1 flex-col px-4 py-3">
                    {figures?.verdicts[chapter.id] ? <p className="text-sm">{figures.verdicts[chapter.id]}</p> : null}
                    {chapter.facts.length ? (
                      <dl className="mt-3">
                        {chapter.facts.map((row) => (
                          <div key={row.label} className="flex items-baseline justify-between gap-3 border-t border-line py-1.5">
                            <dt className="text-[12px] text-muted">{row.label}</dt>
                            <dd className="text-right text-sm font-semibold">{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : null}
                    {chapter.notes ? <p className="mt-2 text-[12px] text-muted">{chapter.notes}</p> : null}
                  </div>
                </section>
              );
            })}
          </div>
        ) : null}

        {album.length ? (
          <section className="mt-6">
            <h2 className="font-['Oswald',sans-serif] text-base tracking-wide uppercase">Photos from the assessment</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 @min-[45rem]:grid-cols-3">
              {album.map((photo) => (
                <li key={photo.id}>
                  <img src={photo.src} alt="" className="aspect-[4/3] w-full object-cover" />
                  {photo.caption ? <p className="mt-1 text-[12px] text-muted">{photo.caption}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {figures ? (
          <section className="mt-6 bg-[var(--cozy)] px-4 py-4 text-white">
            <h2 className="font-['Oswald',sans-serif] text-[11px] tracking-[0.16em] uppercase">How this was figured</h2>
            <p className="mt-2 text-justify text-[11px] leading-relaxed text-white/80">{figures.assumptions.join(" ")}</p>
          </section>
        ) : (
          <p className="mt-6 text-sm">The assessment is not in yet.</p>
        )}

        {onContinue ? (
          <button type="button" className="mt-6 h-11 bg-[var(--cozy)] px-6 text-sm font-semibold text-card" onClick={onContinue}>
            The proposal
          </button>
        ) : null}
      </div>
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

function GradeMark({ letter, label, large = false, onDark = false }: { letter: GradeLetter; label?: string; large?: boolean; onDark?: boolean }) {
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

function CostDonut({ slices }: { slices: CostSlice[] }) {
  const mids = slices.map((slice) => (slice.low + slice.high) / 2);
  const total = mids.reduce((sum, n) => sum + n, 0) || 1;
  const radius = 42;
  const turn = 2 * Math.PI * radius;
  let offset = 0;
  const biggest = Math.max(...mids);
  return (
    <div className="relative mx-auto mt-2 size-44">
      <svg viewBox="0 0 120 120" className="size-full">
        {mids.map((mid, index) => {
          const length = (mid / total) * turn;
          const node = (
            <circle
              key={slices[index].id}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="14"
              strokeDasharray={`${length} ${turn - length}`}
              strokeDashoffset={-offset}
              className={mid === biggest ? "text-alert" : "text-[var(--cozy)]"}
              opacity={mid === biggest ? 1 : 0.28 + (index % 3) * 0.18}
              transform="rotate(-90 60 60)"
            />
          );
          offset += length;
          return node;
        })}
      </svg>
      <p className="absolute inset-0 grid place-content-center text-center">
        <span className="text-sm font-semibold">{money(Math.round(total))}</span>
        <span className="text-[10px] text-muted">/ month</span>
      </p>
    </div>
  );
}
