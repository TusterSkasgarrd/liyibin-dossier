import { useEffect, useRef, useState } from 'react';
import type { Skill, SkillGroup, Project } from '../data/types';
import type { Db } from '../data/store';
import { loadDb, saveKey, getAdminToken, setAdminToken } from './persist';

type Tab = 'profile' | 'skills' | 'projects' | 'notes' | 'timeline' | 'stats';
type ListKey = 'skills' | 'projects' | 'notes' | 'timeline' | 'stats';
type RowIds = Record<ListKey, string[]>;

const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: '个人信息' },
  { key: 'skills', label: '技能' },
  { key: 'projects', label: '项目' },
  { key: 'notes', label: '笔记' },
  { key: 'timeline', label: '时间线' },
  { key: 'stats', label: '数据条' },
];

const ICONS: string[] = ['twin', 'game', 'writing', 'medical', 'database', 'cpu'];
const GROUPS: SkillGroup[] = ['language', 'data', 'xr', 'hardware'];

/** 行 key 用稳定 id：编号/标题可编辑，不能拿可编辑字段当 key，否则输入到一半整行重挂载丢焦点 */
function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 为每个列表行分配稳定 id，随增删同步维护，编辑字段不影响 */
function buildRowIds(db: Db): RowIds {
  return {
    skills: db.skills.map(() => newId()),
    projects: db.projects.map(() => newId()),
    notes: db.notes.map(() => newId()),
    timeline: db.timeline.map(() => newId()),
    stats: db.stats.map(() => newId()),
  };
}

/** 逗号/换行分隔的字符串数组：编辑期保留空段（打字时回车不能吞掉），保存时再清洗 */
function splitLines(v: string): string[] {
  return v.split('\n');
}

function splitTags(v: string): string[] {
  return v.split(/[,,]/).map((s) => s.trim());
}

function cleanList(list: string[]): string[] {
  return list.map((s) => s.trim()).filter(Boolean);
}

function cleanDbForSave(key: keyof Db, value: unknown): unknown {
  if (key === 'projects') {
    return (value as Project[]).map((p) => ({ ...p, tags: cleanList(p.tags), highlights: cleanList(p.highlights) }));
  }
  if (key === 'notes') {
    return (value as Db['notes']).map((n) => ({ ...n, tags: cleanList(n.tags), body: cleanList(n.body) }));
  }
  return value;
}

/** 通用输入框 */
function Field({
  label,
  value,
  onChange,
  textarea,
  hint,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  textarea?: boolean;
  hint?: string;
}) {
  return (
    <label className="adm-field">
      <span>{label}</span>
      {textarea ? (
        <textarea value={String(value)} rows={4} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input value={String(value)} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <em>{hint}</em>}
    </label>
  );
}

export function Admin() {
  const [db, setDb] = useState<Db | null>(null);
  const [tab, setTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Set<Tab>>(new Set());
  const [token, setToken] = useState<string>(() => getAdminToken());
  const [rowIds, setRowIds] = useState<RowIds>({
    skills: [],
    projects: [],
    notes: [],
    timeline: [],
    stats: [],
  });
  const saveTimer = useRef<number | null>(null);

  // 拉取（/api → localStorage → 种子）
  useEffect(() => {
    let alive = true;
    loadDb()
      .then((data) => {
        if (alive) {
          setDb(data);
          setRowIds(buildRowIds(data));
        }
      })
      .catch((e) => {
        if (alive) setFatal('读取数据失败：' + (e as Error).message);
      });
    return () => {
      alive = false;
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
    };
  }, []);

  const markDirty = (t: Tab) => {
    setDirty((prev) => {
      const next = new Set(prev);
      next.add(t);
      return next;
    });
  };

  /** 只改本地草稿，不发请求；由「保存」按钮统一落库，避免每次按键整包 PUT 的并发乱序 */
  const edit = (t: Tab, key: keyof Db, value: unknown) => {
    setDb((prev) => (prev ? ({ ...prev, [key]: value } as Db) : prev));
    markDirty(t);
  };

  /** 立即落库（增/删这类离散操作用） */
  const commit = async (key: keyof Db, value: unknown) => {
    const payload = cleanDbForSave(key, value);
    setDb((prev) => (prev ? ({ ...prev, [key]: payload } as Db) : prev));
    const res = await saveKey(key, payload);
    if (res.ok) {
      setSaved(`${key}（${res.via === 'api' ? '数据库' : '本地存储'}）`);
      setNotice(null);
      setDirty((prev) => {
        const next = new Set(prev);
        for (const t of TABS) {
          if (t.key === key || (key === 'skillGroupLabel' && t.key === 'skills')) next.delete(t.key);
        }
        return next;
      });
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => setSaved(null), 1800);
    } else {
      setNotice(res.error ?? '保存失败，请检查网络与管理口令');
    }
  };

  /** 保存当前 tab（技能页连同分类标签一起存） */
  const handleSaveTab = () => {
    if (!db) return;
    if (tab === 'profile') {
      void commit('profile', db.profile);
      return;
    }
    if (tab === 'skills') {
      void commit('skills', db.skills);
      void commit('skillGroupLabel', db.skillGroupLabel);
      return;
    }
    void commit(tab, db[tab as ListKey]);
  };

  const handleReload = () => {
    loadDb()
      .then((data) => {
        setDb(data);
        setRowIds(buildRowIds(data));
        setDirty(new Set());
        setNotice(null);
        setSaved('已重新加载服务器数据');
        if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(() => setSaved(null), 1800);
      })
      .catch(() => setNotice('重新加载失败'));
  };

  const handleTokenChange = (v: string) => {
    setToken(v);
    setAdminToken(v);
    setNotice(null);
  };

  /* ---------- 各列表的字段编辑（只改草稿） ---------- */

  const editSkill = (i: number, patch: Partial<Skill>) => {
    if (!db) return;
    edit('skills', 'skills', db.skills.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  };

  const editProject = (i: number, patch: Partial<Project>) => {
    if (!db) return;
    edit('projects', 'projects', db.projects.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  };

  const editNote = (i: number, patch: Partial<Db['notes'][number]>) => {
    if (!db) return;
    edit('notes', 'notes', db.notes.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  };

  const editTimeline = (i: number, patch: Partial<Db['timeline'][number]>) => {
    if (!db) return;
    edit('timeline', 'timeline', db.timeline.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  };

  const editStat = (i: number, patch: Partial<Db['stats'][number]>) => {
    if (!db) return;
    edit('stats', 'stats', db.stats.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  };

  /* ---------- 增删（离散操作，立即落库） ---------- */

  const handleAddSkill = () => {
    if (!db) return;
    setRowIds((prev) => ({ ...prev, skills: [...prev.skills, newId()] }));
    void commit('skills', [
      ...db.skills,
      { code: `SKL-${String(db.skills.length + 1).padStart(2, '0')}`, name: '新技能', spec: '', level: 3, group: 'language' },
    ]);
  };

  const handleDelSkill = (i: number) => {
    if (!db) return;
    setRowIds((prev) => ({ ...prev, skills: prev.skills.filter((_, j) => j !== i) }));
    void commit('skills', db.skills.filter((_, j) => j !== i));
  };

  const handleAddProject = () => {
    if (!db) return;
    setRowIds((prev) => ({ ...prev, projects: [...prev.projects, newId()] }));
    void commit('projects', [
      ...db.projects,
      {
        code: `PRJ-${String(db.projects.length + 1).padStart(2, '0')}`,
        title: '新项目',
        subtitle: '',
        desc: '',
        period: '',
        role: '',
        tags: [],
        icon: 'twin',
        highlights: [],
      },
    ]);
  };

  const handleDelProject = (i: number) => {
    if (!db) return;
    setRowIds((prev) => ({ ...prev, projects: prev.projects.filter((_, j) => j !== i) }));
    void commit('projects', db.projects.filter((_, j) => j !== i));
  };

  const handleAddNote = () => {
    if (!db) return;
    setRowIds((prev) => ({ ...prev, notes: [...prev.notes, newId()] }));
    void commit('notes', [
      ...db.notes,
      { code: `NTE-${String(db.notes.length + 1).padStart(2, '0')}`, title: '新笔记', date: '', tags: [], excerpt: '', body: [] },
    ]);
  };

  const handleDelNote = (i: number) => {
    if (!db) return;
    setRowIds((prev) => ({ ...prev, notes: prev.notes.filter((_, j) => j !== i) }));
    void commit('notes', db.notes.filter((_, j) => j !== i));
  };

  const handleAddTimeline = () => {
    if (!db) return;
    setRowIds((prev) => ({ ...prev, timeline: [...prev.timeline, newId()] }));
    void commit('timeline', [...db.timeline, { date: '', title: '新条目', desc: '' }]);
  };

  const handleDelTimeline = (i: number) => {
    if (!db) return;
    setRowIds((prev) => ({ ...prev, timeline: prev.timeline.filter((_, j) => j !== i) }));
    void commit('timeline', db.timeline.filter((_, j) => j !== i));
  };

  const handleAddStat = () => {
    if (!db) return;
    setRowIds((prev) => ({ ...prev, stats: [...prev.stats, newId()] }));
    void commit('stats', [...db.stats, { value: 0, suffix: '', label: '新指标' }]);
  };

  const handleDelStat = (i: number) => {
    if (!db) return;
    setRowIds((prev) => ({ ...prev, stats: prev.stats.filter((_, j) => j !== i) }));
    void commit('stats', db.stats.filter((_, j) => j !== i));
  };

  if (fatal) {
    return (
      <div className="adm">
        <header className="adm-top">
          <a href={import.meta.env.BASE_URL}>← 返回网站</a>
          <b>后台 · 数据管理</b>
        </header>
        <p className="adm-error">{fatal}</p>
      </div>
    );
  }

  if (!db) {
    return <div className="adm adm-loading">加载数据中…</div>;
  }

  const isDirty = dirty.has(tab);

  return (
    <div className="adm">
      <header className="adm-top">
        <a href={import.meta.env.BASE_URL}>← 返回网站</a>
        <b>后台 · 数据管理</b>
        <label className="adm-top__token">
          <span>管理口令</span>
          <input
            type="password"
            value={token}
            autoComplete="off"
            onChange={(e) => handleTokenChange(e.target.value)}
          />
        </label>
        <button className="adm-reload" type="button" onClick={handleReload}>
          重新加载
        </button>
        <span className="adm-top__save">
          {saved ? `已保存 ${saved}` : isDirty ? '有未保存的改动，点「保存」' : '改动后点「保存」'}
        </span>
      </header>

      {notice && <p className="adm-error">{notice}</p>}

      <nav className="adm-tabs">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={tab === t.key ? 'is-on' : ''} onClick={() => setTab(t.key)}>
            {t.label}
            {dirty.has(t.key) ? ' •' : ''}
          </button>
        ))}
      </nav>

      <main className="adm-body">
        {/* ---------- 个人信息 ---------- */}
        {tab === 'profile' && (
          <section className="adm-card">
            <h3>个人信息</h3>
            {(['name', 'enName', 'role', 'school', 'grade', 'location', 'coords', 'email'] as const).map((f) => (
              <Field
                key={f}
                label={f}
                value={db.profile[f]}
                onChange={(v) => edit('profile', 'profile', { ...db.profile, [f]: v })}
              />
            ))}
            <Field
              label="tagline"
              value={db.profile.tagline}
              textarea
              onChange={(v) => edit('profile', 'profile', { ...db.profile, tagline: v })}
            />
            <button className="adm-save" type="button" onClick={handleSaveTab}>
              保存个人信息
            </button>
          </section>
        )}

        {/* ---------- 技能 ---------- */}
        {tab === 'skills' && (
          <section className="adm-card">
            <h3>分类标签（雷达图 / 分组标题同步生效）</h3>
            <div className="adm-row">
              {GROUPS.map((g) => (
                <Field
                  key={g}
                  label={g}
                  value={db.skillGroupLabel[g]}
                  onChange={(v) => edit('skills', 'skillGroupLabel', { ...db.skillGroupLabel, [g]: v })}
                />
              ))}
            </div>

            <h3>技能清单（{db.skills.length}）</h3>
            {db.skills.map((s, i) => (
              <div key={rowIds.skills[i]} className="adm-row">
                <Field label="编号" value={s.code} onChange={(v) => editSkill(i, { code: v })} />
                <Field label="名称" value={s.name} onChange={(v) => editSkill(i, { name: v })} />
                <Field label="规格" value={s.spec} onChange={(v) => editSkill(i, { spec: v })} />
                <label className="adm-field">
                  <span>熟练度</span>
                  <select value={s.level} onChange={(e) => editSkill(i, { level: Number(e.target.value) as Skill['level'] })}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="adm-field">
                  <span>分类</span>
                  <select value={s.group} onChange={(e) => editSkill(i, { group: e.target.value as SkillGroup })}>
                    {GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {db.skillGroupLabel[g] ?? g}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="adm-del" type="button" onClick={() => handleDelSkill(i)}>
                  删除
                </button>
              </div>
            ))}
            <button className="adm-add" type="button" onClick={handleAddSkill}>
              ＋ 新增技能
            </button>
            <button className="adm-save" type="button" onClick={handleSaveTab}>
              保存技能与分类标签
            </button>
          </section>
        )}

        {/* ---------- 项目 ---------- */}
        {tab === 'projects' && (
          <section className="adm-card">
            <h3>项目（{db.projects.length}）</h3>
            {db.projects.map((p, i) => (
              <div key={rowIds.projects[i]} className="adm-row adm-row--wide">
                <Field label="编号" value={p.code} onChange={(v) => editProject(i, { code: v })} />
                <Field label="标题" value={p.title} onChange={(v) => editProject(i, { title: v })} />
                <Field label="副标题" value={p.subtitle} onChange={(v) => editProject(i, { subtitle: v })} />
                <Field label="时间" value={p.period} onChange={(v) => editProject(i, { period: v })} />
                <Field label="角色" value={p.role} onChange={(v) => editProject(i, { role: v })} />
                <Field label="描述" value={p.desc} textarea onChange={(v) => editProject(i, { desc: v })} />
                <Field
                  label="要点（每行一条）"
                  value={p.highlights.join('\n')}
                  textarea
                  hint="回车换行分隔"
                  onChange={(v) => editProject(i, { highlights: splitLines(v) })}
                />
                <Field
                  label="标签（逗号分隔）"
                  value={p.tags.join(', ')}
                  onChange={(v) => editProject(i, { tags: splitTags(v) })}
                />
                <label className="adm-field">
                  <span>封面图形</span>
                  <select value={p.icon} onChange={(e) => editProject(i, { icon: e.target.value as Project['icon'] })}>
                    {ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="adm-del" type="button" onClick={() => handleDelProject(i)}>
                  删除
                </button>
              </div>
            ))}
            <button className="adm-add" type="button" onClick={handleAddProject}>
              ＋ 新增项目
            </button>
            <button className="adm-save" type="button" onClick={handleSaveTab}>
              保存项目
            </button>
          </section>
        )}

        {/* ---------- 笔记 ---------- */}
        {tab === 'notes' && (
          <section className="adm-card">
            <h3>笔记（{db.notes.length}）</h3>
            {db.notes.map((n, i) => (
              <div key={rowIds.notes[i]} className="adm-row adm-row--wide">
                <Field label="编号" value={n.code} onChange={(v) => editNote(i, { code: v })} />
                <Field label="标题" value={n.title} onChange={(v) => editNote(i, { title: v })} />
                <Field label="日期" value={n.date} onChange={(v) => editNote(i, { date: v })} />
                <Field label="摘要" value={n.excerpt} textarea onChange={(v) => editNote(i, { excerpt: v })} />
                <Field
                  label="正文（每行一段）"
                  value={n.body.join('\n')}
                  textarea
                  hint="回车换行分隔段落"
                  onChange={(v) => editNote(i, { body: splitLines(v) })}
                />
                <button className="adm-del" type="button" onClick={() => handleDelNote(i)}>
                  删除
                </button>
              </div>
            ))}
            <button className="adm-add" type="button" onClick={handleAddNote}>
              ＋ 新增笔记
            </button>
            <button className="adm-save" type="button" onClick={handleSaveTab}>
              保存笔记
            </button>
          </section>
        )}

        {/* ---------- 时间线 ---------- */}
        {tab === 'timeline' && (
          <section className="adm-card">
            <h3>时间线（{db.timeline.length}）</h3>
            {db.timeline.map((t, i) => (
              <div key={rowIds.timeline[i]} className="adm-row">
                <Field label="日期" value={t.date} onChange={(v) => editTimeline(i, { date: v })} />
                <Field label="标题" value={t.title} onChange={(v) => editTimeline(i, { title: v })} />
                <Field label="描述" value={t.desc} textarea onChange={(v) => editTimeline(i, { desc: v })} />
                <button className="adm-del" type="button" onClick={() => handleDelTimeline(i)}>
                  删除
                </button>
              </div>
            ))}
            <button className="adm-add" type="button" onClick={handleAddTimeline}>
              ＋ 新增时间线
            </button>
            <button className="adm-save" type="button" onClick={handleSaveTab}>
              保存时间线
            </button>
          </section>
        )}

        {/* ---------- 数据条 ---------- */}
        {tab === 'stats' && (
          <section className="adm-card">
            <h3>数据条（{db.stats.length}）</h3>
            {db.stats.map((s, i) => (
              <div key={rowIds.stats[i]} className="adm-row">
                <Field label="数值" value={s.value} onChange={(v) => editStat(i, { value: Number(v) || 0 })} />
                <Field label="后缀" value={s.suffix} onChange={(v) => editStat(i, { suffix: v })} />
                <Field label="说明" value={s.label} onChange={(v) => editStat(i, { label: v })} />
                <button className="adm-del" type="button" onClick={() => handleDelStat(i)}>
                  删除
                </button>
              </div>
            ))}
            <button className="adm-add" type="button" onClick={handleAddStat}>
              ＋ 新增数据
            </button>
            <button className="adm-save" type="button" onClick={handleSaveTab}>
              保存数据条
            </button>
          </section>
        )}
      </main>

      <footer className="adm-foot">
        数据写入 <code>server/db.json</code>（API 可用时）并同步 localStorage · 点「保存」后前台实时生效
      </footer>
    </div>
  );
}
