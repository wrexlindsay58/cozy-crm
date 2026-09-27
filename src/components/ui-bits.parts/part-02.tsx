import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Flag } from "@/lib/snapshot";
import { wash } from "./part-01";

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
