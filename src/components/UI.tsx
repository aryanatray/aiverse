import ConceptGuide from "./ConceptGuide";
import { LabRuntime } from "../lib/LabRuntime";
import { useContext, useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
export function Icon({
  name = "spark",
  size = 20,
}: {
  name?: string;
  size?: number;
}) {
  const paths: Record<string, ReactNode> = {
    explore: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m16 8-2.5 5.5L8 16l2.5-5.5Z" />
      </>
    ),
    path: (
      <>
        <circle cx="5" cy="5" r="2" />
        <circle cx="19" cy="19" r="2" />
        <path d="M5 7v6a4 4 0 0 0 4 4h6a4 4 0 0 0 0-8h-4M19 17v-4" />
      </>
    ),
    lab: (
      <>
        <path d="M9 3h6M10 3v6L4 19a1.3 1.3 0 0 0 1 2h14a1.3 1.3 0 0 0 1-2L14 9V3M7 15h10" />
        <circle cx="11" cy="17" r=".5" />
      </>
    ),
    graph: (
      <>
        <path d="m6 6 12 0M6 6l6 12m6-12-6 12" />
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="12" cy="18" r="3" />
      </>
    ),
    challenge: (
      <>
        <path d="M8 3h8v7a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 14v6m-4 1h8" />
      </>
    ),
    book: (
      <>
        <path d="M12 5c-3-2-7-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-2-1-6-1-9 1Zm0 0v15" />
      </>
    ),
    settings: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="9" cy="7" r="3" />
        <circle cx="15" cy="17" r="3" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    play: <path d="m8 4 12 8-12 8Z" />,
    pause: <path d="M8 4v16M16 4v16" />,
    step: (
      <>
        <path d="m5 5 10 7-10 7ZM19 5v14" />
      </>
    ),
    reset: (
      <>
        <path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    save: (
      <>
        <path d="M4 3h14l3 3v15H3V3Zm3 0v6h10V3M7 21v-7h10v7" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4" />
      </>
    ),
    close: <path d="m5 5 14 14M5 19 19 5" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3Z" />
      </>
    ),
    vector: (
      <>
        <path d="M4 20 19 5M4 20V4m0 16h16m-7-15h6v6" />
      </>
    ),
    curve: (
      <>
        <path d="M3 4v17h18M5 6c5 0 4 12 9 12s4-7 8-8" />
        <circle cx="14" cy="18" r="2" />
      </>
    ),
    scatter: (
      <>
        <path d="M3 3v18h18M5 17 20 5" />
        <circle cx="8" cy="12" r="1" />
        <circle cx="13" cy="14" r="1" />
        <circle cx="17" cy="5" r="1" />
      </>
    ),
    network: (
      <>
        <path d="m5 5 7 7-7 7m0-14 14 0-7 7 7 7H5m7-7h7" />
        <circle cx="5" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="5" r="2" />
        <circle cx="19" cy="19" r="2" />
      </>
    ),
    sliders: (
      <>
        <path d="M5 3v18M12 3v18M19 3v18" />
        <path d="M2 8h6m1 8h6m1-10h6" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
      </>
    ),
    bars: (
      <>
        <path d="M4 20V10m5 10V5m5 15V8m5 12V3" />
      </>
    ),
    pipeline: (
      <>
        <rect x="2" y="8" width="5" height="8" rx="1" />
        <rect x="17" y="8" width="5" height="8" rx="1" />
        <path d="M7 12h10m-5-4 4 4-4 4" />
      </>
    ),
    workflow: (
      <>
        <rect x="2" y="9" width="5" height="6" rx="1" />
        <rect x="17" y="2" width="5" height="6" rx="1" />
        <rect x="17" y="16" width="5" height="6" rx="1" />
        <path d="M7 12h5V5h5m-5 7v7h5" />
      </>
    ),
    layers: (
      <>
        <path d="m12 2 10 6-10 6L2 8ZM2 12l10 6 10-6M2 16l10 6 10-6" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v1" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.spark}
    </svg>
  );
}
export function Range({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
  format?: (n: number) => string;
}) {
  const id = useId();
  return (
    <div className="control">
      <div className="control-label">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>
          {format ? format(value) : Number(value.toFixed(3))}
        </output>
      </div>
      <input
        id={id}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(+e.target.value)}
      />
    </div>
  );
}
export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (s: string) => void;
}) {
  const id = useId();
  return (
    <div className="control">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}
export function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <label className="toggle-label">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
export function Metrics({ items }: { items: [string, string | number][] }) {
  const runtime = useContext(LabRuntime);
  const report = runtime?.reportMetrics;
  const signature = JSON.stringify(items);
  useEffect(() => {
    report?.(JSON.parse(signature));
  }, [report, signature]);
  return (
    <div className="metrics">
      {items.map(([l, v]) => (
        <div key={l}>
          <span>{l}</span>
          <strong>{v}</strong>
        </div>
      ))}
    </div>
  );
}
export function Playback({
  running,
  onRun,
  onStep,
  onReset,
  disabled = false,
}: {
  running: boolean;
  onRun: () => void;
  onStep: () => void;
  onReset: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="playback">
      <button className="button primary" onClick={onRun} disabled={disabled}>
        <Icon name={running ? "pause" : "play"} size={16} />
        {running ? "Pause" : "Run"}
      </button>
      <button
        className="button"
        onClick={onStep}
        disabled={disabled || running}
      >
        <Icon name="step" size={16} />
        Step
      </button>
      <button
        className="icon-button"
        onClick={onReset}
        aria-label="Reset experiment"
        title="Reset experiment"
      >
        <Icon name="reset" size={17} />
      </button>
    </div>
  );
}
/** Keep the timer stable while reading the latest step closure. Hidden lessons suspend work. */
export function usePlayback(step: () => void, delay = 160) {
  const runtime = useContext(LabRuntime);
  const active = runtime?.active ?? true;
  const [running, setRunning] = useState(true);
  const [visible, setVisible] = useState(
    () => document.visibilityState !== "hidden",
  );
  const latest = useRef(step);
  useEffect(() => {
    latest.current = step;
  }, [step]);
  useEffect(() => {
    const onVisibility = () =>
      setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  useEffect(() => {
    if (!running || !active || !visible) return;
    const timer = setInterval(() => latest.current(), delay);
    return () => clearInterval(timer);
  }, [running, active, visible, delay]);
  const report = runtime?.reportPlaying;
  useEffect(() => {
    report?.(running && active && visible);
  }, [report, running, active, visible]);
  return { running, setRunning };
}
export function Plot({
  children,
  onClick,
  label = "Interactive plot",
  height = 320,
}: {
  children?: ReactNode;
  onClick?: (x: number, y: number) => void;
  label?: string;
  height?: number;
}) {
  return (
    <svg
      className="plot"
      role="img"
      aria-label={label}
      viewBox={`0 0 600 ${height}`}
      onClick={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        onClick?.(
          ((e.clientX - b.left) / b.width) * 600,
          ((e.clientY - b.top) / b.height) * height,
        );
      }}
    >
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <path d={`M${50 + i * 50} 20V${height - 35}`} stroke="var(--grid)" />
          <path
            d={`M50 ${20 + (i * (height - 55)) / 10}H550`}
            stroke="var(--grid)"
          />
        </g>
      ))}
      {children}
    </svg>
  );
}
export function LossChart({ history }: { history: number[] }) {
  const max = Math.max(0.01, ...history);
  return (
    <svg
      viewBox="0 0 600 100"
      className="loss-chart"
      role="img"
      aria-label="Training loss history"
    >
      <path d="M0 95H600" stroke="var(--line)" />
      <polyline
        fill="none"
        stroke="var(--green)"
        strokeWidth="2"
        points={history
          .map(
            (v, i) =>
              `${(i / Math.max(1, history.length - 1)) * 590 + 5},${95 - Math.min(v / max, 1) * 85}`,
          )
          .join(" ")}
      />
      <text x="8" y="14" className="svg-label">
        LOSS
      </text>
    </svg>
  );
}
export function LabFrame({
  children,
  controls,
  note,
}: {
  children: ReactNode;
  controls: ReactNode;
  note?: string;
}) {
  const runtime = useContext(LabRuntime);
  return (
    <>
      <div className={`lab-grid ${runtime ? "with-guide" : ""}`}>
        <div className="visual-panel">
          <div className="canvas-mode">
            <span
              className={`status-dot ${runtime?.playing === false && !(runtime?.id === "fine-tuning" && runtime.config.tab === "lora") ? "paused" : ""}`}
            />
            {runtime?.playing === false &&
            !(runtime?.id === "fine-tuning" && runtime.config.tab === "lora")
              ? "Paused · inspect or step through"
              : runtime?.playing &&
                  !(
                    runtime?.id === "fine-tuning" &&
                    runtime.config.tab === "lora"
                  )
                ? "Live simulation"
                : "Live calculation"}
            <span>Controls update automatically</span>
          </div>
          {children}
        </div>
        <aside className="controls-panel">
          <div className="panel-heading">
            <Icon name="sliders" size={16} />
            <span>Adjust & observe</span>
          </div>
          {controls}
        </aside>
        <ConceptGuide />
      </div>
      {note && (
        <div className="lab-note">
          <Icon name="info" size={16} />
          <span>{note}</span>
        </div>
      )}
    </>
  );
}
