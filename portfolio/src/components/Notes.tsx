import { useState } from 'react';
import { useData } from '../data/store';
import { SectionHead } from './ui/SectionHead';

export function Notes() {
  const { notes } = useData();
  const [openCode, setOpenCode] = useState<string | null>(null);

  return (
    <section className="section" id="notes">
      <div className="wrap">
        <SectionHead no="⑤" title="笔记" en="Field Notes" />

        <div className="notes">
          {notes.map((n) => {
            const expanded = openCode === n.code;
            return (
              <article className="note" key={n.code}>
                <button
                  className="note__head"
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpenCode(expanded ? null : n.code)}
                >
                  <span className="note__code">{n.code}</span>
                  <span className="note__title">
                    {n.title}
                    <small>{n.excerpt}</small>
                  </span>
                  <span className="note__date">{n.date}</span>
                  <span className="note__sign" aria-hidden="true">
                    +
                  </span>
                </button>

                {expanded && (
                  <div className="note__body">
                    {n.body.map((para) => (
                      <p key={para.slice(0, 18)}>{para}</p>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
