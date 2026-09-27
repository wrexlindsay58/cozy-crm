import { mapType } from "../types";
import { rid, officeFor, upsertBook } from "./part-01";

export function putFromJob(input: {
  jobId: string;
  personId: string;
  title: string;
  process: string;
  day: string;
  start: string;
  end: string;
  crew: string;
  sourceId: string;
  woSigned?: boolean;
  city?: string;
}) {
  if (!input.day) return;
  const start = `${input.day}T${input.start || "07:00"}`;
  const end = `${input.day}T${input.end || "15:00"}`;
  upsertBook({
    id: `BK-${input.jobId}-${input.sourceId}`,
    type: mapType(input.process),
    status: "Set",
    title: input.title,
    personId: input.personId,
    jobId: input.jobId,
    href: `/projects/${input.jobId}`,
    resourceId: rid(input.crew),
    crewId: rid(input.crew),
    techId: "",
    assigneeId: "",
    office: officeFor(input.city ?? ""),
    start,
    end,
    city: input.city ?? "",
    notes: "",
    setBy: input.crew,
    scope: input.process,
    leadSource: "",
    products: [{ label: input.process, notes: "", qty: 1 }],
    internal: false,
    woSigned: Boolean(input.woSigned),
    hold: false,
    blank: false,
    links: [],
    source: "job",
    sourceId: input.sourceId,
  });
}
