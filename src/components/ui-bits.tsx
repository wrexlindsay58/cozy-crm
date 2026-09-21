import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/crm-data";
import { clockLabel } from "@/lib/clock";
import type { Flag } from "@/lib/snapshot";

export function wash(flag: Flag | "stop" | "watch" | "go" | "info" | "none") {
  if (flag === "stop") return "bg-stop-bg";
  if (flag === "watch") return "bg-watch-bg";
  if (flag === "go") return "bg-go-bg";
  if (flag === "info") return "bg-info-bg";
  return "bg-card";
}

export function flagInk(flag: Flag | "stop" | "watch" | "go" | "info" | "none") {
  if (flag === "stop") return "text-stop";
  if (flag === "watch") return "text-watch";
  if (flag === "go") return "text-go";
  return "text-ink";
}

export function StatusBar({ label, tone }: { label: string; tone: Tone | Flag }) {
  const t =
    tone === "alert" || tone === "stop"
      ? "stop"
      : tone === "up" || tone === "go"
        ? "go"
        : tone === "watch"
          ? "watch"
          : tone === "muted"
            ? "none"
            : "info";
  return (
    <span className={cn("inline-flex h-6 items-center gap-2 text-[11px] font-semibold uppercase tracking-wide", flagInk(t))}>
      <i
        className={cn(
          "block h-6 w-1 shrink-0",
          t === "stop" ? "bg-stop" : t === "watch" ? "bg-watch" : t === "go" ? "bg-go" : t === "info" ? "bg-navy" : "bg-idle",
        )}
      />
      {label}
    </span>
  );
}

export function StatusPill({ label, tone }: { label: string; tone: Tone | "watch" }) {
  return <StatusBar label={label} tone={tone} />;
}

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="inline-flex h-10 items-center gap-0.5 text-sm font-semibold text-navy md:hidden">
      <ChevronLeft className="size-4" />
      {label}
    </Link>
  );
}

export function PageTitle({
  title,
  count,
  actions,
  flush,
}: {
  title: string;
  count?: string;
  actions?: ReactNode;
  flush?: boolean;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", flush ? "min-h-14 w-full" : "mb-4")}>
      <h1 className="shrink-0 text-[20px] font-bold tracking-tight">
        {title}
        {count ? <span className="ml-2 text-[13px] font-semibold text-muted">{count}</span> : null}
      </h1>
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">{actions}</div>
      <p className="hidden shrink-0 text-[13px] text-muted tabular-nums md:block">{clockLabel()}</p>
    </div>
  );
}

export function PageHeader({
  title,
  count,
  actions,
}: {
  kicker?: string;
  title: string;
  count?: string;
  actions?: ReactNode;
}) {
  return <PageTitle title={title} count={count} actions={actions} />;
}

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 min-h-11 rounded-sm px-3 text-[13px] font-semibold",
        active ? "bg-navy text-card" : "border border-line bg-card text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-sm bg-card px-4 py-8 text-[13px] text-muted">{children}</div>;
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cn("h-full min-w-0 overflow-x-hidden overflow-y-auto p-4 lg:p-6", className)}>{children}</main>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <article className={cn("rounded-sm bg-card p-4 shadow-card", className)}>{children}</article>;
}

export function Num({ k, v, note, flag }: { k: string; v: number | string; note?: string; flag?: Flag }) {
  return (
    <div>
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{k}</p>
      <p className={cn("text-[28px] font-bold tabular-nums tracking-tight", flagInk(flag ?? "none"))}>{v}</p>
      {note ? <p className="text-[11px] text-muted">{note}</p> : null}
    </div>
  );
}

export function ExceptionRow({
  name,
  fact,
  flag,
  href,
}: {
  name: string;
  fact: string;
  flag: Flag;
  href?: string;
}) {
  const body = (
    <>
      <i className={cn("mt-0.5 h-10 w-1 shrink-0", flag === "stop" ? "bg-stop" : flag === "watch" ? "bg-watch" : "bg-navy")} />
      <span className="min-w-0 flex-1 py-2">
        <span className="block text-[13px] font-semibold">{name}</span>
        <span className="block text-[11px] text-muted">{fact}</span>
      </span>
    </>
  );
  const cls = cn("flex items-start gap-3 px-3", wash(flag));
  if (href) {
    return (
      <a href={href} className={cls}>
        {body}
      </a>
    );
  }
  return <div className={cls}>{body}</div>;
}

export function Btn({
  children,
  href,
  quiet,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  quiet?: boolean;
  onClick?: () => void;
}) {
  const cls = cn(
    "grid h-10 min-h-10 place-items-center rounded-md px-3 text-[13px] font-semibold",
    quiet ? "bg-page text-ink" : "bg-navy text-card",
  );
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
