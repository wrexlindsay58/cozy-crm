import { Lane, Who, Channel, TalkType, Pipe } from "./bits-01";
import { useMemo, useState } from "react";
import { accounts } from "@/lib/crm-data";
import { useOps } from "@/features/ops/store";
import { useStaff } from "@/features/staff/store";
import { useAssessments } from "@/features/assessment/store";
import { useMessages } from "@/features/thread/store";

export function useConversations1() {
const messages = useMessages();

const { leads, followers, history, appointments, tickets } = useOps();

const { viewAs, actorName: me } = useStaff();

useAssessments();

const [who, setWho] = useState<Who>("all");

const [channel, setChannel] = useState<Channel>("all");

const [talkType, setTalkType] = useState<TalkType>("all");

const [starredOnly, setStarredOnly] = useState(false);

const [unreadOnly, setUnreadOnly] = useState(false);

const [pipe, setPipe] = useState<Pipe>("all");

const [extra, setExtra] = useState({ dnd: false, booked: false, actions: false, status: "" });

const [query, setQuery] = useState("");

const [activeId, setActiveId] = useState("L-4821");

const [lane, setLane] = useState<Lane>("customer");

const [mobileThread, setMobileThread] = useState(false);

const [callOpen, setCallOpen] = useState(false);

const people = useMemo(() => {
    const byIdMap = new Map<string, { id: string; name: string; phone: string; city: string; closer: string; setter: string; leadId?: string }>();
    for (const l of leads) {
      byIdMap.set(l.id, {
        id: l.id,
        name: l.name,
        phone: l.phone,
        city: l.city,
        closer: l.closer,
        setter: l.setter,
        leadId: l.id,
      });
    }
    for (const a of accounts) {
      if ([...byIdMap.values()].some((p) => p.name === a.name)) continue;
      const lead = leads.find((l) => l.name === a.name);
      byIdMap.set(a.id, {
        id: lead?.id ?? a.id,
        name: a.name,
        phone: lead?.phone ?? "",
        city: a.city,
        closer: a.owner,
        setter: lead?.setter ?? "",
        leadId: lead?.id,
      });
    }
    return [...byIdMap.values()];
  }, [leads]);
  return { messages, leads, followers, history, appointments, tickets, viewAs, me, who, setWho, channel, setChannel, talkType, setTalkType, starredOnly, setStarredOnly, unreadOnly, setUnreadOnly, pipe, setPipe, extra, setExtra, query, setQuery, activeId, setActiveId, lane, setLane, mobileThread, setMobileThread, callOpen, setCallOpen, people };
}
