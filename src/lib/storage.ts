import type { LabId } from "./curriculum";
export type Config = Record<string, number | string | boolean>;
export type Rule = {
  value: number | string | boolean;
  min?: number;
  max?: number;
  choices?: string[];
};
export const schemas: Record<LabId, Record<string, Rule>> = {
  mathematics: {
    a: { value: 1, min: -3, max: 3 },
    b: { value: 0.5, min: -3, max: 3 },
    c: { value: 0, min: -3, max: 3 },
    d: { value: 1, min: -3, max: 3 },
    x: { value: 1.5, min: -2, max: 2 },
    y: { value: 1, min: -2, max: 2 },
  },
  optimization: {
    lr: { value: 0.12, min: 0.01, max: 0.8 },
    momentum: { value: 0, min: 0, max: 0.95 },
    x: { value: 3, min: -4, max: 4 },
    y: { value: 2, min: -4, max: 4 },
  },
  "machine-learning": {
    lr: { value: 0.05, min: 0.005, max: 0.3 },
    seed: { value: 42, min: 1, max: 9999 },
    algorithm: { value: "linear", choices: ["linear", "logistic", "kmeans"] },
    k: { value: 2, min: 2, max: 5 },
  },
  "neural-network": {
    lr: { value: 0.03, min: 0.001, max: 0.5 },
    seed: { value: 42, min: 1, max: 9999 },
    width: { value: 4, min: 2, max: 8 },
    depth: { value: 1, min: 1, max: 3 },
    activation: { value: "tanh", choices: ["tanh", "relu", "sigmoid"] },
    optimizer: { value: "adam", choices: ["sgd", "adam"] },
  },
  "fine-tuning": {
    lr: { value: 0.04, min: 0.001, max: 0.3 },
    w: { value: 0.3, min: -2, max: 3 },
    b: { value: 0, min: -2, max: 2 },
    freezeW: { value: false },
    freezeB: { value: false },
    rank: { value: 1, min: 1, max: 4 },
    alpha: { value: 2, min: 0, max: 8 },
    adapter: { value: 0.2, min: -1, max: 1 },
    tab: { value: "training", choices: ["training", "lora"] },
  },
  transformers: {
    text: { value: "Learning changes how we see" },
    tokenizer: { value: "words", choices: ["words", "characters"] },
    causal: { value: true },
    temperature: { value: 1, min: 0.1, max: 3 },
    selected: { value: 3, min: 0, max: 7 },
  },
  sampling: {
    temperature: { value: 1, min: 0.1, max: 2 },
    k: { value: 6, min: 1, max: 8 },
    p: { value: 0.95, min: 0.05, max: 1 },
    seed: { value: 42, min: 1, max: 9999 },
  },
  rag: {
    size: { value: 24, min: 8, max: 80 },
    overlap: { value: 4, min: 0, max: 7 },
    k: { value: 3, min: 1, max: 8 },
    query: { value: "How do agents use tools?" },
    method: { value: "tfidf", choices: ["tfidf", "bm25"] },
    documents: {
      value:
        "AI agents coordinate tools, state, and decisions to carry out tasks. Reliable agents use bounded retries, explicit permissions, and observable execution traces. Tool failures should produce structured errors rather than invented results.\n\nRetrieval augmented generation supplies a language model with relevant external documents. Chunking splits documents into searchable passages. Retrieval can use lexical matching, vector similarity, or a hybrid of both methods.\n\nNeural networks learn parameters through gradient descent and backpropagation. A learning rate that is too large can cause loss to diverge. Holdout evaluation helps detect overfitting on training examples.\n\nProduction AI systems require monitoring, caching, and capacity planning. Replicas increase service capacity while caches reduce repeated backend work. A queue grows without bound when arrival rate exceeds service capacity.",
    },
  },
  agents: {
    failure: { value: "none", choices: ["none", "transient", "persistent"] },
    retries: { value: 2, min: 0, max: 4 },
    approval: { value: false },
    strategy: { value: "sequential", choices: ["sequential", "parallel"] },
    tool: { value: "Search knowledge base" },
    prompt: { value: "Find the customer renewal policy." },
  },
  reinforcement: {
    obstacles: { value: "7,12,17" },
    alpha: { value: 0.2, min: 0.01, max: 1 },
    gamma: { value: 0.95, min: 0, max: 0.99 },
    epsilon: { value: 0.3, min: 0, max: 1 },
    reward: { value: 1, min: 0.1, max: 5 },
    seed: { value: 42, min: 1, max: 9999 },
  },
  systems: {
    arrival: { value: 12, min: 1, max: 100 },
    service: { value: 100, min: 20, max: 500 },
    replicas: { value: 2, min: 1, max: 8 },
    cache: { value: 0.2, min: 0, max: 0.95 },
    failed: { value: false },
  },
};
export function sanitize(id: LabId, input: unknown): Config {
  const obj =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  return Object.fromEntries(
    Object.entries(schemas[id]).map(([k, r]) => {
      const v = obj[k];
      let value = r.value;
      if (typeof v === typeof r.value) {
        if (
          typeof v === "number" &&
          Number.isFinite(v) &&
          v >= (r.min ?? -Infinity) &&
          v <= (r.max ?? Infinity) &&
          (![
            "seed",
            "width",
            "depth",
            "k",
            "rank",
            "retries",
            "selected",
            "size",
            "overlap",
            "replicas",
          ].includes(k) ||
            Number.isInteger(v))
        )
          value = v;
        else if (typeof v === "boolean") value = v;
        else if (
          typeof v === "string" &&
          v.length <= 20000 &&
          (!r.choices || r.choices.includes(v))
        )
          value = v;
      }
      return [k, value];
    }),
  );
}
export type Experiment = {
  id: string;
  lab: LabId;
  name: string;
  created: string;
  config: Config;
};
export type Progress = { completed: LabId[]; last?: LabId; path?: string };
export const storage = {
  read<T>(key: string, fallback: T): T {
    try {
      const s = localStorage.getItem("aiverse.v1." + key);
      return s ? (JSON.parse(s) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  write(key: string, value: unknown) {
    try {
      localStorage.setItem("aiverse.v1." + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};
export function loadProgress(): Progress {
  const p = storage.read<unknown>("progress", {});
  if (!p || typeof p !== "object") return { completed: [] };
  const v = p as Progress;
  return {
    completed: Array.isArray(v.completed)
      ? v.completed.filter(
          (x, i, a) => Object.hasOwn(schemas, x) && a.indexOf(x) === i,
        )
      : [],
    last: v.last && Object.hasOwn(schemas, v.last) ? v.last : undefined,
    path: typeof v.path === "string" ? v.path : undefined,
  };
}
export function loadExperiments(): Experiment[] {
  const xs = storage.read<unknown>("experiments", []);
  return Array.isArray(xs)
    ? xs
        .slice(0, 40)
        .filter(
          (x) =>
            x &&
            typeof x === "object" &&
            Object.hasOwn(schemas, x.lab) &&
            typeof x.id === "string" &&
            typeof x.name === "string" &&
            typeof x.created === "string",
        )
        .map((x) => ({ ...x, config: sanitize(x.lab, x.config) }))
    : [];
}
export function parseExperiment(text: string): Experiment {
  if (text.length > 100000)
    throw Error("Experiment files must be smaller than 100 KB.");
  const x = JSON.parse(text);
  if (
    !x ||
    typeof x !== "object" ||
    !Object.hasOwn(schemas, x.lab) ||
    !x.config ||
    typeof x.config !== "object"
  )
    throw Error("This is not an AIverse experiment.");
  return {
    id: crypto.randomUUID(),
    lab: x.lab,
    name:
      typeof x.name === "string" ? x.name.slice(0, 80) : "Imported experiment",
    created: new Date().toISOString(),
    config: sanitize(x.lab, x.config),
  };
}
export function download(name: string, value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
