# TECH_DESIGN · 工程档案个人网站

| 项目 | 内容 |
|---|---|
| 文档版本 | v1.0 |
| 关联文档 | `PRD.md`、`AGENTS.md` |
| 代码位置 | `portfolio/` |

---

## 一、技术选型

| 层 | 选型 | 版本 | 为什么是它 |
|---|---|---|---|
| 构建 | Vite | 8.x | 冷启动 < 300ms，`build` 产物是纯静态，托管零配置 |
| 框架 | React | 19.x | 组件化拆分六区块；生态成熟，后续接后端容易 |
| 语言 | TypeScript | 5.x | 数据模型（项目/技能/笔记）用接口约束，改字段编译期就报错 |
| 样式 | 原生 CSS + CSS 变量 | — | 蓝图体系大量用 `repeating-linear-gradient`、`clip-path`、SVG，工具类库表达不了；纯 CSS 体积最小、可控性最高 |
| 图标 | 内联 SVG | — | 不引图标库（一个 icon 库动辄 100KB+），本页只需 8 个图标 |

### 不选什么，为什么

| 方案 | 否决理由 |
|---|---|
| Tailwind CSS | v4 的 `@theme` 配置与 PostCSS 链路容易在 Windows + Vite 8 下报错；蓝图风格需要大量自定义 CSS 函数，工具类反而更长 |
| Next.js | 单页静态站不需要 SSR/路由，多引入 40MB 依赖 |
| 组件库（Ant Design / shadcn） | 组件库的圆角、阴影、间距体系与"工程图纸"冲突，改造成本高于自己写 |
| Framer Motion | 本项目动效只有"线条绘制 + 数字滚动"两类，原生 IntersectionObserver + CSS 足够，不必引入 50KB 动画库 |

---

## 二、项目结构

```
portfolio/
├── index.html                  # 入口，含 <title>/meta/字体预置
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── package.json
├── public/
│   └── favicon.svg             # 蓝图风格 favicon
└── src/
    ├── main.tsx                # createRoot
    ├── App.tsx                 # 组装六区块 + 图纸框
    ├── styles/
    │   ├── tokens.css          # 全部 CSS 变量（色板/字号/间距/断点/动效时长）
    │   └── global.css          # reset、蓝图网格、图框、通用组件类
    ├── data/
    │   ├── profile.ts          # 个人信息
    │   ├── skills.ts           # BOM 技能清单
    │   ├── projects.ts         # 6 个项目
    │   └── notes.ts            # 3 篇笔记
    ├── hooks/
    │   ├── useReveal.ts        # IntersectionObserver 入场
    │   └── useCountUp.ts       # 数字滚动
    ├── assets/                 # AI 生成的 7 张 WebP（封面 6 + 肖像 1）
    ├── components/
    │   ├── BlueprintFrame.tsx  # 图纸外框 + 四角十字 + 图签栏
    │   ├── Nav.tsx
    │   ├── Hero.tsx            # 背景视频 + 肖像 + 逐字入场 + 准星
    │   ├── About.tsx           # 自述 + 数据条 + 能力拓扑
    │   ├── Skills.tsx          # BOM 表 + 雷达图 + 节奏图
    │   ├── Toolbox.tsx         # 8 个工具线稿卡
    │   ├── SloganBand.tsx      # 通栏大字 + 视差
    │   ├── Projects.tsx        # 封面卡 + 灯箱 + 甘特图
    │   ├── Notes.tsx
    │   ├── Practice.tsx        # 学生会 / 三下乡 / 返家乡
    │   ├── Honors.tsx
    │   ├── Contact.tsx
    │   ├── Footer.tsx
    │   └── ui/
    │       ├── DimLine.tsx      # SVG 尺寸标注线
    │       ├── SectionHead.tsx  # 带编号的区块标题 + 绘制下划线
    │       ├── ScaleBar.tsx     # 5 格熟练度刻度
    │       ├── ProjectCover.tsx # 六个项目的 SVG 线稿封面（按 icon 换构图）
    │       └── StackMap.tsx     # Hero 的技术栈拓扑图（中心 + 四向正交连线）
    └── assets/                 # 生成的插画（构建时被 hash）
```

---

## 三、组件树

```
App
├── BlueprintFrame            ← position:fixed，pointer-events:none
│   ├── 外框（2px）+ 内框（1px）
│   ├── 四角十字标记
│   └── TitleBlock（右下角图签：图名/图号/比例/日期/制图）
├── Nav                       ← position:sticky
└── main
    ├── section#hero   → Hero      (DimLine ×2, 肖像, 3 CTA)
    ├── section#about  → About     (自述 ×3, 时间线, CountUp 数据条)
    ├── section#skills → Skills    (BOM 表格 ⇄ 移动端卡片)
    ├── section#projects → Projects (卡片网格 + hover 标注 + 展开详情)
    ├── section#notes  → Notes     (目录列表 + 手风琴正文)
    └── section#contact → Contact  (邮箱复制 + 图签闭环)
└── Footer
```

数据流向：**单向**。`data/*.ts` 导出只读常量 → 区块组件 `map` 渲染 → 无状态提升、无全局 store。

---

## 四、数据模型

```ts
// src/data/profile.ts
export interface Profile {
  name: string; enName: string;
  role: string; school: string; grade: string;
  tagline: string; location: string; coords: string;
  email: string; avatar: string; resumeUrl?: string;
}

// src/data/skills.ts
export type SkillGroup = 'language' | 'data' | 'xr' | 'frontend';
export interface Skill {
  code: string;              // SKL-01
  name: string;
  spec: string;              // 规格：版本 / 典型用途
  level: 1 | 2 | 3 | 4 | 5;  // 5 格刻度
  group: SkillGroup;
}

// src/data/projects.ts
export interface Project {
  code: string;              // PRJ-01
  title: string;
  subtitle: string;
  desc: string;
  period: string;
  role: string;
  tags: string[];
  cover: string;             // 图片路径
  highlights: string[];      // 展开后的要点
}

// src/data/notes.ts
export interface Note {
  code: string;              // NTE-01
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  body: string[];            // 段落数组，渲染时逐段 <p>
}
```

**为什么用 `level: 1|2|3|4|5` 而不是百分比**：PRD FR-16 要求刻度条。数字联合类型能在编译期挡住 `level: 6` 这类错误。

---

## 五、关键技术实现

### 5.1 蓝图双网格背景

单层网格太"平"，双层才有图纸的深度感。用 4 条 `repeating-linear-gradient` 叠在 `body::before` 上，固定不随内容滚动：

```css
body::before {
  content: '';
  position: fixed; inset: 0; z-index: -1;
  background-image:
    repeating-linear-gradient(to right, var(--grid-fine) 0 1px, transparent 1px 10px),
    repeating-linear-gradient(to bottom, var(--grid-fine) 0 1px, transparent 1px 10px),
    repeating-linear-gradient(to right, var(--grid-bold) 0 1px, transparent 1px 100px),
    repeating-linear-gradient(to bottom, var(--grid-bold) 0 1px, transparent 1px 100px);
}
```

移动端把细网格换成 `display:none`，只留 100px 粗网格，减少渲染压力。

### 5.2 图纸框与图签栏

`BlueprintFrame` 用 `position: fixed` 覆盖整个视口，`pointer-events: none` 保证不挡交互；图签栏 `pointer-events: auto` 单独放开（要能选中邮箱）。

```
.fixed inset:12px  → 外框 1px  + 内框（inset:4px 的伪元素）
四角：每个角两条 18px 短线交叉成十字
图签栏：右下角，6 行小表格（图名/图号/比例/日期/制图/版本）
```

图签栏在小屏（<640px）折叠为两行，避免遮挡内容。

### 5.3 SVG 尺寸标注线 `DimLine`

标注线不能进文档流（会把布局撑乱），所以统一用**绝对定位的 SVG 覆盖层** + `pointer-events:none`：

```
<DimLine from="left" value="2024 级" />   → 一条水平线 + 两端短竖线 + 中间文字
<DimLine vertical value="物联网工程" />    → 竖线 + 旋转 90° 的文字
```

文字用 `<text>` 并 `text-anchor:middle`，背景色块用 `<rect>` 挖白避免压线。

### 5.4 标题下划线"绘制"动画

`SectionHead` 的编号下划线、`Hero` 的姓名下划线都是一条 SVG `<path>`：

```css
.draw-line { stroke-dasharray: var(--len); stroke-dashoffset: var(--len); }
.is-in .draw-line { stroke-dashoffset: 0; transition: stroke-dashoffset .7s var(--ease-out); }
```

`--len` 由 `pathLength="1"` 归一化，避免手算长度。

### 5.5 `useReveal` 入场

```ts
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}
```

只触发一次（`io.disconnect()`），避免来回滚动时反复闪。

### 5.6 数字滚动 `useCountUp`

`requestAnimationFrame` + `easeOutCubic`，1.2s 内从 0 到目标值；`prefers-reduced-motion` 时直接返回目标值。

### 5.7 图片素材

项目封面与肖像用 AI 生成（豆包），统一提示词后缀：

> `蓝图工程图风格，深蓝底 + 白色细线稿，轴测视角，无文字，16:9`

生成后压到 `src/assets/`，由 Vite 自动 hash。列表页 `loading="lazy"` + `decoding="async"`。

### 5.8 Hero 背景视频（Remotion 渲染，运行时零依赖）

视频是**离线产物**，不是运行时库：

```
video/                      # 独立工程，不进部署
├── src/HeroBg.tsx          # 8s / 30fps / 1920×1080 合成
└── out/hero-bg.mp4         # 701KB → 复制成 portfolio/public/hero-bg.mp4
```

- 画面全部是 `frame` 的纯函数：网格 8 秒平移 100px（整数个网格周期 → 首尾帧一致可无缝 loop）、三条尺寸线依次绘制、黄色光点 sin 往返
- 渲染命令：`npx remotion render src/index.ts HeroBg out/hero-bg.mp4 --codec=h264 --crf=30 --browser-executable=<Edge 路径>`
- 网页侧只有一个 `<video autoplay muted loop playsinline>`，`@remotion/player` **不进 bundle**
- 加载条件：`pointer:fine && min-width:768 && !prefers-reduced-motion`
- 降级：不满足条件时只显示 `public/hero-bg-poster.jpg`（68KB 首帧）

### 5.9 图片资产

7 张 WebP 共 444KB（封面 45–81KB / 张）：`src/assets/prj-0X-*.webp`、`portrait.webp`。
由豆包按「蓝图工程图风格，深蓝底 #0E4C92，白色细线稿，轴测视角，无文字」生成，Pillow 压到宽 1000（肖像 800）、`quality=84`。
每张都带 `width/height` 与 `loading="lazy"`，避免 CLS。

### 5.10 项目卡片展开（同层撑开 + View Transitions）

**不是弹窗**：卡片仍留在 `.proj-grid` 里，展开时只是自己变大、把邻居推开，页面不加遮罩、不改层级。

| 阶段 | 做法 |
|---|---|
| 按住 | CSS：`.is-pressing` → `scale(.75)` + 背景转白 + 封面图 `brightness(1.85) saturate(.22)` 洗白 |
| 松开 | JS：`document.startViewTransition(() => flushSync(() => setExpanded(code)))` |
| 变形 | 浏览器原生做 FLIP：每张卡片带唯一 `view-transition-name: proj-01…06`，`::view-transition-group(*)` 统一 0.38s `cubic-bezier(.16,.84,.44,1)` |
| 布局 | `.is-expanded { grid-column: span 2; aspect-ratio: 4/3; display: grid; grid-template-columns: 1.02fr 0.98fr }` → 实测 **709 × 531 = 1.33** |
| 邻居 | `.proj-grid { grid-auto-flow: dense; align-items: start }` + `.proj-card:not(.is-expanded) { align-self: start }`，避免同行卡片被拉到和展开卡一样高 |
| 粒子 | 14 个镂空三角形挂在**卡片内部**的 `.burst-layer`（`position:absolute; inset:0`），跟着卡片走，不脱离文档流 |

要点：
- 展开态必须 `overflow: visible`，否则粒子飞不出卡片边界；圆角裁剪交给内层 `.proj-card__cover`
- 降级：不支持 `startViewTransition` 时直接切换状态（无动画）；`prefers-reduced-motion` 下 `::view-transition-*` 全部 `animation: none`

### 5.11 无障碍

- 所有可展开内容用 `<button aria-expanded>`，不用 `div onclick`
- 导航抽屉 `aria-hidden` + `Esc` 关闭
- 颜色对比：正文 `#E8F1FB` on `#0B3568` ≈ 11.4:1，远超 AA

---

## 六、性能预算

| 项 | 预算 | 手段 |
|---|---|---|
| JS（gzip） | < 80KB | 无 UI 库 / 无动画库 / 无图标库 |
| CSS（gzip） | < 12KB | 单文件 + 变量，不引入框架 |
| 首屏图片 | < 300KB | 肖像压到 800px 宽 WebP/PNG 优化 |
| 构建 | < 2s | Vite 默认配置即可 |

---

## 七、构建与部署

```bash
npm install          # 已配 npmmirror 源
npm run dev          # 本地 http://localhost:5173
npm run build        # tsc -b && vite build → dist/
npm run preview      # 本地预览产物
```

产物 `dist/` 为纯静态目录，直接交给静态托管平台。部署后用 `curl -I` 验证 200，再用浏览器验证 375px 与 1440px 两档。

---

## 八、扩展性

- **加项目**：只改 `src/data/projects.ts` 追加一个对象，卡片自动出现
- **加笔记**：只改 `src/data/notes.ts`
- **改主题色**：只改 `tokens.css` 里 7 个变量，全站跟随
- **接后端**：把 `data/*.ts` 换成 `fetch()` 返回同样结构的 Promise，组件层零改动
