import { ImagePlus } from "lucide-react";
import { MEDIA_TAGS, type MediaTag } from "../types";
import { cn } from "@/lib/cn";
import { FILL_IN, FILL_IN_ERR, FillField } from "../fill-row";

export function MediaAddView(props: { bag: { caption: any; setCaption: any; tried: any; setTried: any; miss: any; title: any; setTitle: any; tag: any; setTag: any; go: any; ready: any; fileRef: any; onAdd: any; why: any } }) {
  const { caption, setCaption, tried, setTried, miss, title, setTitle, tag, setTag, go, ready, fileRef, onAdd, why } = props.bag;
  return (
    <div className="@container w-full min-w-0">
      <div className="flex w-full min-w-0 flex-col gap-2 @[40rem]:flex-row @[40rem]:items-end">
        <div className="grid min-w-0 w-full flex-1 grid-cols-1 gap-2 @[40rem]:grid-cols-3">
          <FillField label="Description">
            <input
              value={caption}
              onChange={(e) => {
                setCaption(e.target.value);
                if (tried) setTried(false);
              }}
              placeholder="What’s in the shot"
              className={miss && !caption.trim() ? FILL_IN_ERR : FILL_IN}
            />
          </FillField>
          <FillField label="Media name">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (tried) setTried(false);
              }}
              placeholder="File name"
              className={miss && !title.trim() ? FILL_IN_ERR : FILL_IN}
            />
          </FillField>
          <FillField label="Tag">
            <select
              value={tag}
              onChange={(e) => {
                setTag(e.target.value as MediaTag);
                if (tried) setTried(false);
              }}
              className={miss && !tag ? FILL_IN_ERR : FILL_IN}
            >
              <option value="">Select</option>
              {MEDIA_TAGS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </FillField>
        </div>
        <button type="button" onClick={go} className={cn("h-10 w-full shrink-0 rounded-md px-3 text-[12px] font-semibold @[40rem]:w-auto", ready ? "bg-navy text-card" : "border border-line text-muted")}>
          <span className="inline-flex items-center justify-center gap-1.5">
            <ImagePlus className="size-3.5" />
            Upload
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*,audio/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && ready && tag) {
              onAdd(f, { name: title.trim(), caption: caption.trim(), tag });
              setCaption("");
              setTitle("");
              setTag("");
              setTried(false);
            } else if (f) {
              setTried(true);
            }
            e.target.value = "";
          }}
        />
      </div>
      {miss ? <p className="mt-1 text-[12px] font-semibold text-alert">{why}</p> : null}
    </div>
  );
}
