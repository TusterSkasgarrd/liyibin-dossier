import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

/**
 * Hero 背景循环片：8 秒 / 30fps / 1920×1080
 *
 * 内容是时间的纯函数；首尾帧状态完全一致，可无缝 loop：
 *  - 网格 8 秒正好平移 100px（一个粗网格周期）
 *  - 三条尺寸线画完 → 保持 → 最后 20 帧淡出归零
 *  - 光点用 sin 往返，周期 = 全片时长
 */

const ACCENT = '#FFD166';
const LINE = '#BFD8F5';
const LINE_DIM = 'rgba(191,216,245,0.38)';

const LINES = [
  { x1: 200, x2: 880, y: 248, label: 'L=680', from: 0, to: 72 },
  { x1: 1080, x2: 1740, y: 542, label: 'L=660', from: 58, to: 130 },
  { x1: 400, x2: 1100, y: 836, label: 'L=700', from: 116, to: 188 },
];

export const HeroBg = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const gridShift = (frame / durationInFrames) * 100;

  const fade = interpolate(frame, [216, 240], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const t = frame / durationInFrames;
  const dotX = 1600 + Math.sin(t * Math.PI * 4) * 68;
  const dotY = 150 + Math.sin(t * Math.PI * 2 - Math.PI / 2) * 0.5 * 780 + 390;
  const dotOpacity = interpolate(frame, [0, 24, 216, 240], [0, 0.95, 0.95, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #082F5E 0%, #0E4C92 52%, #0A3A6F 100%)',
      }}
    >
      {/* 双层网格 */}
      <AbsoluteFill
        style={{
          transform: `translate(${-gridShift}px, ${-gridShift}px)`,
          backgroundImage: [
            'repeating-linear-gradient(to right, rgba(191,216,245,0.07) 0 1px, transparent 1px 10px)',
            'repeating-linear-gradient(to bottom, rgba(191,216,245,0.07) 0 1px, transparent 1px 10px)',
            'repeating-linear-gradient(to right, rgba(191,216,245,0.13) 0 1px, transparent 1px 100px)',
            'repeating-linear-gradient(to bottom, rgba(191,216,245,0.13) 0 1px, transparent 1px 100px)',
          ].join(','),
        }}
      />

      {/* 图形层 */}
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: 'absolute' }}>
        {/* 三条尺寸标注线 */}
        {LINES.map((l) => {
          const p = interpolate(frame, [l.from, l.to], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const drawn = (l.x2 - l.x1) * p;
          const midX = l.x1 + (l.x2 - l.x1) / 2;
          const labelOpacity = interpolate(
            frame,
            [l.to - 10, l.to + 8, 216, 240],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <g key={l.y} opacity={fade}>
              {/* 主线 */}
              <line
                x1={l.x1}
                y1={l.y}
                x2={l.x1 + drawn}
                y2={l.y}
                stroke={LINE}
                strokeWidth={1.4}
                strokeOpacity={0.7}
              />
              {/* 两端竖线 */}
              <line x1={l.x1} y1={l.y - 13} x2={l.x1} y2={l.y + 13} stroke={LINE} strokeWidth={1.4} strokeOpacity={0.7} />
              <line
                x1={l.x2}
                y1={l.y - 13}
                x2={l.x2}
                y2={l.y + 13}
                stroke={LINE}
                strokeWidth={1.4}
                strokeOpacity={0.7 * p}
              />
              {/* 数值 */}
              <g opacity={labelOpacity * 0.85}>
                <rect x={midX - 34} y={l.y - 24} width={68} height={18} fill="#0B3A70" />
                <text
                  x={midX}
                  y={l.y - 10}
                  textAnchor="middle"
                  fill={ACCENT}
                  fontSize={15}
                  letterSpacing={2}
                  fontFamily="Consolas, monospace"
                >
                  {l.label}
                </text>
              </g>
              {/* 引线 */}
              <line
                x1={midX}
                y1={l.y + 13}
                x2={midX}
                y2={l.y + 46}
                stroke={LINE_DIM}
                strokeWidth={1}
                strokeDasharray="4 4"
                opacity={labelOpacity}
              />
            </g>
          );
        })}

        {/* 光点与轨迹 */}
        <g opacity={dotOpacity}>
          <circle cx={dotX} cy={dotY} r={26} fill={ACCENT} opacity={0.08} />
          <circle cx={dotX} cy={dotY} r={12} fill={ACCENT} opacity={0.22} />
          <circle cx={dotX} cy={dotY} r={4.5} fill={ACCENT} />
          <line
            x1={dotX}
            y1={dotY - 46}
            x2={dotX}
            y2={dotY - 16}
            stroke={ACCENT}
            strokeWidth={1}
            strokeOpacity={0.5}
          />
          <line
            x1={dotX}
            y1={dotY + 16}
            x2={dotX}
            y2={dotY + 46}
            stroke={ACCENT}
            strokeWidth={1}
            strokeOpacity={0.5}
          />
        </g>

        {/* 四角十字 */}
        {[
          [58, 58],
          [1862, 58],
          [58, 1022],
          [1862, 1022],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`} stroke={LINE} strokeOpacity={0.42} strokeWidth={1}>
            <line x1={x - 16} y1={y} x2={x + 16} y2={y} />
            <line x1={x} y1={y - 16} x2={x} y2={y + 16} />
          </g>
        ))}

        {/* 角标 */}
        <text
          x={68}
          y={1044}
          fill="rgba(168,195,224,0.62)"
          fontSize={13}
          letterSpacing={3.2}
          fontFamily="Consolas, monospace"
        >
          FIG.00 · BACKGROUND LOOP
        </text>
        <text
          x={1852}
          y={1044}
          textAnchor="end"
          fill="rgba(168,195,224,0.42)"
          fontSize={13}
          letterSpacing={3.2}
          fontFamily="Consolas, monospace"
        >
          1920 × 1080 / 8S / 30FPS
        </text>
      </svg>

      {/* 暗角 */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 90% at 50% 45%, transparent 42%, rgba(4,22,44,0.5) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
