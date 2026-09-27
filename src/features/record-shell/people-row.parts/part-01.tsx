import { useState } from "react";
import { ActBar, type ActItem } from "@/components/act-bar";
import { addActionFollower, addFollower, removeFollower, removeTicketFollower, useOps } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import type { PersonRef } from "@/lib/file-data";
import { PeopleRowView3 } from "./part-03";

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
  const { list, houseMoves, mode, pick, setPick, people, departments, setMode, newFollow, setNewFollow, reason, setReason, into, setInto, others, setPanel, dropFollow, addFollowPerson } = usePeopleRow(personId, owner, seedFollowers, canDrop, actionId, onCancelJob);


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
    <PeopleRowView3 bag={{ owner, list, peopleActs, ownerBlock, followChips, mode, pick, setPick, people, departments, addFollowPerson, setMode, newFollow, setNewFollow, reason, setReason, personId, into, setInto, others, onCancelJob }} />
  );
}

function usePeopleRow(personId: any, owner: any, seedFollowers: any, canDrop: any, actionId: any, onCancelJob: any) {
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
  return { list, houseMoves, mode, pick, setPick, people, departments, setMode, newFollow, setNewFollow, reason, setReason, into, setInto, others, setPanel, dropFollow, addFollowPerson };
}
