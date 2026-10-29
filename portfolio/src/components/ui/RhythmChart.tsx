// 月度产出节奏柱状图：项目/笔记数据由父组件从 useData() 传入
import type { Note, Project } from '../../data/types';

const C = {
  weak: 'var(--line-weak)',
  line: 'var(--line-strong)',
  accent: 'var(--accent)',
  txt2: 'var(--txt-2)',
  muted: 'var(--txt-3)',
};

const ORIGIN_Y = 2025;
const ORIGIN_M = 9;
const MONTHS = 15; // 2025.09 → 2026.11

interface RhythmChartProps {
  projects: Project[];
  notes: Note[];
}

function monthIndex(y: number, m: number): number {
  return (y - ORIGIN_Y) * 12 + (m - ORIGIN_M);
}

/** 每个项目在其起止月之间计 1 次活跃；笔记按发布日期计 1 次 */
function buildLoad(projects: Project[], notes: Note[]): number[] {
  const load = new Array(MONTHS).fill(0) as number[];

  for (const p of projects) {
    const parts = p.period.replace(/\s/g, '').split('—');
    const s = (parts[0] ?? '').split('.').map(Number);
    const e = (parts[1] || parts[0] || '').split('.').map(Number);
    const from = monthIndex(s[0] ?? 0, s[1] ?? 0);
    const to = monthIndex(e[0] ?? 0, e[1] ?? 0);
    for (let i = Math.max(0, from); i <= Math.min(MONTHS - 1, to); i++) load[i] += 1;
  }

  for (const n of notes) {
    const [y, m] = n.date.split('.').map(Number);
    const i = monthIndex(y ?? 0, m ?? 0);
    if (i >= 0 && i < MONTHS) load[i] += 2; // 写作权重更高
  }

  return load;
}

const W = 420;
const H = 180;
const PAD_L = 26;
const PAD_B = 26;
const PAD_T = 14;

export function RhythmChart({ projects, notes }: RhythmChartProps) {
  const load = buildLoad(projects, notes);
  const max = Math.max(...load, 1);
  const barZone = W - PAD_L - 8;
  const slot = barZone / MONTHS;
  const barW = slot * 0.56;
  const chartH = H - PAD_B - PAD_T;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="rhythm" role="img" aria-label="月度项目与写作产出节奏">
      {/* 横向刻度 */}
      {[0, 0.5, 1].map((r) => {
        const y = PAD_T + chartH * (1 - r);
        return (
          <g key={r}>
            <line x1={PAD_L} y1={y} x2={W - 6} y2={y} stroke={C.weak} strokeWidth={1} />
            <text x={PAD_L - 6} y={y + 3} textAnchor="end" fill={C.muted} fontSize={7} fontFamily="Consolas, monospace">
              {Math.round(max * r)}
            </text>
          </g>
        );
      })}

      {/* 柱子 */}
      {load.map((v, i) => {
        const h = v === 0 ? 0 : Math.max((v / max) * chartH, 3);
        const x = PAD_L + i * slot + (slot - barW) / 2;
        const y = PAD_T + chartH - h;
        const isPeak = v === max;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              fill={isPeak ? 'rgba(255,209,102,0.55)' : 'rgba(191,216,245,0.28)'}
              stroke={isPeak ? C.accent : C.line}
              strokeWidth={isPeak ? 1 : 0.6}
            />
            {isPeak && (
              <text
                x={x + barW / 2}
                y={y - 4}
                textAnchor="middle"
                fill={C.accent}
                fontSize={7}
                fontFamily="Consolas, monospace"
              >
                {v}
              </text>
            )}
          </g>
        );
      })}

      {/* 月份标签：只标 4 个 */}
      {[0, 3, 6, 12].map((i) => {
        const m = (ORIGIN_M - 1 + i) % 12 + 1;
        const y = ORIGIN_Y + Math.floor((ORIGIN_M - 1 + i) / 12);
        return (
          <text
            key={i}
            x={PAD_L + i * slot + slot / 2}
            y={H - 12}
            textAnchor="middle"
            fill={C.muted}
            fontSize={7.5}
            fontFamily="Consolas, monospace"
          >
            {`${String(y).slice(2)}.${String(m).padStart(2, '0')}`}
          </text>
        );
      })}

      <text x={6} y={H - 3} fill={C.muted} fontSize={7} letterSpacing={1} fontFamily="Consolas, monospace">
        FIG.04 · OUTPUT RHYTHM
      </text>
    </svg>
  );
}
