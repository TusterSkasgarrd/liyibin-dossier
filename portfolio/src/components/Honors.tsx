import { SectionHead } from './ui/SectionHead';

interface Honor {
  code: string;
  title: string;
  issuer: string;
  date: string;
  note: string;
}

const HONORS: Honor[] = [
  {
    code: 'HNR-01',
    title: '大学生创新创业训练计划 · 立项',
    issuer: '大连民族大学',
    date: '2025.11',
    note: '「光谱探险家」高光谱科普游戏，5 人跨专业团队',
  },
  {
    code: 'HNR-02',
    title: '中国大学生计算机设计大赛 · 参赛',
    issuer: '教育部高等学校计算机类专业教学指导委员会',
    date: '2026.05',
    note: '「云境高山 · 一叶知春」智能制造数字孪生监测系统',
  },
  {
    code: 'HNR-03',
    title: '大模型实训 · 结业',
    issuer: '信息与通信工程学院',
    date: '2026.10',
    note: '完整跑通 分词器 → 自注意力 → 预训练 → LoRA 微调 全链路',
  },
];

export function Honors() {
  return (
    <section className="section" id="honors">
      <div className="wrap">
        <SectionHead no="⑦" title="荣誉与证书" en="Records" />

        <div className="honor-list">
          {HONORS.map((h) => (
            <article className="honor" key={h.code}>
              <div className="honor__left">
                <span className="honor__code">{h.code}</span>
                <span className="honor__date">{h.date}</span>
              </div>
              <div className="honor__body">
                <h3>{h.title}</h3>
                <p className="honor__issuer">{h.issuer}</p>
                <p className="honor__note">{h.note}</p>
              </div>
              <div className="honor__stamp" aria-hidden="true">
                <svg viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" stroke="var(--accent)" strokeWidth="1" fill="none" strokeDasharray="3 3" />
                  <circle cx="22" cy="22" r="13" stroke="var(--accent)" strokeWidth="0.8" fill="none" />
                  <path d="M15 22l5 5 9-10" stroke="var(--accent)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
