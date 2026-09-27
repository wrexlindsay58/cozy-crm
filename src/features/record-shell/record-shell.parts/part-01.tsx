import { useState } from "react";
import { dndOn, setLeadStatus, useOps } from "@/features/ops/store";
import { setCallFrom, setSmsFrom } from "@/features/from/store";
import { useMoneySettings } from "@/features/money-settings/store";
import { PeopleRow } from "../people-row";
import { TitleRow } from "../title-row";
import { ConvTabs } from "../conv-tabs";
import type { ConvLane } from "../lanes";
import type { RecordShellProps } from "../types";
import { cn } from "@/lib/cn";
import { RecordShellView, RecordShellView4 } from "./part-02";

export function pipeName(kind: RecordShellProps["kind"]) {
  if (kind === "assessment") return "Assessment";
  if (kind === "opportunity") return "Opportunity";
  if (kind === "job") return "Job";
  if (kind === "account") return "Account";
  if (kind === "membership") return "Membership";
  if (kind === "action" || kind === "ticket" || kind === "task" || kind === "request") return "Actions";
  return "Lead";
}

function dndChip(dnd?: string[]) {
  if (!dnd?.length) return;
  if (dnd.length === 3) return "DND all";
  return `DND ${dnd.join(", ")}`;
}

export function RecordShell(props: RecordShellProps) {
  const [lane, setLane] = useState<ConvLane>("customer");
  const [callOpen, setCallOpen] = useState(false);
  const [draft, setDraft] = useState<"ticket" | "task" | "request" | null>(null);
  const [talkScope, setTalkScope] = useState<"action" | "house">(props.actionId ? "action" : "house");
  const [mobileTalk, setMobileTalk] = useState(false);
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === props.personId);
  const { numbers } = useMoneySettings();

  function openThread() {
    setLane("customer");
    setMobileTalk(true);
    queueMicrotask(() => {
      document.getElementById(`composer-${props.personId}-customer`)?.focus();
    });
  }

  function startCall() {
    if (dndOn(lead, "call")) return;
    setLane("customer");
    setMobileTalk(true);
    setCallOpen(true);
  }

  const numberMenu = numbers.map((n) => ({
    label: `${n.office} · ${n.number}`,
    onClick: () => {
      setSmsFrom(n.number);
      setCallFrom(n.number);
    },
  }));

  const acts = props.acts
    .filter((a) => a.label !== "Drop")
    .map((a) => {
      if (a.label === "Call") return { ...a, onClick: startCall, menu: numberMenu };
      if (a.label === "Text") return { ...a, onClick: openThread, menu: numberMenu };
      if (a.label === "Create" && a.menu) {
        return {
          ...a,
          menu: a.menu.map((item) => {
            if (item.label !== "Ticket" && item.label !== "Task" && item.label !== "Request") return item;
            return {
              ...item,
              onClick: () => {
                setLane("actions");
                setMobileTalk(true);
                setDraft(item.label === "Task" ? "task" : item.label === "Request" ? "request" : "ticket");
              },
            };
          }),
        };
      }
      return a;
    });

  const talkLane = lane === "customer" || lane === "internal" || lane === "notes";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn(mobileTalk && "max-lg:hidden")}>
        <TitleRow
          kind={props.kind}
          title={props.title}
          subtitle={props.subtitle}
          stage={props.kind === "lead" ? (lead?.status ?? props.stage) : props.stage}
          stageTone={props.kind === "lead" ? (lead?.tone ?? props.stageTone) : props.stageTone}
          dndLabel={dndChip(lead?.dnd)}
          moneyLabel={props.moneyLabel}
          related={props.related}
          acts={acts}
          onText={openThread}
          onStage={props.onStage ?? (props.kind === "lead" && lead ? (status) => setLeadStatus(lead.id, status) : undefined)}
          stageOptions={props.stageOptions}
          lead={lead}
        />
        <PeopleRow
          personId={props.personId}
          owner={props.owner}
          seedFollowers={props.followers}
          canDrop={props.kind === "lead"}
          actionId={props.actionId}
          onCancelJob={props.onCancelJob}
        />
      </div>

      <RecordShellView bag={{ mobileTalk, props, setMobileTalk, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
    </div>
  );
}

export function SideHead({
  lane,
  onLane,
  withBook,
}: {
  lane: ConvLane;
  onLane: (v: ConvLane) => void;
  withBook?: boolean;
}) {
  return <ConvTabs lane={lane} onLane={(id) => onLane(id as ConvLane)} withBook={withBook} />;
}

export function RecordShellView2(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView3 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}

function RecordShellView3(__p: { bag: { mobileTalk: any; setMobileTalk: any; props: any; lane: any; setLane: any; lead: any; callOpen: any; setCallOpen: any; draft: any; setDraft: any; talkScope: any; setTalkScope: any; talkLane: any; startCall: any } }) {
  const { mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall } = __p.bag;
  return (
    <RecordShellView4 bag={{ mobileTalk, setMobileTalk, props, lane, setLane, lead, callOpen, setCallOpen, draft, setDraft, talkScope, setTalkScope, talkLane, startCall }} />
  );
}
