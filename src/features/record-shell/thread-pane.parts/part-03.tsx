import { useRef, useState } from "react";
import { ChevronDown, Phone } from "lucide-react";
import { kindFromFile } from "@/features/photos/store";
import { cannedFor } from "@/lib/canned";
import { Float } from "@/components/float";
import { Tip } from "@/components/tip";
import { cn } from "@/lib/cn";
import type { FileKind } from "@/lib/file-data";
import { ComposeExtrasView2 } from "./part-04";

export function ComposeExtras({
  channel,
  files,
  onFiles,
  onTemplate,
  onInsert,
}: {
  channel: "sms" | "email";
  files: { name: string; kind: FileKind; src?: string }[];
  onFiles: (rows: { name: string; kind: FileKind; src?: string }[]) => void;
  onTemplate: (body: string, subject?: string) => void;
  onInsert: (bit: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pane, setPane] = useState<"icons" | "templates" | "links" | "values" | "emoji" | "pay">("icons");
  const [box, setBox] = useState<DOMRect | null>(null);
  const canned = cannedFor(channel);

  function addFile(file: File | undefined) {
    if (!file) return;
    const kind = kindFromFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      onFiles([...files, { name: file.name, kind, src: typeof reader.result === "string" ? reader.result : undefined }]);
    };
    reader.readAsDataURL(file);
  }

  function close() {
    setOpen(false);
    setPane("icons");
    setBox(null);
  }

  function toggle() {
    if (open) {
      close();
      return;
    }
    const el = btnRef.current;
    if (el) setBox(el.getBoundingClientRect());
    setPane("icons");
    setOpen(true);
  }

  return (
    <ComposeExtrasView2 bag={{ fileRef, addFile, open, btnRef, toggle, files, box, pane, close, setPane, canned, onTemplate, onInsert }} />
  );
}

export function FromSplit({
  label,
  aria,
  active,
  onPick,
  current,
  options,
  onFrom,
  icon,
  disabled,
}: {
  label: string;
  aria?: string;
  active?: boolean;
  onPick: () => void;
  current: string;
  options: { label: string; value: string }[];
  onFrom: (v: string) => void;
  icon?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const chevRef = useRef<HTMLButtonElement>(null);
  const [box, setBox] = useState<DOMRect | null>(null);

  function toggle() {
    if (open) {
      setOpen(false);
      setBox(null);
      return;
    }
    if (chevRef.current) setBox(chevRef.current.getBoundingClientRect());
    setOpen(true);
  }

  return (
    <div className="relative flex">
      <button
        type="button"
        aria-label={aria ?? label}
        disabled={disabled}
        onClick={onPick}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-l-md px-3 text-sm font-semibold disabled:opacity-40",
          icon && "w-10 px-0",
          active ? "bg-navy text-card" : "text-muted",
        )}
      >
        {icon ? <Phone className="size-4" /> : label}
      </button>
      <Tip label={current || "From"} on={!open} side="top">
        <button
          ref={chevRef}
          type="button"
          aria-label={`${aria ?? label} from`}
          disabled={disabled}
          onClick={toggle}
          className={cn("grid h-10 w-7 place-items-center rounded-r-md disabled:opacity-40", active ? "bg-navy text-card" : "text-muted")}
        >
          <ChevronDown className="size-3.5" />
        </button>
      </Tip>
      {open && box ? (
        <Float anchor={box} prefer="top" onClose={() => setOpen(false)}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              className={cn("block w-full min-w-52 px-3 py-2 text-left text-sm hover:bg-page", o.value === current && "font-semibold")}
              onClick={() => {
                onFrom(o.value);
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </Float>
      ) : null}
    </div>
  );
}
