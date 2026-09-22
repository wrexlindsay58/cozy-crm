import { useState } from "react";
import { ActBar, type ActItem } from "@/components/act-bar";
import { Tip } from "@/components/tip";
import { addActionFollower, addFollower, dropLead, mergeLead, removeFollower, removeTicketFollower, transferOwner, useOps } from "@/features/ops/store";
import { addDepartment, useStaff } from "@/features/staff/store";
import type { PersonRef } from "@/lib/file-data";

export function Initials({ name }: { name: string }) {
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
  actionId,
  onCancelJob,
}: {
  personId: string;
  owner: PersonRef;
  seedFollowers: PersonRef[];
  canDrop?: boolean;
  actionId?: string;
  onCancelJob?: (why: string) => void;
}) {
  const { followers, leads, actions } = useOps();
  const { people, departments } = useStaff();
  const action = actionId ? actions.find((a) => a.id === actionId) : undefined;
  const list = action
    ? (action.followers ?? []).map((name) => ({ name, role: "Follow" }))
    : (followers[personId] ?? seedFollowers);
  const [mode, setMode] = useState<"idle" | "follow" | "transfer" | "drop" | "merge" | "cancel">("idle");
  const [pick, setPick] = useState(`p:${people[0]?.name ?? ""}`);
  const [reason, setReason] = useState("");
  const [newFollow, setNewFollow] = useState("");
  const others = leads.filter((l) => l.id !== personId && l.status !== "Merged" && l.status !== "Dropped");
  const [into, setInto] = useState(others[0]?.id ?? "");
  const houseMoves = !actionId;

  function setPanel(next: "idle" | "follow" | "transfer" | "drop" | "merge" | "cancel") {
    setMode((cur) => (cur === next ? "idle" : next));
  }

  function addFollowPerson(name: string, role: string) {
    if (actionId) addActionFollower(actionId, name);
    else addFollower(personId, { name, role });
  }

  function dropFollow(name: string) {
    if (actionId) removeTicketFollower(actionId, name);
    else removeFollower(personId, name);
  }

  function followChips() {
    return (
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold tracking-wide text-muted uppercase">Followers</p>
        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-2">
          {list.length === 0 ? <p className="text-sm text-muted">None</p> : null}
          {list.map((f) => (
            <span key={f.name} className="group inline-flex items-center gap-1.5 text-sm">
              <Initials name={f.name} />
              <span className="font-medium">{f.name}</span>
              <button
                type="button"
                className="text-[11px] font-semibold text-muted opacity-0 hover:text-stop group-hover:opacity-100 group-focus-within:opacity-100"
                onClick={() => dropFollow(f.name)}
                aria-label={`Remove ${f.name}`}
              >
                x
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  }

  function peopleActs(iconsOnly?: boolean) {
    return (
      <ActBar
        iconsOnly={iconsOnly}
        items={
          [
            { label: "Follow", onClick: () => setPanel("follow") },
            ...(houseMoves
              ? [
                  { label: "Transfer", onClick: () => setPanel("transfer") },
                  ...(onCancelJob ? [{ label: "Cancel job", onClick: () => setPanel("cancel") }] : []),
                  ...(canDrop
                    ? [
                        { label: "Merge", onClick: () => setPanel("merge") },
                        { label: "Drop", onClick: () => setPanel("drop") },
                      ]
                    : []),
                ]
              : []),
          ] as ActItem[]
        }
      />
    );
  }

  function ownerBlock() {
    return (
      <div className="shrink-0">
        <p className="text-[10px] font-bold tracking-wide text-muted uppercase">Owner</p>
        <div className="mt-0.5 flex items-center gap-2">
          <Initials name={owner.name} />
          <p className="text-sm font-semibold">{owner.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-line bg-card px-4 py-2 md:px-5">
      <div className="flex flex-col gap-2 md:hidden">
        <div className="flex items-start gap-6">
          <div className="shrink-0">
            <p className="text-[10px] font-bold tracking-wide text-muted uppercase">Owner</p>
            <Tip label={owner.name} on>
              <span className="mt-0.5 inline-flex shrink-0" aria-label={`Owner ${owner.name}`}>
                <Initials name={owner.name} />
              </span>
            </Tip>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-wide text-muted uppercase">Followers</p>
            <div className="mt-0.5 flex min-w-0 items-center justify-end gap-1.5 overflow-x-auto">
              {list.length === 0 ? <p className="text-sm text-muted">None</p> : null}
              {list.map((f) => (
                <Tip key={f.name} label={f.name} on>
                  <span className="shrink-0" aria-label={f.name}>
                    <Initials name={f.name} />
                  </span>
                </Tip>
              ))}
            </div>
          </div>
        </div>
        {peopleActs(true)}
      </div>
      <div className="hidden min-w-0 flex-nowrap items-start gap-6 overflow-x-auto md:flex">
        {ownerBlock()}
        {followChips()}
        <div className="ml-auto shrink-0 self-center">{peopleActs()}</div>
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
                addFollowPerson(pick.slice(2), "Dept");
              } else {
                const name = pick.startsWith("p:") ? pick.slice(2) : pick;
                const p = people.find((x) => x.name === name);
                addFollowPerson(p?.name ?? name, p?.role ?? "Follow");
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
              addFollowPerson(name, "Dept");
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
      {mode === "cancel" && onCancelJob ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why we're cancelling" className="h-11 min-w-40 flex-1 rounded-md border border-line bg-card px-3 text-sm" />
          <button
            type="button"
            className="h-11 rounded-md border border-alert px-3 text-sm font-semibold text-alert"
            onClick={() => {
              if (!reason.trim()) return;
              onCancelJob(reason.trim());
              setReason("");
              setMode("idle");
            }}
          >
            Cancel job
          </button>
        </div>
      ) : null}
    </div>
  );
}
