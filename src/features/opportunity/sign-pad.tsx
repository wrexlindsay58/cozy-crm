import { useEffect, useRef } from "react";

export function SignPad({ onChange }: { onChange: (url: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const moved = useRef(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const pen = canvas.getContext("2d");
    if (!pen) return;
    pen.strokeStyle = "#14324a";
    pen.lineWidth = 2.2;
    pen.lineCap = "round";
    pen.lineJoin = "round";
  }, []);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = ref.current;
    if (!canvas) return { x: 0, y: 0 };
    const box = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - box.left) / box.width) * canvas.width,
      y: ((e.clientY - box.top) / box.height) * canvas.height,
    };
  }

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    const pen = ref.current?.getContext("2d");
    if (!pen) return;
    const p = point(e);
    drawing.current = true;
    moved.current = false;
    pen.beginPath();
    pen.moveTo(p.x, p.y);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const pen = ref.current?.getContext("2d");
    if (!pen) return;
    const p = point(e);
    pen.lineTo(p.x, p.y);
    pen.stroke();
    moved.current = true;
  }

  function up() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = ref.current;
    onChange(canvas && moved.current ? canvas.toDataURL("image/png") : null);
  }

  function clear() {
    const canvas = ref.current;
    const pen = canvas?.getContext("2d");
    if (!canvas || !pen) return;
    pen.clearRect(0, 0, canvas.width, canvas.height);
    pen.beginPath();
    moved.current = false;
    onChange(null);
  }

  return (
    <div>
      <canvas
        ref={ref}
        width={640}
        height={160}
        className="h-36 w-full touch-none rounded-md border border-line bg-white"
        aria-label="Draw your signature"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
      <button type="button" className="mt-2 text-sm font-semibold text-navy" onClick={clear}>
        Clear signature
      </button>
    </div>
  );
}
