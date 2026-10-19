/** Small, bounded numerical kernels. All randomness comes from an explicit seed. */
export type Point = { x: number; y: number };
export const clamp = (x: number, a: number, b: number) =>
  Math.max(a, Math.min(b, x));
export const mean = (xs: number[]) =>
  xs.reduce((a, b) => a + b, 0) / (xs.length || 1);
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function softmax(xs: number[], temperature = 1) {
  if (!xs.length || temperature <= 0 || !Number.isFinite(temperature))
    throw Error("Temperature must be positive.");
  const m = Math.max(...xs);
  const es = xs.map((x) => Math.exp((x - m) / temperature));
  const s = es.reduce((a, b) => a + b, 0);
  return es.map((x) => x / s);
}
export function sampling(
  logits: number[],
  temperature: number,
  k: number,
  p: number,
) {
  const probs = softmax(logits, temperature);
  let ranked = probs
    .map((prob, i) => ({ i, prob }))
    .sort((a, b) => b.prob - a.prob)
    .slice(0, Math.max(1, k));
  const candidateSum = ranked.reduce((s, v) => s + v.prob, 0);
  ranked = ranked.map((v) => ({ ...v, prob: v.prob / candidateSum }));
  let total = 0;
  ranked = ranked.filter((v, i) => {
    const keep = i === 0 || total < p;
    total += v.prob;
    return keep;
  });
  const sum = ranked.reduce((a, v) => a + v.prob, 0);
  return probs.map((_, i) => (ranked.find((v) => v.i === i)?.prob || 0) / sum);
}
export function sample(probs: number[], seed: number) {
  const r = rng(seed)();
  let cumulative = 0;
  return probs.findIndex((p, i) => {
    cumulative += p;
    return r < cumulative || i === probs.length - 1;
  });
}
export function dot(a: number[], b: number[]) {
  if (a.length !== b.length) throw Error("Vector dimensions differ.");
  return a.reduce((s, v, i) => s + v * b[i], 0);
}
export function matmul(a: number[][], b: number[][]) {
  if (
    !a.length ||
    !b.length ||
    a[0].length !== b.length ||
    a.some((r) => r.length !== a[0].length) ||
    b.some((r) => r.length !== b[0].length)
  )
    throw Error("Incompatible matrix dimensions.");
  return a.map((row) =>
    b[0].map((_, j) => row.reduce((s, v, k) => s + v * b[k][j], 0)),
  );
}
export function lora(
  w: number[][],
  a: number[][],
  b: number[][],
  alpha: number,
) {
  const ba = matmul(b, a);
  if (ba.length !== w.length || ba[0].length !== w[0].length)
    throw Error("Adapter shape mismatch.");
  return w.map((row, i) =>
    row.map((v, j) => v + (alpha / a.length) * ba[i][j]),
  );
}
export const sigmoid = (x: number) => 1 / (1 + Math.exp(-clamp(x, -500, 500)));
export function dataset(seed: number, n = 36, kind = "linear"): Point[] {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    const x = r() * 4 - 2;
    return {
      x,
      y:
        kind === "clusters"
          ? (x < 0 ? -1 : 1) + (r() - 0.5) * 1.5
          : kind === "classification"
            ? x + (r() - 0.5) * 2 > 0
              ? 1
              : 0
            : 1.15 * x + 0.4 + (r() - 0.5) * 1.2,
    };
  });
}
export function regressionLoss(
  data: Point[],
  w: number,
  b: number,
  logistic = false,
) {
  return mean(
    data.map((p) => {
      const z = w * p.x + b;
      if (logistic) {
        const q = clamp(sigmoid(z), 1e-12, 1 - 1e-12);
        return -p.y * Math.log(q) - (1 - p.y) * Math.log(1 - q);
      }
      return (z - p.y) ** 2;
    }),
  );
}
export function regressionStep(
  data: Point[],
  w: number,
  b: number,
  lr: number,
  logistic = false,
  freezeW = false,
  freezeB = false,
) {
  if (!data.length) throw Error("Add at least one point.");
  const dw = mean(
    data.map(
      (p) =>
        (logistic ? sigmoid(w * p.x + b) - p.y : 2 * (w * p.x + b - p.y)) * p.x,
    ),
  );
  const db = mean(
    data.map((p) =>
      logistic ? sigmoid(w * p.x + b) - p.y : 2 * (w * p.x + b - p.y),
    ),
  );
  return { w: freezeW ? w : w - lr * dw, b: freezeB ? b : b - lr * db, dw, db };
}
export function kmeansStep(data: Point[], centers: Point[]) {
  if (!centers.length || !data.length)
    throw Error("Points and centroids are required.");
  const assignments = data.map((p) =>
    centers
      .map((c) => (c.x - p.x) ** 2 + (c.y - p.y) ** 2)
      .reduce((best, d, i, arr) => (d < arr[best] ? i : best), 0),
  );
  const next = centers.map((c, i) => {
    const group = data.filter((_, j) => assignments[j] === i);
    return group.length
      ? { x: mean(group.map((p) => p.x)), y: mean(group.map((p) => p.y)) }
      : c;
  });
  const inertia = data.reduce(
    (s, p, i) =>
      s +
      (p.x - next[assignments[i]].x) ** 2 +
      (p.y - next[assignments[i]].y) ** 2,
    0,
  );
  return { centers: next, assignments, inertia };
}
export function attention(
  q: number[][],
  k: number[][],
  v: number[][],
  causal: boolean,
  temperature = 1,
) {
  const scores = matmul(
    q,
    k[0].map((_, j) => k.map((row) => row[j])),
  ).map((row, i) =>
    row.map((x, j) =>
      causal && j > i ? -Infinity : x / Math.sqrt(q[0].length),
    ),
  );
  const weights = scores.map((row) => softmax(row, temperature));
  return { scores, weights, output: matmul(weights, v) };
}
export function toyEmbeddings(tokens: string[]) {
  return tokens.map((t) => {
    const seed = Array.from(t).reduce(
      (s, c) => Math.imul(s, 31) + c.charCodeAt(0),
      7,
    );
    const r = rng(seed);
    return [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1, r() * 2 - 1];
  });
}
export type Network = {
  weights: number[][][];
  biases: number[][];
  epoch: number;
  loss: number;
  gradNorm: number;
  history: number[];
  momentum: number[][][];
  variance: number[][][];
  bm: number[][];
  bv: number[][];
  weightGradients: number[][][];
  biasGradients: number[][];
};
export type Activation = "tanh" | "relu" | "sigmoid";
export function createNetwork(
  seed: number,
  width: number,
  depth: number,
  act: Activation = "tanh",
): Network {
  const r = rng(seed);
  const sizes = [2, ...Array(depth).fill(width), 1] as number[];
  const weights = sizes
    .slice(1)
    .map((n, l) =>
      Array.from({ length: n }, () =>
        Array.from(
          { length: sizes[l] },
          () => (r() * 2 - 1) * Math.sqrt(2 / sizes[l]),
        ),
      ),
    );
  const biases = sizes.slice(1).map((n) => Array(n).fill(0) as number[]);
  const net: Network = {
    weights,
    biases,
    epoch: 0,
    loss: 0,
    gradNorm: 0,
    history: [],
    momentum: weights.map((m) => m.map((row) => row.map(() => 0))),
    variance: weights.map((m) => m.map((row) => row.map(() => 0))),
    bm: biases.map((row) => row.map(() => 0)),
    bv: biases.map((row) => row.map(() => 0)),
    weightGradients: weights.map((m) => m.map((row) => row.map(() => 0))),
    biasGradients: biases.map((row) => row.map(() => 0)),
  };
  net.loss = networkLoss(net, act);
  return net;
}
const activate = (x: number, act: Activation) =>
  act === "relu"
    ? Math.max(0, x)
    : act === "sigmoid"
      ? sigmoid(x)
      : Math.tanh(x);
const derivative = (z: number, a: number, act: Activation) =>
  act === "relu"
    ? z > 0
      ? 1
      : 0
    : act === "sigmoid"
      ? a * (1 - a)
      : 1 - a * a;
export function forward(net: Network, input: number[], act: Activation) {
  const as = [input],
    zs: number[][] = [];
  net.weights.forEach((matrix, l) => {
    const z = matrix.map((row, j) => dot(row, as[l]) + net.biases[l][j]);
    zs.push(z);
    as.push(
      z.map((x) =>
        l === net.weights.length - 1 ? sigmoid(x) : activate(x, act),
      ),
    );
  });
  return { as, zs, output: as.at(-1)![0] };
}
const XOR = [
  { x: [0, 0], y: 0 },
  { x: [0, 1], y: 1 },
  { x: [1, 0], y: 1 },
  { x: [1, 1], y: 0 },
];
export function networkLoss(net: Network, act: Activation) {
  return mean(
    XOR.map((p) => {
      const q = clamp(forward(net, p.x, act).output, 1e-12, 1 - 1e-12);
      return -p.y * Math.log(q) - (1 - p.y) * Math.log(1 - q);
    }),
  );
}
export function networkStep(
  net: Network,
  lr: number,
  act: Activation,
  adam = false,
) {
  const n = structuredClone(net);
  const gw = net.weights.map((m) => m.map((r) => r.map(() => 0))),
    gb = net.biases.map((r) => r.map(() => 0));
  for (const p of XOR) {
    const f = forward(net, p.x, act);
    let delta = [f.output - p.y];
    for (let l = net.weights.length - 1; l >= 0; l--) {
      for (let j = 0; j < delta.length; j++) {
        gb[l][j] += delta[j] / 4;
        for (let k = 0; k < f.as[l].length; k++)
          gw[l][j][k] += (delta[j] * f.as[l][k]) / 4;
      }
      if (l > 0)
        delta = f.as[l].map(
          (a, k) =>
            net.weights[l].reduce((s, row, j) => s + row[k] * delta[j], 0) *
            derivative(f.zs[l - 1][k], a, act),
        );
    }
  }
  n.epoch++;
  let squared = 0;
  const update = (g: number, m: number, v: number) => {
    const nm = 0.9 * m + 0.1 * g,
      nv = 0.999 * v + 0.001 * g * g;
    return {
      m: nm,
      v: nv,
      change: adam
        ? (lr * (nm / (1 - 0.9 ** n.epoch))) /
          (Math.sqrt(nv / (1 - 0.999 ** n.epoch)) + 1e-8)
        : lr * g,
    };
  };
  n.weights.forEach((matrix, l) =>
    matrix.forEach((row, j) =>
      row.forEach((_, k) => {
        const g = gw[l][j][k];
        squared += g * g;
        const u = update(g, n.momentum[l][j][k], n.variance[l][j][k]);
        n.momentum[l][j][k] = u.m;
        n.variance[l][j][k] = u.v;
        n.weights[l][j][k] -= u.change;
      }),
    ),
  );
  n.biases.forEach((row, l) =>
    row.forEach((_, j) => {
      const g = gb[l][j];
      squared += g * g;
      const u = update(g, n.bm[l][j], n.bv[l][j]);
      n.bm[l][j] = u.m;
      n.bv[l][j] = u.v;
      n.biases[l][j] -= u.change;
    }),
  );
  n.gradNorm = Math.sqrt(squared);
  n.weightGradients = gw;
  n.biasGradients = gb;
  n.loss = mean(
    XOR.map((p) => {
      const y = clamp(forward(n, p.x, act).output, 1e-12, 1 - 1e-12);
      return -p.y * Math.log(y) - (1 - p.y) * Math.log(1 - y);
    }),
  );
  n.history = [...n.history, n.loss].slice(-300);
  return n;
}
export const tokenize = (s: string): string[] =>
  s.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
export function chunkDocuments(text: string, size: number, overlap: number) {
  if (size < 1 || overlap < 0 || overlap >= size)
    throw Error("Overlap must be smaller than chunk size.");
  const paragraphs = text.split(/\n\s*\n/).filter((s) => s.trim());
  const chunks: { id: number; text: string; source: number }[] = [];
  for (let d = 0; d < paragraphs.length; d++) {
    const words = paragraphs[d].trim().split(/\s+/);
    for (let i = 0; i < words.length; i += size - overlap) {
      chunks.push({
        id: chunks.length,
        text: words.slice(i, i + size).join(" "),
        source: d + 1,
      });
      if (i + size >= words.length) break;
    }
  }
  return chunks;
}
export function retrieve(
  chunks: { id: number; text: string; source: number }[],
  query: string,
  method: "tfidf" | "bm25",
) {
  if (!chunks.length) return [];
  const docs = chunks.map((c) => tokenize(c.text));
  const counts = (tokens: string[]) => {
    const m = new Map<string, number>();
    for (const t of tokens) m.set(t, (m.get(t) || 0) + 1);
    return m;
  };
  const frequencies = docs.map(counts),
    documentFrequency = new Map<string, number>();
  frequencies.forEach((m) =>
    m.forEach((_, t) =>
      documentFrequency.set(t, (documentFrequency.get(t) || 0) + 1),
    ),
  );
  const idf = (t: string) =>
    Math.log((docs.length + 1) / ((documentFrequency.get(t) || 0) + 1)) + 1;
  const queryTokens = tokenize(query),
    queryCounts = counts(queryTokens);
  const qv = new Map(
    [...queryCounts].map(([t, c]) => [
      t,
      (c / (queryTokens.length || 1)) * idf(t),
    ]),
  );
  const qnorm = Math.sqrt([...qv.values()].reduce((s, v) => s + v * v, 0));
  const avg = mean(docs.map((d) => d.length));
  return chunks
    .map((chunk, i) => {
      let score = 0;
      const frequency = frequencies[i];
      if (method === "bm25") {
        for (const term of queryCounts.keys()) {
          const tf = frequency.get(term) || 0,
            df = documentFrequency.get(term) || 0;
          const termIdf = Math.log(1 + (docs.length - df + 0.5) / (df + 0.5));
          score +=
            (termIdf * tf * 2.5) /
            (tf + 1.5 * (0.25 + (0.75 * docs[i].length) / (avg || 1)));
        }
      } else {
        let inner = 0,
          squared = 0;
        frequency.forEach((count, term) => {
          const value = (count / (docs[i].length || 1)) * idf(term);
          squared += value * value;
          inner += value * (qv.get(term) || 0);
        });
        const norm = Math.sqrt(squared) * qnorm;
        score = norm ? inner / norm : 0;
      }
      return { ...chunk, score };
    })
    .sort((a, b) => b.score - a.score || a.id - b.id);
}
export type QState = {
  q: number[][];
  episode: number;
  reward: number;
  seed: number;
  path: number[];
  success: number;
};
export function qInitial(seed: number): QState {
  return {
    q: Array.from({ length: 25 }, () => [0, 0, 0, 0]),
    episode: 0,
    reward: 0,
    seed,
    path: [0],
    success: 0,
  };
}
export const move = (s: number, a: number, obstacles: number[]) => {
  const x = s % 5,
    y = Math.floor(s / 5),
    [dx, dy] = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ][a];
  const nx = clamp(x + dx, 0, 4),
    ny = clamp(y + dy, 0, 4),
    next = ny * 5 + nx;
  return obstacles.includes(next) ? s : next;
};
export function qEpisode(
  st: QState,
  alpha: number,
  gamma: number,
  epsilon: number,
  obstacles: number[],
  goalReward: number,
) {
  const n = structuredClone(st),
    r = rng(st.seed + st.episode);
  let s = 0,
    total = 0;
  const path = [0];
  for (let t = 0; t < 100; t++) {
    const best = n.q[s]
      .map((v, a) => ({ v, a }))
      .sort((a, b) => b.v - a.v || a.a - b.a)[0].a;
    const a = r() < epsilon ? Math.floor(r() * 4) : best;
    const next = move(s, a, obstacles),
      reward = next === 24 ? goalReward : -0.04;
    const target = reward + (next === 24 ? 0 : gamma * Math.max(...n.q[next]));
    n.q[s][a] += alpha * (target - n.q[s][a]);
    total += reward;
    s = next;
    path.push(s);
    if (s === 24) {
      n.success++;
      break;
    }
  }
  n.episode++;
  n.reward = total;
  n.path = path;
  return n;
}
export function queueModel(
  arrival: number,
  serviceMs: number,
  replicas: number,
  cache: number,
  failed: boolean,
) {
  const effective = arrival * (1 - cache),
    capacity = (replicas * 1000) / serviceMs,
    utilization = effective / capacity;
  return {
    capacity,
    utilization,
    throughput: failed ? 0 : Math.min(effective, capacity),
    latency:
      failed || utilization >= 1 ? Infinity : serviceMs / (1 - utilization),
    stable: !failed && utilization < 1,
  };
}
