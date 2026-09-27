import { useState } from "react";
import { compatible, isPlace, type RowKind } from "@/features/leaderboard/fields";
import { cn } from "@/lib/cn";
import { useClose } from "../part-01";
import { ROWS } from "../part-02";
import { PositionSheetView12 } from "./part-02";

export function BoardSheet({
  names,
  onClose,
  onSave,
}: {
  names: string[];
  onClose: () => void;
  onSave: (row: { name: string; row: RowKind }) => void;
}) {
  const [name, setName] = useState("");
  const [row, setRow] = useState<RowKind>("area");
  useClose(onClose);
  const taken = names.some((item) => item.toLowerCase() === name.trim().toLowerCase());
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <aside className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col bg-card shadow-sm md:inset-y-0 md:right-0 md:left-auto md:w-[440px] md:max-h-none">
        <header className="shrink-0 border-b border-line px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold">Add a board</h2>
              <p className="text-[13px] text-muted">A board is a page. It decides what one row is. It does not copy the races.</p>
            </div>
            <button type="button" className="h-10 shrink-0 px-2 text-sm font-semibold text-muted" onClick={onClose}>
              Close
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
          <label className="block text-[12px] font-semibold text-muted">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Southwest" className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm font-normal text-ink outline-none focus:border-navy" />
          </label>
          {taken ? <p className="mt-1 text-[12px] text-alert">That board already exists.</p> : null}
          <p className="mt-4 text-[12px] font-semibold text-muted">One row is</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {ROWS.map((item) => (
              <button key={item.id} type="button" onClick={() => setRow(item.id)} className={cn("h-8 rounded-md px-2.5 text-[12px] font-semibold", row === item.id ? "bg-navy text-card" : "border border-line text-muted")}>
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-muted">{isPlace(row) ? "Groups mapped here roll up to that place. The races stay on the group." : "Groups with this kind of row can be mapped here."}</p>
        </div>
        <footer className="shrink-0 border-t border-line px-4 py-3">
          <button type="button" disabled={!name.trim() || taken} onClick={() => onSave({ name: name.trim(), row })} className="h-11 w-full rounded-md bg-navy text-sm font-semibold text-card disabled:opacity-40">
            Add board
          </button>
        </footer>
      </aside>
    </div>
  );
}

export function MapSheet({
  group,
  row,
  pages,
  selected,
  onClose,
  onSave,
}: {
  group: string;
  row: "person" | "partner" | "customer";
  pages: { id: string; name: string; row: RowKind }[];
  selected: string[];
  onClose: () => void;
  onSave: (boards: string[]) => void;
}) {
  const [boards, setBoards] = useState(selected);
  useClose(onClose);
  const allowed = pages.filter((item) => compatible(row, item.row));
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <aside className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col bg-card shadow-sm md:inset-y-0 md:right-0 md:left-auto md:w-[440px] md:max-h-none">
        <header className="shrink-0 border-b border-line px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold">Map {group}</h2>
              <p className="text-[13px] text-muted">Same races. The board decides the row.</p>
            </div>
            <button type="button" className="h-10 shrink-0 px-2 text-sm font-semibold text-muted" onClick={onClose}>
              Close
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
          {allowed.map((item) => (
            <label key={item.id} className="flex h-11 items-center gap-2 text-[13px] font-semibold">
              <input type="checkbox" checked={boards.includes(item.id)} onChange={() => setBoards((cur) => (cur.includes(item.id) ? cur.filter((id) => id !== item.id) : [...cur, item.id]))} />
              {item.name}
            </label>
          ))}
        </div>
        <footer className="shrink-0 border-t border-line px-4 py-3">
          <button type="button" disabled={!boards.length} onClick={() => onSave(boards)} className="h-11 w-full rounded-md bg-navy text-sm font-semibold text-card disabled:opacity-40">
            Save
          </button>
        </footer>
      </aside>
    </div>
  );
}

export function PositionSheetView7(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView8 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView8(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView9 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView9(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView10 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView10(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView11 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView11(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView12 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}
