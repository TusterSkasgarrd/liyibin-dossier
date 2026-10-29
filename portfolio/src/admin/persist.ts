import type { Db } from '../data/store';

// 种子：API 与 localStorage 都不可用时的最终兜底
import { profile } from '../data/profile';
import { skills, skillGroupLabel, timeline, stats } from '../data/skills';
import { projects } from '../data/projects';
import { notes } from '../data/notes';

const LS_KEY = 'dossier-db';
const TOKEN_KEY = 'dossier-admin-token';

/**
 * 跨域部署（如 GitHub Pages 静态站指向远程 API）时构建期注入：
 *   VITE_API_BASE=https://imagegrab-site-44501.app.workbuddy.host npm run build
 * 不设置则用同源相对路径 /api。
 */
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';

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

/** 管理口令：写接口（PUT/POST/DELETE）需要，与服务端 ADMIN_TOKEN 对齐 */
export function getAdminToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? 'admin123';
  } catch {
    return 'admin123';
  }
}

export function setAdminToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* 隐私模式等场景忽略 */
  }
}

function apiHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-admin-token': getAdminToken(),
  };
}

/** 数据变更广播：同页用自定义事件，跨标签页靠 storage 事件 */
export const DB_CHANGED = 'dossier:db-changed';

function emitChange(): void {
  window.dispatchEvent(new Event(DB_CHANGED));
}

function readLocalDb(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function writeLocalDb(key: keyof Db, value: unknown): boolean {
  try {
    const db = readLocalDb() ?? (JSON.parse(JSON.stringify(SEED)) as Record<string, unknown>);
    db[key] = value;
    localStorage.setItem(LS_KEY, JSON.stringify(db));
    return true;
  } catch {
    return false;
  }
}

/**
 * 三通道加载，逐键回落后合并：
 *   /api（数据库）→ localStorage（静态托管/离线）→ 内置种子
 * 任何单键失败只影响该键，不再整库放弃 API 数据。
 */
export async function loadDb(): Promise<Db> {
  const out = JSON.parse(JSON.stringify(SEED)) as Record<string, unknown>;
  const local = readLocalDb();
  let apiHit = 0;

  for (const k of KEYS) {
    let hit = false;
    try {
      const r = await fetch(`${API_BASE}/api/${k}`, { cache: 'no-store' });
      if (r.ok) {
        const v: unknown = await r.json();
        // 服务端对缺失键可能返回 null，不能拿 null 覆盖兜底数据
        if (v !== null && v !== undefined) {
          out[k] = v;
          hit = true;
          apiHit += 1;
        }
      }
    } catch {
      /* 无后端 */
    }
    if (!hit && local && local[k] !== null && local[k] !== undefined) {
      out[k] = local[k];
    }
  }

  // API 可用时把快照写回 localStorage，让静态托管也能读到最新数据
  if (apiHit > 0) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(out));
    } catch {
      /* 忽略缓存失败 */
    }
  }

  return out as unknown as Db;
}

export type SaveResult = { ok: boolean; via: 'api' | 'local'; error?: string };

/**
 * 双通道保存：/api 优先（写数据库），成功/失败都镜像到 localStorage，
 * 保证静态托管兜底与刷新后不丢；写入后广播变更事件。
 */
export async function saveKey(key: keyof Db, value: unknown): Promise<SaveResult> {
  let via: 'api' | 'local' = 'local';

  try {
    const r = await fetch(`${API_BASE}/api/${key}`, {
      method: 'PUT',
      headers: apiHeaders(),
      body: JSON.stringify(value),
    });
    if (r.ok) {
      via = 'api';
    } else if (r.status === 401) {
      writeLocalDb(key, value);
      emitChange();
      return { ok: false, via: 'api', error: '管理口令错误：请在后台顶部填写正确的口令后重试' };
    }
  } catch {
    /* 无后端，落到 localStorage */
  }

  const localOk = writeLocalDb(key, value);
  emitChange();
  if (via === 'api' || localOk) return { ok: true, via };
  return { ok: false, via };
}

/** 订阅数据变化（本页保存 + 跨标签页 localStorage 变化），返回取消订阅函数 */
export function onDbChanged(cb: () => void): () => void {
  const onLocal = () => cb();
  const onStorage = (e: StorageEvent) => {
    if (e.key === LS_KEY || e.key === null) cb();
  };
  window.addEventListener(DB_CHANGED, onLocal);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(DB_CHANGED, onLocal);
    window.removeEventListener('storage', onStorage);
  };
}
