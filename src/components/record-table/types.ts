import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Col<T> = {
  key: string;
  label: string;
  hide?: "sm" | "md" | "lg";
  align?: "right";
  /** Renders as itself. Never covered by the row link. */
  interactive?: boolean;
  render: (row: T) => ReactNode;
};

export function hideCls(hide?: "sm" | "md" | "lg") {
  return cn(hide === "sm" && "hidden sm:table-cell", hide === "md" && "hidden md:table-cell", hide === "lg" && "hidden lg:table-cell");
}

export function isField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

export function rowEdge(on: boolean, edge: "first" | "mid" | "last") {
  if (!on) return "";
  if (edge === "first") return "xl:shadow-[inset_2px_0_0_0_var(--color-navy),inset_0_2px_0_0_var(--color-navy),inset_0_-2px_0_0_var(--color-navy)]";
  if (edge === "last") return "xl:shadow-[inset_-2px_0_0_0_var(--color-navy),inset_0_2px_0_0_var(--color-navy),inset_0_-2px_0_0_var(--color-navy)]";
  return "xl:shadow-[inset_0_2px_0_0_var(--color-navy),inset_0_-2px_0_0_var(--color-navy)]";
}
