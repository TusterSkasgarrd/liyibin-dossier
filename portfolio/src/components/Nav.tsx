import { useEffect, useState } from 'react';

const LINKS = [
  { id: 'about', no: '01', label: '概述' },
  { id: 'skills', no: '02', label: '技能' },
  { id: 'projects', no: '03', label: '项目' },
  { id: 'notes', no: '04', label: '笔记' },
  { id: 'contact', no: '05', label: '联系' },
];

/** SVG 内部同样走 CSS 变量，不出现色值字面量 */
const ACCENT = 'var(--accent)';
const LINE = 'var(--line-strong)';

export function Nav() {
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const point = window.scrollY + window.innerHeight * 0.3;
      let current = '';
      for (const link of LINKS) {
        const el = document.getElementById(link.id);
        if (el && el.offsetTop <= point) current = link.id;
      }
      setActive(current);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // 移动端抽屉关闭时整块不可聚焦、不进无障碍树
  const drawerClosed = isMobile && !open;

  return (
    <header className="nav">
      <div className="nav__inner">
        <a className="nav__logo" href="#top" aria-label="回到顶部">
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="0.5" y="0.5" width="31" height="31" stroke={LINE} strokeOpacity="0.55" />
            <path d="M6 26V6h20" stroke={ACCENT} strokeWidth="1.2" />
            <circle cx="6" cy="26" r="2" fill={ACCENT} />
            <path d="M11 21h14M11 16h9M11 11h5" stroke={LINE} strokeOpacity="0.7" strokeWidth="1" />
          </svg>
          <span>
            <b>李亦斌</b>
            <span>ENGINEERING DOSSIER</span>
          </span>
        </a>

        <nav
          className={`nav__links${open ? ' is-open' : ''}`}
          aria-hidden={drawerClosed ? true : undefined}
          inert={drawerClosed ? true : undefined}
        >
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={active === link.id ? 'is-active' : ''}
              onClick={() => setOpen(false)}
            >
              {link.no} {link.label}
            </a>
          ))}
        </nav>

        <a className="nav__admin" href={`${import.meta.env.BASE_URL}admin`} title="进入后台管理">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="6.5" width="12" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4.5 6.5V5a3.5 3.5 0 0 1 7 0v1.5" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="8" cy="10" r="1.3" fill="currentColor" />
          </svg>
          后台
        </a>

        <button
          className="nav__toggle"
          type="button"
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
