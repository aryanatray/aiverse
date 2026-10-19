import { useContext, useState } from "react";
import { LabRuntime, type Metric } from "../lib/LabRuntime";
import { lessonById, type LabId } from "../lib/curriculum";
import { details } from "../lib/lessonDetails";
import type { Config } from "../lib/storage";
export function liveExplanation(
  id: LabId,
  c: Config,
  metrics: Metric[],
): string {
  const n = (key: string) => Number(c[key]),
    s = (key: string) => String(c[key]),
    metric = (key: string) =>
      String(metrics.find((m) => m[0] === key)?.[1] ?? "—");
  switch (id) {
    case "mathematics": {
      const det = n("a") * n("d") - n("b") * n("c");
      return Math.abs(det) < 1e-9
        ? "The determinant is zero. The transformed plane collapses, so this map loses at least one independent direction."
        : `Determinant ${det.toFixed(2)}: area scales by ${Math.abs(det).toFixed(2)}×${det < 0 ? " and orientation reverses" : ""}. The output arrow is A times your current input vector.`;
    }
    case "optimization":
      return `${n("lr") >= 0.5 ? "This rate is outside the plain-GD convergence range for this quadratic. Watch for oscillation or divergence." : `With η = ${n("lr")}, plain gradient descent is inside this quadratic’s stable range.`} ${n("momentum") > 0 ? "Momentum changes the stability behavior; the plain-GD bound alone no longer guarantees convergence." : ""} Current loss: ${metric("Loss")}.`;
    case "machine-learning":
      return s("algorithm") === "kmeans"
        ? `${n("k")} centroids compete for each point. The current sum of squared distances is ${metric("Inertia")}; assignments and means update together.`
        : s("algorithm") === "logistic"
          ? `The curve shows class-1 probability, not a continuous target. Current training cross-entropy: ${metric("Training loss")}.`
          : `The line predicts y = wx + b. Current fit: ${metric("Model")}. Training MSE: ${metric("Training loss")}.`;
    case "neural-network":
      return `${n("depth")} hidden layer${n("depth") === 1 ? "" : "s"} × ${n("width")} neurons with ${s("activation")}. ${s("optimizer") === "adam" ? "Adam scales updates using gradient moments." : "Plain full-batch gradient updates use one global learning rate."} Current cross-entropy: ${metric("Binary cross-entropy")}.`;
    case "fine-tuning":
      return s("tab") === "lora"
        ? `Rank ${n("rank")} uses ${8 * n("rank")} adapter values for a 16-value base. Scaling α/r is ${(n("alpha") / n("rank")).toFixed(2)}.${n("rank") >= 2 ? " At this tiny scale, this no longer saves parameters." : ""}`
        : c.freezeW && c.freezeB
          ? "Both parameters are frozen. Predictions and loss are evaluated, but neither parameter can update."
          : `${c.freezeW ? "The slope is frozen: the line can only shift vertically." : c.freezeB ? "The intercept is frozen: training can only change the slope." : "Slope and intercept are both trainable."} Current training MSE: ${metric("Training MSE")}.`;
    case "transformers":
      return `${c.causal ? "Future-token cells are masked to exactly zero. The first query can only use itself." : "Each query may use every position, including future ones."} Temperature ${n("temperature").toFixed(1)} ${n("temperature") < 1 ? "concentrates" : n("temperature") > 1 ? "spreads" : "leaves unchanged"} the softmax distribution relative to T = 1.`;
    case "sampling":
      return n("k") === 1
        ? "Top-K = 1 leaves a single candidate. Every draw must select the highest-logit token, regardless of seed."
        : `Temperature ${n("temperature").toFixed(2)} reshapes the scores. Top-K keeps up to ${n("k")} tokens, then Top-P = ${n("p").toFixed(2)} narrows that set. ${metric("Candidates")} candidates currently survive.`;
    case "rag":
      return `Chunks use ${n("size")} words with ${n("overlap")} repeated boundary words. ${s("method") === "bm25" ? "BM25 uses length normalization and saturating term frequency." : "TF-IDF uses cosine similarity between lexical vectors."} Top-K selects up to ${n("k")} positive-scoring passages; it does not certify their relevance.`;
    case "agents":
      return `${s("failure") === "persistent" ? "A persistent timeout exhausts retries." : s("failure") === "transient" ? "The first tool call times out; a retry can recover." : "No injected tool failure."} Budget ${n("retries")} permits at most ${n("retries") + 1} total attempts. ${c.approval ? "Human approval will pause the workflow until you explicitly approve." : "The read-only response does not require approval."}`;
    case "reinforcement":
      return `Exploration is ${Math.round(n("epsilon") * 100)}%: that fraction of decisions sample a random action. γ = ${n("gamma")} controls future-reward influence. Last episode reward: ${metric("Last reward")}. Arrows show the greedy policy, which can differ from an exploratory path.`;
    case "systems":
      return c.failed
        ? "The backend is unavailable. Cache hits can still be served under this simplified failure model."
        : `Approximate backend demand is ${(n("arrival") * (1 - n("cache"))).toFixed(1)} req/s; capacity is ${((n("replicas") * 1000) / n("service")).toFixed(1)} req/s. ${n("arrival") * (1 - n("cache")) >= (n("replicas") * 1000) / n("service") ? "Demand reaches capacity: no finite steady-state queueing delay exists." : "More headroom reduces the delay estimate."}`;
  }
}
export function FlowDiagram({
  steps,
  label,
}: {
  steps: string[];
  label: string;
}) {
  return (
    <svg
      className="concept-flow"
      viewBox={`0 0 244 ${steps.length * 51 - 11}`}
      role="img"
      aria-label={label}
    >
      {steps.map((s, i) => (
        <g key={s}>
          <rect
            x="1"
            y={i * 51 + 1}
            width="242"
            height="34"
            rx="7"
            fill="var(--bg)"
            stroke="var(--line)"
          />
          <text
            x="122"
            y={i * 51 + 22}
            textAnchor="middle"
            fill="var(--ink)"
            fontSize="10"
          >
            {s}
          </text>
          {i < steps.length - 1 && (
            <path
              d={`M122 ${i * 51 + 37}v11m-3-3 3 3 3-3`}
              fill="none"
              stroke="var(--axis)"
            />
          )}
        </g>
      ))}
    </svg>
  );
}
export default function ConceptGuide() {
  const runtime = useContext(LabRuntime);
  const [expanded, setExpanded] = useState(false);
  if (!runtime) return null;
  const d = details[runtime.id],
    lesson = lessonById[runtime.id];
  return (
    <aside
      className={`concept-guide ${expanded ? "expanded" : ""}`}
      aria-label="Live concept guide"
    >
      <div className="guide-title">
        <span className="eyebrow">LEARN AS YOU EXPLORE</span>
        <span className="guide-bookmark">GUIDE</span>
      </div>
      <h2>{lesson.title}</h2>
      <p className="guide-summary">{d.summary}</p>
      <section
        className="live-insight"
        aria-label="Current parameter interpretation"
      >
        <span className="eyebrow">
          <i className="status-dot" />
          WHAT YOUR SETTINGS MEAN
        </span>
        <p>{liveExplanation(runtime.id, runtime.config, runtime.metrics)}</p>
      </section>
      <button
        className="guide-toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {expanded ? "Show less" : "How to read this · key terms & flow"}{" "}
        <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      <div className="guide-extras">
        <details className="guide-details" open>
          <summary>How to read the canvas</summary>
          <p>{d.readCanvas}</p>
        </details>
        <FlowDiagram
          steps={
            runtime.id === "fine-tuning" && runtime.config.tab === "lora"
              ? [
                  "Frozen matrix W",
                  "Low-rank factors A and B",
                  "Scale the product (α/r)BA",
                  "Compose W′ and multiply",
                ]
              : d.flow
          }
          label={`${lesson.title}: computation flow`}
        />
        <details className="guide-details" open>
          <summary>Three ideas to know</summary>
          <dl>
            {d.terms.map(([term, definition]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{definition}</dd>
              </div>
            ))}
          </dl>
        </details>
        <div className="guide-try">
          <span className="eyebrow">TRY THIS NEXT</span>
          <p>{d.tryThis}</p>
        </div>
      </div>
      <button className="button full" onClick={runtime.onLearn}>
        Read the full explanation <span aria-hidden="true">↗</span>
      </button>
    </aside>
  );
}
