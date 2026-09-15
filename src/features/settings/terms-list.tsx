import { useState } from "react";
import { addTerm, useMoneySettings } from "@/features/money-settings/store";

export function TermsList() {
  const { terms } = useMoneySettings();
  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState("");
  return (
    <div className="space-y-3">
      <ul className="divide-y divide-line rounded-md border border-line bg-card">
        {terms.map((t) => (
          <li key={t.id} className="px-4 py-3 text-sm">
            <p className="font-semibold">{t.name}</p>
            <p className="text-muted">{t.schedule}</p>
          </li>
        ))}
      </ul>
      <form
        className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] rounded-md border border-line bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          addTerm(name, schedule);
          setName("");
          setSchedule("");
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Term" className="h-11 rounded-md border border-line px-3 text-sm" />
        <input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="When" className="h-11 rounded-md border border-line px-3 text-sm" />
        <button type="submit" className="h-11 rounded-md bg-navy px-3 text-sm font-semibold text-card">Add</button>
      </form>
    </div>
  );
}
