import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
import { actingName } from "@/features/staff/store";
import { photosByPerson, type FileKind, type Photo } from "@/lib/file-data";

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

export function kindFromFile(file: File): FileKind {
  const t = file.type;
  const n = file.name.toLowerCase();
  if (t.startsWith("image/") || /\.(heic|jpg|jpeg|png|gif|webp)$/.test(n)) return "photo";
  if (t.startsWith("video/") || /\.(mp4|mov|m4v|webm)$/.test(n)) return "video";
  if (t.startsWith("audio/") || /\.(m4a|mp3|wav|aac|ogg)$/.test(n)) return "audio";
  if (t === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  return "file";
}

export function kindWord(kind: FileKind = "photo") {
  if (kind === "video") return "Video";
  if (kind === "audio") return "Audio";
  if (kind === "pdf") return "PDF";
  if (kind === "file") return "File";
  return "Photo";
}

export function usePhotos(personId: string) {
  const all = useSyncExternalStore(subscribe, () => cached, () => cached);
  return all[personId] ?? [];
}

export function putPhoto(personId: string, row: Photo) {
  const list = photos[personId] ?? [];
  if (list.some((p) => p.id === row.id)) return;
  photos = { ...photos, [personId]: [{ ...row, personId }, ...list] };
  emit();
}

export function addPhoto(
  personId: string,
  caption: string,
  src?: string,
  kind: FileKind = "photo",
  name?: string,
  extra?: { actionId?: string },
) {
  const label = caption.trim() || name || kindWord(kind);
  const row: Photo = {
    id: `PH-${Date.now()}`,
    personId,
    caption: label,
    tone: "info",
    src,
    kind,
    name,
    actionId: extra?.actionId,
  };
  putPhoto(personId, row);
  addHistory(personId, actingName(), `${kindWord(kind)} added. ${label}.`);
  return row;
}

export function photosOnAction(rows: Photo[], actionIds?: string[]) {
  if (!actionIds?.length) return rows;
  return rows.filter((p) => p.actionId && actionIds.includes(p.actionId));
}
