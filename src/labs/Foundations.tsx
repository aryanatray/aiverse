import { useCallback, useEffect, useState } from "react";
import {
  LabFrame,
  Range,
  Select,
  Metrics,
  Playback,
  Plot,
  LossChart,
  usePlayback,
} from "../components/UI";
import {
  dataset,
  regressionStep,
  regressionLoss,
  kmeansStep,
  sigmoid,
  type Point,
} from "../lib/math";
import { useConfig, fixed, type LabProps } from "./core";
export function OptimizationMap({
  trace,
  compact = false,
}: {
  trace: Point[];
  compact?: boolean;
}) {
  const px = (x: number) => 300 + x * 62.5,
    py = (y: number) => 160 - y * 32.5;
  const last = trace.at(-1)!;
  return (
    <Plot label="Quadratic loss contours and gradient descent trajectory">
      <defs>
        <radialGradient id={compact ? "hero-bg" : "lab-bg"}>
          <stop stopColor="#c9df8f" stopOpacity=".7" />
          <stop offset="1" stopColor="#edf3e5" stopOpacity=".3" />
        </radialGradient>
      </defs>
      <ellipse
        cx="300"
        cy="160"
        rx="240"
        ry="123"
        fill={`url(#${compact ? "hero-bg" : "lab-bg"})`}
      />
      {[0.35, 0.7, 1.1, 1.6, 2.2, 2.9, 3.7, 4.7].map((r, i) => (
        <ellipse
          key={r}
          cx="300"
          cy="160"
          rx={r * 62.5}
          ry={r * 16.25}
          fill="none"
          stroke={i % 2 ? "#9aaf80" : "#b0c298"}
          strokeWidth="1"
        />
      ))}
      <path
        d="M50 160H550M300 20V285"
        stroke="var(--axis)"
        strokeDasharray="3 5"
      />
      <text x="536" y="181" className="svg-label">
        w₁
      </text>
      <text x="310" y="31" className="svg-label">
        w₂
      </text>
      <circle cx="300" cy="160" r="5" fill="#9fb868" />
      <polyline
        points={trace
          .filter((p) => Math.abs(p.x) < 5 && Math.abs(p.y) < 5)
          .map((p) => `${px(p.x)},${py(p.y)}`)
          .join(" ")}
        fill="none"
        stroke="var(--plot-positive)"
        strokeWidth="2.4"
      />
      {trace
        .filter((p) => Math.abs(p.x) < 4 && Math.abs(p.y) < 4)
        .map((p, i) => (
          <circle
            key={i}
            cx={px(p.x)}
            cy={py(p.y)}
            r={i === 0 ? 5 : 2.4}
            fill="var(--plot-positive)"
            opacity={0.4 + (i / trace.length) * 0.6}
          />
        ))}
      {Math.abs(last.x) < 4 && Math.abs(last.y) < 4 && (
        <>
          <circle
            cx={px(last.x)}
            cy={py(last.y)}
            r="8"
            fill="#fff"
            stroke="var(--plot-positive)"
            strokeWidth="3"
          />
          <circle
            cx={px(last.x)}
            cy={py(last.y)}
            r="3"
            fill="var(--plot-positive)"
          />
        </>
      )}
      <text x="55" y="309" className="svg-label">
        L(w) = ½(w₁² + 4w₂²)
      </text>
      <text x="425" y="309" className="svg-label">
        ● minimum
      </text>
    </Plot>
  );
}
export function Mathematics(props: LabProps) {
  const { n, set } = useConfig("mathematics", props);
  const a = n("a"),
    b = n("b"),
    c = n("c"),
    d = n("d"),
    x = n("x"),
    y = n("y"),
    ox = a * x + b * y,
    oy = c * x + d * y;
  const map = (x: number, y: number) => `${300 + x * 55},${160 - y * 38}`;
  return (
    <LabFrame
      controls={
        <>
          <h3>Transformation matrix</h3>
          {["a", "b", "c", "d"].map((k) => (
            <Range
              key={k}
              label={k.toUpperCase()}
              value={n(k)}
              min={-3}
              max={3}
              step={0.1}
              onChange={(v) => set(k, v)}
            />
          ))}
          <h3>Input vector</h3>
          {["x", "y"].map((k) => (
            <Range
              key={k}
              label={k}
              value={n(k)}
              min={-2}
              max={2}
              step={0.1}
              onChange={(v) => set(k, v)}
            />
          ))}
          <button
            className="button full"
            onClick={() => {
              set("a", 0);
              set("b", -1);
              set("c", 1);
              set("d", 0);
            }}
          >
            90° rotation preset
          </button>
        </>
      }
      note="All grid lines and vectors use the same matrix multiplication. Outputs outside the visible plot are clipped."
    >
      <div className="viz-heading">
        <span>LINEAR TRANSFORMATION</span>
        <span className="tag">Live computation</span>
      </div>
      <svg
        viewBox="0 0 600 320"
        className="plot"
        role="img"
        aria-label="Original and transformed coordinate grid"
      >
        <defs>
          <clipPath id="matrix-clip">
            <rect x="30" y="15" width="540" height="280" />
          </clipPath>
          <marker
            id="vector-arrow"
            markerWidth="7"
            markerHeight="7"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0 0 6 3 0 6" fill="var(--plot-positive)" />
          </marker>
        </defs>
        <g clipPath="url(#matrix-clip)">
          {Array.from({ length: 11 }, (_, i) => i - 5).map((t) => (
            <g key={t}>
              <polyline
                points={`${map(t, -5)} ${map(t, 5)}`}
                stroke="var(--grid)"
              />
              <polyline
                points={`${map(-5, t)} ${map(5, t)}`}
                stroke="var(--grid)"
              />
              <polyline
                points={`${map(a * t + b * -5, c * t + d * -5)} ${map(a * t + b * 5, c * t + d * 5)}`}
                stroke="#94b29a"
                opacity=".5"
              />
              <polyline
                points={`${map(a * -5 + b * t, c * -5 + d * t)} ${map(a * 5 + b * t, c * 5 + d * t)}`}
                stroke="#94b29a"
                opacity=".5"
              />
            </g>
          ))}
          <path
            d={`M300 160 ${map(x, y).replace(",", " ")}`}
            stroke="var(--plot-negative)"
            strokeWidth="3"
            strokeDasharray="5 4"
          />
          <path
            d={`M300 160 ${map(ox, oy).replace(",", " ")}`}
            stroke="var(--plot-positive)"
            strokeWidth="3"
            markerEnd="url(#vector-arrow)"
          />
        </g>
      </svg>
      <div className="plot-legend">
        <span>
          <i className="dot lavender" />
          Original x
        </span>
        <span>
          <i className="dot sage" />
          Transformed Ax
        </span>
      </div>
      <Metrics
        items={[
          ["Output x", fixed(ox)],
          ["Output y", fixed(oy)],
          ["Determinant", fixed(a * d - b * c)],
          ["Area scale", fixed(Math.abs(a * d - b * c))],
        ]}
      />
    </LabFrame>
  );
}
export function Optimization(props: LabProps) {
  const { n, set } = useConfig("optimization", props);
  const [trace, setTrace] = useState<Point[]>([{ x: n("x"), y: n("y") }]),
    [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const last = trace.at(-1)!,
    loss = 0.5 * (last.x ** 2 + 4 * last.y ** 2),
    diverged = !Number.isFinite(loss) || loss > 1e7;
  const step = useCallback(() => {
    if (diverged || trace.length >= 500) return;
    const v = {
      x: n("momentum") * velocity.x + last.x,
      y: n("momentum") * velocity.y + 4 * last.y,
    };
    setVelocity(v);
    setTrace((p) => [
      ...p,
      { x: last.x - n("lr") * v.x, y: last.y - n("lr") * v.y },
    ]);
  }, [last, velocity, n("lr"), n("momentum"), diverged, trace.length]);
  const { running, setRunning } = usePlayback(step, 160);
  useEffect(() => {
    if (diverged || trace.length >= 500 || (trace.length > 2 && loss < 1e-10))
      setRunning(false);
  }, [diverged, trace.length, loss]);
  const reset = () => {
    setRunning(true);
    setTrace([{ x: n("x"), y: n("y") }]);
    setVelocity({ x: 0, y: 0 });
  };
  useEffect(() => {
    setTrace([{ x: n("x"), y: n("y") }]);
    setVelocity({ x: 0, y: 0 });
    setRunning(true);
  }, [n("x"), n("y"), n("lr"), n("momentum")]);
  return (
    <LabFrame
      controls={
        <>
          <Range
            label="Learning rate η"
            value={n("lr")}
            min={0.01}
            max={0.8}
            onChange={(v) => set("lr", v)}
          />
          <Range
            label="Momentum β"
            value={n("momentum")}
            min={0}
            max={0.95}
            step={0.05}
            onChange={(v) => set("momentum", v)}
          />
          <h3>Starting position · updates live</h3>
          <Range
            label="Initial x"
            value={n("x")}
            min={-4}
            max={4}
            step={0.1}
            onChange={(v) => set("x", v)}
          />
          <Range
            label="Initial y"
            value={n("y")}
            min={-4}
            max={4}
            step={0.1}
            onChange={(v) => set("y", v)}
          />
          <Playback
            running={running}
            onRun={() => {
              if (loss < 1e-10 && trace.length > 2) reset();
              else setRunning(!running);
            }}
            onStep={step}
            onReset={reset}
            disabled={diverged || trace.length >= 500}
          />
          <p className="control-help">
            Runs automatically. Changing a setting rebuilds the trajectory from
            your chosen start. Pause to inspect, or Step while paused.
          </p>
        </>
      }
      note={
        diverged
          ? "Divergence detected. Lower the learning rate; the trajectory restarts automatically."
          : "Actual gradient updates on a convex quadratic. Contours, trajectory, and metrics use the displayed quadratic."
      }
    >
      <div className="viz-heading">
        <span>THE LOSS LANDSCAPE</span>
        <span className="tag">2 parameters</span>
      </div>
      <OptimizationMap trace={trace} />
      <Metrics
        items={[
          ["Iteration", trace.length - 1],
          ["Loss", fixed(loss, 5)],
          ["Gradient norm", fixed(Math.hypot(last.x, 4 * last.y))],
          [
            "Status",
            diverged ? "Diverged" : loss < 1e-6 ? "Converged" : "Exploring",
          ],
        ]}
      />
      <LossChart
        history={trace.map((p) => 0.5 * (p.x * p.x + 4 * p.y * p.y))}
      />
    </LabFrame>
  );
}
export function MachineLearning(props: LabProps) {
  const { n, s, set } = useConfig("machine-learning", props);
  const algorithm = s("algorithm"),
    logistic = algorithm === "logistic";
  const [data, setData] = useState<Point[]>(() =>
    dataset(
      n("seed"),
      36,
      logistic
        ? "classification"
        : algorithm === "kmeans"
          ? "clusters"
          : "linear",
    ),
  );
  const [fit, setFit] = useState({
      w: 0,
      b: 0,
      epoch: 0,
      history: [] as number[],
      halted: false,
    }),
    [centers, setCenters] = useState<Point[]>([
      { x: -1, y: -1 },
      { x: 1, y: 1 },
    ]);
  const [draft, setDraft] = useState({ x: "0", y: "0" });
  const validPoint =
    draft.x.trim() !== "" &&
    draft.y.trim() !== "" &&
    Number.isFinite(+draft.x) &&
    Number.isFinite(+draft.y) &&
    +draft.x >= -2 &&
    +draft.x <= 2 &&
    (logistic
      ? +draft.y === 0 || +draft.y === 1
      : +draft.y >= -2.5 && +draft.y <= 3.5);
  const clusters = kmeansStep(data, centers);
  const currentInertia = data.reduce(
    (total, p, i) =>
      total +
      (p.x - centers[clusters.assignments[i]].x) ** 2 +
      (p.y - centers[clusters.assignments[i]].y) ** 2,
    0,
  );
  const reset = useCallback(() => {
    setFit({ w: 0, b: 0, epoch: 0, history: [], halted: false });
    setCenters(
      Array.from({ length: n("k") }, (_, i) => ({
        x: -1.5 + (i * 3) / (n("k") - 1),
        y: i % 2 ? 1 : -1,
      })),
    );
    setData(
      dataset(
        n("seed"),
        36,
        logistic
          ? "classification"
          : algorithm === "kmeans"
            ? "clusters"
            : "linear",
      ),
    );
  }, [algorithm, n("seed"), n("k")]);
  useEffect(reset, [reset]);
  const step = useCallback(() => {
    if (algorithm === "kmeans") {
      const next = kmeansStep(data, centers).centers;
      setCenters(next);
      if (
        next.every(
          (c, i) => Math.hypot(c.x - centers[i].x, c.y - centers[i].y) < 1e-8,
        )
      )
        setRunning(false);
      setFit((p) => ({ ...p, epoch: p.epoch + 1 }));
    } else
      setFit((p) => {
        const v = regressionStep(data, p.w, p.b, n("lr"), logistic);
        const loss = regressionLoss(data, v.w, v.b, logistic);
        if (!Number.isFinite(loss) || loss > 1e8) return { ...p, halted: true };
        return {
          ...v,
          halted: false,
          epoch: p.epoch + 1,
          history: [...p.history, loss].slice(-300),
        };
      });
  }, [algorithm, data, centers, n("lr"), logistic]);
  const { running, setRunning } = usePlayback(step);
  useEffect(() => {
    if (fit.halted) setRunning(false);
  }, [fit.halted]);
  useEffect(() => setRunning(true), [algorithm, n("seed"), n("k")]);
  useEffect(() => {
    setFit({ w: 0, b: 0, epoch: 0, history: [], halted: false });
    setRunning(true);
  }, [n("lr")]);
  const px = (x: number) => 300 + x * 110,
    py = (y: number) => 260 - (y + 2.5) * 42;
  return (
    <LabFrame
      controls={
        <>
          <Select
            label="Algorithm"
            value={algorithm}
            options={[
              ["linear", "Linear regression"],
              ["logistic", "Logistic regression"],
              ["kmeans", "K-Means clustering"],
            ]}
            onChange={(v) => set("algorithm", v)}
          />
          {algorithm === "kmeans" ? (
            <Range
              label="Clusters K"
              min={2}
              max={5}
              step={1}
              value={n("k")}
              onChange={(v) => set("k", v)}
            />
          ) : (
            <Range
              label="Learning rate"
              min={0.005}
              max={0.3}
              step={0.005}
              value={n("lr")}
              onChange={(v) => set("lr", v)}
            />
          )}
          <Range
            label="Dataset seed"
            min={1}
            max={100}
            step={1}
            value={n("seed")}
            onChange={(v) => set("seed", v)}
          />
          <Playback
            running={running}
            onRun={() => setRunning(!running)}
            onStep={step}
            disabled={fit.halted}
            onReset={() => {
              setRunning(true);
              reset();
            }}
          />
          <button
            className="button full"
            onClick={() => {
              setRunning(true);
              set("seed", n("seed") + 1);
            }}
          >
            Generate new dataset
          </button>
          <p className="control-help">
            Click the plot to add a point. For logistic regression, click above
            the midpoint for class 1 and below for class 0. Maximum 120
            observations.
          </p>
          <details className="point-editor">
            <summary>Add an observation with the keyboard</summary>
            <div className="point-inputs">
              <label>
                New point x
                <input
                  aria-label="New point x"
                  type="number"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={draft.x}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, x: e.target.value }))
                  }
                />
              </label>
              <label>
                {logistic ? "Class 0 or 1" : "New point y"}
                <input
                  aria-label="New point y"
                  type="number"
                  min={logistic ? 0 : -2.5}
                  max={logistic ? 1 : 3.5}
                  step={logistic ? 1 : 0.1}
                  value={draft.y}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, y: e.target.value }))
                  }
                />
              </label>
            </div>
            <button
              className="button full"
              disabled={!validPoint || data.length >= 120}
              onClick={() => {
                setData((p) => [...p, { x: +draft.x, y: +draft.y }]);
                setRunning(true);
              }}
            >
              Add point & fit live
            </button>
            <p className="control-help">
              x between −2 and 2.{" "}
              {logistic
                ? "Use binary labels 0 or 1."
                : "y between −2.5 and 3.5."}
            </p>
          </details>
        </>
      }
      note={
        fit.halted
          ? "Learning diverged. Lower the learning rate to restart fitting automatically."
          : "Metrics use the training sample only. This experiment does not estimate performance on unseen data."
      }
    >
      <div className="viz-heading">
        <span>
          {algorithm === "kmeans"
            ? "CLUSTER ASSIGNMENTS"
            : "DATA & MODEL PREDICTIONS"}
        </span>
        <span className="tag">Synthetic dataset</span>
      </div>
      <Plot
        label="Editable training data and fitted model"
        onClick={(x, y) => {
          setRunning(true);
          if (data.length < 120)
            setData((p) => [
              ...p,
              {
                x: Math.max(-2, Math.min(2, (x - 300) / 110)),
                y: logistic
                  ? y < 160
                    ? 1
                    : 0
                  : Math.max(-2.5, Math.min(3.5, (260 - y) / 42 - 2.5)),
              },
            ]);
        }}
      >
        {algorithm !== "kmeans" && (
          <polyline
            points={Array.from({ length: 81 }, (_, i) => {
              const x = -2 + i * 0.05;
              return `${px(x)},${py(logistic ? sigmoid(fit.w * x + fit.b) : fit.w * x + fit.b)}`;
            }).join(" ")}
            fill="none"
            stroke="var(--plot-positive)"
            strokeWidth="2.5"
          />
        )}
        {data.map((p, i) => (
          <circle
            key={i}
            cx={px(p.x)}
            cy={py(p.y)}
            r="4.5"
            fill={
              algorithm === "kmeans"
                ? ["#638d71", "#aa94c3", "#db9b69", "#7c9cb7", "#c5b96e"][
                    clusters.assignments[i]
                  ]
                : "var(--plot-point)"
            }
            stroke="var(--paper)"
            strokeWidth="1.5"
          />
        ))}
        {algorithm === "kmeans" &&
          centers.map((p, i) => (
            <g key={i} transform={`translate(${px(p.x)},${py(p.y)})`}>
              <circle
                r="9"
                fill="var(--paper)"
                stroke="var(--plot-positive)"
                strokeWidth="2"
              />
              <path
                d="M-4 0h8M0-4v8"
                stroke="var(--plot-positive)"
                strokeWidth="2"
              />
            </g>
          ))}
        <text x="55" y="307" className="svg-label">
          x: feature
        </text>
        <text x="440" y="307" className="svg-label">
          y: target / position
        </text>
      </Plot>
      <Metrics
        items={[
          ["Epoch", fit.epoch],
          ["Observations", data.length],
          [
            algorithm === "kmeans" ? "Inertia" : "Training loss",
            fixed(
              algorithm === "kmeans"
                ? currentInertia
                : regressionLoss(data, fit.w, fit.b, logistic),
            ),
          ],
          [
            "Model",
            algorithm === "kmeans"
              ? `${centers.length} centroids`
              : `${fixed(fit.w, 2)}x + ${fixed(fit.b, 2)}`,
          ],
        ]}
      />
      <LossChart history={fit.history} />
    </LabFrame>
  );
}
