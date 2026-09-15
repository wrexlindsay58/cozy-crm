import { useState } from "react";
import { bookAppointment } from "@/features/ops/store";
import { activeClosers, useStaff } from "@/features/staff/store";

const DAYS = [13, 14, 15, 16, 17, 18, 19, 20];
const HOURS = ["4:00p", "5:00p", "5:30p", "6:00p", "6:30p", "7:00p"];

export function BookWidget({
  leadId,
  defaultCloser,
  open,
}: {
  leadId: string;
  defaultCloser: string;
  open: boolean;
}) {
  useStaff();
  const closers = activeClosers();
  const [closer, setCloser] = useState(defaultCloser || closers[0] || "");
  const [day, setDay] = useState(14);
  const [hour, setHour] = useState("6:00p");
  const [saved, setSaved] = useState("");
  if (!open) return null;
  return (
    <section id="book-widget" className="rounded-md border border-navy bg-card p-4">
      <h2 className="mb-3 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Book the run</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Closer</span>
          <select value={closer} onChange={(e) => setCloser(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm">
            {closers.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Day</span>
          <select value={day} onChange={(e) => setDay(Number(e.target.value))} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm">
            {DAYS.map((d) => (
              <option key={d} value={d}>Sep {d}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-[11px] font-bold tracking-wide text-muted uppercase">Hour</span>
          <select value={hour} onChange={(e) => setHour(e.target.value)} className="mt-1 h-11 w-full rounded-md border border-line bg-card px-3 text-sm">
            {HOURS.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="button"
        className="mt-3 h-11 w-full rounded-md bg-navy px-3 text-sm font-semibold text-card sm:w-auto"
        onClick={() => {
          bookAppointment(leadId, closer, day, hour);
          setSaved(`On ${closer}'s book: Sep ${day} ${hour}`);
        }}
      >
        Write the book
      </button>
      {saved ? <p className="mt-2 text-sm font-medium text-up">{saved}</p> : null}
    </section>
  );
}
