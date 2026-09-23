import { useEffect, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { ThreadMessage } from "@/lib/file-data";
import { cn } from "@/lib/cn";
import { Initial, whoName } from "./who-mark";

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function CallCard({ msg, contact }: { msg: ThreadMessage; contact: string }) {
  const name = whoName(msg, contact);
  const out = msg.from === "shop";
  const dur = msg.durationSec && msg.durationSec > 0 ? msg.durationSec : 60;
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const bars = useMemo(() => {
    const n = 42;
    return Array.from({ length: n }, (_, i) => {
      const seed = (msg.id.charCodeAt(msg.id.length - 1) + i * 7) % 10;
      return 8 + seed * 2;
    });
  }, [msg.id]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setT((cur) => {
        if (cur + 0.2 >= dur) {
          setPlaying(false);
          return dur;
        }
        return cur + 0.2;
      });
    }, 200);
    return () => window.clearInterval(id);
  }, [playing, dur]);

  const pct = Math.min(100, (t / dur) * 100);

  return (
    <div className={cn("flex items-start gap-2", out && "flex-row-reverse")}>
      <Initial name={name} />
      <div className="min-w-0 flex-1 rounded-md border border-line bg-page p-3">
      <p className={cn("text-[11px] font-semibold text-muted", out && "text-right")}>
        {name} · call · {msg.direction ?? "Out"} · {msg.result ?? "Answered"} · {msg.at}
      </p>
      <p className="mt-1 text-sm">{msg.text}</p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          className="grid size-11 shrink-0 place-items-center rounded-md bg-navy text-card"
          aria-label={playing ? "Pause recording" : "Play recording"}
          onClick={() => {
            if (t >= dur) setT(0);
            setPlaying((v) => !v);
          }}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
        <div className="relative min-w-0 flex-1">
          <div className="flex h-8 items-end gap-px">
            {bars.map((h, i) => (
              <i
                key={i}
                className="min-w-0 flex-1 rounded-sm"
                style={{
                  height: h,
                  background: (i / bars.length) * 100 <= pct ? "#0b3a4d" : "#d7e0e5",
                }}
              />
            ))}
          </div>
        </div>
        <span className="w-16 shrink-0 text-right text-[11px] font-semibold tabular-nums text-muted">
          {fmt(t)} / {fmt(dur)}
        </span>
      </div>
      </div>
    </div>
  );
}
