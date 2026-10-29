import { SectionHead } from './ui/SectionHead';

interface Activity {
  code: string;
  role: string;
  title: string;
  org: string;
  place: string;
  period: string;
  points: string[];
  outputs: string[];
}

const ACTIVITIES: Activity[] = [
  {
    code: 'ACT-01',
    role: '副部长',
    title: '信息与通信工程学院学生会 · 媒体部',
    org: '院学生会',
    place: '辽宁 · 大连',
    period: '2024.09 — 至今',
    points: [
      '负责院级活动的现场影像记录与后期整理，从拍摄到成片一条线跟完',
      '撰写活动推文与宣传文案，配合学院公众号节点发布',
      '带新部员熟悉相机操作与推文排版规范，把流程沉淀成模板',
    ],
    outputs: ['活动摄影', '推文撰写', '物料排版', '新人带教'],
  },
  {
    code: 'ACT-02',
    role: '调研成员',
    title: '暑期「三下乡」· 萤火兴乡乡村振兴团',
    org: '校团委 / 乡村振兴实践团',
    place: '云南大理 · 吉林农安 · 青海德令哈',
    period: '2026.07 — 2026.08',
    points: [
      '随团赴三地开展乡村振兴调研，走访农场与种植基地，记录产业现状',
      '在基地做智慧农业科普，把传感器、环境监测这些专业内容讲成村民听得懂的话',
      '承担实践过程的影像记录与推文撰写，把每日见闻整理成可发布的稿件',
    ],
    outputs: ['实地调研', '科普宣讲', '影像记录', '推文撰写'],
  },
  {
    code: 'ACT-03',
    role: '调研成员',
    title: '寒假「返家乡」· 生态文明与洱海保护',
    org: '校团委 / 返家乡社会实践',
    place: '云南 · 大理',
    period: '2026.01 — 2026.02',
    points: [
      '围绕洱海流域生态保护开展入户走访，梳理当地治理措施与实际感受',
      '把访谈记录整理成结构化材料，用于实践报告的数据支撑',
      '形成调研报告，按学院要求完成排版与提交',
    ],
    outputs: ['入户访谈', '资料整理', '调研报告'],
  },
];

export function Practice() {
  return (
    <section className="section" id="practice">
      <div className="wrap">
        <SectionHead no="⑥" title="实践与担当" en="Field Work" />

        <div className="act-list">
          {ACTIVITIES.map((a) => (
            <article className="act" key={a.code}>
              <div className="act__head">
                <span className="act__code">{a.code}</span>
                <span className="act__role">{a.role}</span>
                <span className="act__period">{a.period}</span>
              </div>

              <h3 className="act__title">{a.title}</h3>

              <p className="act__meta">
                <span>{a.org}</span>
                <span className="act__dot">·</span>
                <span>{a.place}</span>
              </p>

              <ul className="act__points">
                {a.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>

              <div className="act__outputs">
                {a.outputs.map((o) => (
                  <span className="tag" key={o}>
                    {o}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
