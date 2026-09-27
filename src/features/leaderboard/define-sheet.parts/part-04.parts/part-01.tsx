import { cn } from "@/lib/cn";
import { KINDS } from "../part-01";
import { PositionSheetView21 } from "./part-02";

export function RaceFieldsView(props: { bag: { name: any; setName: any; taken: any; setMode: any; mode: any; setFewest: any; fewest: any; setKind: any; kind: any; sample: any; setSample: any; groups: any; fields: any; setSourceKey: any; sourceKey: any; setOp: any; op: any; setRightKey: any; rightKey: any } }) {
  const { name, setName, taken, setMode, mode, setFewest, fewest, setKind, kind, sample, setSample, groups, fields, setSourceKey, sourceKey, setOp, op, setRightKey, rightKey } = props.bag;
  return (
    <div>
      <label className="block text-[12px] font-semibold text-muted">
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm font-normal text-ink outline-none focus:border-navy" />
      </label>
      {taken ? <p className="mt-1 text-[12px] text-alert">This group already has a race with that name.</p> : null}
      <p className="mt-4 text-[12px] font-semibold text-muted">Where the number comes from</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {([{ id: "field", label: "A field" }, { id: "calc", label: "A calculation" }, { id: "entered", label: "Entered" }] as const).map((item) => (
          <button key={item.id} type="button" onClick={() => setMode(item.id)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", mode === item.id ? "bg-navy text-card" : "border border-line text-muted")}>
            {item.label}
          </button>
        ))}
      </div>
      {mode === "entered" ? (
        <div>
          <p className="mt-2 text-[12px] text-muted">Someone types the number. Today stays open. Every other period is locked.</p>
          <p className="mt-4 text-[12px] font-semibold text-muted">Direction</p>
          <div className="mt-1 flex gap-1">
            {[{ id: false, label: "Most" }, { id: true, label: "Fewest" }].map((item) => (
              <button key={item.label} type="button" onClick={() => setFewest(item.id)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", fewest === item.id ? "bg-navy text-card" : "border border-line text-muted")}>
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-[12px] font-semibold text-muted">Number</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {KINDS.map((item) => (
              <button key={item.id} type="button" onClick={() => setKind(item.id)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", kind === item.id ? "bg-navy text-card" : "border border-line text-muted")}>
                {item.label}
              </button>
            ))}
          </div>
          <label className="mt-4 block text-[12px] font-semibold text-muted">
            One of them is called
            <input value={sample} onChange={(e) => setSample(e.target.value)} placeholder="sit, hire, visit" className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm font-normal text-ink outline-none focus:border-navy" />
          </label>
          {kind === "pct" || kind === "days" ? <p className="mt-2 text-[12px] text-muted">A rate ranks after 3. A count can rank from one.</p> : null}
        </div>
      ) : (
        <div className="mt-2">
          <p className="text-[12px] text-muted">{mode === "calc" ? "Pick two fields and one operation. The race uses that result." : "The number, the direction, and the sample come from that field."}</p>
          {groups.map((group: any) => (
            <div key={group} className="mt-2">
              <p className="text-[12px] font-semibold">{group}</p>
              {fields.filter((field: any) => field.group === group).map((field: any) => (
                <button key={field.id} type="button" onClick={() => { setSourceKey(field.id); setFewest(Boolean(field.fewest)); }} className={cn("flex h-9 w-full items-center rounded-md px-2 text-left text-[13px] font-semibold", sourceKey === field.id ? "bg-page text-navy" : "text-ink")}>
                  {field.label}
                </button>
              ))}
            </div>
          ))}
          {mode === "calc" ? (
            <div className="mt-3">
              <div className="flex gap-1">
                {([{ id: "/", label: "Divide" }, { id: "-", label: "Subtract" }, { id: "+", label: "Add" }] as const).map((item) => (
                  <button key={item.id} type="button" onClick={() => setOp(item.id)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", op === item.id ? "bg-navy text-card" : "border border-line text-muted")}>
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[12px] font-semibold text-muted">By</p>
              {fields.map((field: any) => (
                <button key={`right-${field.id}`} type="button" onClick={() => setRightKey(field.id)} className={cn("flex h-9 w-full items-center rounded-md px-2 text-left text-[13px] font-semibold", rightKey === field.id ? "bg-page text-navy" : "text-ink")}>
                  {field.group} · {field.label}
                </button>
              ))}
            </div>
          ) : null}
          <p className="mt-3 text-[12px] font-semibold text-muted">Direction</p>
          <div className="mt-1 flex gap-1">
            {[{ id: false, label: "Most" }, { id: true, label: "Fewest" }].map((item) => (
              <button key={item.label} type="button" onClick={() => setFewest(item.id)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", fewest === item.id ? "bg-navy text-card" : "border border-line text-muted")}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PositionSheetView13(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView14 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView14(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView15 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView15(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView16 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView16(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView17 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView17(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView18 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView18(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView19 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView19(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView20 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView20(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView21 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}
