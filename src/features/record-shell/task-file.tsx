import { useState } from "react";
import { addTaskFollower, patchTask, useOps } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import type { Task } from "@/features/ops/store";
import { PhotoRail } from "./side-rails";
import { ThreadPane } from "./thread-pane";

export function TaskFile({ task, onBack }: { task: Task; onBack: () => void }) {
  const { people } = useStaff();
  useOps();
  const [follow, setFollow] = useState(people[0]?.name ?? "");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto p-3">
      <button type="button" className="h-10 self-start text-sm font-semibold text-muted" onClick={onBack}>
        Close
      </button>
      <h2 className="mt-1 text-base font-extrabold">{task.title}</h2>
      <p className="text-[12px] text-muted">
        {task.status} · {task.due || "No due"}
      </p>
      <label className="mt-3 block text-[11px] font-bold tracking-wide text-muted uppercase">
        Description
        <textarea
          defaultValue={task.description ?? ""}
          onBlur={(e) => patchTask(task.id, { description: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-navy"
        />
      </label>
      <label className="mt-3 block text-[11px] font-bold tracking-wide text-muted uppercase">
        Due
        <input
          defaultValue={task.due}
          onBlur={(e) => patchTask(task.id, { due: e.target.value })}
          className="mt-1 h-11 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-navy"
        />
      </label>
      <label className="mt-3 block text-[11px] font-bold tracking-wide text-muted uppercase">
        Assigned
        <select
          value={task.owner}
          onChange={(e) => patchTask(task.id, { owner: e.target.value })}
          className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm"
        >
          {people.map((p) => (
            <option key={p.name}>{p.name}</option>
          ))}
        </select>
      </label>
      <p className="mt-3 text-[11px] font-bold tracking-wide text-muted uppercase">Followers</p>
      <p className="mt-1 text-sm">{(task.followers ?? []).join(", ") || "None"}</p>
      <div className="mt-2 flex gap-2">
        <select value={follow} onChange={(e) => setFollow(e.target.value)} className="h-11 min-w-0 flex-1 rounded-md border border-line bg-card px-3 text-sm">
          {people.map((p) => (
            <option key={p.name}>{p.name}</option>
          ))}
        </select>
        <button type="button" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card" onClick={() => addTaskFollower(task.id, follow)}>
          Follow
        </button>
      </div>
      <button
        type="button"
        className="mt-3 h-11 rounded-md border border-line text-sm font-semibold"
        onClick={() => patchTask(task.id, { status: task.status === "Done" ? "Open" : "Done" })}
      >
        {task.status === "Done" ? "Reopen" : "Done"}
      </button>
      <div className="mt-4">
        <PhotoRail personId={task.id} />
      </div>
      <div className="mt-4 h-64 overflow-hidden rounded-md border border-line">
        <ThreadPane personId={task.id} mode="internal" />
      </div>
    </div>
  );
}
