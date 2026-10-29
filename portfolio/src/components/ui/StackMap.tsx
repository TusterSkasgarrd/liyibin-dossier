/**
 * 技术栈拓扑图：中心是本人，四个方向连到能力域。
 * 全部正交折线 + 方框，工程图语言。
 *
 * 色值常量与 tokens.css 同值（P1 例外条款：SVG 内部绘制集中定义，不散落）
 */
const C = {
  line: 'var(--line-strong)',
  accent: 'var(--accent)',
  txt: 'var(--txt)',
  txt2: 'var(--txt-2)',
  bg: 'var(--bp-base)',
  muted: 'var(--txt-3)',
};

const DOMAINS = [
  { key: 'hw', title: '嵌入式与传感', items: ['Logisim', 'Multisim', '传感器调理'], box: { x: 132, y: 62, w: 136, h: 72 } },
  { key: 'data', title: '数据与后端', items: ['MySQL', 'Java', '数据结构'], box: { x: 274, y: 196, w: 116, h: 88 } },
  { key: 'xr', title: '三维与可视化', items: ['Unity3D', 'Blender', '数字孪生'], box: { x: 132, y: 346, w: 136, h: 72 } },
  { key: 'fe', title: '前端与 AI', items: ['React / TS', '扩展 MV3', 'Prompt'], box: { x: 10, y: 196, w: 116, h: 88 } },
];

const CENTER = { x: 152, y: 213, w: 96, h: 54 };

export function StackMap() {
  return (
    <svg viewBox="0 0 400 480" fill="none" aria-label="技术栈拓扑图" style={{ width: '100%', height: '100%' }}>
      <defs>
        <pattern id="sm-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" stroke={C.line} strokeOpacity="0.07" strokeWidth="1" />
        </pattern>
        <marker id="sm-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 1 6 4 0 7" fill={C.line} fillOpacity="0.75" />
        </marker>
      </defs>

      <rect width="400" height="480" fill="url(#sm-grid)" />

      {/* 中心 → 四方：正交连线 */}
      <g stroke={C.line} strokeOpacity="0.5" strokeWidth="1" markerEnd="url(#sm-arrow)">
        <path d="M200 213V136" />
        <path d="M200 267v77" />
        <path d="M152 240h-26" />
        <path d="M248 240h25" />
      </g>

      {/* 中心节点 */}
      <rect
        x={CENTER.x}
        y={CENTER.y}
        width={CENTER.w}
        height={CENTER.h}
        stroke={C.accent}
        strokeWidth="1.5"
        fill={C.bg}
        fillOpacity="0.94"
      />
      <text x="200" y="236" textAnchor="middle" fill={C.txt} fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">
        李亦斌
      </text>
      <text x="200" y="252" textAnchor="middle" fill={C.txt2} fontSize="7.5" letterSpacing="1.2" fontFamily="Consolas, monospace">
        IOT ENGINEERING
      </text>

      {/* 四个能力域 */}
      {DOMAINS.map((d) => {
        const { x, y, w, h } = d.box;
        return (
          <g key={d.key}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              stroke={C.line}
              strokeOpacity="0.55"
              strokeWidth="1"
              fill={C.bg}
              fillOpacity="0.35"
            />
            <rect x={x} y={y} width="3" height={h} fill={C.accent} fillOpacity="0.85" />
            <text x={x + 11} y={y + 19} fill={C.txt} fontSize="10.5" fontWeight="600" fontFamily="system-ui, sans-serif">
              {d.title}
            </text>
            {d.items.map((it, i) => (
              <text
                key={it}
                x={x + 11}
                y={y + 35 + i * 12}
                fill={C.txt2}
                fontSize="8"
                letterSpacing="0.4"
                fontFamily="Consolas, monospace"
              >
                · {it}
              </text>
            ))}
          </g>
        );
      })}

      {/* 左上角标与图注 */}
      <g stroke={C.accent} strokeOpacity="0.6" strokeWidth="1">
        <path d="M24 40V24h18" />
      </g>
      <text x="24" y="58" fill={C.muted} fontSize="8" letterSpacing="1.4" fontFamily="Consolas, monospace">
        FIG.01 · CAPABILITY MAP
      </text>

      <text x="376" y="462" textAnchor="end" fill={C.muted} fontSize="8" letterSpacing="1.4" fontFamily="Consolas, monospace">
        4 DOMAINS · 13 SKILLS
      </text>
    </svg>
  );
}
