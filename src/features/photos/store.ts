import { useSyncExternalStore } from "react";
import { addHistory } from "@/features/ops/store";
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
  if (t === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  return "file";
}

export function kindWord(kind: FileKind = "photo") {
  if (kind === "video") return "Video";
  if (kind === "pdf") return "PDF";
  if (kind === "file") return "File";
  return "Photo";
}

export function usePhotos(personId: string) {
  const all = useSyncExternalStore(subscribe, () => cached, () => cached);
  return all[personId] ?? [];
}

export function addPhoto(personId: string, caption: string, src?: string, kind: FileKind = "photo", name?: string) {
  const label = caption.trim() || name || kindWord(kind);
  const row: Photo = {
    id: `PH-${Date.now()}`,
    personId,
    caption: label,
    tone: "info",
    src,
    kind,
    name,
  };
  photos = { ...photos, [personId]: [row, ...(photos[personId] ?? [])] };
  addHistory(personId, "Wrex Lindsay", `${kindWord(kind)} added. ${label}.`);
  emit();
  return row;
}
