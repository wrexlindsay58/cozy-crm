import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { photosByPerson, type Photo } from "@/lib/file-data";

let photos: Record<string, Photo[]> = Object.fromEntries(
  Object.entries(photosByPerson).map(([id, rows]) => [id, rows.map((p) => ({ ...p }))]),
);
let cached = photos;
const listeners = new Set<() => void>();
function emit() {
  cached = photos;
  listeners.forEach((l) => l());
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function usePhotos(personId: string) {
  const all = useSyncExternalStore(subscribe, () => cached, () => cached);
  return all[personId] ?? [];
}

export function addPhoto(personId: string, caption: string, src?: string) {
  const label = caption.trim() || "Photo";
  const row: Photo = {
    id: `PH-${Date.now()}`,
    personId,
    caption: label,
    tone: "info",
    src,
  };
  photos = { ...photos, [personId]: [row, ...(photos[personId] ?? [])] };
  addHistory(personId, "Wrex Lindsay", `Photo added. ${label}.`);
  emit();
  return row;
}
