import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

const BLOCKS = [
  { t: "Company", d: "Cozy Home Performance · Surprise, AZ" },
  { t: "Offices", d: "Phoenix, Scottsdale, Dallas, Fort Worth, North Phoenix" },
  { t: "Fiscal year", d: "January – December" },
  { t: "Theme", d: "Navy chrome, cool gray canvas, one data blue" },
  { t: "Data", d: "Demo records only. Not connected to Odin." },
];

function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl p-4 pb-10 md:p-5">
      <PageHeader kicker="Admin" title="Settings" />
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-card shadow-sm">
        {BLOCKS.map((b) => (
          <li key={b.t} className="px-4 py-3">
            <p className="text-[11px] font-bold tracking-widest text-muted uppercase">{b.t}</p>
            <p className="text-sm font-medium">{b.d}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
