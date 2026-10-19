import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Icon } from "./components/UI";
import { OptimizationMap } from "./labs/Foundations";
import {
  domains,
  lessons,
  lessonById,
  paths,
  type LabId,
  type Lesson,
} from "./lib/curriculum";
import {
  loadProgress,
  loadExperiments,
  storage,
  sanitize,
  download,
  parseExperiment,
  type Config,
  type Experiment,
  type Progress,
} from "./lib/storage";
import { attention, toyEmbeddings } from "./lib/math";
import type { Point } from "./lib/math";
const DetailedLesson = lazy(() => import("./components/DetailedLesson"));
const Lab = lazy(() => import("./labs"));
type View =
  | "explore"
  | "paths"
  | "playgrounds"
  | "graph"
  | "challenges"
  | "learning"
  | "settings"
  | "lab";
const nav: [View, string, string][] = [
  ["explore", "Explore", "explore"],
  ["paths", "Learning paths", "path"],
  ["playgrounds", "Playgrounds", "lab"],
  ["graph", "Knowledge graph", "graph"],
  ["challenges", "Challenges", "challenge"],
  ["learning", "My learning", "book"],
];
class Boundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "AIverse workspace error",
      error.message,
      info.componentStack,
    );
  }
  render() {
    return this.state.error ? (
      <div className="empty-state">
        <h2>This experiment needs a reset.</h2>
        <p>Your learning progress is safe. Reload to recover.</p>
        <button className="button" onClick={() => location.reload()}>
          Reload workspace
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function initialRoute(): { view: View; id: LabId } {
  const h = location.hash.slice(1);
  if (h.startsWith("lab/")) {
    const id = h.slice(4) as LabId;
    if (Object.hasOwn(lessonById, id)) return { view: "lab", id };
  }
  return {
    view:
      nav.some(([v]) => v === h) || h === "settings" ? (h as View) : "explore",
    id: "optimization",
  };
}
function MiniArt({ id }: { id: LabId }) {
  if (id === "transformers") {
    const e = toyEmbeddings(["AI", "learns", "from", "data"]),
      a = attention(e, e, e, true).weights;
    return (
      <svg viewBox="0 0 320 130" aria-hidden="true">
        {a.flatMap((r, i) =>
          r.map((v, j) => (
            <rect
              key={`${i}-${j}`}
              x={95 + j * 32}
              y={4 + i * 30}
              width="27"
              height="25"
              rx="4"
              fill="#8d7ca6"
              opacity={0.15 + 0.75 * v}
            />
          )),
        )}
      </svg>
    );
  }
  if (id === "neural-network" || id === "agents" || id === "systems") {
    const ys = [[40, 90], [25, 65, 105], [45, 85], [65]];
    return (
      <svg viewBox="0 0 320 130" aria-hidden="true">
        {ys
          .slice(0, -1)
          .flatMap((r, l) =>
            r.flatMap((y, i) =>
              ys[l + 1].map((yy, j) => (
                <line
                  key={`${l}-${i}-${j}`}
                  x1={50 + l * 72}
                  y1={y}
                  x2={122 + l * 72}
                  y2={yy}
                  stroke="currentColor"
                  opacity=".18"
                />
              )),
            ),
          )}
        {ys.flatMap((r, l) =>
          r.map((y, i) => (
            <circle
              key={`${l}-${i}`}
              cx={50 + l * 72}
              cy={y}
              r={l === 3 ? 12 : 9}
              fill="var(--paper)"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          )),
        )}
      </svg>
    );
  }
  if (id === "rag" || id === "fine-tuning") {
    return (
      <svg viewBox="0 0 320 130" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <g
            key={i}
            transform={`translate(${35 + i * 92} ${35 + (i % 2) * 15})`}
          >
            <rect
              width="64"
              height="52"
              rx="8"
              fill="var(--paper)"
              stroke="currentColor"
              strokeOpacity=".3"
            />
            {[0, 1, 2].map((j) => (
              <path
                key={j}
                d={`M13 ${16 + j * 10}h${j === 2 ? 20 : 36}`}
                stroke="currentColor"
                strokeOpacity=".45"
              />
            ))}
            {i < 2 && (
              <path
                d="M69 26h17m-5-4 5 4-5 4"
                fill="none"
                stroke="currentColor"
              />
            )}
          </g>
        ))}
      </svg>
    );
  }
  if (id === "sampling") {
    return (
      <svg viewBox="0 0 320 130" aria-hidden="true">
        {[80, 62, 46, 35, 25, 17, 9].map((h, i) => (
          <rect
            key={i}
            x={40 + i * 35}
            y={105 - h}
            width="23"
            height={h}
            rx="4"
            fill="currentColor"
            opacity={0.7 - i * 0.07}
          />
        ))}
      </svg>
    );
  }
  if (id === "reinforcement") {
    return (
      <svg viewBox="0 0 320 130" aria-hidden="true">
        {Array.from({ length: 25 }, (_, i) => (
          <rect
            key={i}
            x={100 + (i % 5) * 23}
            y={8 + Math.floor(i / 5) * 23}
            width="19"
            height="19"
            rx="3"
            fill="currentColor"
            opacity={[7, 12, 17].includes(i) ? 0.55 : 0.13}
          />
        ))}
        <text x="198" y="111" fontSize="18" fill="currentColor">
          ★
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 320 130" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M20 ${30 + i * 18}Q90 ${125 + i * 6} 162 ${75 + i * 5}T300 ${28 + i * 15}`}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.2 + i * 0.12}
          strokeWidth={i === 2 ? 2.5 : 1}
        />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle
          key={i}
          cx={65 + i * 32}
          cy={60 + Math.sin(i) * 25}
          r="4"
          fill="var(--paper)"
          stroke="currentColor"
        />
      ))}
    </svg>
  );
}
function LabCard({
  lesson,
  open,
  completed,
}: {
  lesson: Lesson;
  open: (id: LabId) => void;
  completed: boolean;
}) {
  return (
    <button
      className={`lab-card ${lesson.accent}`}
      onClick={() => open(lesson.id)}
    >
      <div className="card-top">
        <span className="card-icon">
          <Icon name={lesson.icon} />
        </span>
        <span className="card-level">
          {completed ? (
            <>
              <Icon name="check" size={13} />
              Completed
            </>
          ) : (
            lesson.level
          )}
        </span>
      </div>
      <div className="card-art">
        <MiniArt id={lesson.id} />
      </div>
      <h3>{lesson.title}</h3>
      <p>{lesson.subtitle}</p>
      <div className="card-footer">
        <span>
          <Icon name="clock" size={13} />
          {lesson.minutes} min · Live lab + guide
        </span>
        <Icon name="arrow" size={18} />
      </div>
    </button>
  );
}
function Hero({ open }: { open: (id: LabId) => void }) {
  const [lr, setLr] = useState(0.15),
    [playing, setPlaying] = useState(true),
    [trace, setTrace] = useState<Point[]>([{ x: 3.1, y: 2.7 }]);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () =>
        setTrace((p) =>
          p.length >= 50
            ? p
            : [
                ...p,
                { x: p.at(-1)!.x * (1 - lr), y: p.at(-1)!.y * (1 - 4 * lr) },
              ],
        ),
      220,
    );
    return () => clearInterval(t);
  }, [playing, lr]);
  useEffect(() => {
    if (trace.length >= 50) setPlaying(false);
  }, [trace.length]);
  return (
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="tiny-star">✳</span> A VISUAL STUDIO FOR
          UNDERSTANDING AI
        </div>
        <h1>
          Build real intuition.
          <br />
          <em>One idea at a time.</em>
        </h1>
        <p>
          Understand the idea. Watch it work. Make it your own.
          <br className="desktop-break" />
          Guided explanations beside every experiment, so every change makes
          sense.
        </p>
        <div className="hero-actions">
          <button
            className="button primary"
            onClick={() => open("optimization")}
          >
            Start with a guided lab
            <Icon name="arrow" size={17} />
          </button>
          <span>No setup. No API keys. Just curiosity.</span>
        </div>
        <div className="hero-facts">
          <span>
            <i className="dot sage" />
            11 working labs
          </span>
          <span>15 learning domains</span>
          <span>No API keys</span>
        </div>
      </div>
      <div className="hero-demo">
        <div className="demo-bar">
          <span>
            <i className="dot sage" />
            GRADIENT DESCENT
          </span>
          <span className="live-label">LIVE EXPERIMENT</span>
        </div>
        <OptimizationMap trace={trace} compact />
        <div className="demo-bottom">
          <div>
            <small>Learning rate</small>
            <label className="sr-only" htmlFor="hero-rate">
              Preview learning rate
            </label>
            <input
              id="hero-rate"
              type="range"
              min=".02"
              max=".45"
              step=".01"
              value={lr}
              onChange={(e) => {
                setLr(+e.target.value);
                setTrace([{ x: 3.1, y: 2.7 }]);
                setPlaying(true);
              }}
            />
            <code>{lr.toFixed(2)}</code>
          </div>
          <button
            className="icon-button"
            aria-label={playing ? "Pause preview" : "Run preview"}
            onClick={() => setPlaying(!playing)}
          >
            <Icon name={playing ? "pause" : "play"} size={17} />
          </button>
          <button
            className="icon-button"
            aria-label="Reset preview"
            onClick={() => {
              setPlaying(true);
              setTrace([{ x: 3.1, y: 2.7 }]);
            }}
          >
            <Icon name="reset" size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
export default function App() {
  const route = initialRoute(),
    [view, setView] = useState<View>(route.view),
    [lab, setLab] = useState<LabId>(route.id),
    [config, setConfig] = useState<Config | undefined>(),
    [labKey, setLabKey] = useState(0),
    [snapshot, setSnapshot] = useState<Config>({}),
    [progress, setProgress] = useState<Progress>(loadProgress),
    [experiments, setExperiments] = useState<Experiment[]>(loadExperiments),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [mobile, setMobile] = useState(false),
    [toast, setToast] = useState(""),
    [theme, setTheme] = useState(() => {
      const t = storage.read<string>("theme", "system");
      return ["light", "dark", "system"].includes(t) ? t : "system";
    }),
    [tab, setTab] = useState("experiment"),
    [choice, setChoice] = useState<number | null>(null),
    [submitted, setSubmitted] = useState(false),
    [activePath, setActivePath] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null),
    mainRef = useRef<HTMLElement>(null);
  const notify = useCallback((s: string) => setToast(s), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
    };
    apply();
    media.addEventListener("change", apply);
    storage.write("theme", theme);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setMobile(false);
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);
  const persist = useCallback(
    (p: Progress) => {
      setProgress(p);
      if (!storage.write("progress", p))
        notify(
          "Browser storage is unavailable. Progress will last for this session only.",
        );
    },
    [notify],
  );
  const open = useCallback(
    (id: LabId, initial?: Config) => {
      setLab(id);
      setConfig(initial);
      setSnapshot(sanitize(id, initial));
      setLabKey((k) => k + 1);
      setView("lab");
      setTab("experiment");
      setChoice(null);
      setSubmitted(false);
      setMobile(false);
      history.pushState(null, "", `#lab/${id}`);
      setProgress((p) => {
        const v = { ...p, last: id };
        if (!storage.write("progress", v))
          notify("Progress could not be saved in this browser.");
        return v;
      });
      window.scrollTo({ top: 0 });
    },
    [notify],
  );
  const navigate = (v: View) => {
    setView(v);
    history.pushState(null, "", `#${v}`);
    setMobile(false);
    setSearch("");
    window.scrollTo({ top: 0 });
  };
  useEffect(() => {
    const onHash = () => {
      const r = initialRoute();
      if (r.view === "lab") {
        setLab(r.id);
        setConfig(undefined);
        setLabKey((k) => k + 1);
        setSnapshot(sanitize(r.id, undefined));
        setTab("experiment");
        setSubmitted(false);
        setChoice(null);
      }
      setView(r.view);
    };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
    };
  }, []);
  const saveExperiment = () => {
    const item: Experiment = {
        id: crypto.randomUUID(),
        lab,
        name: `${lessonById[lab].title} · ${new Date().toLocaleDateString()}`,
        created: new Date().toISOString(),
        config: sanitize(lab, snapshot),
      },
      items = [item, ...experiments].slice(0, 40);
    setExperiments(items);
    notify(
      storage.write("experiments", items)
        ? "Experiment settings saved. Training state is not included."
        : "Settings kept in this session; browser storage is unavailable.",
    );
  };
  const complete = () => {
    if (choice === lessonById[lab].correct) {
      persist({
        ...progress,
        completed: [...new Set([...progress.completed, lab])],
      });
      notify("Knowledge check passed. Lesson added to your learning progress.");
    }
    setSubmitted(true);
  };
  const filtered = lessons.filter(
    (l) =>
      (!search ||
        `${l.title} ${l.concept} ${domains.find((d) => d.id === l.domain)?.title}`
          .toLowerCase()
          .includes(search.toLowerCase())) &&
      (filter === "all" ||
        (filter === "foundations" && [1, 2].includes(l.domain)) ||
        (filter === "deep" && l.domain === 3) ||
        (filter === "genai" && [4, 5, 6].includes(l.domain)) ||
        (filter === "systems" && [7, 10, 15].includes(l.domain))),
  );
  const topicResults = search
    ? domains
        .flatMap((d) =>
          d.topics
            .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
            .map((t) => ({ ...t, domain: d.title })),
        )
        .slice(0, 20)
    : [];
  const current = lessonById[lab];
  const onConfig = useCallback((c: Config) => setSnapshot(c), []);
  return (
    <div className={`app ${view === "lab" ? "lab-mode" : ""}`}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>
      {mobile && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <button
          className="brand"
          onClick={() => navigate("explore")}
          aria-label="AIverse home"
        >
          <span className="brand-mark">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="m7 25 9-18 9 18M11 19h10" />
              <circle cx="16" cy="19" r="2.5" />
            </svg>
          </span>
          <span>
            AIverse<small>THE INTERACTIVE AI LAB</small>
          </span>
        </button>
        <span className="nav-label">WORKSPACE</span>
        <nav>
          {nav.map(([v, title, icon]) => (
            <button
              key={v}
              aria-label={title}
              title={title}
              className={
                view === v || (v === "playgrounds" && view === "lab")
                  ? "active"
                  : ""
              }
              onClick={() => navigate(v)}
            >
              <Icon name={icon} size={19} />
              <span>{title}</span>
              {v === "playgrounds" && <small>{lessons.length}</small>}
            </button>
          ))}
        </nav>
        <div className="sidebar-course">
          <span className="eyebrow">A LITTLE, EVERY DAY</span>
          <h3>Build your intuition.</h3>
          <p>Your next breakthrough starts with one experiment.</p>
          <button onClick={() => open(progress.last || "mathematics")}>
            Continue learning
            <Icon name="arrow" size={15} />
          </button>
          <div className="progress-track">
            <span
              style={{
                width: `${(progress.completed.length / lessons.length) * 100}%`,
              }}
            />
          </div>
          <small>
            {progress.completed.length} of {lessons.length} labs completed
          </small>
        </div>
        <div className="sidebar-bottom">
          <button
            aria-label="Settings"
            title="Settings"
            className={view === "settings" ? "active" : ""}
            onClick={() => navigate("settings")}
          >
            <Icon name="settings" size={19} />
            Settings
          </button>
          <div>
            <span className="avatar">A</span>
            <span>
              Personal workspace<small>Saved on this device</small>
            </span>
            <i className="status-dot" />
          </div>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobile(true)}
          >
            <Icon name="menu" />
          </button>
          <div className="breadcrumb">
            Workspace <span>/</span>
            <strong>
              {view === "lab"
                ? "Playgrounds"
                : view === "settings"
                  ? "Settings"
                  : nav.find((n) => n[0] === view)?.[1]}
            </strong>
          </div>
          <div className="global-search">
            <Icon name="search" size={17} />
            <input
              ref={searchRef}
              aria-label="Search concepts and labs"
              placeholder="Search anything in AI…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (view !== "explore" && view !== "playgrounds") {
                  setView("explore");
                  history.pushState(null, "", "#explore");
                }
              }}
            />
            <kbd>/</kbd>
          </div>
          <div className="topbar-actions">
            <span className="local-status">
              <i className="status-dot" />
              Browser powered
            </span>
            <button
              className="icon-button"
              aria-label="Toggle light and dark theme"
              onClick={() =>
                setTheme(
                  document.documentElement.dataset.theme === "dark"
                    ? "light"
                    : "dark",
                )
              }
            >
              <Icon name="sun" size={19} />
            </button>
          </div>
        </header>
        <main
          ref={mainRef}
          tabIndex={-1}
          id="main-content"
          className={`main-content ${view === "lab" ? "workspace-content" : ""}`}
        >
          {(view === "explore" || view === "playgrounds") && (
            <>
              {view === "explore" && !search ? (
                <Hero open={open} />
              ) : (
                <div className="page-title">
                  <div className="eyebrow">LEARN BY DOING</div>
                  <h1>
                    {search ? "Follow your curiosity." : "Your AI playground."}
                  </h1>
                  <p>Real computations. Inspectable steps. No black boxes.</p>
                </div>
              )}
              {view === "explore" && !search && (
                <section
                  className="start-here"
                  aria-label="Recommended starting sequence"
                >
                  <div>
                    <span className="eyebrow">NEW TO THE LAB?</span>
                    <h2>A clear place to start.</h2>
                    <p>
                      Three connected ideas. Follow them in order, or explore
                      freely below.
                    </p>
                  </div>
                  <div className="starter-steps">
                    {(
                      [
                        "mathematics",
                        "optimization",
                        "machine-learning",
                      ] as LabId[]
                    ).map((id, i) => (
                      <button key={id} onClick={() => open(id)}>
                        <span>0{i + 1}</span>
                        <div>
                          <strong>{lessonById[id].title}</strong>
                          <small>
                            {
                              [
                                "See a transformation",
                                "Follow a learning update",
                                "Fit your first model",
                              ][i]
                            }
                          </small>
                        </div>
                        <Icon name="arrow" size={16} />
                      </button>
                    ))}
                  </div>
                </section>
              )}
              <section className="labs-section" id="browse-labs">
                <div className="section-title">
                  <div>
                    <div className="eyebrow">CHOOSE AN IDEA TO UNDERSTAND</div>
                    <h2>
                      {search ? "Search results" : "Explore the live labs."}
                    </h2>
                  </div>
                  <span className="muted">
                    {filtered.length} interactive labs
                    <Icon name="lab" size={16} />
                  </span>
                </div>
                <div className="filter-row">
                  {[
                    ["all", "All labs"],
                    ["foundations", "Math & ML"],
                    ["deep", "Deep learning"],
                    ["genai", "Generative AI & RAG"],
                    ["systems", "Agents & systems"],
                  ].map(([v, l]) => (
                    <button
                      key={v}
                      className={filter === v ? "active" : ""}
                      onClick={() => setFilter(v)}
                    >
                      {l}
                      {v === "all" && <span>{lessons.length}</span>}
                    </button>
                  ))}
                </div>
                <div className="lab-cards">
                  {filtered.map((l) => (
                    <LabCard
                      key={l.id}
                      lesson={l}
                      open={open}
                      completed={progress.completed.includes(l.id)}
                    />
                  ))}
                </div>
                {!filtered.length && (
                  <div className="empty-state">
                    No matching labs. Try another term or choose All labs.
                  </div>
                )}
                {topicResults.length > 0 && (
                  <section className="taxonomy-results">
                    <h2>Curriculum topics</h2>
                    <p>
                      These taxonomy entries are planned; they are not finished
                      lessons.
                    </p>
                    {topicResults.map((t) => (
                      <div key={t.id}>
                        <span>
                          {t.title}
                          <small>{t.domain}</small>
                        </span>
                        <span className="tag">Planned</span>
                      </div>
                    ))}
                  </section>
                )}
              </section>
              {!search && (
                <section className="path-banner">
                  <span className="path-banner-icon">
                    <Icon name="path" size={34} />
                  </span>
                  <div>
                    <span className="eyebrow">A CLEARER WAY FORWARD</span>
                    <h2>Curiosity is great. A little direction helps.</h2>
                    <p>
                      Follow a structured starter sequence, then explore the
                      complete curriculum roadmap.
                    </p>
                  </div>
                  <button className="button" onClick={() => navigate("paths")}>
                    Explore learning paths
                    <Icon name="arrow" size={17} />
                  </button>
                </section>
              )}
              <footer className="site-footer">
                <span>
                  AIverse <span>·</span> Built for the way understanding
                  happens.
                </span>
                <span>No accounts. No API bills. Just experiments.</span>
              </footer>
            </>
          )}
          {view === "paths" && (
            <>
              <PageTitle
                eyebrow="FROM FIRST PRINCIPLES TO SYSTEMS"
                title="Find your learning path."
                description="15 curriculum roadmaps with working starter labs. Full courses are still in development."
              />
              <div className="path-cards">
                {paths.map((p) => (
                  <article className="path-card" key={p.id}>
                    <span className="card-icon sage">
                      <Icon name="path" />
                    </span>
                    <span className="tag">Starter sequence</span>
                    <h2>{p.title}</h2>
                    <p>{p.objective}</p>
                    <div className="path-meta">
                      {p.ids.length} available labs ·{" "}
                      {p.ids.reduce((a, id) => a + lessonById[id].minutes, 0)}{" "}
                      min
                    </div>
                    <div className="progress-track">
                      <span
                        style={{
                          width: `${(p.ids.filter((id) => progress.completed.includes(id)).length / p.ids.length) * 100}%`,
                        }}
                      />
                    </div>
                    <button
                      className="button full"
                      onClick={() =>
                        setActivePath(activePath === p.id ? null : p.id)
                      }
                    >
                      {activePath === p.id
                        ? "Hide sequence"
                        : "View learning sequence"}
                      <Icon name="chevron" size={16} />
                    </button>
                    {activePath === p.id && (
                      <div className="path-details">
                        <ol>
                          {p.ids.map((id) => (
                            <li key={id}>
                              <button onClick={() => open(id)}>
                                {progress.completed.includes(id) && "✓ "}
                                {lessonById[id].title}
                              </button>
                            </li>
                          ))}
                        </ol>
                        <p>
                          <strong>Milestone exercise:</strong> {p.project}
                        </p>
                        <p>
                          <strong>Remaining curriculum:</strong>{" "}
                          {
                            domains.find((d) => d.id === p.domain)?.topics
                              .length
                          }{" "}
                          topic entries await full lesson coverage. This starter
                          sequence does not certify role readiness.
                        </p>
                        <button
                          className="button primary full"
                          onClick={() => {
                            persist({ ...progress, path: p.id });
                            open(
                              p.ids.find(
                                (id) => !progress.completed.includes(id),
                              ) || p.ids[0],
                            );
                          }}
                        >
                          Start / resume path
                          <Icon name="arrow" size={16} />
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </>
          )}
          {view === "lab" && (
            <>
              <div className="lab-page-heading">
                <div>
                  <button
                    className="back-link"
                    onClick={() => navigate("playgrounds")}
                  >
                    ← All playgrounds
                  </button>
                  <div className="eyebrow">
                    {domains.find((d) => d.id === current.domain)?.title}{" "}
                    <span> / </span> {current.level}
                  </div>
                  <h1>{current.title}</h1>
                  <p>{current.subtitle}</p>
                </div>
                <div className="lab-header-actions">
                  <button className="button" onClick={saveExperiment}>
                    <Icon name="save" size={16} />
                    Save settings
                  </button>
                  <button
                    className="icon-button bordered"
                    aria-label="Export experiment settings"
                    title="Export experiment settings"
                    onClick={() =>
                      download(`aiverse-${lab}.json`, {
                        lab,
                        name: current.title,
                        config: sanitize(lab, snapshot),
                      })
                    }
                  >
                    <Icon name="download" size={18} />
                  </button>
                </div>
              </div>
              <div className="lab-kind">
                <span className="status-dot" />
                {current.kind}
                <span>
                  <Icon name="clock" size={14} />
                  {current.minutes} min
                </span>
              </div>
              {current.prereqs.some(
                (id) => !progress.completed.includes(id),
              ) && (
                <div className="prereq-bar">
                  Helpful first:{" "}
                  {current.prereqs
                    .filter((id) => !progress.completed.includes(id))
                    .map((id) => (
                      <button key={id} onClick={() => open(id)}>
                        {lessonById[id].title}
                        <Icon name="arrow" size={13} />
                      </button>
                    ))}
                </div>
              )}
              <div className="workspace-orientation">
                <Icon name="book" size={17} />
                <p>
                  <strong>Learn while it runs.</strong> The guide beside the
                  canvas explains what you’re seeing. Change a control to see
                  its impact, or pause to inspect each step.
                </p>
              </div>
              <div className="workspace-tabs">
                {[
                  ["experiment", "Experiment"],
                  ["lesson", "Understand the concept"],
                  ["code", "Python example"],
                  ["check", "Knowledge check"],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    className={tab === v ? "active" : ""}
                    onClick={() => setTab(v)}
                  >
                    {l}
                    {v === "check" && progress.completed.includes(lab) && (
                      <Icon name="check" size={14} />
                    )}
                  </button>
                ))}
              </div>
              <div hidden={tab !== "experiment"}>
                <Boundary key={`${lab}-${labKey}`}>
                  <Suspense
                    fallback={
                      <div className="empty-state">Preparing experiment…</div>
                    }
                  >
                    <Lab
                      key={`${lab}-${labKey}`}
                      id={lab}
                      initial={config}
                      snapshot={snapshot}
                      active={tab === "experiment"}
                      onLearn={() => setTab("lesson")}
                      onConfig={onConfig}
                    />
                  </Suspense>
                  <div className="below-lab">
                    <div>
                      <span className="eyebrow">WHAT TO NOTICE</span>
                      <p>{current.observe}</p>
                    </div>
                    <button className="button" onClick={() => setTab("lesson")}>
                      Understand the why
                      <Icon name="arrow" size={16} />
                    </button>
                  </div>
                </Boundary>
              </div>
              {tab === "lesson" && (
                <Suspense
                  fallback={
                    <div className="empty-state">Opening the explanation…</div>
                  }
                >
                  <DetailedLesson
                    id={lab}
                    onExperiment={() => setTab("experiment")}
                    onCheck={() => setTab("check")}
                  />
                </Suspense>
              )}
              {tab === "code" && (
                <article className="lesson-content">
                  <h2>A minimal Python reference</h2>
                  <p>
                    Run this independently with Python 3 and NumPy where
                    imported. The browser lab uses TypeScript kernels; this
                    snippet is not executed here.
                  </p>
                  <pre className="code-block">
                    <code>{current.code}</code>
                  </pre>
                  <h3>Bridge to the experiment</h3>
                  <p>{current.exercise}</p>
                  <a href={current.source.url} target="_blank" rel="noreferrer">
                    {current.source.title} ↗
                  </a>
                </article>
              )}
              {tab === "check" && (
                <article className="lesson-content knowledge-check">
                  <span className="eyebrow">ONE IDEA, WELL UNDERSTOOD</span>
                  <h2>{current.question}</h2>
                  <div className="answer-options">
                    {current.answers.map((a, i) => (
                      <label
                        key={i}
                        className={`${choice === i ? "selected" : ""} ${submitted && choice === i ? (i === current.correct ? "correct" : "incorrect") : ""}`}
                      >
                        <input
                          type="radio"
                          name="answer"
                          checked={choice === i}
                          onChange={() => {
                            setChoice(i);
                            setSubmitted(false);
                          }}
                        />
                        <span>{a}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    className="button primary"
                    disabled={choice === null}
                    onClick={complete}
                  >
                    Check answer
                    <Icon name="check" size={16} />
                  </button>
                  {submitted && (
                    <div
                      className={`answer-feedback ${choice === current.correct ? "correct" : "incorrect"}`}
                      role="status"
                    >
                      <strong>
                        {choice === current.correct ? "Exactly." : "Try again."}
                      </strong>
                      <p>
                        {choice === current.correct
                          ? current.reason
                          : "Return to the lesson and experiment with the settings before trying again."}
                      </p>
                    </div>
                  )}
                  <p className="muted">
                    Passing records a lesson completion, not proof of mastery.
                  </p>
                </article>
              )}
            </>
          )}
          {view === "graph" && (
            <KnowledgeGraph completed={progress.completed} open={open} />
          )}
          {view === "challenges" && (
            <>
              <PageTitle
                eyebrow="TURN INSIGHT INTO EVIDENCE"
                title="Can you explain the result?"
                description="Applied experiments for the working labs. Save your settings, make a prediction, then test it."
              />
              <div className="challenge-list">
                {lessons.map((l, i) => (
                  <article key={l.id}>
                    <span className="challenge-index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <span className="eyebrow">{l.title}</span>
                      <h2>{l.exercise}</h2>
                      <p>
                        Acceptance: reproduce the result from the same settings
                        and explain one failure mode.
                      </p>
                    </div>
                    <button className="button" onClick={() => open(l.id)}>
                      Open lab
                      <Icon name="arrow" size={16} />
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
          {view === "learning" && (
            <>
              <PageTitle
                eyebrow="YOUR PERSONAL NOTEBOOK"
                title="Keep the good experiments."
                description="Progress and experiment settings stay on this browser. Export settings for a portable copy."
              />
              <div className="learning-summary">
                <div>
                  <strong>
                    {progress.completed.length}
                    <small> / {lessons.length}</small>
                  </strong>
                  <span>Knowledge checks passed</span>
                </div>
                <div>
                  <strong>{experiments.length}</strong>
                  <span>Saved experiments</span>
                </div>
                <button
                  className="button primary"
                  onClick={() => open(progress.last || "mathematics")}
                >
                  Resume learning
                  <Icon name="arrow" size={16} />
                </button>
              </div>
              <div className="section-title">
                <h2>Saved experiment settings</h2>
                <label className="upload-label inline">
                  Import JSON
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        if (f.size > 100000)
                          throw Error("Experiment files must be under 100 KB.");
                        const item = parseExperiment(await f.text()),
                          items = [item, ...experiments].slice(0, 40);
                        setExperiments(items);
                        if (!storage.write("experiments", items))
                          notify(
                            "Imported for this session; browser storage is unavailable.",
                          );
                        else notify("Experiment imported.");
                      } catch (err) {
                        notify(
                          err instanceof Error
                            ? err.message
                            : "Could not import experiment.",
                        );
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              {experiments.length ? (
                <div className="saved-list">
                  {experiments.map((e) => (
                    <article key={e.id}>
                      <span className={`card-icon ${lessonById[e.lab].accent}`}>
                        <Icon name={lessonById[e.lab].icon} />
                      </span>
                      <div>
                        <h3>{e.name}</h3>
                        <p>
                          {new Date(e.created).toLocaleString()} · Settings only
                        </p>
                      </div>
                      <button
                        className="button"
                        onClick={() => open(e.lab, e.config)}
                      >
                        Restore
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Export ${e.name}`}
                        onClick={() => download(`aiverse-${e.lab}.json`, e)}
                      >
                        <Icon name="download" size={17} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={`Delete ${e.name}`}
                        onClick={() => {
                          const items = experiments.filter(
                            (x) => x.id !== e.id,
                          );
                          setExperiments(items);
                          if (!storage.write("experiments", items))
                            notify(
                              "Could not persist deletion in this browser.",
                            );
                        }}
                      >
                        <Icon name="close" size={17} />
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Icon name="lab" size={30} />
                  <h3>Your notebook is a blank canvas.</h3>
                  <p>Open a lab and save a set of experiment settings.</p>
                  <button
                    className="button"
                    onClick={() => navigate("playgrounds")}
                  >
                    Explore the labs
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
              )}
              <h2 className="spaced-title">Your completed labs</h2>
              <div className="lab-cards">
                {lessons
                  .filter((l) => progress.completed.includes(l.id))
                  .map((l) => (
                    <LabCard key={l.id} lesson={l} completed open={open} />
                  ))}
              </div>
              {!progress.completed.length && (
                <p className="muted">
                  Pass a lab’s knowledge check to record completion here.
                </p>
              )}
            </>
          )}
          {view === "settings" && (
            <>
              <PageTitle
                eyebrow="MAKE YOURSELF AT HOME"
                title="Your workspace, your way."
                description="The core learning experience runs locally in your browser without accounts or API keys."
              />
              <div className="settings-panel">
                <h2>Appearance</h2>
                <div className="segmented">
                  {["system", "light", "dark"].map((t) => (
                    <button
                      key={t}
                      className={theme === t ? "active" : ""}
                      onClick={() => setTheme(t)}
                    >
                      {t[0].toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                <h2>Data & privacy</h2>
                <p>
                  Progress and saved settings use localStorage. Documents are
                  processed in this page or a browser worker. No analytics or
                  inference service is configured. Hosting may require sign-in;
                  a local build does not.
                </p>
                <button
                  className="button"
                  onClick={() =>
                    download("aiverse-notebook.json", { progress, experiments })
                  }
                >
                  <Icon name="download" size={16} />
                  Export notebook backup
                </button>
                <p className="control-help">
                  Backups include progress and experiments for archival use.
                  Individual experiment JSON files can be imported from My
                  learning. Training checkpoints are not stored.
                </p>
                <h2>Coverage, without the hype</h2>
                <p>
                  {lessons.length} working starter labs, {domains.length} domain
                  roadmaps, and{" "}
                  {domains.reduce((a, d) => a + d.topics.length, 0)} planned
                  topic entries. Full framework courses, pretrained inference,
                  arbitrary node editors, and complete career paths remain
                  future work.
                </p>
                <h2>Learning progress</h2>
                <button
                  className="button danger-text"
                  onClick={() => {
                    persist({ completed: [], last: progress.last });
                    notify(
                      "Knowledge-check progress reset. Saved experiments remain available.",
                    );
                  }}
                >
                  Reset knowledge-check progress
                </button>
              </div>
            </>
          )}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Icon name="info" size={18} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-title">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
function KnowledgeGraph({
  completed,
  open,
}: {
  completed: LabId[];
  open: (id: LabId) => void;
}) {
  const [selected, setSelected] = useState<LabId>("optimization"),
    [zoom, setZoom] = useState(1),
    [domain, setDomain] = useState("all");
  const visible = lessons.filter(
    (l) => domain === "all" || l.domain === +domain,
  );
  const positions: Record<string, { x: number; y: number }> = {
    mathematics: { x: 100, y: 70 },
    optimization: { x: 320, y: 70 },
    "machine-learning": { x: 550, y: 70 },
    "neural-network": { x: 550, y: 200 },
    "fine-tuning": { x: 780, y: 200 },
    transformers: { x: 320, y: 200 },
    sampling: { x: 100, y: 200 },
    rag: { x: 100, y: 340 },
    agents: { x: 320, y: 340 },
    reinforcement: { x: 550, y: 340 },
    systems: { x: 780, y: 340 },
  };
  return (
    <>
      <PageTitle
        eyebrow="NO CONCEPT IS AN ISLAND"
        title="Connect the dots."
        description="A prerequisite graph derived from the working lesson registry. Select a node to inspect its connections."
      />
      <div className="graph-tools">
        <label>
          Domain{" "}
          <select value={domain} onChange={(e) => setDomain(e.target.value)}>
            <option value="all">All implemented domains</option>
            {domains
              .filter((d) => lessons.some((l) => l.domain === d.id))
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
          </select>
        </label>
        <label>
          Zoom{" "}
          <input
            aria-label="Knowledge graph zoom"
            type="range"
            min=".7"
            max="1.5"
            step=".1"
            value={zoom}
            onChange={(e) => setZoom(+e.target.value)}
          />
        </label>
      </div>
      <div className="knowledge-graph">
        <svg
          viewBox="0 0 910 420"
          style={{ width: `${zoom * 100}%`, minWidth: 640 }}
          role="img"
          aria-label="Lesson prerequisite graph"
        >
          <defs>
            <marker
              id="graph-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="m0 0 8 4-8 4" fill="var(--axis)" />
            </marker>
          </defs>
          {visible.flatMap((l) =>
            l.prereqs
              .filter((id) => visible.some((v) => v.id === id))
              .map((id) => (
                <line
                  key={`${id}-${l.id}`}
                  x1={positions[id].x}
                  y1={positions[id].y + 20}
                  x2={positions[l.id].x}
                  y2={positions[l.id].y - 18}
                  stroke={selected === l.id ? "var(--green)" : "var(--line)"}
                  strokeWidth={selected === l.id ? 2 : 1.5}
                  markerEnd="url(#graph-arrow)"
                />
              )),
          )}
          {visible.map((l) => (
            <g
              key={l.id}
              role="button"
              tabIndex={0}
              aria-label={`Select ${l.title}`}
              onClick={() => setSelected(l.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(l.id);
                }
              }}
              className="graph-node"
            >
              <rect
                x={positions[l.id].x - 84}
                y={positions[l.id].y - 22}
                width="168"
                height="44"
                rx="10"
                fill={
                  selected === l.id
                    ? "var(--green)"
                    : completed.includes(l.id)
                      ? "var(--sage)"
                      : "var(--paper)"
                }
                stroke={selected === l.id ? "var(--green)" : "var(--line)"}
              />
              <text
                x={positions[l.id].x}
                y={positions[l.id].y + 4}
                textAnchor="middle"
                fill={selected === l.id ? "var(--on-green)" : "var(--ink)"}
              >
                {l.title.length > 22 ? l.title.slice(0, 21) + "…" : l.title}
              </text>
              {completed.includes(l.id) && (
                <circle
                  cx={positions[l.id].x + 77}
                  cy={positions[l.id].y - 18}
                  r="5"
                  fill="#75a979"
                />
              )}
            </g>
          ))}
        </svg>
      </div>
      <div className="graph-detail">
        <div>
          <span className="eyebrow">SELECTED CONCEPT</span>
          <h2>{lessonById[selected].title}</h2>
          <p>{lessonById[selected].concept}</p>
          <p className="muted">
            Prerequisites:{" "}
            {lessonById[selected].prereqs
              .map((id) => lessonById[id].title)
              .join(", ") || "None"}
          </p>
        </div>
        <button className="button primary" onClick={() => open(selected)}>
          Open experiment
          <Icon name="arrow" size={16} />
        </button>
      </div>
      <details className="taxonomy-details">
        <summary>Explore the full 15-domain curriculum roadmap</summary>
        <p>Planned taxonomy entries; not a graph of finished lessons.</p>
        {domains.map((d) => (
          <details key={d.id}>
            <summary>
              {d.title}
              <span>{d.topics.length} planned topic entries</span>
            </summary>
            <div className="topic-tags">
              {d.topics.map((t) => (
                <span key={t.id}>{t.title}</span>
              ))}
            </div>
          </details>
        ))}
      </details>
    </>
  );
}
