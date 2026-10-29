import { createContext, useContext, useEffect, useState } from 'react';
import type { Note, Profile, Project, Skill, SkillGroup, TimelineItem } from './types';

// 种子：API 不可用时（如纯静态打开）仍能正常显示
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

/** 全站数据源：优先从 /api 读数据库，失败回落到本地种子 */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Db>(SEED);

  useEffect(() => {
    (async () => {
      try {
        const keys: (keyof Db)[] = ['profile', 'skills', 'projects', 'notes', 'timeline', 'stats', 'skillGroupLabel'];
        const out = { ...SEED } as Db;
        for (const k of keys) {
          const r = await fetch(`/api/${k}`);
          if (r.ok) out[k] = await r.json();
        }
        setDb(out);
      } catch {
        // 无后端（纯静态托管）时保持种子数据
      }
    })();
  }, []);

  return <Ctx.Provider value={db}>{children}</Ctx.Provider>;
}

export function useData(): Db {
  return useContext(Ctx);
}
