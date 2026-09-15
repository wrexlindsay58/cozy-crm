import { setOfficeNumber, setReminderMin, toggleNotify, useMoneySettings } from "@/features/money-settings/store";

export function NotifyList() {
  const { notify } = useMoneySettings();
  return (
    <ul className="divide-y divide-line rounded-md border border-line bg-card">
      {notify.map((n) => (
        <li key={n.id} className="flex items-center justify-between px-4 py-3 text-sm">
          <span>{n.label}</span>
          <button type="button" onClick={() => toggleNotify(n.id)} className="h-10 rounded-md border border-line px-3 text-xs font-semibold">
            {n.on ? "On" : "Off"}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ReminderSkin() {
  const { reminderMin } = useMoneySettings();
  return (
    <section className="max-w-lg rounded-md border border-line bg-card p-4">
      <h2 className="mb-2 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">20-min-out text</h2>
      <p className="mb-2 text-sm text-muted">Skin only. No live Twilio.</p>
      <input
        defaultValue={reminderMin}
        inputMode="numeric"
        onBlur={(e) => setReminderMin(Number(e.target.value) || 20)}
        className="h-11 w-32 rounded-md border border-line px-3 text-sm"
      />
      <span className="ml-2 text-sm text-muted">minutes before the run</span>
    </section>
  );
}

export function NumbersSkin() {
  const { numbers } = useMoneySettings();
  return (
    <ul className="divide-y divide-line rounded-md border border-line bg-card">
      {numbers.map((n) => (
        <li key={n.office} className="grid gap-2 px-4 py-3 sm:grid-cols-[8rem_1fr] text-sm">
          <p className="font-semibold self-center">{n.office}</p>
          <input
            defaultValue={n.number}
            onBlur={(e) => setOfficeNumber(n.office, e.target.value)}
            className="h-11 rounded-md border border-line px-3"
          />
        </li>
      ))}
    </ul>
  );
}

export function TemplatesList() {
  const { templates } = useMoneySettings();
  return (
    <ul className="divide-y divide-line rounded-md border border-line bg-card">
      {templates.map((t) => (
        <li key={t} className="px-4 py-3 text-sm font-semibold">
          {t}
        </li>
      ))}
    </ul>
  );
}
