import { useEffect, useState } from 'react';
import type { Skill, SkillGroup, Project } from '../data/types';
import type { Db } from '../data/store';
import { loadDb, saveKey } from './persist';

type Tab = 'profile' | 'skills' | 'projects' | 'notes' | 'timeline' | 'stats';

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
  const [error, setError] = useState<string | null>(null);

  // 拉取（/api → localStorage → 种子）
  useEffect(() => {
    let alive = true;
    loadDb()
      .then((data) => {
        if (alive) setDb(data);
      })
      .catch((e) => {
        if (alive) setError('读取数据失败：' + (e as Error).message);
      });
    return () => {
      alive = false;
    };
  }, []);

  const save = async (key: keyof Db, value: unknown) => {
    if (!db) return;
    setDb({ ...db, [key]: value } as Db);
    const res = await saveKey(key, value);
    if (res.ok) {
      setSaved(`${key}（${res.via === 'api' ? '数据库' : '本地存储'}）`);
      setError(null);
      window.setTimeout(() => setSaved(null), 1800);
    } else {
      setError('保存失败');
    }
  };

  if (error) {
    return (
      <div className="adm">
        <header className="adm-top">
          <a href="/">← 返回网站</a>
          <b>后台 · 数据管理</b>
        </header>
        <p className="adm-error">{error}</p>
      </div>
    );
  }

  if (!db) {
    return <div className="adm adm-loading">加载数据中…</div>;
  }

  return (
    <div className="adm">
      <header className="adm-top">
        <a href="/">← 返回网站</a>
        <b>后台 · 数据管理</b>
        <span className="adm-top__save">{saved ? `已保存 ${saved}` : '改动后点「保存」'}</span>
      </header>

      <nav className="adm-tabs">
        {TABS.map((t) => (
          <button key={t.key} type="button" className={tab === t.key ? 'is-on' : ''} onClick={() => setTab(t.key)}>
            {t.label}
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
                onChange={(v) => setDb({ ...db, profile: { ...db.profile, [f]: v } })}
              />
            ))}
            <Field
              label="tagline"
              value={db.profile.tagline}
              textarea
              onChange={(v) => setDb({ ...db, profile: { ...db.profile, tagline: v } })}
            />
            <button className="adm-save" type="button" onClick={() => save('profile', db.profile)}>
              保存个人信息
            </button>
          </section>
        )}

        {/* ---------- 技能 ---------- */}
        {tab === 'skills' && (
          <section className="adm-card">
            <h3>技能清单（{db.skills.length}）</h3>
            {db.skills.map((s, i) => (
              <div key={s.code} className="adm-row">
                <Field label="编号" value={s.code} onChange={(v) => save('skills', db.skills.map((x, j) => (j === i ? { ...x, code: v } : x)))} />
                <Field label="名称" value={s.name} onChange={(v) => save('skills', db.skills.map((x, j) => (j === i ? { ...x, name: v } : x)))} />
                <Field label="规格" value={s.spec} onChange={(v) => save('skills', db.skills.map((x, j) => (j === i ? { ...x, spec: v } : x)))} />
                <label className="adm-field">
                  <span>熟练度</span>
                  <select
                    value={s.level}
                    onChange={(e) => save('skills', db.skills.map((x, j) => (j === i ? { ...x, level: Number(e.target.value) as Skill['level'] } : x)))}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="adm-field">
                  <span>分类</span>
                  <select
                    value={s.group}
                    onChange={(e) => save('skills', db.skills.map((x, j) => (j === i ? { ...x, group: e.target.value as SkillGroup } : x)))}
                  >
                    {GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {db.skillGroupLabel?.[g] ?? g}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="adm-del"
                  type="button"
                  onClick={() => save('skills', db.skills.filter((_, j) => j !== i))}
                >
                  删除
                </button>
              </div>
            ))}
            <button
              className="adm-add"
              type="button"
              onClick={() =>
                save('skills', [
                  ...db.skills,
                  { code: `SKL-${String(db.skills.length + 1).padStart(2, '0')}`, name: '新技能', spec: '', level: 3, group: 'language' },
                ])
              }
            >
              ＋ 新增技能
            </button>
          </section>
        )}

        {/* ---------- 项目 ---------- */}
        {tab === 'projects' && (
          <section className="adm-card">
            <h3>项目（{db.projects.length}）</h3>
            {db.projects.map((p, i) => (
              <div key={p.code} className="adm-row adm-row--wide">
                <Field label="编号" value={p.code} onChange={(v) => save('projects', db.projects.map((x, j) => (j === i ? { ...x, code: v } : x)))} />
                <Field label="标题" value={p.title} onChange={(v) => save('projects', db.projects.map((x, j) => (j === i ? { ...x, title: v } : x)))} />
                <Field label="副标题" value={p.subtitle} onChange={(v) => save('projects', db.projects.map((x, j) => (j === i ? { ...x, subtitle: v } : x)))} />
                <Field label="时间" value={p.period} onChange={(v) => save('projects', db.projects.map((x, j) => (j === i ? { ...x, period: v } : x)))} />
                <Field label="角色" value={p.role} onChange={(v) => save('projects', db.projects.map((x, j) => (j === i ? { ...x, role: v } : x)))} />
                <Field
                  label="描述"
                  value={p.desc}
                  textarea
                  onChange={(v) => save('projects', db.projects.map((x, j) => (j === i ? { ...x, desc: v } : x)))}
                />
                <Field
                  label="要点（每行一条）"
                  value={p.highlights.join('\n')}
                  textarea
                  hint="回车换行分隔"
                  onChange={(v) => save('projects', db.projects.map((x, j) => (j === i ? { ...x, highlights: v.split('\n').filter(Boolean) } : x)))}
                />
                <Field
                  label="标签（逗号分隔）"
                  value={p.tags.join(', ')}
                  onChange={(v) => save('projects', db.projects.map((x, j) => (j === i ? { ...x, tags: v.split(/[,,]/).map((s) => s.trim()).filter(Boolean) } : x)))}
                />
                <label className="adm-field">
                  <span>封面图形</span>
                  <select
                    value={p.icon}
                    onChange={(e) => save('projects', db.projects.map((x, j) => (j === i ? { ...x, icon: e.target.value as Project['icon'] } : x)))}
                  >
                    {ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="adm-del"
                  type="button"
                  onClick={() => save('projects', db.projects.filter((_, j) => j !== i))}
                >
                  删除
                </button>
              </div>
            ))}
            <button
              className="adm-add"
              type="button"
              onClick={() =>
                save('projects', [
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
                ])
              }
            >
              ＋ 新增项目
            </button>
          </section>
        )}

        {/* ---------- 笔记 ---------- */}
        {tab === 'notes' && (
          <section className="adm-card">
            <h3>笔记（{db.notes.length}）</h3>
            {db.notes.map((n, i) => (
              <div key={n.code} className="adm-row adm-row--wide">
                <Field label="编号" value={n.code} onChange={(v) => save('notes', db.notes.map((x, j) => (j === i ? { ...x, code: v } : x)))} />
                <Field label="标题" value={n.title} onChange={(v) => save('notes', db.notes.map((x, j) => (j === i ? { ...x, title: v } : x)))} />
                <Field label="日期" value={n.date} onChange={(v) => save('notes', db.notes.map((x, j) => (j === i ? { ...x, date: v } : x)))} />
                <Field
                  label="摘要"
                  value={n.excerpt}
                  textarea
                  onChange={(v) => save('notes', db.notes.map((x, j) => (j === i ? { ...x, excerpt: v } : x)))}
                />
                <Field
                  label="正文（每行一段）"
                  value={n.body.join('\n')}
                  textarea
                  hint="回车换行分隔段落"
                  onChange={(v) => save('notes', db.notes.map((x, j) => (j === i ? { ...x, body: v.split('\n').filter(Boolean) } : x)))}
                />
                <button
                  className="adm-del"
                  type="button"
                  onClick={() => save('notes', db.notes.filter((_, j) => j !== i))}
                >
                  删除
                </button>
              </div>
            ))}
            <button
              className="adm-add"
              type="button"
              onClick={() =>
                save('notes', [
                  ...db.notes,
                  { code: `NTE-${String(db.notes.length + 1).padStart(2, '0')}`, title: '新笔记', date: '', tags: [], excerpt: '', body: [] },
                ])
              }
            >
              ＋ 新增笔记
            </button>
          </section>
        )}

        {/* ---------- 时间线 ---------- */}
        {tab === 'timeline' && (
          <section className="adm-card">
            <h3>时间线（{db.timeline.length}）</h3>
            {db.timeline.map((t, i) => (
              <div key={t.title} className="adm-row">
                <Field label="日期" value={t.date} onChange={(v) => save('timeline', db.timeline.map((x, j) => (j === i ? { ...x, date: v } : x)))} />
                <Field label="标题" value={t.title} onChange={(v) => save('timeline', db.timeline.map((x, j) => (j === i ? { ...x, title: v } : x)))} />
                <Field label="描述" value={t.desc} textarea onChange={(v) => save('timeline', db.timeline.map((x, j) => (j === i ? { ...x, desc: v } : x)))} />
                <button
                  className="adm-del"
                  type="button"
                  onClick={() => save('timeline', db.timeline.filter((_, j) => j !== i))}
                >
                  删除
                </button>
              </div>
            ))}
            <button
              className="adm-add"
              type="button"
              onClick={() => save('timeline', [...db.timeline, { date: '', title: '新条目', desc: '' }])}
            >
              ＋ 新增时间线
            </button>
          </section>
        )}

        {/* ---------- 数据条 ---------- */}
        {tab === 'stats' && (
          <section className="adm-card">
            <h3>数据条（{db.stats.length}）</h3>
            {db.stats.map((s, i) => (
              <div key={s.label} className="adm-row">
                <Field label="数值" value={s.value} onChange={(v) => save('stats', db.stats.map((x, j) => (j === i ? { ...x, value: Number(v) || 0 } : x)))} />
                <Field label="后缀" value={s.suffix} onChange={(v) => save('stats', db.stats.map((x, j) => (j === i ? { ...x, suffix: v } : x)))} />
                <Field label="说明" value={s.label} onChange={(v) => save('stats', db.stats.map((x, j) => (j === i ? { ...x, label: v } : x)))} />
                <button
                  className="adm-del"
                  type="button"
                  onClick={() => save('stats', db.stats.filter((_, j) => j !== i))}
                >
                  删除
                </button>
              </div>
            ))}
            <button
              className="adm-add"
              type="button"
              onClick={() => save('stats', [...db.stats, { value: 0, suffix: '', label: '新指标' }])}
            >
              ＋ 新增数据
            </button>
          </section>
        )}
      </main>

      <footer className="adm-foot">
        数据存在 <code>server/db.json</code> · 改动即时写盘 · 点「保存」后前台立即生效
      </footer>
    </div>
  );
}
