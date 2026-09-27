import { useNavigate } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { assessmentForLead, useAssessments } from "@/features/assessment/store";
import { returnSizeFacts, hatchFacts } from "@/features/assessment/packets";
import { fieldCaption, useAssessCategories } from "@/features/assessment/categories";
import { buildFigures } from "@/features/assessment/figures";
import { useReportAccess } from "@/features/assessment/fee-card";
import { useOps } from "@/features/ops/store";
import { usePhotos } from "@/features/photos/store";
import { useBrand } from "@/features/brand/store";

export function useAssessmentReport(personId: any, closer: any, embedded: any, oppId: any, mentionProposal: any, onContinue: any, audience: any) {
  useAssessments();
  const brand = useBrand();
  const navigate = useNavigate();
  const { leads } = useOps();
  const lead = leads.find((l) => l.id === personId);
  const assess = assessmentForLead(personId);
  const cats = useAssessCategories();
  const photos = usePhotos(personId);
  const access = useReportAccess(
    assess ?? {
      id: "",
      leadId: personId,
      name: "",
      address: "",
      closer,
      status: "Open",
      packets: [],
      property: { occupancy: "", bothHome: "", yearBuilt: "", sqft: "", stories: "", hoa: "", access: "", electrical: "", notes: "", utility: "", hotRooms: "", coldRooms: "", indoorTemp: "", outdoorTemp: "", occupants: "", peakBill: "" },
      qualify: {},
      intent: "",
      reportPaid: false,
      reportWaivedBy: "",
      reportWaiveReason: "",
    },
  );
  const locked = audience === "customer" && !access.unlocked;
  const cozyBlue = {
    ["--cozy" as string]: brand.navy,
    ["--cozy-soft" as string]: `color-mix(in srgb, ${brand.navy} 11%, white)`,
  } as CSSProperties;
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const figures = assess
    ? buildFigures({
        sqft: assess.property.sqft,
        stories: assess.property.stories,
        occupants: assess.property.occupants,
        peakBill: assess.property.peakBill,
        utility: assess.property.utility,
        hotRooms: assess.property.hotRooms,
        coldRooms: assess.property.coldRooms,
        indoorTemp: assess.property.indoorTemp,
        outdoorTemp: assess.property.outdoorTemp,
        packets: assess.packets,
      })
    : null;
  const chapterOrder = ["attic", "hvac", "ducts", "windows"];
  const chapters = (assess?.packets ?? [])
    .filter((packet) => packet.id !== "air-seal")
    .map((packet) => {
      const cat = cats.find((c) => c.id === packet.id);
      const facts = (cat?.fields ?? [])
        .map((field) => ({ label: fieldCaption(field), value: (packet.fields[field.label] || packet.fields[field.id] || "").trim() }))
        .filter((row) => row.value);
      if (packet.id === "attic") {
        const legacy = assess?.packets.find((row) => row.id === "air-seal");
        if (legacy) {
          for (const [label, value] of Object.entries(legacy.fields)) {
            const clean = value.trim();
            if (clean && !facts.some((row) => row.label === label)) facts.push({ label, value: clean });
          }
        }
        for (const row of hatchFacts(packet)) {
          if (!facts.some((item) => item.label === row.label)) facts.push(row);
        }
      }
      if (packet.id === "windows") {
        const outside = (assess?.property.outdoorTemp || packet.fields["Outside temperature (°F)"] || "").trim();
        if (outside && !facts.some((row) => row.label === "Outside temperature (°F)")) facts.push({ label: "Outside temperature (°F)", value: outside });
      }
      if (packet.id === "ducts") {
        for (const row of returnSizeFacts(packet)) {
          if (!facts.some((item) => item.label === row.label)) facts.push(row);
        }
        for (const label of ["Jump ducts", "Transfer grilles"] as const) {
          const old = label === "Jump ducts" ? "Jump ducts (count)" : "Air transfers (count)";
          const value = (packet.fields[label] || packet.fields[old] || "").trim();
          if (value && !facts.some((item) => item.label === label)) facts.push({ label, value });
        }
      }
      return { id: packet.id, label: cat?.label ?? packet.id, facts, notes: packet.notes.trim() };
    })
    .filter((chapter) => chapter.facts.length || chapter.notes)
    .sort((a, b) => chapterOrder.indexOf(a.id) - chapterOrder.indexOf(b.id));
  return { photos, assess, locked, cozyBlue, navigate, lead, today, figures, chapters, brand };
}
