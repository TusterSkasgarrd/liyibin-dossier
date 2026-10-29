import { useCallback, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useData } from '../data/store';
import { COVERS } from '../data/covers';
import { SectionHead } from './ui/SectionHead';
import { Gantt } from './ui/Gantt';

const TRI_COUNT = 14;

/** 从卡片中心炸出镂空三角形（挂在卡片内部的 abs 层，不脱层） */
function burst(card: HTMLElement, layer: HTMLElement) {
  const r = card.getBoundingClientRect();
  const cx = r.width / 2;
  const cy = r.height / 2;
  layer.innerHTML = '';

  const frag = document.createDocumentFragment();
  for (let i = 0; i < TRI_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / TRI_COUNT + (Math.random() - 0.5) * 0.36;
    const distance = 130 + Math.random() * 160;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance * 0.8;
    const rotate = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 340);
    const size = 9 + Math.random() * 7;
    const dur = 560 + Math.random() * 300;

    const el = document.createElement('span');
    el.className = 'burst-tri';
    el.style.cssText = `width:${size}px;height:${size}px;left:${cx}px;top:${cy}px`;
    el.innerHTML =
      '<svg viewBox="0 0 12 12"><polygon points="6,0.8 11.2,10.6 0.8,10.6" fill="none" stroke="#fff" stroke-width="1.15" stroke-linejoin="round"/></svg>';

    el.animate(
      [
        { transform: 'translate(-50%,-50%) rotate(0deg) scale(.55)', opacity: 0.95 },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rotate}deg) scale(1)`,
          opacity: 0,
        },
      ],
      { duration: dur, easing: 'cubic-bezier(.12,.72,.3,1)', fill: 'forwards' }
    );

    frag.appendChild(el);
    window.setTimeout(() => el.remove(), dur + 60);
  }
  layer.appendChild(frag);
}

export function Projects() {
  const { projects } = useData();
  const [expanded, setExpanded] = useState<string | null>(null);
  const burstLayers = useRef<Record<string, HTMLDivElement | null>>({});
  const cards = useRef<Record<string, HTMLElement | null>>({});

  const toggle = useCallback(
    (code: string) => {
      const next = expanded === code ? null : code;

      const doc = document as Document & {
        startViewTransition?: (cb: () => void) => { finished: Promise<void> };
      };

      if (doc.startViewTransition) {
        doc.startViewTransition(() => {
          flushSync(() => setExpanded(next));
        });
      } else {
        setExpanded(next);
      }

      // 展开时才炸粒子；收起不炸
      if (next) {
        window.setTimeout(() => {
          const card = cards.current[next];
          const layer = burstLayers.current[next];
          if (card && layer) burst(card, layer);
        }, 90);
      }
    },
    [expanded]
  );

  return (
    <section className="section" id="projects">
      <div className="wrap">
        <SectionHead no="④" title="项目" en="Drawings" />

        <div className="proj-grid">
          {projects.map((p) => {
            const open = expanded === p.code;
            return (
              <article
                key={p.code}
                ref={(el) => {
                  cards.current[p.code] = el;
                }}
                className={`bp-card proj-card${open ? ' is-expanded' : ''}`}
                style={{ viewTransitionName: `proj-${p.code.replace('PRJ-', '')}` }}
                role="button"
                tabIndex={0}
                aria-expanded={open}
                aria-label={`${open ? '收起' : '展开'} ${p.title}`}
                onClick={() => toggle(p.code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle(p.code);
                  }
                }}
              >
                <i className="corner corner--tl" />
                <i className="corner corner--tr" />
                <i className="corner corner--bl" />
                <i className="corner corner--br" />

                {/* 粒子层：贴在卡片内部，不脱离文档流 */}
                <div
                  className="burst-layer"
                  ref={(el) => {
                    burstLayers.current[p.code] = el;
                  }}
                  aria-hidden="true"
                />

                <div className="proj-card__cover">
                  <span className="proj-card__code">{p.code}</span>
                  <img
                    src={COVERS[p.icon]}
                    alt={`${p.title} 的工程图封面`}
                    loading="lazy"
                    decoding="async"
                    width={1000}
                    height={625}
                  />
                  <span className="proj-card__hint" aria-hidden="true">
                    {open ? '点击收起' : '点击展开图纸'}
                  </span>
                </div>

                <div className="proj-card__body">
                  <h3 className="proj-card__title">
                    {p.title}
                    <i aria-hidden="true">{open ? '−' : '+'}</i>
                  </h3>
                  <p className="proj-card__sub">{p.subtitle}</p>

                  <p className="proj-card__desc">{p.desc}</p>

                  {open && (
                    <div className="proj-card__more">
                      <ul>
                        {p.highlights.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                      <p className="proj-card__role">
                        {p.role} · {p.period}
                      </p>
                    </div>
                  )}

                  <div className="proj-card__tags">
                    {p.tags.map((t) => (
                      <span className="tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="chart-card chart-card--wide">
          <h3 className="chart-card__title">项目时间分布</h3>
          <Gantt />
        </div>
      </div>
    </section>
  );
}
