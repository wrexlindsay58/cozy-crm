import { patch } from "./events-02";
import { addHistory, createAction } from "@/features/ops/store";
import { actingName } from "@/features/staff/store";
import { sendMessage } from "@/features/thread/store";
import { closeBlockers, packetLines, packetOn } from "../closeout";
import { isAccepted, catFromTag, type ScopeMedia } from "../types";

export function signPost(jobId: string, input: { name: string; signature: string; relation?: string }) {
  const name = input.name.trim();
  if (name.length < 3 || !input.signature.startsWith("data:image")) return;
  patch(jobId, (j) => {
    if (!isAccepted(j)) return j;
    addHistory(j.personId, actingName(), `Post-install signed in person by ${name}${input.relation ? ` (${input.relation})` : ""}. Collected by ${actingName()}.`);
    return { ...j, postCheck: { ...j.postCheck, signedBy: name, collectedBy: actingName(), signedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), signature: input.signature, relation: input.relation } };
  }, { nudge: false });
}

export function addCheckMedia(jobId: string, kind: "pre" | "post", file: File, meta: { name: string; caption: string; tag: string }) {
  const url = URL.createObjectURL(file);
  const row: ScopeMedia = {
    id: `CK-${Date.now()}`,
    cat: catFromTag(meta.tag),
    name: meta.name.trim() || file.name,
    url,
    kind: file.type.startsWith("video/") ? "video" : "photo",
    caption: meta.caption,
    purpose: meta.tag,
  };
  patch(jobId, (j) => {
    if (!isAccepted(j)) return j;
    const key = kind === "pre" ? "preCheck" : "postCheck";
    const pack = j[key];
    addHistory(j.personId, actingName(), `${kind === "pre" ? "Pre" : "Post"}-install acknowledgement photo ${row.name}.`);
    return { ...j, [key]: { ...pack, photos: [row, ...(pack.photos ?? [])] } };
  }, { nudge: false });
}

export function togglePacket(jobId: string, id: string) {
  patch(jobId, (j) => {
    const line = packetLines(j).find((p) => p.id === id);
    if (!line) return j;
    const exists = j.packet.parts.some((p) => p.id === id);
    const on = exists ? !j.packet.parts.find((p) => p.id === id)?.on : false;
    addHistory(j.personId, actingName(), `${line.label} ${on ? "in" : "out of"} the packet.`);
    const parts = exists ? j.packet.parts.map((p) => (p.id === id ? { ...p, on } : p)) : [...j.packet.parts, { id, label: line.label, on }];
    return { ...j, packet: { ...j.packet, parts } };
  }, { nudge: false });
}

export function signCloseout(jobId: string) {
  patch(jobId, (j) => {
    if (closeBlockers(j).length || j.packet.signedBy) return j;
    addHistory(j.personId, actingName(), "Closeout signed off.");
    return { ...j, packet: { ...j.packet, signedBy: actingName(), signedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }) } };
  }, { nudge: false });
}

export function sendPacket(jobId: string) {
  patch(jobId, (j) => {
    if (j.packet.sent || closeBlockers(j).length || !j.packet.signedBy) return j;
    const included = packetLines(j).filter((line) => packetOn(j, line.id));
    sendMessage(j.personId, [`Completion packet for ${j.name}.`, "", "Included", ...included.map((line) => `· ${line.label}. ${line.detail}`), "", "Work orders and purchase orders stay in the office. They are not in this packet.", "", "A short survey and a review request are on the way."].join("\n"), "email", { subject: `Your ${j.product} completion packet` });
    sendMessage(j.personId, `${j.name.split(" ")[0]}, the install is done. If you have a minute, a Google review helps the crew.`, "sms");
    const survey = j.packet.surveyId ? undefined : createAction({ kind: "task", personId: j.personId, title: `After-install survey · ${j.name}`, owner: j.pm, description: `Call or send the survey for ${j.jobId}. Review request already went out.`, category: "Follow up" });
    addHistory(j.personId, actingName(), "Closing packet sent. Survey and review request sent.");
    return { ...j, packet: { ...j.packet, sent: true, sentAt: "Now", surveyId: j.packet.surveyId || survey?.id } };
  });
}

export function setPlan(jobId: string, scopeId: string, status: import("../types").PlanStatus) {
  patch(jobId, (j) => ({
    ...j,
    scope: j.scope.map((s) => (s.id === scopeId ? { ...s, plan: { status, approvedBy: status === "Released" || status === "Approved" ? "Office" : s.plan?.approvedBy ?? "" } } : s)),
  }));
}

export function togglePromise(jobId: string, scopeId: string) {
  patch(jobId, (j) => {
    const line = j.scope.find((s) => s.id === scopeId);
    const next = !line?.promiseDone;
    addHistory(j.personId, j.pm, `Promise ${line?.label ?? "line"} ${next ? "done" : "reopened"}.`);
    return { ...j, scope: j.scope.map((s) => (s.id === scopeId ? { ...s, promiseDone: next } : s)) };
  }, { nudge: false });
}

export function patchBom(jobId: string, scopeId: string, bomId: string, row: Partial<import("../types").BomLine>) {
  patch(jobId, (j) => {
    if (row.usedQty != null && !isAccepted(j)) return j;
    return {
    ...j,
    scope: j.scope.map((s) =>
      s.id === scopeId
        ? {
            ...s,
            bom: s.bom.map((b) => {
              if (b.id !== bomId) return b;
              const next = { ...b, ...row };
              const ordered = next.orderQty ?? next.estQty;
              const left = Math.max(0, ordered - (next.usedQty || 0));
              let ret = next.returnQty || 0;
              let wh = next.warehouseQty || 0;
              if (ret > left) ret = left;
              if (ret + wh > left) wh = Math.max(0, left - ret);
              next.returnQty = ret;
              next.warehouseQty = wh;
              next.leftQty = left;
              if (row.returnQty != null && row.returnCredit == null) {
                next.returnCredit = ret * (next.actualUnitCost ?? next.unitCost);
              }
              if (ret === 0 && row.returnQty != null) next.returnCredit = 0;
              return next;
            }),
          }
        : s,
    ),
  };
  });
}
