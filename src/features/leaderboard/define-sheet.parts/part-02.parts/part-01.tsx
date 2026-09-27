import { useState } from "react";
import type { ScoreKind } from "@/features/leaderboard/catalog";
import { compatible, raceFields, type RowKind } from "@/features/leaderboard/fields";
import type { Person } from "@/features/leaderboard/rank";
import { useClose, type RaceDraft } from "../part-01";
import { PositionSheetView6 } from "./part-02";

export function WhoList({ groups, who, setWho }: { groups: { label: string; people: Person[] }[]; who: string[]; setWho: (next: string[]) => void }) {
  const all = groups.flatMap((group) => group.people.map((person) => person.name));
  const every = all.length > 0 && all.every((name) => who.includes(name));
  function setMany(names: string[], on: boolean) {
    setWho(on ? [...new Set([...who, ...names])] : who.filter((name) => !names.includes(name)));
  }
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-muted">Who</p>
        <button type="button" onClick={() => setWho(every ? [] : all)} className="h-8 text-[12px] font-semibold text-muted hover:text-ink">
          {every ? "Clear" : "Select all"}
        </button>
      </div>
      {groups.map((group) => {
        const names = group.people.map((person) => person.name);
        const on = names.length > 0 && names.every((name) => who.includes(name));
        return (
          <div key={group.label} className="mt-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold">{group.label}</p>
              <button type="button" onClick={() => setMany(names, !on)} className="h-7 text-[12px] font-semibold text-muted hover:text-ink">
                {on ? "Clear" : "Select all"}
              </button>
            </div>
            <ul>
              {group.people.map((person) => (
                <li key={person.name}>
                  <label className="flex h-10 items-center gap-2 text-[13px]">
                    <input type="checkbox" checked={who.includes(person.name)} onChange={() => setWho(who.includes(person.name) ? who.filter((name) => name !== person.name) : [...who, person.name])} />
                    <span className="font-semibold">{person.name}</span>
                    <span className="text-muted">{person.office}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function PositionSheet({
  names,
  page = "people",
  current,
  pages,
  groups,
  onClose,
  onSave,
}: {
  names: string[];
  page?: "people" | "partners" | "customers";
  current: string;
  pages: { id: string; name: string; row: RowKind }[];
  groups: { label: string; people: Person[] }[];
  onClose: () => void;
  onSave: (row: { name: string; people: Person[]; page: "people" | "partners" | "customers"; boards: string[]; race: RaceDraft }) => void;
}) {
  const row = page === "partners" ? "partner" : page === "customers" ? "customer" : "person";
  const fields = raceFields().filter((field) => field.row === row);
  const listed = groups.flatMap((group) => group.people);
  const [name, setName] = useState("");
  const [who, setWho] = useState(listed.map((person) => person.name));
  const [extra, setExtra] = useState<Person[]>([]);
  const [company, setCompany] = useState("");
  const [companyOffice, setCompanyOffice] = useState("Phoenix");
  const [boards, setBoards] = useState(() => {
    const allowed = pages.filter((item) => compatible(row, item.row)).map((item) => item.id);
    const start = new Set([current, ...allowed.filter((id) => ["people", "partners", "customers"].includes(id) || id === current)]);
    return [...start].filter((id) => allowed.includes(id));
  });
  const [raceName, setRaceName] = useState("");
  const [fewest, setFewest] = useState(false);
  const [kind, setKind] = useState<ScoreKind>("num");
  const [sample, setSample] = useState("");
  const [mode, setMode] = useState<"field" | "calc" | "entered">("field");
  const [sourceKey, setSourceKey] = useState(fields[0]?.id ?? "");
  const [rightKey, setRightKey] = useState(fields[1]?.id ?? fields[0]?.id ?? "");
  const [op, setOp] = useState<"+" | "-" | "/">("/");
  useClose(onClose);
  const partner = page === "partners";
  const taken = names.some((n) => n.toLowerCase() === name.trim().toLowerCase());
  const source = fields.find((field) => field.id === sourceKey);
  const ready = Boolean(name.trim() && !taken && who.length > 0 && boards.length > 0 && raceName.trim() && (mode === "entered" ? sample.trim() : source));
  const shown = extra.length ? [...groups, { label: "New", people: extra }] : groups;
  const base = source && mode !== "entered" ? source : null;
  return (
    <PositionSheetView bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

export const ROWS: { id: RowKind; label: string }[] = [
  { id: "person", label: "Person" },
  { id: "office", label: "Office" },
  { id: "area", label: "Area" },
  { id: "district", label: "District" },
  { id: "region", label: "Region" },
  { id: "partner", label: "Partner" },
  { id: "customer", label: "Customer" },
];

function PositionSheetView(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView2 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView2(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView3 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView3(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView4 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView4(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView5 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}

function PositionSheetView5(props: { bag: { onClose: any; partner: any; page: any; name: any; setName: any; taken: any; shown: any; who: any; setWho: any; company: any; setCompany: any; companyOffice: any; setCompanyOffice: any; setExtra: any; pages: any; setBoards: any; boards: any; raceName: any; setRaceName: any; fewest: any; setFewest: any; kind: any; setKind: any; sample: any; setSample: any; mode: any; setMode: any; sourceKey: any; setSourceKey: any; rightKey: any; setRightKey: any; op: any; setOp: any; ready: any; onSave: any; listed: any; extra: any; base: any } }) {
  const { onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base } = props.bag;
  return (
    <PositionSheetView6 bag={{ onClose, partner, page, name, setName, taken, shown, who, setWho, company, setCompany, companyOffice, setCompanyOffice, setExtra, pages, setBoards, boards, raceName, setRaceName, fewest, setFewest, kind, setKind, sample, setSample, mode, setMode, sourceKey, setSourceKey, rightKey, setRightKey, op, setOp, ready, onSave, listed, extra, base }} />
  );
}
