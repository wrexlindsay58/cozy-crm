import { cn } from "@/lib/cn";

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase() || "?";
}

export function whoName(msg: { from: string; by?: string }, contact: string) {
  if (msg.from === "customer") return contact || "Customer";
  return msg.by || "Cozy";
}

export function Initial({ name, className }: { name: string; className?: string }) {
  return (
    <span
      title={name}
      className={cn("grid size-8 shrink-0 place-items-center rounded-md bg-navy text-[10px] font-bold text-card", className)}
    >
      {initials(name)}
    </span>
  );
}
