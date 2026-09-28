import { leads } from "@/lib/crm-data";
import { familyOf, type BookEvent } from "./types";

export function eventCreator(e: Pick<BookEvent, "type" | "personId" | "setBy">) {
  if (familyOf(e.type) === "sales" && e.personId) {
    const setter = leads.find((l) => l.id === e.personId)?.setter;
    if (setter) return setter;
  }
  return e.setBy || "";
}
