import { useState } from "react";
import { ActBar, type ActItem } from "@/components/act-bar";
import { addFollower, dropLead, mergeLead, removeFollower, transferOwner, useOps } from "@/features/ops/store";
import { addDepartment, useStaff } from "@/features/staff/store";
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
  canDrop,
}: {
  personId: string;
  owner: PersonRef;
  seedFollowers: PersonRef[];
  canDrop?: boolean;
}) {
  const { followers, leads } = useOps();
  const { people, departments } = useStaff();
  const list = followers[personId] ?? seedFollowers;
  const [mode, setMode] = useState<"idle" | "follow" | "transfer" | "drop" | "merge">("idle");
  const [pick, setPick] = useState(`p:${people[0]?.name ?? ""}`);
  const [reason, setReason] = useState("");
  const [newFollow, setNewFollow] = useState("");
  const others = leads.filter((l) => l.id !== personId && l.status !== "Merged" && l.status !== "Dropped");
  const [into, setInto] = useState(others[0]?.id ?? "");

  function setPanel(next: "idle" | "follow" | "transfer" | "drop" | "merge") {
    setMode((cur) => (cur === next ? "idle" : next));
  }

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
            <span key={f.name} className="group inline-flex items-center gap-1.5 text-sm">
              <Initials name={f.name} />
              <span className="font-medium">{f.name}</span>
              <button
                type="button"
                className="text-[11px] font-semibold text-muted opacity-0 hover:text-stop group-hover:opacity-100 group-focus-within:opacity-100"
                onClick={() => removeFollower(personId, f.name)}
                aria-label={`Remove ${f.name}`}
              >
                x
              </button>
            </span>
          ))}
        </div>
        <ActBar
          items={
            [
              { label: "Follow", onClick: () => setPanel("follow") },
              { label: "Transfer", onClick: () => setPanel("transfer") },
              ...(canDrop
                ? [
                    { label: "Merge", onClick: () => setPanel("merge") },
                    { label: "Drop", onClick: () => setPanel("drop") },
                  ]
                : []),
            ] as ActItem[]
          }
        />
      </div>
      {mode === "follow" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <select value={pick} onChange={(e) => setPick(e.target.value)} className="h-11 min-w-40 rounded-md border border-line bg-card px-3 text-sm">
            <optgroup label="People">
              {people.map((p) => (
                <option key={p.name} value={`p:${p.name}`}>
                  {p.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Departments">
              {departments.map((d) => (
                <option key={d} value={`d:${d}`}>
                  {d}
                </option>
              ))}
            </optgroup>
          </select>
          <button
            type="button"
            className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card"
            onClick={() => {
              if (pick.startsWith("d:")) {
                const name = pick.slice(2);
                addFollower(personId, { name, role: "Dept" });
              } else {
                const name = pick.startsWith("p:") ? pick.slice(2) : pick;
                const p = people.find((x) => x.name === name);
                if (p) addFollower(personId, { name: p.name, role: p.role });
              }
              setMode("idle");
            }}
          >
            Add
          </button>
          <input
            value={newFollow}
            onChange={(e) => setNewFollow(e.target.value)}
            placeholder="New follower or department"
            className="h-11 min-w-40 flex-1 rounded-md border border-line px-3 text-sm"
          />
          <button
            type="button"
            className="h-11 rounded-md border border-line px-3 text-sm font-semibold"
            onClick={() => {
              const name = newFollow.trim();
              if (!name) return;
              addDepartment(name);
              addFollower(personId, { name, role: "Dept" });
              setNewFollow("");
              setMode("idle");
            }}
          >
            Add new
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
      {mode === "merge" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <select value={into} onChange={(e) => setInto(e.target.value)} className="h-11 min-w-0 flex-1 rounded-md border border-line bg-card px-3 text-sm">
            {others.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} · {l.address}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card"
            onClick={() => {
              if (!into) return;
              mergeLead(personId, into);
              setMode("idle");
            }}
          >
            Merge
          </button>
        </div>
      ) : null}
      {mode === "drop" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="h-11 min-w-40 flex-1 rounded-md border border-line bg-card px-3 text-sm" />
          <button
            type="button"
            className="h-11 rounded-md bg-stop px-3 text-sm font-semibold text-card"
            onClick={() => {
              if (!reason.trim()) return;
              dropLead(personId, reason.trim());
              setReason("");
              setMode("idle");
            }}
          >
            Drop
          </button>
        </div>
      ) : null}
    </div>
  );
}
