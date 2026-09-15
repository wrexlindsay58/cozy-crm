import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";

export function SettingsPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl p-4 pb-10 md:p-5">
      <p className="mb-2 text-sm">
        <Link to="/settings" className="font-semibold text-navy">
          Settings
        </Link>
      </p>
      <PageHeader kicker="Company" title={title} />
      {children}
    </main>
  );
}
