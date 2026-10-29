# 工程档案 · 李亦斌个人网站

> 把个人履历做成一份**工程图纸**：普鲁士蓝底、双层网格、双线图框、右下角固定图签栏，每一段经历都有图号。

考核七（实训 7）交付物：按「需求研究 → PRD → 技术设计 → AGENTS.md → 实现 → 部署」的完整流程产出的单页个人网站。

---

## 在线地址

<https://imagegrab-site-44501.app.workbuddy.host/?sharecode=ER2X4YHN7D>

## 技术栈

| 层 | 选型 |
|---|---|
| 构建 | Vite 8 |
| 框架 | React 19 |
| 语言 | TypeScript 5 |
| 样式 | 原生 CSS + CSS 变量（**无** Tailwind / UI 库 / 动画库 / 图标库） |

## 本地运行

```bash
cd portfolio
npm install          # registry 已指向 npmmirror
npm run dev          # http://localhost:5173
npm run build        # 产物 dist/
```

## 目录

```
第07节-个人网站/
├── portfolio/              # 源码（React + TS + Vite）
│   ├── src/
│   │   ├── styles/tokens.css     # 全部设计变量
│   │   ├── styles/global.css     # 蓝图版式 + 组件样式 + 响应式
│   │   ├── data/                 # 纯数据：profile / skills / projects / notes
│   │   ├── hooks/                # useReveal / useCountUp
│   │   └── components/           # 六区块 + 5 个 UI 原子件
│   └── dist/               # 构建产物（部署这个目录）
├── PRD.md                  # ① 需求文档
├── TECH_DESIGN.md          # ② 技术设计文档
├── AGENTS.md               # ③ AI 开发规范
├── QUALITY_GATE.md         # ④ 界面质量墙（含自检结果）
└── 截图/                    # 考核七提交图
```

## 四份文档的分工

| 文档 | 回答什么 |
|---|---|
| `PRD.md` | 做什么、给谁用、有哪些功能、验收标准 |
| `TECH_DESIGN.md` | 用什么技术、目录怎么组织、数据模型与关键实现 |
| `AGENTS.md` | AI 怎么改这个项目：目录约定、代码风格、禁止事项、测试清单 |
| `QUALITY_GATE.md` | 界面做到什么程度算过关：四项 100 分的可判定门槛 + 实测数据 |

## 设计语言

- **底色** 普鲁士蓝渐变 `#082F5E → #0E4C92`，铺 10px 细网格 + 100px 粗网格
- **图框** 外 1px + 内 1px 双线，四角十字，右下角图签栏常驻
- **卡片** 只描边不填充、圆角 3px、无投影
- **强调** 只有一种黄色 `#FFD166`，只出现在标注线、编号、交互态
- **动效** 只做两类：SVG 线条绘制、数字计数；全部支持 `prefers-reduced-motion`

## 签名组件

| 组件 | 为什么这么做 |
|---|---|
| `BlueprintFrame` | 图签栏是 CAD 的署名方式，用它替代页脚版权——进来是图，出去还是图 |
| `DimLine` | 尺寸标注本身就是信息（年级、专业），不是装饰；`pointer-events:none` 不进文档流 |
| `ScaleBar` | 百分比是"评分"，五格刻度是"规格"——BOM 里写规格不写分数 |
| `SectionHead` | 编号让页面像零件表，导航序号 = 区块序号 = 图号 |
| `ProjectCover` | 纯 SVG 线稿，用照片会破坏图纸一致性；线稿能表达"结构" |
| `StackMap` | 技术栈不是标签墙，是拓扑图——"怎么连"比"列了什么"更能说明方向 |
