import { Fragment } from 'react';
import { useData } from '../data/store';
import type { SkillGroup } from '../data/types';
import { SectionHead } from './ui/SectionHead';
import { ScaleBar } from './ui/ScaleBar';
import { SkillRadar } from './ui/SkillRadar';
import { RhythmChart } from './ui/RhythmChart';

const GROUPS: SkillGroup[] = ['language', 'data', 'xr', 'hardware'];

export function Skills() {
  const { skills, skillGroupLabel } = useData();
  return (
    <section className="section" id="skills">
      <div className="wrap">
        <SectionHead no="②" title="技能" en="Bill of Materials" />

        <div className="skills-layout">
          <div className="bom">
            <div className="bom__head">
              <span>编号</span>
              <span>名称</span>
              <span>规格 / 用途</span>
              <span>熟练度</span>
            </div>

            {GROUPS.map((group) => (
              <Fragment key={group}>
                <div className="bom__group">{skillGroupLabel[group]}</div>
                {skills
                  .filter((s) => s.group === group)
                  .map((s) => (
                    <div className="bom__row" key={s.code}>
                      <span className="bom__code">{s.code}</span>
                      <span className="bom__name">{s.name}</span>
                      <span className="bom__spec">{s.spec}</span>
                      <ScaleBar level={s.level} />
                    </div>
                  ))}
              </Fragment>
            ))}
          </div>

          <aside className="skills-side">
            <div className="chart-card">
              <h3 className="chart-card__title">能力域分布</h3>
              <SkillRadar />
            </div>
            <div className="chart-card">
              <h3 className="chart-card__title">产出节奏</h3>
              <RhythmChart />
            </div>

            <div className="chart-card chart-card--list">
              <h3 className="chart-card__title">正在学</h3>
              <ul className="learning">
                <li>
                  <span>01</span>TypeScript 泛型与类型体操
                </li>
                <li>
                  <span>02</span>React 并发渲染与 Suspense
                </li>
                <li>
                  <span>03</span>数字孪生的实时渲染优化
                </li>
                <li>
                  <span>04</span>嵌入式 C 的指针与内存模型
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <div className="skills__legend">
          <ScaleBar level={5} />
          <span>5 格刻度 · 1 格 = 了解概念，5 格 = 能独立完成项目</span>
        </div>
      </div>
    </section>
  );
}
