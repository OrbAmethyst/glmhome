import { useEffect, useRef, useState } from 'react';

/* ============================================================
   ANIMATED NUMBER — eased rAF roll between values
   ============================================================ */
const eased = (t: number): number => 1 - Math.pow(1 - t, 3);
const reducedMotion = (): boolean =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function AnimatedNumber({ value, format = (n: number) => `${Math.round(n)}` }:
{ value: number; format?: (n: number) => string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reducedMotion()) { from.current = value; setShown(value); return; }
    const start = from.current;
    const delta = value - start;
    if (delta === 0) { return; }
    const t0 = performance.now();
    const DUR = 480;
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / DUR);
      const cur = start + delta * eased(k);
      setShown(cur);
      from.current = cur;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{format(shown)}</>;
}
