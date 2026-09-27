import { useEffect, useState } from "react";
import type { ScoreKind } from "@/features/leaderboard/catalog";
import { raceMin, type CustomRace } from "@/features/leaderboard/define";
import { compatible, isPlace, raceFields, type RowKind } from "@/features/leaderboard/fields";
import type { Person } from "@/features/leaderboard/rank";
import { cn } from "@/lib/cn";

const KINDS: { id: ScoreKind; label: string }[] = [
  { id: "money", label: "Dollars" },
  { id: "pct", label: "Percent" },
  { id: "num", label: "Count" },
  { id: "days", label: "Time" },
];

export type RaceDraft = Omit<CustomRace, "id" | "positionId" | "retired" | "scores">;

function RaceFields({
  name,
  setName,
  fewest,
  setFewest,
  kind,
  setKind,
  sample,
  setSample,
  mode,
  setMode,
  sourceKey,
  setSourceKey,
  rightKey,
  setRightKey,
  op,
  setOp,
  row,
  names,
}: {
  name: string;
  setName: (v: string) => void;
  fewest: boolean;
  setFewest: (v: boolean) => void;
  kind: ScoreKind;
  setKind: (v: ScoreKind) => void;
  sample: string;
  setSample: (v: string) => void;
  mode: "field" | "calc" | "entered";
  setMode: (v: "field" | "calc" | "entered") => void;
  sourceKey: string;
  setSourceKey: (v: string) => void;
  rightKey: string;
  setRightKey: (v: string) => void;
  op: "+" | "-" | "/";
  setOp: (v: "+" | "-" | "/") => void;
  row: "person" | "partner" | "customer";
  names: string[];
}) {
  const fields = raceFields().filter((field) => field.row === row);
  const taken = names.some((n) => n.toLowerCase() === name.trim().toLowerCase());
  const groups = [...new Set(fields.map((field) => field.group))];
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
          {groups.map((group) => (
            <div key={group} className="mt-2">
              <p className="text-[12px] font-semibold">{group}</p>
              {fields.filter((field) => field.group === group).map((field) => (
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
              {fields.map((field) => (
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

function useClose(onClose: () => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
}

export function RaceSheet({
  position,
  names,
  row,
  onClose,
  onSave,
}: {
  position: string;
  names: string[];
  row: "person" | "partner" | "customer";
  onClose: () => void;
  onSave: (race: RaceDraft) => void;
}) {
  const fields = raceFields().filter((field) => field.row === row);
  const first = fields[0];
  const [name, setName] = useState("");
  const [fewest, setFewest] = useState(false);
  const [kind, setKind] = useState<ScoreKind>("num");
  const [sample, setSample] = useState("");
  const [mode, setMode] = useState<"field" | "calc" | "entered">("field");
  const [sourceKey, setSourceKey] = useState(first?.id ?? "");
  const [rightKey, setRightKey] = useState(fields[1]?.id ?? first?.id ?? "");
  const [op, setOp] = useState<"+" | "-" | "/">("/");
  useClose(onClose);
  const taken = names.some((n) => n.toLowerCase() === name.trim().toLowerCase());
  const source = fields.find((field) => field.id === sourceKey) ?? first;
  const ready = Boolean(name.trim() && !taken && (mode === "entered" ? sample.trim() : source && (mode === "field" || rightKey)));
  function draft(): RaceDraft {
    const base = source && mode !== "entered" ? source : null;
    return {
      name: name.trim(),
      fewest,
      kind: base ? base.kind : kind,
      sample: base ? base.sample : sample.trim(),
      min: base ? raceMin(base.kind) : raceMin(kind),
      mode,
      field: mode === "field" ? sourceKey : undefined,
      calc: mode === "calc" ? { left: sourceKey, op, right: rightKey } : undefined,
      office: false,
    };
  }
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={onClose} />
      <aside className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col bg-card shadow-sm md:inset-y-0 md:right-0 md:left-auto md:w-[440px] md:max-h-none">
        <header className="shrink-0 border-b border-line px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-semibold">Add a race</h2>
              <p className="text-[13px] text-muted">{position}</p>
            </div>
            <button type="button" className="h-10 shrink-0 px-2 text-sm font-semibold text-muted" onClick={onClose}>
              Close
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
          <RaceFields name={name} setName={setName} fewest={fewest} setFewest={setFewest} kind={kind} setKind={setKind} sample={sample} setSample={setSample} mode={mode} setMode={setMode} sourceKey={sourceKey} setSourceKey={setSourceKey} rightKey={rightKey} setRightKey={setRightKey} op={op} setOp={setOp} row={row} names={names} />
        </div>
        <footer className="shrink-0 border-t border-line px-4 py-3">
          <button
            type="button"
            disabled={!ready}
            onClick={() => onSave(draft())}
            className="h-11 w-full rounded-md bg-navy text-sm font-semibold text-card disabled:opacity-40"
          >
            Add race
          </button>
        </footer>
      </aside>
    </div>
  );
}

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
                  setExtra((cur) => [...cur, row]);
                  setWho((cur) => [...cur, row.name]);
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
            {pages.filter((item) => compatible(row, item.row)).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setBoards((cur) => (cur.includes(item.id) ? cur.filter((id) => id !== item.id) : [...cur, item.id]))}
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

const ROWS: { id: RowKind; label: string }[] = [
  { id: "person", label: "Person" },
  { id: "office", label: "Office" },
  { id: "area", label: "Area" },
  { id: "district", label: "District" },
  { id: "region", label: "Region" },
  { id: "partner", label: "Partner" },
  { id: "customer", label: "Customer" },
];

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
