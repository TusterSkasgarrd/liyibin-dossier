interface ScaleBarProps {
  level: number;
}

/** 五格熟练度刻度 */
export function ScaleBar({ level }: ScaleBarProps) {
  const n = Math.max(1, Math.min(5, Math.round(level)));
  return (
    <span className="scale" title={`熟练度 ${n} / 5`} aria-label={`熟练度 ${n} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= n ? 'on' : ''} />
      ))}
    </span>
  );
}
