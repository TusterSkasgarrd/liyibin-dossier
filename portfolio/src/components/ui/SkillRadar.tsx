// 四轴能力雷达图：数据由父组件从 useData() 传入，本文件不直接读种子
import type { Skill, SkillGroup } from '../../data/types';

const C = {
  line: 'var(--line-strong)',
  weak: 'var(--line-weak)',
  accent: 'var(--accent)',
  txt: 'var(--txt)',
  txt2: 'var(--txt-2)',
  muted: 'var(--txt-3)',
};

const GROUPS: SkillGroup[] = ['language', 'data', 'xr', 'hardware'];

interface SkillRadarProps {
  skills: Skill[];
  groupLabel: Record<SkillGroup, string>;
}

/** 每个能力域的平均熟练度（0–1） */
function groupScore(skills: Skill[], group: SkillGroup): number {
  const list = skills.filter((s) => s.group === group);
  if (!list.length) return 0;
  const avg = list.reduce((n, s) => n + s.level, 0) / list.length;
  return avg / 5;
}

const W = 340;
const H = 300;
const CX = W / 2;
const CY = H / 2 + 2;
const R = 78;

/** 上 → 右 → 下 → 左（4 轴） */
function point(axis: number, ratio: number): [number, number] {
  const angle = (Math.PI / 2) * axis - Math.PI / 2;
  return [CX + Math.cos(angle) * R * ratio, CY + Math.sin(angle) * R * ratio];
}

export function SkillRadar({ skills, groupLabel }: SkillRadarProps) {
  const scores = GROUPS.map((g) => groupScore(skills, g));
  const polygon = scores.map((v, i) => point(i, Math.max(v, 0.12)).join(',')).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="radar" role="img" aria-label="四个能力域的熟练度分布">
      {/* 三层同心菱形 */}
      {[0.34, 0.67, 1].map((r) => (
        <polygon
          key={r}
          points={[0, 1, 2, 3].map((i) => point(i, r).join(',')).join(' ')}
          fill="none"
          stroke={C.weak}
          strokeWidth={1}
        />
      ))}

      {/* 十字轴 */}
      <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} stroke={C.weak} strokeWidth={1} />
      <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke={C.weak} strokeWidth={1} />

      {/* 数据多边形 */}
      <polygon points={polygon} fill="rgba(255,209,102,0.14)" stroke={C.accent} strokeWidth={1.5} />

      {/* 顶点 */}
      {scores.map((v, i) => {
        const [x, y] = point(i, Math.max(v, 0.12));
        return <circle key={i} cx={x} cy={y} r={3} fill={C.accent} />;
      })}

      {/* 轴标签 */}
      {GROUPS.map((g, i) => {
        const [x, y] = point(i, 1.32);
        const anchor = i === 1 ? 'start' : i === 3 ? 'end' : 'middle';
        return (
          <g key={g}>
            <text
              x={x}
              y={y}
              textAnchor={anchor}
              fill={C.txt2}
              fontSize={9.5}
              fontFamily="system-ui, sans-serif"
            >
              {groupLabel[g]}
            </text>
            <text
              x={x}
              y={y + 12}
              textAnchor={anchor}
              fill={C.muted}
              fontSize={8.5}
              fontFamily="Consolas, monospace"
            >
              {(scores[i] * 5).toFixed(1)} / 5
            </text>
          </g>
        );
      })}

      {/* 角标 */}
      <text x={6} y={H - 6} fill={C.muted} fontSize={7.5} letterSpacing={1.2} fontFamily="Consolas, monospace">
        FIG.02 · SKILL DISTRIBUTION
      </text>
    </svg>
  );
}
