import type { ProjectIcon } from '../../data/types';

/** 六个项目的封面线稿，统一蓝图语言：只描边、只用强调色做点缀 */
export function ProjectCover({ icon }: { icon: ProjectIcon }) {
  const common = {
    width: '46%',
    viewBox: '0 0 120 120',
    fill: 'none' as const,
    'aria-hidden': true,
  };
  const line = 'var(--txt)';
  const accent = 'var(--accent)';

  switch (icon) {
    case 'twin':
      return (
        <svg {...common}>
          <path d="M20 86 60 62l40 24-40 24-40-24Z" stroke={line} strokeOpacity=".8" strokeWidth="1.3" />
          <path d="M20 86V50l40-24 40 24v36" stroke={line} strokeOpacity=".5" strokeWidth="1.1" />
          <path d="M60 62v48M60 38v24" stroke={line} strokeOpacity=".35" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="60" cy="38" r="4" fill={accent} />
          <path d="M60 26V14M74 32l8-8M46 32l-8-8" stroke={accent} strokeWidth="1" strokeOpacity=".7" />
        </svg>
      );

    case 'game':
      return (
        <svg {...common}>
          <rect x="18" y="30" width="34" height="34" stroke={line} strokeOpacity=".8" strokeWidth="1.3" />
          <rect x="60" y="56" width="34" height="34" stroke={line} strokeOpacity=".6" strokeWidth="1.2" />
          <path d="M35 30V18M35 64v14M18 47H6M52 47h14" stroke={line} strokeOpacity=".3" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M77 56V30M77 90v10" stroke={line} strokeOpacity=".3" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="77" cy="43" r="3.5" fill={accent} />
          <path d="M24 92l6-6 6 6 6-6" stroke={accent} strokeWidth="1.2" strokeOpacity=".8" />
        </svg>
      );

    case 'writing':
      return (
        <svg {...common}>
          <path d="M28 26h44l16 16v56H28V26Z" stroke={line} strokeOpacity=".8" strokeWidth="1.3" />
          <path d="M72 26v16h16" stroke={line} strokeOpacity=".55" strokeWidth="1.1" />
          <path d="M40 54h32M40 66h32M40 78h20" stroke={line} strokeOpacity=".45" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M86 40l14 14-26 26-16 4 4-16 24-28Z" stroke={accent} strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      );

    case 'medical':
      return (
        <svg {...common}>
          <rect x="24" y="18" width="72" height="84" stroke={line} strokeOpacity=".8" strokeWidth="1.3" />
          <circle cx="60" cy="46" r="12" stroke={line} strokeOpacity=".7" strokeWidth="1.2" />
          <path d="M60 58v26M50 68h20M46 84h28" stroke={line} strokeOpacity=".6" strokeWidth="1.2" />
          <path d="M24 36h72M24 84h72" stroke={line} strokeOpacity=".22" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="60" cy="46" r="18" stroke={accent} strokeWidth="1" strokeOpacity=".8" strokeDasharray="3 5" />
        </svg>
      );

    case 'database':
      return (
        <svg {...common}>
          <ellipse cx="60" cy="30" rx="30" ry="10" stroke={line} strokeOpacity=".85" strokeWidth="1.3" />
          <path d="M30 30v24c0 5.5 13.4 10 30 10s30-4.5 30-10V30" stroke={line} strokeOpacity=".7" strokeWidth="1.3" />
          <path d="M30 54v24c0 5.5 13.4 10 30 10s30-4.5 30-10V54" stroke={line} strokeOpacity=".55" strokeWidth="1.3" />
          <path d="M30 66c0 5.5 13.4 10 30 10s30-4.5 30-10" stroke={line} strokeOpacity=".35" strokeWidth="1.1" />
          <circle cx="60" cy="30" r="3" fill={accent} />
        </svg>
      );

    case 'cpu':
      return (
        <svg {...common}>
          <rect x="34" y="34" width="52" height="52" stroke={line} strokeOpacity=".85" strokeWidth="1.3" />
          <rect x="46" y="46" width="28" height="28" stroke={line} strokeOpacity=".55" strokeWidth="1.1" />
          <path
            d="M34 44H20M34 56H20M34 68H20M34 80H20M86 44h14M86 56h14M86 68h14M86 80h14M44 34V20M56 34V20M68 34V20M80 34V20M44 86v14M56 86v14M68 86v14M80 86v14"
            stroke={line}
            strokeOpacity=".45"
            strokeWidth="1.1"
          />
          <path d="M20 100h20v-8h12v8h16v-8h14v8h18" stroke={accent} strokeWidth="1.2" strokeOpacity=".85" />
        </svg>
      );

    default:
      return null;
  }
}
