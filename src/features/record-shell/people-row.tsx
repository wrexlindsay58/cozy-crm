import { useState } from "react";
import { addFollower, removeFollower, transferOwner, useOps } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import type { PersonRef } from "@/lib/file-data";

function Initials({ name }: { name: string }) {
  const bits = name.split(" ").filter(Boolean);
  const letters = ((bits[0]?.[0] ?? "") + (bits[1]?.[0] ?? "")).toUpperCase();
  return (
    <span className="grid size-7 place-items-center rounded-full bg-navy text-[10px] font-bold text-card">
      {letters}
    </span>
  );
}

export function PeopleRow({
  personId,
  owner,
  seedFollowers,
}: {
  personId: string;
  owner: PersonRef;
  seedFollowers: PersonRef[];
}) {
  const { followers } = useOps();
  const { people } = useStaff();
  const list = followers[personId] ?? seedFollowers;
  const [mode, setMode] = useState<"idle" | "follow" | "transfer">("idle");
  const [pick, setPick] = useState(people[0]?.name ?? "");
  const [reason, setReason] = useState("");

  return (
    <div className="border-b border-line bg-card px-4 py-2 md:px-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Initials name={owner.name} />
          <div>
            <p className="text-[10px] font-bold tracking-wide text-muted uppercase">Owner</p>
            <p className="text-sm font-semibold">{owner.name}</p>
          </div>
        </div>
        <span className="hidden h-6 w-px bg-line sm:block" />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <p className="text-[10px] font-bold tracking-wide text-muted uppercase">Followers</p>
          {list.length === 0 ? <p className="text-sm text-muted">None</p> : null}
          {list.map((f) => (
            <span key={f.name} className="inline-flex items-center gap-1.5 text-sm">
              <Initials name={f.name} />
              <span className="font-medium">{f.name}</span>
              <button type="button" className="text-[11px] font-semibold text-muted hover:text-stop" onClick={() => removeFollower(personId, f.name)} aria-label={`Remove ${f.name}`}>
                x
              </button>
            </span>
          ))}
        </div>
        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => setMode(mode === "follow" ? "idle" : "follow")}>
          Follow
        </button>
        <button type="button" className="h-10 rounded-md border border-line px-3 text-sm font-semibold" onClick={() => setMode(mode === "transfer" ? "idle" : "transfer")}>
          Transfer
        </button>
      </div>
      {mode === "follow" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <select value={pick} onChange={(e) => setPick(e.target.value)} className="h-11 rounded-md border border-line bg-card px-3 text-sm">
            {people.map((p) => (
              <option key={p.name}>{p.name}</option>
            ))}
          </select>
          <button
            type="button"
            className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card"
            onClick={() => {
              const p = people.find((x) => x.name === pick);
              if (p) addFollower(personId, { name: p.name, role: p.role });
              setMode("idle");
            }}
          >
            Add
          </button>
        </div>
      ) : null}
      {mode === "transfer" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <select value={pick} onChange={(e) => setPick(e.target.value)} className="h-11 rounded-md border border-line bg-card px-3 text-sm">
            {people.map((p) => (
              <option key={p.name}>{p.name}</option>
            ))}
          </select>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="h-11 min-w-40 flex-1 rounded-md border border-line bg-card px-3 text-sm" />
          <button
            type="button"
            className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card"
            onClick={() => {
              transferOwner(personId, pick, reason);
              setReason("");
              setMode("idle");
            }}
          >
            Transfer
          </button>
        </div>
      ) : null}
    </div>
  );
}
