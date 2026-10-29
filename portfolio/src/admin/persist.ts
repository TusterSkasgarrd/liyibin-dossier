import type { Db } from '../data/store';

// 种子：静态托管（GitHub Pages）下没有 /api，回落到本地种子
import { profile } from '../data/profile';
import { skills, skillGroupLabel, timeline, stats } from '../data/skills';
import { projects } from '../data/projects';
import { notes } from '../data/notes';

const LS_KEY = 'dossier-db';

const SEED: Db = {
  profile,
  skills,
  skillGroupLabel,
  timeline,
  stats,
  projects,
  notes,
};

const KEYS = Object.keys(SEED) as (keyof Db)[];

/** 三通道加载：/api（数据库）→ localStorage（GitHub Pages）→ 内置种子 */
export async function loadDb(): Promise<Db> {
  // 1) 优先 /api
  try {
    const out = {} as Db;
    let hit = 0;
    for (const k of KEYS) {
      const r = await fetch(`/api/${k}`);
      if (r.ok) {
        out[k] = await r.json();
        hit += 1;
      }
    }
    if (hit === KEYS.length) return out;
  } catch {
    /* 无后端 */
  }

  // 2) localStorage
  try {
    const local = localStorage.getItem(LS_KEY);
    if (local) return JSON.parse(local) as Db;
  } catch {
    /* 无本地缓存 */
  }

  // 3) 种子
  return JSON.parse(JSON.stringify(SEED));
}

export type SaveResult = { ok: boolean; via: 'api' | 'local' };

/** 双通道保存：/api 优先，失败写 localStorage */
export async function saveKey(key: keyof Db, value: unknown): Promise<SaveResult> {
  try {
    const r = await fetch(`/api/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    });
    if (r.ok) return { ok: true, via: 'api' };
  } catch {
    /* 无后端 */
  }

  try {
    const cur = localStorage.getItem(LS_KEY);
    const db = (cur ? JSON.parse(cur) : JSON.parse(JSON.stringify(SEED))) as Db;
    (db as unknown as Record<string, unknown>)[key] = value;
    localStorage.setItem(LS_KEY, JSON.stringify(db));
    return { ok: true, via: 'local' };
  } catch {
    return { ok: false, via: 'local' };
  }
}
