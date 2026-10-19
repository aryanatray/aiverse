import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LabFrame,
  Range,
  Select,
  Toggle,
  Metrics,
  Playback,
  Icon,
  usePlayback,
} from "../components/UI";
import { qInitial, qEpisode, queueModel } from "../lib/math";
import { initialAgent, stepAgent, type AgentConfig } from "../lib/agent";
import { useConfig, fixed, type LabProps } from "./core";
export function Agents(props: LabProps) {
  const { n, s, b, set } = useConfig("agents", props);
  const [state, setState] = useState(initialAgent);
  const config: AgentConfig = {
    failure: s("failure"),
    retries: n("retries"),
    approval: b("approval"),
    strategy: s("strategy"),
    tool: s("tool"),
    prompt: s("prompt"),
  };
  const step = useCallback(
    () => setState((p) => stepAgent(p, config)),
    [
      s("failure"),
      n("retries"),
      b("approval"),
      s("strategy"),
      s("tool"),
      s("prompt"),
    ],
  );
  const { running, setRunning } = usePlayback(step, 500);
  useEffect(() => {
    setState(initialAgent());
    setRunning(true);
  }, [
    s("failure"),
    n("retries"),
    b("approval"),
    s("strategy"),
    s("tool"),
    s("prompt"),
  ]);
  useEffect(() => {
    if (["waiting", "failed", "complete"].includes(state.status))
      setRunning(false);
  }, [state.status]);
  const nodes = [
    "Route",
    s("strategy") === "parallel" ? "Parallel tools" : "Retrieve",
    "Validate",
    "Approve",
    "Respond",
  ];
  return (
    <>
      <LabFrame
        controls={
          <>
            <label className="text-control">
              Task
              <input
                value={s("prompt")}
                maxLength={150}
                onChange={(e) => set("prompt", e.target.value)}
              />
            </label>
            <label className="text-control">
              Validation tool label
              <input
                value={s("tool")}
                maxLength={50}
                onChange={(e) => set("tool", e.target.value)}
              />
            </label>
            <Select
              label="Execution strategy"
              value={s("strategy")}
              options={[
                ["sequential", "Sequential tools"],
                ["parallel", "Simulated parallel tools"],
              ]}
              onChange={(v) => set("strategy", v)}
            />
            <Select
              label="Inject a tool failure"
              value={s("failure")}
              options={[
                ["none", "No failure"],
                ["transient", "Transient timeout"],
                ["persistent", "Persistent timeout"],
              ]}
              onChange={(v) => set("failure", v)}
            />
            <Range
              label="Retry budget"
              value={n("retries")}
              min={0}
              max={4}
              step={1}
              onChange={(v) => set("retries", v)}
            />
            <Toggle
              label="Require human approval"
              value={b("approval")}
              onChange={(v) => set("approval", v)}
            />
            <Playback
              running={running}
              onRun={() => setRunning(!running)}
              onStep={step}
              onReset={() => {
                setState(initialAgent());
                setRunning(true);
              }}
              disabled={["waiting", "complete", "failed"].includes(
                state.status,
              )}
            />
            {state.status === "waiting" && (
              <button
                className="button primary full"
                onClick={() => {
                  setState((p) => stepAgent(p, config, true));
                  setRunning(true);
                }}
              >
                Approve this response
              </button>
            )}
            <p className="control-help">
              Configuration changes replay the workflow automatically. Approval
              still requires your explicit action. No external tools are
              invoked.
            </p>
          </>
        }
        note="Deterministic educational simulation. All results and latencies are illustrative; no framework, model, or external tool is executed."
      >
        <div className="viz-heading">
          <span>BOUNDED WORKFLOW</span>
          <span
            className={`tag ${state.status === "failed" ? "error-tag" : ""}`}
          >
            {state.status}
          </span>
        </div>
        <div className="agent-flow">
          {nodes.map((name, i) => (
            <div
              key={i}
              className={`agent-stage ${state.cursor > i ? "done" : state.cursor === i ? "current" : ""} ${i === 2 && state.status === "failed" ? "failed" : ""}`}
            >
              <div className="agent-node-icon">
                <Icon
                  name={["workflow", "search", "settings", "check", "book"][i]}
                  size={25}
                />
              </div>
              <span className="eyebrow">STEP {i + 1}</span>
              <strong>{name}</strong>
              {state.cursor > i && <Icon name="check" size={15} />}
            </div>
          ))}
        </div>
        <div className="agent-state">
          <span
            className={`status-dot ${state.status === "failed" ? "bad" : ""}`}
          />
          <strong>
            {state.status === "idle"
              ? "Ready to execute"
              : state.status === "waiting"
                ? "Paused at the human approval gate"
                : state.status === "failed"
                  ? "Stopped safely: retry budget exhausted"
                  : state.status === "complete"
                    ? "Workflow completed"
                    : "Execution in progress"}
          </strong>
          <p>
            {state.events.at(-1)?.output ||
              "Run the workflow or step through each transition."}
          </p>
        </div>
        <Metrics
          items={[
            ["Trace events", state.events.length],
            ["Tool attempts", state.attempts],
            [
              "Simulated latency",
              `${state.events.reduce((a, e) => a + e.ms, 0)} ms`,
            ],
            ["External calls", 0],
          ]}
        />
      </LabFrame>
      <div className="trace-panel">
        <div className="panel-heading">
          <Icon name="layers" size={17} />
          Execution trace <span className="tag">Inputs & outputs</span>
        </div>
        {state.events.length ? (
          <ol>
            {state.events.map((e, i) => (
              <li key={i} className={e.status}>
                <span className="trace-number">{i + 1}</span>
                <div>
                  <strong>{e.step}</strong>
                  <p>IN · {e.input}</p>
                  <p>OUT · {e.output}</p>
                </div>
                <code>{e.ms} ms</code>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty-state">
            No events yet. Step through the workflow to inspect its state.
          </p>
        )}
      </div>
    </>
  );
}
const arrows = ["↑", "→", "↓", "←"];
export function Reinforcement(props: LabProps) {
  const { n, s, set } = useConfig("reinforcement", props);
  const obstacles = useMemo(
    () => [
      ...new Set(
        s("obstacles")
          .split(",")
          .map(Number)
          .filter((v) => Number.isInteger(v) && v > 0 && v < 24),
      ),
    ],
    [s("obstacles")],
  );
  const [state, setState] = useState(() => qInitial(n("seed")));
  const reset = useCallback(() => setState(qInitial(n("seed"))), [n("seed")]);
  const step = useCallback(
    () =>
      setState((p) =>
        p.episode >= 500
          ? p
          : qEpisode(
              p,
              n("alpha"),
              n("gamma"),
              n("epsilon"),
              obstacles,
              n("reward"),
            ),
      ),
    [n("alpha"), n("gamma"), n("epsilon"), n("reward"), obstacles],
  );
  const { running, setRunning } = usePlayback(step, 100);
  useEffect(() => {
    reset();
    setRunning(true);
  }, [obstacles, n("reward"), n("seed"), n("alpha"), n("gamma"), n("epsilon")]);
  useEffect(() => {
    if (state.episode >= 500) setRunning(false);
  }, [state.episode]);
  const pathSet = new Set(state.path);
  return (
    <LabFrame
      controls={
        <>
          <Range
            label="Learning rate α"
            min={0.01}
            max={1}
            value={n("alpha")}
            onChange={(v) => set("alpha", v)}
          />
          <Range
            label="Discount factor γ"
            min={0}
            max={0.99}
            value={n("gamma")}
            onChange={(v) => set("gamma", v)}
          />
          <Range
            label="Exploration ε"
            min={0}
            max={1}
            value={n("epsilon")}
            onChange={(v) => set("epsilon", v)}
          />
          <Range
            label="Goal reward"
            min={0.1}
            max={5}
            step={0.1}
            value={n("reward")}
            onChange={(v) => set("reward", v)}
          />
          <Range
            label="Random seed"
            min={1}
            max={100}
            step={1}
            value={n("seed")}
            onChange={(v) => set("seed", v)}
          />
          <Playback
            running={running}
            onRun={() => {
              if (state.episode >= 500) {
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
            Step trains one bounded episode. Click cells to toggle obstacles.
            Start and goal remain open. Settings restart a comparable live run,
            capped at 500 episodes.
          </p>
        </>
      }
      note="Actual tabular Q-learning. Episodes stop at the goal or after 100 transitions. Displayed success rate includes truncated episodes."
    >
      <div className="viz-heading">
        <span>POLICY & STATE VALUES</span>
        <span className="tag">5 × 5 environment</span>
      </div>
      <div className="q-grid">
        {state.q.map((row, i) => {
          const best = row.indexOf(Math.max(...row)),
            wall = obstacles.includes(i);
          return (
            <button
              key={i}
              disabled={i === 0 || i === 24}
              aria-label={`Cell ${i + 1}${wall ? ", obstacle" : ""}`}
              onClick={() =>
                set(
                  "obstacles",
                  (obstacles.includes(i)
                    ? obstacles.filter((v) => v !== i)
                    : [...obstacles, i]
                  ).join(","),
                )
              }
              className={`${wall ? "wall" : ""} ${i === 0 ? "start" : i === 24 ? "goal" : ""} ${pathSet.has(i) ? "visited" : ""}`}
            >
              <strong>
                {wall ? "" : i === 0 ? "S" : i === 24 ? "★" : arrows[best]}
              </strong>
              <small>
                {wall
                  ? "obstacle"
                  : i === 24
                    ? "goal"
                    : fixed(Math.max(...row), 2)}
              </small>
            </button>
          );
        })}
      </div>
      <div className="plot-legend">
        <span>
          <i className="dot sage" />
          Last episode path
        </span>
        <span>Step cost −0.04</span>
        <span>100-step cap</span>
      </div>
      <Metrics
        items={[
          ["Episodes", state.episode],
          ["Last reward", fixed(state.reward, 2)],
          [
            "Success rate",
            state.episode
              ? `${Math.round((state.success / state.episode) * 100)}%`
              : "—",
          ],
          ["Last path length", state.path.length - 1],
        ]}
      />
    </LabFrame>
  );
}
export function Systems(props: LabProps) {
  const { n, b, set } = useConfig("systems", props);
  const result = queueModel(
    n("arrival"),
    n("service"),
    n("replicas"),
    n("cache"),
    b("failed"),
  );
  return (
    <LabFrame
      controls={
        <>
          <Range
            label="Arrival rate · requests / s"
            min={1}
            max={100}
            step={1}
            value={n("arrival")}
            onChange={(v) => set("arrival", v)}
          />
          <Range
            label="Service time · ms / request"
            min={20}
            max={500}
            step={10}
            value={n("service")}
            onChange={(v) => set("service", v)}
          />
          <Range
            label="Backend replicas"
            min={1}
            max={8}
            step={1}
            value={n("replicas")}
            onChange={(v) => set("replicas", v)}
          />
          <Range
            label="Cache hit ratio"
            min={0}
            max={0.95}
            step={0.05}
            value={n("cache")}
            onChange={(v) => set("cache", v)}
            format={(v) => `${Math.round(v * 100)}%`}
          />
          <Toggle
            label="Inject backend outage"
            value={b("failed")}
            onChange={(v) => set("failed", v)}
          />
          <p className="control-help">
            Assumes Poisson arrivals, exponential service, an unbounded queue,
            perfect load pooling, and instant cache hits. This is a teaching
            approximation.
          </p>
        </>
      }
      note="Utilization-based delay heuristic, not an exact multi-server queue. Values are teaching estimates, not measured performance."
    >
      <div className="viz-heading">
        <span>CAPACITY, CACHING & FAILURE PROPAGATION</span>
        <span className="tag">Conceptual system</span>
      </div>
      <div className="system-flow">
        <div>
          <Icon name="workflow" size={30} />
          <strong>Gateway</strong>
          <small>{n("arrival")} req/s</small>
        </div>
        <Icon name="arrow" />
        <div>
          <Icon name="layers" size={30} />
          <strong>Cache</strong>
          <small>{Math.round(n("cache") * 100)}% hits</small>
        </div>
        <Icon name="arrow" />
        <div
          className={b("failed") ? "failed" : !result.stable ? "saturated" : ""}
        >
          <Icon name="network" size={30} />
          <strong>Model service</strong>
          <small>
            {b("failed") ? "UNAVAILABLE" : `${n("replicas")} replicas`}
          </small>
        </div>
      </div>
      <div className="capacity-panel">
        <div>
          <span>Backend utilization</span>
          <strong>
            {b("failed")
              ? "Outage"
              : `${Math.round(result.utilization * 100)}%`}
          </strong>
        </div>
        <div className="capacity-bar">
          <span
            className={!result.stable ? "danger" : ""}
            style={{ width: `${Math.min(result.utilization * 100, 100)}%` }}
          />
        </div>
        <p>
          {b("failed")
            ? "Backend requests fail; cache hits can still be served."
            : result.stable
              ? "Capacity headroom remains under these assumptions."
              : "Saturated: there is no finite steady-state queueing delay."}
        </p>
      </div>
      <Metrics
        items={[
          ["Backend capacity", `${fixed(result.capacity, 1)} /s`],
          ["Backend demand", `${fixed(n("arrival") * (1 - n("cache")), 1)} /s`],
          ["Backend latency", `${fixed(result.latency, 1)} ms`],
          [
            "Served · incl. cache",
            `${fixed(n("arrival") * n("cache") + result.throughput, 1)} /s`,
          ],
        ]}
      />
    </LabFrame>
  );
}
