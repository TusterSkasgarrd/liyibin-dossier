import { createContext, useContext, useEffect, useState } from 'react';
import type { Note, Profile, Project, Skill, SkillGroup, TimelineItem } from './types';
import { loadDb, onDbChanged } from '../admin/persist';

// 种子：API 与 localStorage 都不可用时（纯静态打开）仍能正常显示
import { profile as seedProfile } from './profile';
import { skills as seedSkills, skillGroupLabel as seedGroupLabel, timeline as seedTimeline, stats as seedStats } from './skills';
import { projects as seedProjects } from './projects';
import { notes as seedNotes } from './notes';

export interface Db {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  notes: Note[];
  timeline: TimelineItem[];
  stats: { value: number; suffix: string; label: string }[];
  skillGroupLabel: Record<SkillGroup, string>;
}

const SEED: Db = {
  profile: seedProfile,
  skills: seedSkills,
  projects: seedProjects,
  notes: seedNotes,
  timeline: seedTimeline,
  stats: seedStats,
  skillGroupLabel: seedGroupLabel,
};

const Ctx = createContext<Db>(SEED);

/**
 * 全站数据源：
 * 1. 首次挂载按「/api → localStorage → 种子」逐键加载；
 * 2. 订阅保存事件 / 跨标签页 storage 事件，后台一改前台立即重拉；
 * 3. 页面重新可见时刷新，兜住"另一个窗口改完切回来"的场景。
 */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Db>(SEED);

  useEffect(() => {
    let alive = true;

    const refresh = () => {
      loadDb()
        .then((data) => {
          if (alive) setDb(data);
        })
        .catch(() => {
          /* 加载失败保持现有数据 */
        });
    };

    refresh();
    const unsubscribe = onDbChanged(refresh);

    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      alive = false;
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return <Ctx.Provider value={db}>{children}</Ctx.Provider>;
}

export function useData(): Db {
  return useContext(Ctx);
}
