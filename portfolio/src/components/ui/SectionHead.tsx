import { useReveal } from '../../hooks/useReveal';

interface SectionHeadProps {
  no: string;
  title: string;
  en: string;
  center?: boolean;
}

/** 区块标题：编号 + 中文标题 + 英文副名 + 进入视口时绘制下划线 */
export function SectionHead({ no, title, en, center = false }: SectionHeadProps) {
  const { ref, inView } = useReveal<HTMLDivElement>(0.3);

  return (
    <div
      ref={ref}
      className={`sec-head${center ? ' sec-head--center' : ''}${inView ? ' sec-head--in' : ''}`}
    >
      <span className="sec-head__no">{no}</span>
      <h2 className="sec-head__title">
        {title}
        <em>{en}</em>
      </h2>
      <div className="sec-head__rule" />
    </div>
  );
}
