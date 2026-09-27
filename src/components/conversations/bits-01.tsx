import { GitBranch, Layers, Mail, MessageSquare, MessagesSquare, Phone, Smartphone, User, UserPlus, Users } from "lucide-react";
import { isRead } from "@/features/thread/store";
import type { ConvLane } from "@/features/record-shell/lanes";

export const WHO = [
  { id: "all", label: "All contacts", face: "All", icon: Users },
  { id: "mine", label: "Assigned to me", face: "Mine", icon: User },
  { id: "following", label: "Followed by me", face: "Follow", icon: UserPlus },
] as const;

export const CHANNEL = [
  { id: "all", label: "All talk", face: "Talk", icon: MessagesSquare },
  { id: "sms", label: "SMS", face: "SMS", icon: Smartphone },
  { id: "call", label: "Phone", face: "Phone", icon: Phone },
  { id: "email", label: "Email", face: "Email", icon: Mail },
] as const;

export const TYPE = [
  { id: "all", label: "All types", face: "Type", icon: Layers },
  { id: "customer", label: "Customer", face: "Customer", icon: MessageSquare },
  { id: "internal", label: "Internal", face: "Internal", icon: Users },
] as const;

export const PIPE = [
  { id: "all", label: "All pipelines", face: "Pipe", icon: GitBranch },
  { id: "Lead", label: "Lead", face: "Lead", icon: GitBranch },
  { id: "Assessment", label: "Assessment", face: "Assess", icon: GitBranch },
  { id: "Opportunity", label: "Opportunity", face: "Opp", icon: GitBranch },
  { id: "Job", label: "Job", face: "Job", icon: GitBranch },
  { id: "Account", label: "Account", face: "Account", icon: GitBranch },
] as const;

export type Lane = ConvLane;

export type Who = (typeof WHO)[number]["id"];

export type Channel = (typeof CHANNEL)[number]["id"];

export type TalkType = (typeof TYPE)[number]["id"];

export type Pipe = (typeof PIPE)[number]["id"];

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function unreadCount(msgs: { from: string; channel: string }[], personId: string) {
  if (isRead(personId)) return 0;
  let n = 0;
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if (m.from !== "customer") break;
    if (m.channel === "sms" || m.channel === "email" || m.channel === "call") n += 1;
  }
  return n;
}
