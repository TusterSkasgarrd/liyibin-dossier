import { useEffect, useRef, useState } from 'react';
import { useReveal } from '../hooks/useReveal';

/**
 * 通栏大字：滚入视口时从下往上揭示，
 * 滚动过程中整行做轻微水平位移（视差），制造"图纸被拖动"的感觉。
 */
export function SloganBand() {
  const { ref, inView } = useReveal<HTMLDivElement>(0.25);
  const bandRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = bandRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const progress = 1 - rect.top / window.innerHeight;
      setShift(-28 + progress * 56);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="slogan-band" ref={bandRef} aria-hidden="true">
      <div
        ref={ref}
        className={`slogan${inView ? ' is-in' : ''}`}
        style={{ transform: `translateX(${shift}px)` }}
      >
        <span className="slogan__line">把结构做对</span>
        <span className="slogan__line slogan__line--accent">再谈好看</span>
      </div>
      <div className="slogan-band__rule" />
    </div>
  );
}
