export type FloatSide = "top" | "bottom" | "right";

export function placeFloat(anchor: DOMRect, w: number, h: number, prefer: FloatSide = "bottom") {
  const pad = 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let top = 0;
  let left = 0;
  if (prefer === "top") {
    top = anchor.top - h - 6;
    if (top < pad) top = anchor.bottom + 6;
    left = anchor.left + anchor.width / 2 - w / 2;
  } else if (prefer === "right") {
    left = anchor.right + 8;
    if (left + w > vw - pad) left = anchor.left - w - 8;
    top = anchor.top + anchor.height / 2 - h / 2;
  } else {
    top = anchor.bottom + 6;
    if (top + h > vh - pad) top = anchor.top - h - 6;
    left = anchor.left + anchor.width / 2 - w / 2;
  }
  left = Math.min(Math.max(pad, left), Math.max(pad, vw - w - pad));
  top = Math.min(Math.max(pad, top), Math.max(pad, vh - h - pad));
  return { top, left };
}
