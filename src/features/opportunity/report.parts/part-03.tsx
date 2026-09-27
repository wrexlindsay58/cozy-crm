import { money } from "@/lib/crm-data";
import { cn } from "@/lib/cn";
import { GradeMark, CostDonut } from "./part-01";

export function AssessmentReportView(props: { bag: { embedded: any; mentionProposal: any; figures: any; chapters: any; album: any; onContinue: any } }) {
  const { embedded, mentionProposal, figures, chapters, album, onContinue } = props.bag;
  return (
    <div className={embedded ? "@container px-5 py-5 text-[var(--cozy)] sm:px-8" : "mx-auto max-w-5xl px-4 py-6 @container md:px-6"}>
        <p className="mt-3 text-sm text-muted">
          {mentionProposal ? "Measurements and estimates. Prices are in the proposal, which is a separate document." : "Measurements and estimates from the assessment. No prices."}
        </p>

        {figures && figures.grades.length ? (
          <ul className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-2">
            {figures.grades.map((item: any) => (
              <li key={item.id} className="flex items-center gap-2 bg-[var(--cozy-soft)] px-2.5 py-2">
                <GradeMark letter={item.letter} />
                <span className="min-w-0 text-sm font-semibold">{item.label}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {figures && (figures.slices.length || figures.concerns.length) ? (
          <AssessmentReportView3 bag={{ figures }} />
        ) : null}

        {chapters.length ? (
          <div className="mt-5 grid gap-3 @min-[45rem]:grid-cols-2">
            {chapters.map((chapter: any) => {
              const item = figures?.grades.find((row: any) => row.id === chapter.id);
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
                        {chapter.facts.map((row: any) => (
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
              {album.map((photo: any) => (
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
  );
}

function AssessmentReportView3(props: { bag: { figures: any } }) {
  const { figures } = props.bag;
  return (
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
                    {figures.concerns.map((line: any, index: any) => (
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
                  {figures.dust.map((line: any) => (
                    <li key={line}>{line}</li>
                  ))}
                  {figures.comfort.map((line: any) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
              {figures.slices.length ? (
                <ul className="mt-4 divide-y divide-line border-y border-line">
                  {figures.slices.map((slice: any) => (
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
  );
}
