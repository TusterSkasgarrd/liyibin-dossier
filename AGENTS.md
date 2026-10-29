# AGENTS.md

> 给 AI 编码助手（Cursor / Claude Code / Codex / Copilot）的项目说明。
> 动手前先读完本文；本文与 `PRD.md`、`TECH_DESIGN.md` 冲突时，以本文的**硬性约定**为准。

---

## 1. 这个项目是什么

李亦斌的个人网站「工程档案」，视觉语言是**工程图纸**（蓝图底 + 网格 + 尺寸标注 + 图签栏）。
单页滚动，六个区块：Hero / 概述 / 技能 / 项目 / 笔记 / 联系。

**不是**通用博客模板，**不要**往里面加通用组件库的默认样式。

---

## 2. 怎么跑

```bash
cd portfolio
npm install          # registry 已设为 npmmirror
npm run dev          # http://localhost:5173
npm run build        # 产物 dist/
npm run preview      # 预览产物
npm run lint         # oxlint
```

- Node ≥ 20，包管理只用 npm
- 提交前必须 `npm run build` 通过，TypeScript 不能有 error

---

## 3. 目录约定

```
src/
├── styles/tokens.css     # 所有设计变量，只在这里改颜色/字号/间距
├── styles/global.css     # reset + 蓝图网格 + 通用类，不放组件专属样式
├── data/                 # 纯数据，无 JSX、无副作用
├── hooks/                # 可复用逻辑
├── components/           # 一个组件一个文件，与组件同名
└── components/ui/        # 原子级复用件（DimLine / SectionHead / ScaleBar）
```

**规则**

- 区块组件放在 `components/` 根下，原子件放 `components/ui/`
- 新增样式写到 `global.css` 的对应分区注释下，**不要**在组件里写 `<style>` 标签
- 图片一律放 `src/assets/`，用 `import` 引入让 Vite 处理 hash；**不要**写死 `/public` 路径

---

## 4. 代码风格（硬性）

| 项 | 约定 |
|---|---|
| 组件 | 一律**函数组件 + 具名导出**：`export function Hero() {}`，不用 `export default` |
| 类型 | 组件 props 用 `interface XxxProps`；数据模型从 `data/*.ts` 导出复用 |
| `any` | **禁止**。不确定时用 `unknown` + 类型收窄 |
| 非空断言 | **禁止** `!`。用可选链 + 默认值 |
| 事件 | 一律 `onClick={handleX}` 具名函数，不写内联多行箭头函数 |
| 条件渲染 | 简单用 `cond && jsx`，三态以上用提前 `return` |
| 列表 key | 用业务 id（`project.code`），**禁止**用数组下标 |
| 注释 | 只写"为什么"，不写"做了什么"；每个 `components/ui/` 文件头部写一行用途 |

```tsx
// ✅ 正确
export function Skills() {
  const [activeGroup, setActiveGroup] = useState<SkillGroup>('language');
  return (
    <ul>
      {skills.filter((s) => s.group === activeGroup).map((s) => (
        <li key={s.code}>{s.name}</li>
      ))}
    </ul>
  );
}

// ❌ 错误：default 导出 + 下标 key + 内联长箭头
export default function () {
  return skills.map((s, i) => <div key={i} onClick={() => { /* ... */ }} />);
}
```

---

## 5. 样式规范（硬性）

1. **颜色只能来自 `tokens.css`**。组件里出现 `#0E4C92`、`rgba(255,255,255,.1)` 这类字面值视为错误，必须用变量。
2. 类名用 `kebab-case` + BEM 风格前缀：`.proj-card`、`.proj-card__title`、`.proj-card--active`。
3. **禁用**：`box-shadow`（工程图不用投影）、`border-radius > 4px`、`linear-gradient` 用于装饰（只允许用于图纸底色）。
4. 布局优先 `grid`，其次 `flex`；**禁止** `position: absolute` 做常规排版（仅用于尺寸标注层）。
5. 媒体查询统一写在 `global.css` 文件末尾的 `@media` 分区，按 `1024 → 767 → 400` 顺序降序写（用 767 而非 768，避免与 `min-width: 768` 撞边界）。
6. 每个动效必须同时写 `prefers-reduced-motion: reduce` 的降级。

---

## 6. 组件规范

| 组件 | 必须满足 |
|---|---|
| `BlueprintFrame` | `pointer-events: none`；图签栏单独 `auto`；不参与文档流 |
| `SectionHead` | 必须传 `no`（编号）与 `title`；编号格式 `① ② ③` |
| `DimLine` | 只接受 `value` / `orientation` / `length`；内部 SVG 必须 `aria-hidden="true"` |
| `ScaleBar` | 只接受 `level: 1~5`；非整数时 `Math.round` |
| 所有可点击元素 | 必须是 `<button>` 或 `<a>`，带 `cursor: pointer` 与 `:focus-visible` 轮廓 |
| 所有 `<img>` | 必须有 `alt`、`loading="lazy"`、`decoding="async"` |

---

## 7. 禁止事项

- ❌ 引入任何 UI 组件库（Ant Design / MUI / shadcn / Chakra）
- ❌ 引入 Tailwind CSS
- ❌ 引入动画库（Framer Motion / GSAP / anime.js）
- ❌ 引入图标库（lucide / react-icons）——图标一律内联 SVG
- ❌ 加渐变文字、毛玻璃、大圆角卡片、彩色投影（与工程图纸风格冲突）
- ❌ 改 `data/*.ts` 的结构而不更新 `TECH_DESIGN.md` 的数据模型章节
- ❌ 为了"好看"加装饰性图片；所有图片必须有信息量

---

## 8. Git 规范

- 分支：`main` 为唯一分支，个人项目不建 feature 分支
- 提交粒度：**一个功能一次提交**，不攒着提交
- 提交信息格式（Conventional Commits 中文版）：

```
feat: 新增项目卡片 hover 尺寸标注
fix: 修复 375px 下技能表横向溢出
style: 调整图签栏字号与行距
docs: 补充 PRD 的验收标准
chore: 升级 vite 到 8.3
```

- 每次 `npm run build` 通过后再提交
- 不提交 `dist/`、`node_modules/`（已在 `.gitignore`）

---

## 9. 测试要求

无自动化测试框架，采用**手动验收清单**，每次改动后至少跑一遍：

| # | 检查项 |
|---|---|
| 1 | `npm run build` 零 error |
| 2 | 浏览器控制台无报错 |
| 3 | 375px 宽度无横向滚动条 |
| 4 | 导航六个锚点都能滚动到位，且高亮跟随 |
| 5 | 技能表在 640px 以下变成卡片，不丢列 |
| 6 | 六个项目卡片都能展开/收起详情 |
| 7 | 邮箱复制后出现"已复制"反馈，2 秒后消失 |
| 8 | 系统开启"减少动态效果"后，页面内容完整、无动画 |

发现 bug 时：先在浏览器 DevTools 的 Console / Network 定位是渲染问题还是数据问题，把**完整报错 + 复现步骤**一起交给 AI，不要只说"页面坏了"。

---

## 10. 媒体资产规范（硬性）

### 视频

- Hero 背景视频只能是**离线渲染好的 MP4**，放在 `public/`；**禁止**在运行时引入 Remotion / GSAP / Lottie 等动画库
- 规格：h264 / ≤2.5MB / 无音轨 / 首尾帧一致可无缝循环
- 必须同时提供 `poster` 首帧图，且移动端（<768px）与 `prefers-reduced-motion` 下不加载视频

### 图片

- 一律 WebP，单张 ≤120KB；封面宽 1000、肖像宽 800
- 必须写 `width`/`height`（防 CLS）与 `loading="lazy"` `decoding="async"`
- `alt` 要描述画面内容，不写"图片""封面"这类空话

## 11. 关于 AI 生成图片

项目封面与肖像是 AI 生成的蓝图风格插画，提示词统一后缀：

```
蓝图工程图风格，深蓝底 #0E4C92，白色细线稿，轴测视角，无文字，16:9
```

生成后必须人工检查：**不能出现乱码文字**、线条要连贯、透视要统一。不合格就重新生成，不要凑合。
