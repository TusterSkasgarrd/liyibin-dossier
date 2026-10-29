import { useData } from '../data/store';

export function Footer() {
  const { profile } = useData();
  return (
    <footer className="footer">
      <div className="wrap">
        <div>{profile.name} · 工程档案 · LYB-PF-2026-01</div>
        <div>Vite + React + TypeScript · 手写 CSS · 无 UI 框架</div>
        <div>© 2026 保留所有权利 · 本站内容为个人真实项目整理</div>
      </div>
    </footer>
  );
}
