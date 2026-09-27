import {
  BadgeCheck,
  Briefcase,
  Calendar,
  FileText,
  FolderKanban,
  HardHat,
  House,
  ListChecks,
  Map,
  MessageSquare,
  Radio,
  ScrollText,
  Settings,
  Star,
  Trophy,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { unreadConversations } from "@/lib/crm-data";
import { incidents, notCalled } from "@/lib/snapshot";

export type NavItem = {
  icon: LucideIcon;
  label: string;
  to: string;
  badge?: number;
  live?: boolean;
};

const DAILY: NavItem[] = [
  { icon: Radio, label: "Live Board", to: "/", live: true },
  { icon: MessageSquare, label: "Inbox", to: "/conversations", badge: unreadConversations },
  { icon: Calendar, label: "Book", to: "/calendar" },
  { icon: Map, label: "Map", to: "/dispatch" },
  { icon: ListChecks, label: "Actions", to: "/tickets" },
];

const PIPELINE: NavItem[] = [
  { icon: Users, label: "Leads", to: "/leads" },
  { icon: House, label: "Assessments", to: "/assessments" },
  { icon: Star, label: "Opportunities", to: "/opportunities" },
  { icon: Briefcase, label: "Jobs", to: "/projects" },
  { icon: BadgeCheck, label: "Memberships", to: "/memberships" },
  { icon: FolderKanban, label: "Accounts", to: "/accounts" },
];

const MONEY: NavItem[] = [{ icon: ScrollText, label: "Paper", to: "/paper" }];

const COMPANY: NavItem[] = [
  { icon: Trophy, label: "Leaderboard", to: "/leaderboard" },
  { icon: HardHat, label: "Crews", to: "/crews" },
  { icon: UserRound, label: "Team", to: "/team" },
  { icon: FileText, label: "Reports", to: "/reports" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

export const GROUPS: { label: string; items: NavItem[] }[] = [
  { label: "Daily", items: DAILY },
  { label: "Pipeline", items: PIPELINE },
  { label: "Money", items: MONEY },
  { label: "Company", items: COMPANY },
];

export const BOTTOM_NAV = [
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/projects", label: "Jobs", icon: Briefcase },
  { to: "/memberships", label: "Memberships", icon: BadgeCheck },
  { to: "/accounts", label: "Accounts", icon: FolderKanban },
] as const;

export const lateCount = incidents.length + notCalled.length;

export function activePath(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function itemBadge(item: NavItem, pastDueN: number, paperN: number) {
  if (item.to === "/tickets") return pastDueN;
  if (item.to === "/paper") return paperN;
  return item.badge ?? 0;
}
