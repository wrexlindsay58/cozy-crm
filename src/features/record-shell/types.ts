import type { ActionKind } from "@/features/action/types";
import type { ReactNode } from "react";
import type { Activity, Ticket, Tone } from "@/lib/crm-data";
import type { PersonRef, Photo } from "@/lib/file-data";

export type RecordKind = "lead" | "assessment" | "opportunity" | "job" | "account" | "action" | ActionKind;

export type RecordAct = {
  label: string;
  href?: string;
  onClick?: () => void;
  menu?: { label: string; onClick?: () => void }[];
  opens?: "thread" | "create";
};

export type RecordLink = {
  label: string;
  href: string;
};

export type RecordShellProps = {
  kind: RecordKind;
  personId: string;
  title: string;
  subtitle: string;
  stage: string;
  stageTone?: Tone;
  moneyLabel?: string;
  owner: PersonRef;
  followers: PersonRef[];
  acts: RecordAct[];
  related?: RecordLink[];
  history: Activity[];
  tickets: Ticket[];
  photos: Photo[];
  children: ReactNode;
  actionId?: string;
  actionKind?: ActionKind;
  actionTitle?: string;
  onStage?: (status: string) => void;
  stageOptions?: { label: string; tone: Tone }[];
  onCancelJob?: (why: string) => void;
};
