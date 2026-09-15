import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { kindWord } from "@/features/photos/store";
import type { Photo } from "@/lib/file-data";

export function FileLightbox({
  files,
  index,
  onClose,
  onIndex,
}: {
  files: Photo[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const file = files[index];
  const kind = file?.kind ?? "photo";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndex((index - 1 + files.length) % files.length);
      if (e.key === "ArrowRight") onIndex((index + 1) % files.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, files.length, onClose, onIndex]);

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/80">
      <div className="flex items-center justify-between gap-3 px-3 py-2 text-card">
        <p className="min-w-0 truncate text-sm font-semibold">
          {kindWord(kind)} · {file.caption}
        </p>
        <button type="button" className="grid size-11 place-items-center rounded-md text-card" aria-label="Close" onClick={onClose}>
          <X className="size-5" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-12 py-4">
        {files.length > 1 ? (
          <button
            type="button"
            className="absolute left-2 grid size-11 place-items-center rounded-md bg-card text-ink"
            aria-label="Previous"
            onClick={() => onIndex((index - 1 + files.length) % files.length)}
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : null}
        <Preview file={file} />
        {files.length > 1 ? (
          <button
            type="button"
            className="absolute right-2 grid size-11 place-items-center rounded-md bg-card text-ink"
            aria-label="Next"
            onClick={() => onIndex((index + 1) % files.length)}
          >
            <ChevronRight className="size-5" />
          </button>
        ) : null}
      </div>
      <p className="px-3 py-2 text-center text-[12px] text-card/80">
        {index + 1} of {files.length}
        {file.name ? ` · ${file.name}` : ""}
      </p>
    </div>
  );
}

function Preview({ file }: { file: Photo }) {
  const kind = file.kind ?? "photo";
  if (!file.src) {
    return (
      <div className="max-w-lg rounded-md bg-card p-6 text-center">
        <p className="text-sm font-semibold">{file.caption}</p>
        <p className="mt-1 text-sm text-muted">File is not on this shot yet. Add it from the list.</p>
      </div>
    );
  }
  if (kind === "video") {
    return <video src={file.src} controls autoPlay className="max-h-[78vh] max-w-full rounded-md bg-ink" />;
  }
  if (kind === "pdf") {
    return <iframe title={file.caption} src={file.src} className="h-[78vh] w-[min(100%,900px)] rounded-md bg-card" />;
  }
  if (kind === "file") {
    return (
      <div className="max-w-lg rounded-md bg-card p-6 text-center">
        <p className="text-sm font-semibold">{file.caption}</p>
        <a href={file.src} download={file.name ?? file.caption} className="mt-3 inline-grid h-11 place-items-center rounded-md bg-navy px-4 text-sm font-semibold text-card">
          Download
        </a>
      </div>
    );
  }
  return <img src={file.src} alt={file.caption} className="max-h-[78vh] max-w-full rounded-md object-contain" />;
}
