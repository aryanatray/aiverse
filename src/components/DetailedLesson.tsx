import { details } from "../lib/lessonDetails";
import { lessonById, type LabId } from "../lib/curriculum";
import { FlowDiagram } from "./ConceptGuide";
export default function DetailedLesson({
  id,
  onExperiment,
  onCheck,
}: {
  id: LabId;
  onExperiment: () => void;
  onCheck: () => void;
}) {
  const lesson = lessonById[id],
    d = details[id];
  return (
    <article className="detailed-lesson">
      <header className="lesson-cover">
        <span className="eyebrow">UNDERSTAND THE CONCEPT</span>
        <h2>{lesson.title}</h2>
        <p>{lesson.concept}</p>
        <div className="learning-objectives">
          <h3>By the end, you should be able to</h3>
          <ul>
            {d.goals.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      </header>
      <div className="lesson-reading-layout">
        <nav className="lesson-toc" aria-label="Lesson contents">
          <span className="eyebrow">IN THIS EXPLANATION</span>
          {d.sections.map((s, i) => (
            <a
              key={s.title}
              href={`#section-${id}-${i}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`section-${id}-${i}`)?.scrollIntoView({
                  behavior: matchMedia("(prefers-reduced-motion: reduce)")
                    .matches
                    ? "instant"
                    : "smooth",
                  block: "start",
                });
              }}
            >
              {s.title}
            </a>
          ))}
          <a
            href={`#worked-${id}`}
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById(`worked-${id}`)
                ?.scrollIntoView({ block: "start" });
            }}
          >
            Worked example
          </a>
          <button className="button full" onClick={onExperiment}>
            Back to the live lab →
          </button>
        </nav>
        <div className="lesson-body">
          <section className="lesson-flow-intro">
            <h3>The computation at a glance</h3>
            <FlowDiagram
              steps={d.flow}
              label={`${lesson.title} process overview`}
            />
          </section>
          {d.sections.map((s, i) => (
            <section key={s.title} id={`section-${id}-${i}`}>
              <h3>{s.title}</h3>
              {s.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {s.equation && <div className="formula">{s.equation}</div>}
            </section>
          ))}
          <section className="worked-example" id={`worked-${id}`}>
            <span className="eyebrow">WORK IT THROUGH</span>
            <h3>A numerical example</h3>
            <p>{d.worked.given}</p>
            <ol>
              {d.worked.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <p className="worked-result">{d.worked.result}</p>
          </section>
          <section className="lesson-failure">
            <h3>Common mistake to avoid</h3>
            <p>{lesson.pitfall}</p>
          </section>
          <section>
            <h3>Try it yourself</h3>
            <p>{lesson.exercise}</p>
            <button className="button" onClick={onExperiment}>
              Test this in the live lab →
            </button>
          </section>
          <section className="lesson-references">
            <h3>Sources & further reading</h3>
            <p>
              Original explanations and worked examples for this lab. Technical
              definitions are checked against primary references; tutorials
              provide additional reading.
            </p>
            {d.references.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noreferrer">
                <span>{r.title} ↗</span>
                <small>{r.kind}</small>
              </a>
            ))}
          </section>
          <div className="lesson-next">
            <div>
              <span className="eyebrow">READY TO TEST YOUR INTUITION?</span>
              <p>One short question to check the central idea.</p>
            </div>
            <button className="button primary" onClick={onCheck}>
              Knowledge check →
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
