import { useState } from "react";
import { Ban, BellOff, Mail, MessageSquare, Phone } from "lucide-react";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";
import { dndOn, toggleLeadDnd } from "@/features/ops/store";
import type { DndChannel, Lead } from "@/lib/crm-data";
import { cn } from "@/lib/cn";

const DND_ROWS: { id: DndChannel | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "text", label: "Text" },
  { id: "call", label: "Call" },
  { id: "email", label: "Email" },
];

function ChannelIcon({ id, className = "size-3" }: { id: DndChannel | "all" | "off"; className?: string }) {
  if (id === "off") return <BellOff className={className} />;
  if (id === "all") return <Ban className={className} />;
  if (id === "text") return <MessageSquare className={className} />;
  if (id === "call") return <Phone className={className} />;
  return <Mail className={className} />;
}

export function dndLabel(lead: { dnd?: DndChannel[] }) {
  const d = lead.dnd ?? [];
  if (d.length === 0) return "Off";
  if (d.length === 3) return "All";
  return d.map((c) => (c === "text" ? "Text" : c === "call" ? "Call" : "Email")).join(" · ");
}

function DndMarks({ dnd }: { dnd?: DndChannel[] }) {
  const d = dnd ?? [];
  if (d.length === 0) return <ChannelIcon id="off" />;
  if (d.length === 3) return <ChannelIcon id="all" />;
  return (
    <span className="inline-flex items-center gap-0.5">
      {d.map((c) => (
        <ChannelIcon key={c} id={c} />
      ))}
    </span>
  );
}

export function DndPick({
  lead,
  compact,
}: {
  lead: Lead;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const allOn = (lead.dnd ?? []).length === 3;
  const hot = (lead.dnd ?? []).length > 0;
  const words = `DND ${dndLabel(lead)}`;

  return (
    <>
      <Tip label={words} on={Boolean(compact)}>
        <button
          type="button"
          aria-label={words}
          aria-expanded={open}
          onClick={(e) => {
            setAnchor(e.currentTarget.getBoundingClientRect());
            setOpen((v) => !v);
          }}
          className={cn(
            "inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-1.5 text-[11px] font-bold tracking-wide uppercase",
            hot ? "bg-alert-bg text-alert" : compact ? "bg-page text-muted" : "border border-line text-muted",
            compact && "max-md:w-7 max-md:justify-center max-md:px-0",
          )}
        >
          <DndMarks dnd={lead.dnd} />
          <span className={cn(compact && "max-md:sr-only")}>{words}</span>
        </button>
      </Tip>
      {open && anchor ? (
        <Float anchor={anchor} prefer="bottom" onClose={() => setOpen(false)}>
          {DND_ROWS.map((row) => {
            const on = row.id === "all" ? allOn : dndOn(lead, row.id);
            return (
              <button
                key={row.id}
                type="button"
                className="flex h-10 w-full min-w-44 items-center gap-2 px-3 text-sm hover:bg-page"
                onClick={() => toggleLeadDnd(lead.id, row.id)}
              >
                <ChannelIcon id={row.id} className="size-3.5" />
                <span className="flex-1 text-left">DND {row.label}</span>
                <span className={cn("text-[11px] font-bold", on ? "text-navy" : "text-muted")}>{on ? "On" : "Off"}</span>
              </button>
            );
          })}
        </Float>
      ) : null}
    </>
  );
}
