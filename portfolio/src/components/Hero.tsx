import { useEffect, useState } from 'react';
import { useData } from '../data/store';
import { DimLine } from './ui/DimLine';
import portrait from '../assets/portrait.webp';

export function Hero() {
  const { profile } = useData();
  const [showVideo, setShowVideo] = useState(false);

  // 视频只在「桌面 + 精确指针 + 未开减少动效」时加载
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const wide = window.matchMedia('(min-width: 768px)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setShowVideo(fine && wide && !calm);
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <section className="hero" id="top" onMouseMove={handleMove}>
      {/* 背景视频：纯装饰，读屏器忽略 */}
      {showVideo && (
        <video
          className="hero__video"
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-bg-poster.jpg"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
      )}
      <div className="hero__veil" aria-hidden="true" />

      <div className="wrap hero__inner">
        <div>
          <div className="hero__meta">
            <span className="hero__badge">
              {profile.role} · {profile.grade}
            </span>
            <span className="mono">{profile.school}</span>
          </div>

          <h1 className="hero__name">
            <span className="hero__chars">
              {profile.name.split('').map((ch, i) => (
                <span className="hero__char" key={i} style={{ animationDelay: `${i * 75}ms` }}>
                  {ch}
                </span>
              ))}
            </span>
            <small>{profile.enName} / 工程档案</small>
          </h1>

          <div className="hero__line">
            <DimLine value={`${profile.role} · ${profile.grade}`} length={300} />
          </div>

          <p className="hero__tagline">{profile.tagline}</p>

          <div className="hero__actions">
            <a className="btn btn--solid" href="#projects">
              查看项目
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a className="btn" href="#skills">
              技能清单
            </a>
            <a className="btn" href="#contact">
              联系我
            </a>
          </div>

          <p className="hero__coords">
            {profile.location} · {profile.coords}
          </p>
        </div>

        <figure className="hero__diagram">
          <img
            className="hero__portrait"
            src={portrait}
            alt="李亦斌的蓝图风格肖像"
            width={800}
            height={1066}
          />
          <i className="corner corner--tl" />
          <i className="corner corner--tr" />
          <i className="corner corner--bl" />
          <i className="corner corner--br" />
          <figcaption>
            <span>图 01 · 肖像正视图</span>
            <span>SCALE 1:1</span>
          </figcaption>
        </figure>
      </div>

      {/* 光标十字准星（桌面） */}
      <i className="hero__crosshair" aria-hidden="true" />
    </section>
  );
}
