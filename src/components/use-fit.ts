import { useLayoutEffect, useRef, useState } from "react";

/** True when the labeled row is wider than the bar. Used to drop words. */
export function useFit() {
  const barRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [iconsOnly, setIconsOnly] = useState(true);

  useLayoutEffect(() => {
    const bar = barRef.current;
    const measure = measureRef.current;
    if (!bar || !measure) return;
    function fit() {
      if (!bar || !measure) return;
      setIconsOnly(measure.offsetWidth > bar.clientWidth - 4);
    }
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);

  return { barRef, measureRef, iconsOnly };
}
