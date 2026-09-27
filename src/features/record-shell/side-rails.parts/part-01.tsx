import { useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { addPhoto, kindFromFile, kindWord, photosOnAction, usePhotos } from "@/features/photos/store";
import { CommentBox } from "../comment-box";
import type { Activity, Ticket } from "@/lib/crm-data";
import type { Photo } from "@/lib/file-data";
import { PhotoRailView } from "./part-03";

export function TicketRail({ tickets }: { tickets: Ticket[] }) {
  return (
    <section className="border-t border-line p-3">
      <h2 className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">Actions</h2>
      {tickets.length === 0 ? <p className="mt-2 text-sm text-muted">None on this file.</p> : null}
      <ul className="mt-2 space-y-2">
        {tickets.map((t) => (
          <li key={t.id} className="text-sm">
            <a href={`/tickets/${t.id}`} className="font-semibold text-navy">
              {t.title}
            </a>
            <p className="text-[11px] text-muted">
              {t.owner} · {t.status} · {t.age}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PhotoRail({
  personId,
  photos: seed,
  flush,
  actionId,
  actionKind,
  actionIds,
  scope = "house",
  onScope,
  pipeline = "Lead",
}: {
  personId: string;
  photos?: Photo[];
  flush?: boolean;
  actionId?: string;
  actionKind?: "ticket" | "task" | "request";
  actionIds?: string[];
  scope?: "action" | "house";
  onScope?: (next: "action" | "house") => void;
  pipeline?: string;
}) {
  const live = usePhotos(personId);
  const all = live.length ? live : (seed ?? []);
  const ids = scope === "action" && actionIds?.length ? actionIds : undefined;
  const photos = photosOnAction(all, ids);
  const [caption, setCaption] = useState("");
  const [fileName, setFileName] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const word = actionKind ?? "ticket";
  const showScope = Boolean(actionId && onScope);

  function onFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    if (!caption.trim()) setCaption(file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
  }

  function save(file?: File) {
    if (file) {
      const kind = kindFromFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        addPhoto(
          personId,
          caption,
          typeof reader.result === "string" ? reader.result : undefined,
          kind,
          file.name,
          actionId && scope === "action" ? { actionId, pipeline } : { pipeline },
        );
        setCaption("");
        setFileName("");
        if (fileRef.current) fileRef.current.value = "";
      };
      reader.readAsDataURL(file);
      return;
    }
    if (!caption.trim()) return;
    addPhoto(personId, caption, undefined, "photo", undefined, actionId && scope === "action" ? { actionId, pipeline } : { pipeline });
    setCaption("");
  }

  return (
    <PhotoRailView bag={{ flush, showScope, onScope, scope, word, photos, all, save, fileRef, onFile, fileName, caption, setCaption, actionId, setOpen, open }} />
  );
}

export function MediaTile({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  const [talk, setTalk] = useState(false);
  return (
    <li className="rounded-md bg-page">
      <button type="button" className="w-full overflow-hidden text-left" onClick={onOpen}>
        {photo.src && (photo.kind ?? "photo") === "photo" ? (
          <img src={photo.src} alt="" className="h-28 w-full object-cover" />
        ) : photo.src && photo.kind === "video" ? (
          <video src={photo.src} muted className="h-28 w-full object-cover" />
        ) : (
          <div className="grid h-28 place-items-center bg-line px-2 text-center text-[11px] font-semibold text-muted">
            {kindWord(photo.kind)}
          </div>
        )}
        <p className="px-2 py-1.5 text-[11px] font-medium">{photo.caption}</p>
      </button>
      <button
        type="button"
        aria-label="Comment"
        className="flex h-10 w-full items-center justify-center gap-1 text-[11px] font-semibold text-navy"
        onClick={() => setTalk((v) => !v)}
      >
        <MessageSquare className="size-3.5" />
        Comment
      </button>
      {talk ? <div className="px-2 pb-2"><CommentBox personId={photo.personId} nest={{ kind: "media", id: photo.id, title: photo.caption }} /></div> : null}
    </li>
  );
}

export function timeOf(at: string) {
  const bits = at.split(" ");
  return bits.length > 2 ? bits.slice(2).join(" ") : at;
}

export function groupByDay(history: Activity[]) {
  const map = new Map<string, Activity[]>();
  for (const a of history) {
    const day = a.at.split(" ").slice(0, 2).join(" ") || a.at;
    const rows = map.get(day) ?? [];
    rows.push(a);
    map.set(day, rows);
  }
  return [...map.entries()].map(([day, rows]) => ({ day, rows }));
}
