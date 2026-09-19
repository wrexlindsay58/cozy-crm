import type { WorkStatus } from "@/lib/chrome";
import type { Tone } from "@/lib/crm-data";

export type ActionKind = "ticket" | "task" | "request";

export type ShopAction = {
  id: string;
  kind: ActionKind;
  title: string;
  personId: string;
  parentId?: string;
  owner: string;
  status: WorkStatus;
  priority?: "High" | "Normal" | "Low";
  due?: string;
  description?: string;
  followers?: string[];
  age?: string;
};

export const ACTION_WORD: Record<ActionKind, string> = {
  ticket: "ticket",
  task: "task",
  request: "request",
};

export const ACTION_LABEL: Record<ActionKind, string> = {
  ticket: "Ticket",
  task: "Task",
  request: "Request",
};

export function workTone(status: WorkStatus): Tone {
  if (status === "Past Due") return "alert";
  if (status === "Complete") return "up";
  if (status === "Cancel" || status === "Pause") return "muted";
  return "navy";
}
