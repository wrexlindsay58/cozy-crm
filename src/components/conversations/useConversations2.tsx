import { unreadCount } from "./bits-01";
import { useConversations1 } from "./useConversations1";
import { useMemo } from "react";
import { accounts, byId } from "@/lib/crm-data";
import { pipelineOf } from "@/lib/pipeline-of";
import { toneForStatus } from "@/lib/lead-status";
import { isBlocked, isHidden, isStarred } from "@/features/thread/store";

export function useConversations2(bag: ReturnType<typeof useConversations1>) {
  const { messages, leads, followers, appointments, tickets, me, who, channel, talkType, starredOnly, unreadOnly, pipe, extra, query, activeId, people } = bag;
const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people
      .map((p) => {
        const acc = accounts.find((a) => a.name === p.name);
        const lead = byId(leads, p.leadId ?? p.id);
        const msgs = messages.filter(
          (m) => m.personId === p.id || m.personId === p.leadId || (acc && m.personId === acc.id),
        );
        const last = msgs.at(-1);
        const follow = followers[p.id] ?? followers[p.leadId ?? ""] ?? [];
        const assigned = p.closer === me || p.setter === me;
        const following = follow.some((f) => f.name === me);
        const unread = unreadCount(msgs, p.id);
        const pipe = pipelineOf(p.leadId ?? p.id, p.name);
        const appt = appointments.find((a) => a.leadId === (p.leadId ?? p.id));
        const starred = isStarred(p.id) || isStarred(p.leadId ?? "");
        const dndOnFlag = Boolean(lead?.dnd?.length);
        const ids = [p.id, p.leadId ?? "", acc?.id ?? ""].filter(Boolean);
        const blocked = ids.some((id) => isBlocked(id));
        const hidden = ids.some((id) => isHidden(id));
        return {
          ...p,
          msgs,
          last,
          assigned,
          following,
          unread,
          pipe,
          appt,
          starred,
          dndOn: dndOnFlag,
          blocked,
          hidden,
          status: lead?.status ?? "",
          tone: lead?.tone ?? toneForStatus(lead?.status ?? ""),
          openActions: tickets.some((tix) => (tix.related === p.id || tix.related === p.leadId) && tix.status !== "Complete" && tix.status !== "Cancel"),
        };
      })
      .filter((p) => {
        if (p.hidden) return false;
        if (who === "mine" && !p.assigned) return false;
        if (who === "following" && !p.following) return false;
        if (starredOnly && !p.starred) return false;
        if (unreadOnly && !p.unread) return false;
        if (pipe !== "all" && p.pipe.label !== pipe) return false;
        if (extra.dnd && !p.dndOn) return false;
        if (extra.booked && !p.appt) return false;
        if (extra.actions && !p.openActions) return false;
        if (extra.status && p.status !== extra.status) return false;
        if (talkType === "customer" && !p.msgs.some((m) => m.channel === "sms" || m.channel === "call" || m.channel === "email")) return false;
        if (talkType === "internal" && !p.msgs.some((m) => m.channel === "internal")) return false;
        if (channel === "sms" && !p.msgs.some((m) => m.channel === "sms")) return false;
        if (channel === "call" && !p.msgs.some((m) => m.channel === "call")) return false;
        if (channel === "email" && !p.msgs.some((m) => m.channel === "email")) return false;
        if (!q) return true;
        return [p.name, p.phone, p.last?.text, p.pipe.label, p.status].join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (a.starred !== b.starred) return a.starred ? -1 : 1;
        if (Boolean(a.unread) !== Boolean(b.unread)) return a.unread ? -1 : 1;
        return Number(Boolean(b.last)) - Number(Boolean(a.last));
      });
  }, [people, messages, followers, me, who, channel, talkType, starredOnly, unreadOnly, pipe, extra, query, appointments, leads, tickets]);

const active = rows.find((r) => r.id === activeId) ?? rows[0];

const lead = active ? byId(leads, active.leadId ?? active.id) : undefined;

const personId = active?.leadId ?? active?.id ?? "";

const acc = active ? accounts.find((a) => a.name === active.name) : undefined;

const onAcc = acc ? messages.filter((m) => m.personId === acc.id).length : 0;

const onLead = messages.filter((m) => m.personId === personId).length;
  return { ...bag, rows, active, lead, personId, acc, onAcc, onLead };
}
