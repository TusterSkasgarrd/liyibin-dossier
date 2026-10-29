import { useEffect, useState } from 'react';

interface Props {
  onDone: () => void;
}

const CHARS = ['李', '亦', '斌'];

/**
 * 开机动画：一张工程图纸带 3D 运镜从斜上方俯冲转正，
 * 尺寸线被光点扫过 → 名字逐字弹出 → 盖章 → 整张甩走，露出主站。
 * 纯装饰，读屏器忽略；点击任意处可跳过。
 */
export function IntroOverlay({ onDone }: Props) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setLeaving(true), 2250);
    const t2 = window.setTimeout(onDone, 2650);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className={`intro${leaving ? ' is-leaving' : ''}`}
      onClick={onDone}
      aria-hidden="true"
    >
      <div className="intro__stage">
        <div className="intro__sheet">
          {/* 图纸网格 */}
          <div className="intro__grid" />

          {/* 四角十字 */}
          <i className="intro__cross intro__cross--tl" />
          <i className="intro__cross intro__cross--tr" />
          <i className="intro__cross intro__cross--bl" />
          <i className="intro__cross intro__cross--br" />

          {/* 尺寸线 + 扫过的光点 */}
          <div className="intro__dimline">
            <i className="intro__dot" />
            <em>W 1200</em>
          </div>

          {/* 名字逐字 */}
          <h1 className="intro__name">
            {CHARS.map((ch, i) => (
              <span key={ch} style={{ animationDelay: `${820 + i * 95}ms` }}>
                {ch}
              </span>
            ))}
          </h1>

          {/* 副标打字机 */}
          <p className="intro__sub">
            <span>ENGINEERING DOSSIER</span>
          </p>

          {/* 盖章 */}
          <div className="intro__stamp">
            <svg viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" stroke="#FFD166" strokeWidth="1.4" fill="none" strokeDasharray="3 3" />
              <circle cx="36" cy="36" r="22" stroke="#FFD166" strokeWidth="1" fill="none" />
              <path d="M25 36l7 7 15-16" stroke="#FFD166" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* 图签栏 */}
          <div className="intro__titleblock">
            <span>图名</span><span>工程档案</span>
            <span>图号</span><span>LYB-PF-2026-01</span>
            <span>制图</span><span>李亦斌</span>
          </div>
        </div>
      </div>
    </div>
  );
}
