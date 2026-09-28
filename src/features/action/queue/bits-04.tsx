import { SelectField } from "./bits-01";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ACTION_LABEL, workTone } from "@/features/action/types";
import type { ActionKind, ShopAction } from "@/features/action/types";
import { houseOf } from "@/features/action/house";
import { deleteAction, patchAction } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import { WorkMoves } from "@/features/action/moves";
import { liveStatus, canDeleteWork } from "@/lib/chrome";
import { StatusPill } from "@/components/ui-bits";

export function DetailRail({ action, house, onAdd }: { action: ShopAction; house: ReturnType<typeof houseOf>; onAdd?: (kind: ActionKind) => void }) {
  const { people, viewAs, ticketCats } = useStaff();
  const status = liveStatus(action.status, action.due);
  const [due, setDue] = useState(action.due ?? "");
  const [description, setDescription] = useState(action.description ?? "");
  const [confirm, setConfirm] = useState(false);
  const word = ACTION_LABEL[action.kind].toLowerCase();
  const navigate = useNavigate();
  const allowDelete = canDeleteWork(viewAs);

  useEffect(() => {
    setDue(action.due ?? "");
    setDescription(action.description ?? "");
  }, [action.id, action.due, action.description]);

  return (
    <div className="space-y-4 p-3">
      <section>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">House</p>
        <a href={house.href} className="mt-1 block text-sm font-semibold text-navy">
          {house.name}
        </a>
        <p className="text-[12px] text-muted">
          {house.pipeline}
          {house.city ? ` · ${house.city}` : ""}
        </p>
        {house.phone ? <p className="text-[12px] text-muted">{house.phone}</p> : null}
      </section>
      <section>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Status</p>
        <p className="mt-1">
          <StatusPill label={status} tone={workTone(status)} />
        </p>
        <div className="mt-2">
          <WorkMoves kind={action.kind} id={action.id} status={status} onAdd={onAdd} />
        </div>
      </section>
      <section>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Category</p>
        <SelectField
          value={action.category ?? ""}
          onChange={(e) => patchAction(action.id, { category: e.target.value })}
          className="mt-1"
        >
          <option value="">None</option>
          {ticketCats.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </SelectField>
      </section>
      <section>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Due</p>
        <input
          value={due}
          onChange={(e) => setDue(e.target.value)}
          onBlur={() => {
            if (due.trim() === (action.due ?? "")) return;
            patchAction(action.id, { due: due.trim() });
          }}
          placeholder="Sep 18"
          className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm focus:border-navy"
        />
      </section>
      <section>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Assigned</p>
        <SelectField
          value={action.owner}
          onChange={(e) => patchAction(action.id, { owner: e.target.value })}
          className="mt-1"
        >
          {people.map((p) => (
            <option key={p.name}>{p.name}</option>
          ))}
        </SelectField>
      </section>
      <section>
        <p className="text-[11px] font-bold tracking-wide text-muted uppercase">Description</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => {
            if (description.trim() === (action.description ?? "")) return;
            patchAction(action.id, { description: description.trim() });
          }}
          placeholder="What needs to happen."
          rows={4}
          className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm focus:border-navy"
        />
      </section>
      {allowDelete ? (
        confirm ? (
        <div className="flex flex-col gap-2 text-sm">
          <span>Delete this {word}? Nested work stays on the file.</span>
          <button
            type="button"
            className="h-11 rounded-md bg-stop text-sm font-semibold text-card"
            onClick={() => {
              deleteAction(action.id);
              void navigate({ to: "/tickets" });
            }}
          >
            Delete
          </button>
          <button type="button" className="h-11 text-sm font-semibold text-muted" onClick={() => setConfirm(false)}>
            Keep
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirm(true)} className="h-11 w-full rounded-md border border-line text-sm font-semibold text-stop">
          Delete {word}
        </button>
      )
      ) : null}
    </div>
  );
}
