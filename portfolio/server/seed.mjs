/**
 * 从 src/data/*.ts 生成 server/db.json
 * 运行：node --experimental-strip-types server/seed.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(here, '..', 'src', 'data');
const load = (f) => import(pathToFileURL(path.join(dataDir, f)).href);

const { profile } = await load('profile.ts');
const { skills, skillGroupLabel, timeline, stats } = await load('skills.ts');
const { projects: rawProjects } = await load('projects.ts');
// cover 字段是 Vite 打包后的 URL，Node 端导入 .webp 会崩，只留 icon 由前端映射
const projects = rawProjects.map(({ cover, ...rest }) => rest);
const { notes } = await load('notes.ts');

const db = {
  profile,
  skills,
  skillGroupLabel,
  timeline,
  stats,
  projects,
  notes,
};

const out = path.join(here, 'db.json');
fs.writeFileSync(out, JSON.stringify(db, null, 2), 'utf8');

const counts = Object.entries(db).map(([k, v]) => `${k}=${Array.isArray(v) ? v.length : 1}`);
console.log('seeded', out, '|', counts.join(' '));
