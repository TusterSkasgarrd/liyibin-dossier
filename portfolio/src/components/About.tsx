import { useData } from '../data/store';

import { useReveal } from '../hooks/useReveal';
import { useCountUp } from '../hooks/useCountUp';
import { SectionHead } from './ui/SectionHead';
import { StackMap } from './ui/StackMap';

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useReveal<HTMLDivElement>(0.4);
  const n = useCountUp(value, inView);
  return (
    <div className="about__stat" ref={ref}>
      <b>
        {n}
        {suffix}
      </b>
      <span>{label}</span>
    </div>
  );
}

export function About() {
  const { profile, stats, timeline } = useData();
  return (
    <section className="section" id="about">
      <div className="wrap">
        <SectionHead no="①" title="概述" en="Overview" />

        <div className="about__grid">
          <div className="about__text">
            <p>
              我是<strong>{profile.name}</strong>，大连民族大学信息与通信工程学院
              <strong>{profile.role}</strong>专业 {profile.grade} 学生。比起"会用某个框架"，我更在意
              <strong>能不能把一个东西从底层拆明白</strong>——从 Logisim 里一个节拍一个节拍地搭 CPU，
              到把传感器数据映射成三维产线上的颜色。
            </p>
            <p>
              技术兴趣集中在三块：<strong>嵌入式与传感</strong>（电路仿真、信号调理）、
              <strong>数据与后端</strong>（MySQL 建模、Java 业务逻辑）、
              <strong>三维与交互</strong>（Blender 建模、Unity 实时渲染）。这三块拼在一起，正好是做
              数字孪生和交互式科普需要的能力。
            </p>
            <p>
              做事方式是<strong>先跑通最小闭环，再往上加细节</strong>。做一个系统，先让一条数据能从传感器
              走到屏幕上，再考虑好不好看；写一份文档，先写清楚要做什么，再让 AI 帮我补全。
            </p>

            <div className="about__stats">
              {stats.map((s) => (
                <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
              ))}
            </div>
          </div>

          <div className="about__side">
            <figure className="about__map">
              <StackMap />
              <figcaption>图 02 · 能力拓扑</figcaption>
            </figure>
          </div>
        </div>

        {/* 时间线：通栏三列，避免左列留白 */}
        <div className="about__timeline">
          <p className="mono about__timeline-label">TIMELINE / 时间线</p>
          <div className="tl-row">
            {timeline.map((item, i) => (
              <article className="tl-card" key={item.title}>
                <span className="tl-card__no">{String(i + 1).padStart(2, '0')}</span>
                <span className="tl-card__date">{item.date}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
