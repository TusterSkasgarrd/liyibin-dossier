interface DimLineProps {
  value: string;
  /** 线长（px），默认 100% */
  length?: number;
  orientation?: 'h' | 'v';
  className?: string;
}

/**
 * 工程图尺寸标注：一条主线 + 两端短竖线 + 中间数值。
 * 纯装饰，不进文档流，读屏器忽略。
 */
export function DimLine({ value, length = 220, orientation = 'h', className = '' }: DimLineProps) {
  if (orientation === 'v') {
    return (
      <div className={`dim ${className}`} aria-hidden="true">
        <svg width="26" height={length} viewBox={`0 0 26 ${length}`}>
          <line x1="13" y1="0" x2="13" y2={length} stroke="currentColor" strokeWidth="1" />
          <line x1="6" y1="0" x2="20" y2="0" stroke="currentColor" strokeWidth="1" />
          <line x1="6" y1={length} x2="20" y2={length} stroke="currentColor" strokeWidth="1" />
          <text
            x="13"
            y={length / 2}
            textAnchor="middle"
            transform={`rotate(-90 13 ${length / 2})`}
            dy="-6"
          >
            {value}
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className={`dim ${className}`} aria-hidden="true">
      <svg width={length} height="26" viewBox={`0 0 ${length} 26`}>
        <line x1="0" y1="13" x2={length} y2="13" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="6" x2="0" y2="20" stroke="currentColor" strokeWidth="1" />
        <line x1={length} y1="6" x2={length} y2="20" stroke="currentColor" strokeWidth="1" />
        <text x={length / 2} y="9" textAnchor="middle">
          {value}
        </text>
      </svg>
    </div>
  );
}
