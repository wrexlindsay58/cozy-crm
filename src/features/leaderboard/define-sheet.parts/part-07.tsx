import { raceMin } from "@/features/leaderboard/define";
import { compatible } from "@/features/leaderboard/fields";
import { cn } from "@/lib/cn";
import { RaceFields } from "./part-01";
import { WhoList } from "./part-02";

export function PositionSheetView59(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  const row = page === "partners" ? "partner" : page === "customers" ? "customer" : "person";
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <aside className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col bg-card shadow-sm md:inset-y-0 md:right-0 md:left-auto md:w-[440px] md:max-h-none">
        <header className="shrink-0 border-b border-line px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold">Add a group</h2>
              <p className="text-[13px] text-muted">A group is a card. It can mix people, and it can sit on more than one board.</p>
            </div>
            <button type="button" className="h-10 shrink-0 px-2 text-sm font-semibold text-muted" onClick={onClose}>
              Close
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
          <label className="block text-[12px] font-semibold text-muted">
            {partner ? "Partner type" : page === "customers" ? "Customer group" : "Group"}
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={partner ? "Canvassers, manufacturers" : "Assessors"} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm font-normal text-ink outline-none focus:border-navy" />
          </label>
          {taken ? <p className="mt-1 text-[12px] text-alert">That name already exists.</p> : null}
          <div className="mt-4">
            <WhoList groups={shown} who={who} setWho={setWho} />
          </div>
          {partner ? (
            <div className="mt-4 flex items-end gap-2">
              <label className="min-w-0 flex-1 text-[12px] font-semibold text-muted">
                Add a company
                <input value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm font-normal text-ink outline-none focus:border-navy" />
              </label>
              <label className="w-28 text-[12px] font-semibold text-muted">
                Office
                <input value={companyOffice} onChange={(e) => setCompanyOffice(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-2 text-sm font-normal text-ink outline-none focus:border-navy" />
              </label>
              <button
                type="button"
                disabled={!company.trim()}
                onClick={() => {
                  const row = { name: company.trim(), office: companyOffice.trim() || "Phoenix" };
                  setExtra((cur: any) => [...cur, row]);
                  setWho((cur: any) => [...cur, row.name]);
                  setCompany("");
                }}
                className="h-11 shrink-0 rounded-md border border-line px-3 text-[13px] font-semibold disabled:opacity-40"
              >
                Add
              </button>
            </div>
          ) : null}
          <p className="mt-4 text-[12px] font-semibold text-muted">Show this group on</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {pages.filter((item: any) => compatible(row, item.row)).map((item: any) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setBoards((cur: any) => (cur.includes(item.id) ? cur.filter((id: any) => id !== item.id) : [...cur, item.id]))}
                className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", boards.includes(item.id) ? "bg-navy text-card" : "border border-line text-muted")}
              >
                {item.name}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[13px] font-semibold">First race</p>
          <div className="mt-2">
            <RaceFields name={raceName} setName={setRaceName} fewest={fewest} setFewest={setFewest} kind={kind} setKind={setKind} sample={sample} setSample={setSample} mode={mode} setMode={setMode} sourceKey={sourceKey} setSourceKey={setSourceKey} rightKey={rightKey} setRightKey={setRightKey} op={op} setOp={setOp} row={row} names={[]} />
          </div>
        </div>
        <footer className="shrink-0 border-t border-line px-4 py-3">
          <button
            type="button"
            disabled={!ready}
            onClick={() =>
              onSave({
                name: name.trim(),
                page,
                boards,
                people: [...listed, ...extra].filter((person, index, list) => who.includes(person.name) && list.findIndex((item) => item.name === person.name) === index),
                race: {
                  name: raceName.trim(),
                  fewest,
                  kind: base ? base.kind : kind,
                  sample: base ? base.sample : sample.trim(),
                  min: base ? raceMin(base.kind) : raceMin(kind),
                  mode,
                  field: mode === "field" ? sourceKey : undefined,
                  calc: mode === "calc" ? { left: sourceKey, op, right: rightKey } : undefined,
                  office: false,
                },
              })
            }
            className="h-11 w-full rounded-md bg-navy text-sm font-semibold text-card disabled:opacity-40"
          >
            Add group
          </button>
        </footer>
      </aside>
    </div>
  );
}
