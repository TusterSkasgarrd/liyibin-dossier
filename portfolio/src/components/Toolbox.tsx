import { SectionHead } from './ui/SectionHead';

/**
 * 工具箱：每个工具一个几何线稿符号 + 型号 + 用途。
 * 图标是通用几何语言（齿轮/波形/立方体…），不抄各产品 logo。
 */
type IconKey =
  | 'gear'
  | 'wave'
  | 'cube'
  | 'terminal'
  | 'cylinder'
  | 'chip'
  | 'grid'
  | 'node';

interface Tool {
  name: string;
  ver: string;
  use: string;
  icon: IconKey;
}

const TOOLS: Tool[] = [
  { name: 'Logisim', ver: '2.7.1', use: '单总线 CPU 的电路仿真', icon: 'chip' },
  { name: 'Multisim', ver: '14.2', use: '差动变压器 / 双 T 桥仿真', icon: 'wave' },
  { name: 'Unity3D', ver: '2022 LTS', use: '三关卡科普游戏', icon: 'cube' },
  { name: 'Blender', ver: '4.1', use: '产线与道具低模建模', icon: 'cube' },
  { name: 'MySQL', ver: '5.7', use: '七表教务库与存储过程', icon: 'cylinder' },
  { name: 'Python', ver: '3.11', use: '分词器训练与数据处理', icon: 'terminal' },
  { name: 'Git', ver: '2.55', use: '每完成一个功能就存档', icon: 'node' },
  { name: 'VS Code', ver: '1.9x', use: '写前端与调扩展', icon: 'grid' },
];

function Glyph({ icon }: { icon: IconKey }) {
  const s = 'var(--line-strong)';
  const a = 'var(--accent)';
  const sw = 1.2;

  switch (icon) {
    case 'gear':
      return (
        <>
          <circle cx="16" cy="16" r="6" stroke={s} strokeWidth={sw} />
          <circle cx="16" cy="16" r="2" fill={a} />
          <path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.5 7.5l3 3M21.5 21.5l3 3M24.5 7.5l-3 3M10.5 21.5l-3 3" stroke={s} strokeWidth={sw} />
        </>
      );
    case 'wave':
      return (
        <>
          <path d="M3 16h4l3-8 4 16 4-12 3 6h8" stroke={a} strokeWidth={sw} fill="none" />
          <path d="M3 24h26" stroke={s} strokeWidth={0.8} strokeDasharray="2 2" />
        </>
      );
    case 'cube':
      return (
        <>
          <path d="M16 4l11 6v12l-11 6-11-6V10l11-6Z" stroke={s} strokeWidth={sw} fill="none" />
          <path d="M5 10l11 6 11-6M16 16v12" stroke={s} strokeWidth={0.8} />
          <circle cx="16" cy="4" r="1.6" fill={a} />
        </>
      );
    case 'terminal':
      return (
        <>
          <rect x="3" y="6" width="26" height="20" stroke={s} strokeWidth={sw} fill="none" />
          <path d="M7 12l4 4-4 4" stroke={a} strokeWidth={sw} fill="none" />
          <path d="M14 22h9" stroke={s} strokeWidth={0.9} />
        </>
      );
    case 'cylinder':
      return (
        <>
          <ellipse cx="16" cy="9" rx="10" ry="4" stroke={s} strokeWidth={sw} fill="none" />
          <path d="M6 9v14c0 2.2 4.5 4 10 4s10-1.8 10-4V9" stroke={s} strokeWidth={sw} fill="none" />
          <path d="M6 16c0 2.2 4.5 4 10 4s10-1.8 10-4" stroke={s} strokeWidth={0.8} />
          <circle cx="16" cy="9" r="1.5" fill={a} />
        </>
      );
    case 'chip':
      return (
        <>
          <rect x="9" y="9" width="14" height="14" stroke={s} strokeWidth={sw} fill="none" />
          <rect x="13" y="13" width="6" height="6" fill={a} opacity="0.75" />
          <path d="M9 13H4M9 19H4M23 13h5M23 19h5M13 9V4M19 9V4M13 23v5M19 23v5" stroke={s} strokeWidth={0.9} />
        </>
      );
    case 'grid':
      return (
        <>
          <rect x="5" y="5" width="22" height="22" stroke={s} strokeWidth={sw} fill="none" />
          <path d="M12 5v22M20 5v22M5 12h22M5 20h22" stroke={s} strokeWidth={0.7} strokeOpacity="0.7" />
          <rect x="12" y="12" width="8" height="8" fill={a} opacity="0.5" />
        </>
      );
    case 'node':
      return (
        <>
          <circle cx="8" cy="22" r="3" stroke={s} strokeWidth={sw} />
          <circle cx="16" cy="9" r="3" stroke={s} strokeWidth={sw} />
          <circle cx="25" cy="20" r="3" stroke={s} strokeWidth={sw} />
          <path d="M10.5 20.5l3.5-9M18.5 10.8l5 7.6M10 23h12" stroke={a} strokeWidth={0.9} fill="none" />
        </>
      );
    default:
      return null;
  }
}

export function Toolbox() {
  return (
    <section className="section" id="toolbox">
      <div className="wrap">
        <SectionHead no="③" title="工具箱" en="Toolbox" />

        <div className="tool-grid">
          {TOOLS.map((t) => (
            <div className="tool" key={t.name}>
              <svg className="tool__glyph" viewBox="0 0 32 32" aria-hidden="true">
                <Glyph icon={t.icon} />
              </svg>
              <div className="tool__body">
                <b>{t.name}</b>
                <code>{t.ver}</code>
                <span>{t.use}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
