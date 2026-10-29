import { projects } from '../../data/projects';

const C = {
  line: 'var(--line-strong)',
  weak: 'var(--line-weak)',
  accent: 'var(--accent)',
  txt: 'var(--txt)',
  txt2: 'var(--txt-2)',
  muted: 'var(--txt-3)',
};

/** 把 2026.03 这类年月解析成"从 2025.09 起的第几个月" */
const ORIGIN_YEAR = 2025;
const ORIGIN_MONTH = 9;
const TOTAL_MONTHS = 15; // 2025.09 → 2026.11

function toIndex(period: string, which: 'start' | 'end'): number {
  const parts = period.replace(/\s/g, '').split('—');
  const raw = (which === 'start' ? parts[0] : parts[1] || parts[0]).split('.');
  const y = Number(raw[0]);
  const m = Number(raw[1]);
  if (!y || !m) return 0;
  return (y - ORIGIN_YEAR) * 12 + (m - ORIGIN_MONTH);
}

const ROW_H = 26;
const LABEL_W = 128;
const BAR_ZONE = 360;
const TOP = 26;

export function Gantt() {
  const height = TOP + projects.length * ROW_H + 26;
  const width = LABEL_W + BAR_ZONE + 16;
  const step = BAR_ZONE / TOTAL_MONTHS;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="gantt" role="img" aria-label="项目时间分布">
      {/* 年刻度 */}
      {[0, 12].map((m) => (
        <g key={m}>
          <line
            x1={LABEL_W + m * step}
            y1={TOP - 12}
            x2={LABEL_W + m * step}
            y2={height - 22}
            stroke={C.weak}
            strokeWidth={1}
          />
          <text
            x={LABEL_W + m * step + 4}
            y={TOP - 16}
            fill={C.muted}
            fontSize={8}
            letterSpacing={1}
            fontFamily="Consolas, monospace"
          >
            {ORIGIN_YEAR + Math.floor((ORIGIN_MONTH - 1 + m) / 12)}
          </text>
        </g>
      ))}

      {projects.map((p, i) => {
        const s = toIndex(p.period, 'start');
        const e = toIndex(p.period, 'end');
        const x = LABEL_W + s * step;
        const w = Math.max((e - s + 1) * step, 6);
        const y = TOP + i * ROW_H;

        return (
          <g key={p.code}>
            <text
              x={4}
              y={y + 12}
              fill={C.txt2}
              fontSize={9}
              fontFamily="Consolas, monospace"
            >
              {p.code}
            </text>
            <text x={50} y={y + 12} fill={C.txt} fontSize={9.5} fontFamily="system-ui, sans-serif">
              {p.title.length > 9 ? p.title.slice(0, 9) + '…' : p.title}
            </text>
            <rect x={x} y={y + 3} width={w} height={9} fill="rgba(255,209,102,0.24)" stroke={C.accent} strokeWidth={0.8} />
            <text
              x={x + w + 5}
              y={y + 11}
              fill={C.muted}
              fontSize={7.5}
              fontFamily="Consolas, monospace"
            >
              {e - s + 1}M
            </text>
          </g>
        );
      })}

      <text x={4} y={height - 6} fill={C.muted} fontSize={7.5} letterSpacing={1.2} fontFamily="Consolas, monospace">
        FIG.03 · TIMELINE 2025.09 — 2026.11
      </text>
    </svg>
  );
}
