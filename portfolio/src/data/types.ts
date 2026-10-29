/** 全站数据模型的类型定义，供 data/*.ts 与组件共用 */

export interface Profile {
  name: string;
  enName: string;
  role: string;
  school: string;
  grade: string;
  tagline: string;
  location: string;
  coords: string;
  email: string;
  portrait?: string;
}

export type SkillGroup = 'language' | 'data' | 'xr' | 'hardware';

export interface Skill {
  code: string;
  name: string;
  spec: string;
  level: 1 | 2 | 3 | 4 | 5;
  group: SkillGroup;
}

/** 项目封面用内联 SVG 线稿，key 对应 ProjectCover 组件里的图形 */
export type ProjectIcon = 'twin' | 'game' | 'writing' | 'medical' | 'database' | 'cpu';

export interface Project {
  code: string;
  title: string;
  subtitle: string;
  desc: string;
  period: string;
  role: string;
  tags: string[];
  icon: ProjectIcon;
  highlights: string[];
}

export interface Note {
  code: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  body: string[];
}

export interface TimelineItem {
  date: string;
  title: string;
  desc: string;
}
