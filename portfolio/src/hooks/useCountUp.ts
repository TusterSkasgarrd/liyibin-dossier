import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './useReveal';

/**
 * 数字从 0 滚动到 target。
 * active 为 true 时开始；减少动效时直接给终值。
 */
export function useCountUp(target: number, active: boolean, duration = 1200) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!active) return;

    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }

    const start = performance.now();

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, active, duration]);

  return value;
}
