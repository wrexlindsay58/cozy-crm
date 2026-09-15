import type { LucideIcon } from "lucide-react";
import {
  ArrowRightLeft,
  Calendar,
  GitMerge,
  MessageSquare,
  Paperclip,
  Phone,
  Plus,
  UserMinus,
  UserPlus,
} from "lucide-react";

/**
 * Hard chrome rules. Import these. Do not restyle around them.
 *
 * 1. Every action is an icon plus a word. If the word would clip, drop the
 *    word and keep a tooltip.
 * 2. Under NAV_COLLAPSE_PX the left nav is an icon dock. Tooltips on the right.
 * 3. Tickets and tasks live on cards. No popup for comment, reply, status,
 *    or attach.
 * 4. Comments on tickets, tasks, notes, and media nest in Internal.
 * 5. Owner clicks the title to edit. Anyone on the file can comment.
 * 6. Tap targets are 44px. Internal is the shop log. Customer is the house.
 * 7. Lead file and Inbox are the chrome standard. Same depth, still simple.
 *    Later stages keep this chrome and only change the work. Talk follows
 *    the house. Prior stages sit in expanders on the file, not in talk tabs.
 */
export const NAV_COLLAPSE_PX = 1279;
export const TAP = 44;
export const SHOP_ACTOR = "Wrex Lindsay";

export const WORK_STATUSES = ["Open", "Past Due", "Pause", "Complete", "Cancel"] as const;
export type WorkStatus = (typeof WORK_STATUSES)[number];

export const ACT_ICONS: Record<string, LucideIcon> = {
  Call: Phone,
  Text: MessageSquare,
  Book: Calendar,
  Create: Plus,
  Follow: UserPlus,
  Transfer: ArrowRightLeft,
  Merge: GitMerge,
  Drop: UserMinus,
  Attach: Paperclip,
};

export function canEditWork(owner: string) {
  return owner === SHOP_ACTOR || SHOP_ACTOR === "Wrex Lindsay";
}

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

export function dueIsPast(due?: string, now = new Date()) {
  if (!due) return false;
  const m = due.match(/([A-Za-z]{3})\s+(\d{1,2})/);
  if (!m) return false;
  const month = MONTHS[m[1]];
  if (month == null) return false;
  const day = Number(m[2]);
  const d = new Date(now.getFullYear(), month, day);
  d.setHours(23, 59, 59, 999);
  return d.getTime() < now.getTime();
}

export function liveStatus(status: string, due?: string): WorkStatus {
  if (status === "Done") return "Complete";
  if (status === "Waiting") return "Pause";
  if (status === "Complete" || status === "Cancel" || status === "Pause" || status === "Past Due") return status;
  if (status === "Open" && dueIsPast(due)) return "Past Due";
  return "Open";
}
