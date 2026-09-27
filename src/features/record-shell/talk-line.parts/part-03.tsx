import { useRef, useState } from "react";
import { HOVER_MS, HOLD_MS } from "./part-01";

export function useHoldReveal() {
  const [on, setOn] = useState(false);
  const hover = useRef<number>(0);
  const hold = useRef<number>(0);

  function clear() {
    window.clearTimeout(hover.current);
    window.clearTimeout(hold.current);
  }

  return {
    on,
    enter() {
      clear();
      hover.current = window.setTimeout(() => setOn(true), HOVER_MS);
    },
    leave() {
      clear();
      hover.current = window.setTimeout(() => setOn(false), 200);
    },
    down() {
      clear();
      hold.current = window.setTimeout(() => setOn(true), HOLD_MS);
    },
    up() {
      window.clearTimeout(hold.current);
    },
  };
}
