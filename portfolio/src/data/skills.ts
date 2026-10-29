import type { Skill, TimelineItem } from './types';

export const skills: Skill[] = [
  // ---------- 编程语言 ----------
  { code: 'SKL-01', name: 'C 语言', spec: '指针 / 结构体 / 位运算，写过单总线 CPU 的指令译码', level: 4, group: 'language' },
  { code: 'SKL-02', name: 'Python', spec: '数据处理、脚本自动化、tokenizers 训练分词器', level: 4, group: 'language' },
  { code: 'SKL-03', name: 'Java', spec: '面向对象、JDBC，成绩管理系统 3 角色 CRUD', level: 3, group: 'language' },
  { code: 'SKL-04', name: 'TypeScript / JavaScript', spec: 'React 组件、ES 模块、浏览器扩展 MV3', level: 3, group: 'language' },

  // ---------- 数据与后端 ----------
  { code: 'SKL-05', name: 'MySQL', spec: '5.7 · 多表查询 / 视图 / 索引 / 存储过程 / 函数', level: 4, group: 'data' },
  { code: 'SKL-06', name: '数据结构', spec: '顺序栈、二叉树遍历、哈夫曼编码，C 实现', level: 3, group: 'data' },
  { code: 'SKL-07', name: '数据库设计', spec: 'E-R 建模、范式拆分、7 张表的教务系统', level: 3, group: 'data' },

  // ---------- 三维与仿真 ----------
  { code: 'SKL-08', name: 'Unity3D', spec: 'C# 脚本、物理系统、UI 交互，做过三关卡科普游戏', level: 3, group: 'xr' },
  { code: 'SKL-09', name: 'Blender', spec: '多边形建模、UV、材质烘焙，低模资产导入 Unity', level: 3, group: 'xr' },
  { code: 'SKL-10', name: '数字孪生可视化', spec: '产线模型 + 传感器数据驱动的状态映射', level: 2, group: 'xr' },

  // ---------- 硬件与仿真 ----------
  { code: 'SKL-11', name: 'Logisim', spec: '单总线 MIPS CPU、二维节拍编码、微指令设计', level: 3, group: 'hardware' },
  { code: 'SKL-12', name: 'Multisim', spec: '差动变压器 / 差动电容 / 双 T 桥测量电路仿真', level: 3, group: 'hardware' },
  { code: 'SKL-13', name: '传感器与检测', spec: '电桥电路、信号调理、误差分析', level: 3, group: 'hardware' },
];

export const skillGroupLabel: Record<Skill['group'], string> = {
  language: '编程语言',
  data: '数据与后端',
  xr: '三维与仿真',
  hardware: '硬件与电路',
};

export const timeline: TimelineItem[] = [
  {
    date: '2024.09 — 至今',
    title: '大连民族大学 · 物联网工程',
    desc: '信息与通信工程学院。主修：程序设计、数据结构、计算机组成原理、传感器原理及应用、数据库系统。',
  },
  {
    date: '2026.09 — 2026.10',
    title: '大模型实训 · 从零训练小型 GPT',
    desc: '手写 BPE 分词器 → 自注意力与 Transformer → 预训练与 LoRA 微调。768 隐藏维、8 层、2432 中间维，全量语料 127 万条。',
  },
  {
    date: '2026.10',
    title: 'AI 编程实训 · 浏览器扩展与个人站',
    desc: '用 AI 完成 MV3 电商图片下载插件（淘宝/京东/拼多多）、静态官网与云端部署，走完整 PRD → 技术设计 → 实施流程。',
  },
];

export const stats = [
  { value: 6, suffix: '', label: '完整项目' },
  { value: 4, suffix: ' 学期', label: '专业课程' },
  { value: 2432, suffix: '', label: '模型中间维' },
  { value: 127, suffix: ' 万条', label: '训练语料' },
];
