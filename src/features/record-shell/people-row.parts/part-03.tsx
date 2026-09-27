import { dropLead, mergeLead, transferOwner } from "@/features/ops/store";
import { PeopleRowView, PeopleRowView2 } from "./part-02";

export function PeopleRowView3(props: { bag: { owner: any; list: any; peopleActs: any; ownerBlock: any; followChips: any; mode: any; pick: any; setPick: any; people: any; departments: any; addFollowPerson: any; setMode: any; newFollow: any; setNewFollow: any; reason: any; setReason: any; personId: any; into: any; setInto: any; others: any; onCancelJob: any } }) {
  const { owner, list, peopleActs, ownerBlock, followChips, mode, pick, setPick, people, departments, addFollowPerson, setMode, newFollow, setNewFollow, reason, setReason, personId, into, setInto, others, onCancelJob } = props.bag;
  return (
    <div className="border-b border-line bg-card px-4 py-2 md:px-5">
      <PeopleRowView2 bag={{ owner, list, peopleActs }} />
      <div className="hidden min-w-0 flex-nowrap items-start gap-6 overflow-x-auto md:flex">
        {ownerBlock()}
        {followChips()}
        <div className="ml-auto shrink-0 self-center">{peopleActs()}</div>
      </div>
      {mode === "follow" ? (
        <PeopleRowView bag={{ pick, setPick, people, departments, addFollowPerson, setMode, newFollow, setNewFollow }} />
      ) : null}
      {mode === "transfer" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <select value={pick} onChange={(e) => setPick(e.target.value)} className="h-11 rounded-md border border-line bg-card px-3 text-sm">
            {people.map((p: any) => (
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
            {others.map((l: any) => (
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
