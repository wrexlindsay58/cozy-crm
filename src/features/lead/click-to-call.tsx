import { useEffect, useState } from "react";
import { logCall } from "@/features/ops/store";
import { useFrom } from "@/features/from/store";

export function ClickToCall({
  personId,
  phone,
  name,
  open,
  onClose,
}: {
  personId: string;
  phone: string;
  name: string;
  open: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"dialing" | "live">("dialing");
  const [sec, setSec] = useState(0);
  const [muted, setMuted] = useState(false);
  const { callFrom } = useFrom();

  useEffect(() => {
    if (!open) return;
    setStatus("dialing");
    setSec(0);
    setMuted(false);
    const t = window.setTimeout(() => setStatus("live"), 900);
    return () => window.clearTimeout(t);
  }, [open, personId]);

  useEffect(() => {
    if (!open || status !== "live") return;
    const id = window.setInterval(() => setSec((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [open, status]);

  if (!open) return null;

  const mins = Math.floor(sec / 60);
  const clock = `${mins}:${(sec % 60).toString().padStart(2, "0")}`;

  function hangup() {
    const result = status === "live" && sec >= 4 ? "Answered" : sec >= 1 ? "VM" : "No answer";
    logCall(personId, {
      direction: "Out",
      result,
      duration: String(Math.max(1, Math.round(sec / 60) || (sec > 0 ? 1 : 0))),
      note: `Cozy Voice to ${phone}`,
    });
    onClose();
  }

  return (
    <div className="rounded-md bg-navy px-3 py-3 text-card">
      <p className="text-[11px] font-bold tracking-wide uppercase">Cozy Voice</p>
      <p className="mt-1 text-sm font-semibold">
        {status === "dialing" ? `Calling ${name}` : name} · {phone}
      </p>
      <p className="text-[12px] text-card/80">From {callFrom} · {status === "dialing" ? "Connecting" : clock}</p>
      <div className="mt-3 flex gap-2">
        <button type="button" className="h-11 flex-1 rounded-md bg-card/15 text-sm font-semibold" onClick={() => setMuted((v) => !v)}>
          {muted ? "Unmute" : "Mute"}
        </button>
        <button type="button" className="h-11 flex-1 rounded-md bg-stop text-sm font-semibold" onClick={hangup}>
          Hang up
        </button>
      </div>
    </div>
  );
}
