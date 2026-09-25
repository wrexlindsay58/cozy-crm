import { useState } from "react";
import { Plus } from "lucide-react";
import { addPhoto, kindFromFile, usePhotos } from "@/features/photos/store";
import { MediaAdd } from "@/features/job/media-strip";
import { FileLightbox } from "./file-lightbox";
import type { Photo } from "@/lib/file-data";
import { Tip } from "@/components/tip";

const ORDER = ["Contact", "Assessment", "Opportunity", "Job", "Actions", "Other"];

function groupOf(p: Photo) {
  if (p.actionId) return "Actions";
  const head = p.caption.split(" · ")[0]?.trim() ?? "";
  const h = head.toLowerCase();
  if (/hvac|attic|air.?seal|duct|window|house|hatch|condenser/.test(h)) return "Assessment";
  if (/proposal|option|goodleap|agreement/.test(h)) return "Opportunity";
  if (/install|crew|job|punch/.test(h)) return "Job";
  if (head && head !== p.caption) return "Assessment";
  return "Contact";
}

function subOf(p: Photo) {
  const parts = p.caption.split(" · ");
  return parts.length > 1 ? parts[0] : "";
}

export function FileMedia({ personId, photos: seed }: { personId: string; photos?: Photo[] }) {
  const live = usePhotos(personId);
  const photos = live.length ? live : (seed ?? []);
  const [look, setLook] = useState<number | null>(null);
  const [addOn, setAddOn] = useState(false);
  const groups = new Map<string, Photo[]>();
  for (const p of photos) {
    const g = groupOf(p);
    groups.set(g, [...(groups.get(g) ?? []), p]);
  }
  const keys = ORDER.filter((k) => groups.has(k));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-bold tracking-wide text-muted uppercase">Media</h2>
        <Tip label="Add media" on>
          <button
            type="button"
            aria-label="Add media"
            onClick={() => setAddOn((v) => !v)}
            className="grid size-8 place-items-center rounded-md bg-navy text-card"
          >
            <Plus className="size-4" />
          </button>
        </Tip>
      </div>
      {addOn ? (
        <MediaAdd
          onAdd={(file, meta) => {
            const url = URL.createObjectURL(file);
            addPhoto(personId, `${meta.tag} · ${meta.caption}`, url, kindFromFile(file), meta.name);
            setAddOn(false);
          }}
        />
      ) : null}
      {photos.length === 0 && !addOn ? <p className="text-sm text-muted">No photos, video, or audio on this house yet.</p> : null}
      {keys.map((key) => {
        const rows = groups.get(key) ?? [];
        const subs = new Map<string, Photo[]>();
        for (const p of rows) {
          const s = subOf(p) || key;
          subs.set(s, [...(subs.get(s) ?? []), p]);
        }
        return (
          <section key={key}>
            <h2 className="mb-2 text-[11px] font-bold tracking-wide text-muted uppercase">{key}</h2>
            {[...subs.entries()].map(([sub, list]) => (
              <div key={sub} className="mb-3">
                {sub !== key ? <p className="mb-1.5 text-[12px] font-semibold">{sub}</p> : null}
                <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {list.map((ph) => {
                    const i = photos.indexOf(ph);
                    return (
                      <li key={ph.id}>
                        <button type="button" className="w-full overflow-hidden rounded-md bg-page text-left" onClick={() => setLook(i)}>
                          {ph.src && (ph.kind ?? "photo") === "photo" ? (
                            <img src={ph.src} alt="" className="h-24 w-full object-cover" />
                          ) : (
                            <div className="grid h-24 place-items-center bg-line text-[11px] font-semibold text-muted">{ph.kind ?? "file"}</div>
                          )}
                          <p className="truncate px-2 py-1.5 text-[11px] font-medium">{ph.name || ph.caption}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        );
      })}
      {look !== null ? <FileLightbox files={photos} index={look} onIndex={setLook} onClose={() => setLook(null)} /> : null}
    </div>
  );
}
