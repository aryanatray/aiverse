import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LabFrame,
  Range,
  Select,
  Toggle,
  Metrics,
  Playback,
  LossChart,
  Plot,
  usePlayback,
} from "../components/UI";
import {
  createNetwork,
  networkStep,
  forward,
  dataset,
  regressionStep,
  regressionLoss,
  lora,
  rng,
  matmul,
  type Activation,
} from "../lib/math";
import { useConfig, fixed, type LabProps } from "./core";
export function Matrix({ data, label }: { data: number[][]; label: string }) {
  const max = Math.max(0.001, ...data.flat().map(Math.abs));
  return (
    <div className="matrix-wrap">
      <span className="eyebrow">{label}</span>
      <div
        className="matrix"
        style={{ gridTemplateColumns: `repeat(${data[0]?.length || 1},1fr)` }}
      >
        {data.flatMap((row, i) =>
          row.map((v, j) => (
            <span
              key={`${i}-${j}`}
              style={{
                background:
                  v < 0
                    ? `rgba(161,138,186,${0.12 + (0.7 * Math.abs(v)) / max})`
                    : `rgba(93,143,108,${0.1 + (0.65 * Math.abs(v)) / max})`,
              }}
              title={`Row ${i + 1}, column ${j + 1}: ${fixed(v, 5)}`}
            >
              {fixed(v, 2)}
            </span>
          )),
        )}
      </div>
    </div>
  );
}
export function NeuralNetwork(props: LabProps) {
  const { n, s, set } = useConfig("neural-network", props);
  const act = s("activation") as Activation;
  const [net, setNet] = useState(() =>
      createNetwork(n("seed"), n("width"), n("depth"), act),
    ),
    [input, setInput] = useState(1);
  const reset = useCallback(
    () => setNet(createNetwork(n("seed"), n("width"), n("depth"), act)),
    [n("width"), n("depth"), n("seed"), act, s("optimizer"), n("lr")],
  );
  useEffect(reset, [reset]);
  const step = useCallback(
    () =>
      setNet((p) =>
        p.epoch >= 5000
          ? p
          : networkStep(p, n("lr"), act, s("optimizer") === "adam"),
      ),
    [n("lr"), act, s("optimizer")],
  );
  const batch = useCallback(() => {
    for (let i = 0; i < 5; i++) step();
  }, [step]);
  const { running, setRunning } = usePlayback(batch, 120);
  useEffect(() => {
    if (net.epoch >= 5000) setRunning(false);
  }, [net.epoch]);
  useEffect(() => setRunning(true), [reset]);
  const inputs = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    f = forward(net, inputs[input], act),
    sizes = [2, ...net.weights.map((m) => m.length)],
    coords = sizes.map((size, l) =>
      Array.from({ length: size }, (_, j) => ({
        x: 65 + (l * 470) / (sizes.length - 1),
        y: 160 + (j - (size - 1) / 2) * Math.min(38, 240 / size),
      })),
    );
  return (
    <LabFrame
      controls={
        <>
          <Select
            label="Hidden activation"
            value={act}
            options={[
              ["tanh", "Tanh"],
              ["relu", "ReLU"],
              ["sigmoid", "Sigmoid"],
            ]}
            onChange={(v) => set("activation", v)}
          />
          <Range
            label="Hidden layers"
            value={n("depth")}
            min={1}
            max={3}
            step={1}
            onChange={(v) => set("depth", v)}
          />
          <Range
            label="Neurons per hidden layer"
            value={n("width")}
            min={2}
            max={8}
            step={1}
            onChange={(v) => set("width", v)}
          />
          <Select
            label="Optimizer"
            value={s("optimizer")}
            options={[
              ["sgd", "SGD"],
              ["adam", "Adam"],
            ]}
            onChange={(v) => set("optimizer", v)}
          />
          <Range
            label="Learning rate"
            value={n("lr")}
            min={0.001}
            max={0.5}
            step={0.001}
            onChange={(v) => set("lr", v)}
          />
          <Range
            label="Initialization seed"
            value={n("seed")}
            min={1}
            max={100}
            step={1}
            onChange={(v) => set("seed", v)}
          />
          <Playback
            running={running}
            onRun={() => {
              if (net.epoch >= 5000) {
                reset();
                setRunning(true);
              } else setRunning(!running);
            }}
            onStep={step}
            onReset={() => {
              setRunning(true);
              reset();
            }}
          />
          <p className="control-help">
            Live mode trains 5 epochs per tick; Step trains one. Architecture,
            activation, optimizer, and rate changes restart automatically.
            Capped at 5,000 epochs.
          </p>
        </>
      }
      note="A real, fully connected XOR classifier using full-batch backpropagation. Edge color indicates weight sign; opacity indicates magnitude."
    >
      <div className="viz-heading">
        <span>FORWARD PASS & LEARNED CONNECTIONS</span>
        <span className="tag">
          2 → {Array(n("depth")).fill(n("width")).join(" → ")} → 1
        </span>
      </div>
      <svg
        viewBox="0 0 600 320"
        className="plot"
        role="img"
        aria-label="Neural network weights and neuron activations"
      >
        {net.weights.flatMap((matrix, l) =>
          matrix.flatMap((row, j) =>
            row.map((v, k) => (
              <line
                key={`${l}-${j}-${k}`}
                x1={coords[l][k].x}
                y1={coords[l][k].y}
                x2={coords[l + 1][j].x}
                y2={coords[l + 1][j].y}
                stroke={v < 0 ? "#a38cbb" : "var(--plot-positive)"}
                strokeWidth={Math.min(3, 0.5 + Math.abs(v) * 0.4)}
                opacity={Math.min(0.75, 0.1 + Math.abs(v) * 0.15)}
              >
                <title>
                  W layer {l + 1}, neuron {j + 1}, input {k + 1}: {fixed(v, 5)}
                </title>
              </line>
            )),
          ),
        )}
        {coords.flatMap((row, l) =>
          row.map((p, j) => (
            <g key={`${l}-${j}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="16"
                fill={f.as[l][j] > 0 ? "var(--sage)" : "var(--lavender)"}
                stroke="var(--green)"
                strokeWidth="1.5"
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                className="neuron-label"
              >
                {fixed(f.as[l][j], 1)}
              </text>
              <title>
                Activation {fixed(f.as[l][j], 5)}
                {l ? `; bias ${fixed(net.biases[l - 1][j], 5)}` : ""}
              </title>
            </g>
          )),
        )}
        <text x="65" y="300" className="svg-label" textAnchor="middle">
          INPUT
        </text>
        <text x="300" y="300" className="svg-label" textAnchor="middle">
          HIDDEN REPRESENTATIONS
        </text>
        <text x="535" y="300" className="svg-label" textAnchor="middle">
          OUTPUT
        </text>
      </svg>
      <div className="prediction-row">
        {inputs.map((x, i) => (
          <button
            key={i}
            className={`prediction ${input === i ? "selected" : ""}`}
            onClick={() => setInput(i)}
          >
            <span>
              {x.join(" XOR ")} = {i === 1 || i === 2 ? 1 : 0}
            </span>
            <strong>{fixed(forward(net, x, act).output)}</strong>
            <small>prediction probability</small>
          </button>
        ))}
      </div>
      <Metrics
        items={[
          ["Epoch", net.epoch],
          ["Binary cross-entropy", fixed(net.loss, 4)],
          ["Gradient norm", fixed(net.gradNorm, 4)],
          ["Parameters", net.weights.flat(2).length + net.biases.flat().length],
        ]}
      />
      <LossChart history={net.history} />
      <details className="parameter-inspector">
        <summary>Inspect every parameter & gradient</summary>
        <p>
          Current parameter values, with gradients from the last pre-update
          model. Gradients are zero before the first epoch.
        </p>
        <div className="parameter-table">
          <table>
            <thead>
              <tr>
                <th>Layer · parameter</th>
                <th>Value</th>
                <th>∂L / ∂parameter</th>
              </tr>
            </thead>
            <tbody>
              {net.weights.flatMap((matrix, l) =>
                matrix.flatMap((row, j) =>
                  row.map((v, k) => (
                    <tr key={`w-${l}-${j}-${k}`}>
                      <td>
                        L{l + 1} · W[{j},{k}]
                      </td>
                      <td>{fixed(v, 5)}</td>
                      <td>{fixed(net.weightGradients[l][j][k], 6)}</td>
                    </tr>
                  )),
                ),
              )}
              {net.biases.flatMap((row, l) =>
                row.map((v, j) => (
                  <tr key={`b-${l}-${j}`}>
                    <td>
                      L{l + 1} · b[{j}]
                    </td>
                    <td>{fixed(v, 5)}</td>
                    <td>{fixed(net.biasGradients[l][j], 6)}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </details>
    </LabFrame>
  );
}
export function FineTuning(props: LabProps) {
  const { n, s, b, set } = useConfig("fine-tuning", props);
  const data = useMemo(() => dataset(12), []),
    [fit, setFit] = useState({
      w: n("w"),
      b: n("b"),
      epoch: 0,
      history: [] as number[],
    });
  const reset = useCallback(
    () => setFit({ w: n("w"), b: n("b"), epoch: 0, history: [] }),
    [n("w"), n("b")],
  );
  useEffect(reset, [reset]);
  const step = useCallback(
    () =>
      setFit((p) => {
        const v = regressionStep(
          data,
          p.w,
          p.b,
          n("lr"),
          false,
          b("freezeW"),
          b("freezeB"),
        );
        return {
          ...v,
          epoch: p.epoch + 1,
          history: [...p.history, regressionLoss(data, v.w, v.b)].slice(-300),
        };
      }),
    [n("lr"), b("freezeW"), b("freezeB"), data],
  );
  const { running, setRunning } = usePlayback(step);
  useEffect(
    () =>
      setRunning(s("tab") === "training" && !(b("freezeW") && b("freezeB"))),
    [s("tab"), reset, n("lr"), b("freezeW"), b("freezeB")],
  );
  const rank = n("rank"),
    rand = rng(17),
    a = Array.from({ length: rank }, () =>
      Array.from({ length: 4 }, () => rand() * 0.8 - 0.4),
    ),
    bm = Array.from({ length: 4 }, () =>
      Array.from({ length: rank }, () => n("adapter") * (rand() * 2 - 1)),
    ),
    base = Array.from({ length: 4 }, (_, i) =>
      Array.from({ length: 4 }, (_, j) => (i === j ? 1 : 0)),
    ),
    adapted = lora(base, a, bm, n("alpha")),
    delta = adapted.map((row, i) => row.map((v, j) => v - base[i][j])),
    output = matmul(adapted, [[1], [0.5], [-1], [2]]).flat();
  return (
    <>
      <div className="segmented">
        <button
          className={s("tab") === "training" ? "active" : ""}
          onClick={() => set("tab", "training")}
        >
          Small-model adaptation
        </button>
        <button
          className={s("tab") === "lora" ? "active" : ""}
          onClick={() => set("tab", "lora")}
        >
          LoRA matrix lab
        </button>
      </div>
      <LabFrame
        controls={
          s("tab") === "training" ? (
            <>
              <Range
                label="Slope w · live edit restarts training"
                value={n("w")}
                min={-2}
                max={3}
                step={0.1}
                onChange={(v) => set("w", v)}
              />
              <Range
                label="Bias b · live edit restarts training"
                value={n("b")}
                min={-2}
                max={2}
                step={0.1}
                onChange={(v) => set("b", v)}
              />
              <Range
                label="Learning rate"
                value={n("lr")}
                min={0.001}
                max={0.3}
                step={0.001}
                onChange={(v) => set("lr", v)}
              />
              <Toggle
                label="Freeze slope w"
                value={b("freezeW")}
                onChange={(v) => set("freezeW", v)}
              />
              <Toggle
                label="Freeze bias b"
                value={b("freezeB")}
                onChange={(v) => set("freezeB", v)}
              />
              <Playback
                running={running}
                onRun={() => setRunning(!running)}
                onStep={step}
                onReset={() => {
                  setRunning(true);
                  reset();
                }}
              />
              <p className="control-help">
                Actual gradient descent on a small linear model. Freezing both
                parameters prevents all updates.
              </p>
            </>
          ) : (
            <>
              <Range
                label="Adapter rank r"
                min={1}
                max={4}
                step={1}
                value={rank}
                onChange={(v) => set("rank", v)}
              />
              <Range
                label="Scaling α"
                min={0}
                max={8}
                step={0.25}
                value={n("alpha")}
                onChange={(v) => set("alpha", v)}
              />
              <Range
                label="B matrix amplitude"
                min={-1}
                max={1}
                step={0.05}
                value={n("adapter")}
                onChange={(v) => set("adapter", v)}
              />
              <div className="formula compact">W′ = W + (α/r)BA</div>
              <p className="control-help">
                Base W: 4 × 4 identity.
                <br />
                A: {rank} × 4. B: 4 × {rank}.<br />
                Input: [1, 0.5, −1, 2].
                <br />
                Seeded illustrative adapters; no LLM training.
              </p>
            </>
          )
        }
        note="This lab trains a small differentiable model and computes low-rank matrix updates. It does not train a pretrained language model."
      >
        {s("tab") === "training" ? (
          <>
            <div className="viz-heading">
              <span>FROZEN PARAMETERS, VISIBLE EFFECTS</span>
              <span className="tag">Real gradient updates</span>
            </div>
            <Plot label="Adapted linear model and target data">
              {data.map((p, i) => (
                <circle
                  key={i}
                  cx={300 + p.x * 100}
                  cy={160 - p.y * 36}
                  r="4"
                  fill="#b69b80"
                  opacity=".7"
                />
              ))}
              <path
                d={`M100 ${160 - (fit.w * -2 + fit.b) * 36}L500 ${160 - (fit.w * 2 + fit.b) * 36}`}
                stroke="var(--plot-positive)"
                strokeWidth="3"
              />
              <path
                d={`M100 ${160 - (n("w") * -2 + n("b")) * 36}L500 ${160 - (n("w") * 2 + n("b")) * 36}`}
                stroke="#b69b80"
                strokeWidth="2"
                strokeDasharray="5 4"
              />
            </Plot>
            <Metrics
              items={[
                ["Epoch", fit.epoch],
                ["Current slope", fixed(fit.w)],
                ["Current bias", fixed(fit.b)],
                ["Training MSE", fixed(regressionLoss(data, fit.w, fit.b))],
              ]}
            />
            <LossChart history={fit.history} />
          </>
        ) : (
          <>
            <div className="viz-heading">
              <span>THE LOW-RANK UPDATE</span>
              <span className="tag">Actual matrix math</span>
            </div>
            <div className="matrix-composition">
              <Matrix data={base} label="Frozen W" />
              <span>+</span>
              <Matrix data={delta} label="(α/r)BA" />
              <span>=</span>
              <Matrix data={adapted} label="Adapted W′" />
            </div>
            <div className="output-vector">
              <span>W′x =</span>
              {output.map((v, i) => (
                <strong key={i}>{fixed(v)}</strong>
              ))}
            </div>
            <Metrics
              items={[
                ["Base parameters", 16],
                ["Adapter parameters", 8 * rank],
                ["Adapter / base", `${Math.round(((8 * rank) / 16) * 100)}%`],
                ["Scaling α/r", fixed(n("alpha") / rank, 2)],
              ]}
            />
            <p className="inline-explanation">
              At this toy scale, rank ≥ 2 loses the parameter-saving advantage.
              Large practical weight matrices are where low-rank factorization
              offers savings.
            </p>
          </>
        )}
      </LabFrame>
    </>
  );
}
