import { describe, it, expect } from "vitest";
import {
  rng,
  softmax,
  sampling,
  sample,
  dot,
  matmul,
  lora,
  regressionStep,
  regressionLoss,
  kmeansStep,
  attention,
  createNetwork,
  networkStep,
  forward,
  chunkDocuments,
  retrieve,
  qInitial,
  qEpisode,
  queueModel,
  move,
  dataset,
} from "../src/lib/math";
import { validateCurriculum, lessons, domains } from "../src/lib/curriculum";
import {
  sanitize,
  parseExperiment,
  loadProgress,
  loadExperiments,
  storage,
} from "../src/lib/storage";
import { stepAgent, initialAgent, type AgentConfig } from "../src/lib/agent";
describe("independent numerical reference cases", () => {
  it("seeded PRNG reproduces a sequence", () => {
    const a = rng(42),
      b = rng(42);
    expect(Array.from({ length: 10 }, a)).toEqual(
      Array.from({ length: 10 }, b),
    );
  });
  it("softmax is stable at large logits and rejects invalid temperature", () => {
    expect(softmax([10000, 10000])).toEqual([0.5, 0.5]);
    expect(() => softmax([1], 0)).toThrow();
  });
  it("Top-K=1 is deterministic and nucleus filtering is normalized", () => {
    const p = sampling([3, 2, 1], 0.5, 1, 0.9);
    expect(p).toEqual([1, 0, 0]);
    expect(sample(p, 99)).toBe(0);
    expect(sampling([0, 0, 0], 1, 3, 0.5)).toEqual([0.5, 0.5, 0]);
    expect(sampling([2, 1, 0], 1, 2, 1).reduce((a, b) => a + b, 0)).toBeCloseTo(
      1,
      12,
    );
  });
  it("matrix products match hand arithmetic and reject dimension mismatch", () => {
    expect(
      matmul(
        [
          [1, 2],
          [3, 4],
        ],
        [[5], [6]],
      ),
    ).toEqual([[17], [39]]);
    expect(() => matmul([[1, 2]], [[1, 2]])).toThrow();
    expect(() => dot([1], [1, 2])).toThrow();
  });
  it("LoRA applies alpha/r and preserves a frozen base", () => {
    const w = [
      [1, 0],
      [0, 1],
    ];
    expect(lora(w, [[0.1, 0.1]], [[0.2], [0.2]], 2)).toEqual([
      [1.04, 0.04000000000000001],
      [0.04000000000000001, 1.04],
    ]);
    expect(w).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });
  it("regression gradients agree with a central finite difference", () => {
    const d = [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
      w = 0.3,
      b = 0.2,
      eps = 1e-6,
      s = regressionStep(d, w, b, 0.1);
    const dw =
      (regressionLoss(d, w + eps, b) - regressionLoss(d, w - eps, b)) /
      (2 * eps);
    expect(s.dw).toBeCloseTo(dw, 6);
    const db =
      (regressionLoss(d, w, b + eps) - regressionLoss(d, w, b - eps)) /
      (2 * eps);
    expect(s.db).toBeCloseTo(db, 6);
  });
  it("frozen parameters do not update", () => {
    const v = regressionStep([{ x: 1, y: 3 }], 1, 0, 0.1, false, true, false);
    expect(v.w).toBe(1);
    expect(v.b).toBeCloseTo(0.4);
  });
  it("logistic gradient matches finite difference", () => {
    const d = [
        { x: -1, y: 0 },
        { x: 2, y: 1 },
      ],
      s = regressionStep(d, 0.4, 0.2, 0.1, true),
      eps = 1e-6;
    expect(s.dw).toBeCloseTo(
      (regressionLoss(d, 0.4 + eps, 0.2, true) -
        regressionLoss(d, 0.4 - eps, 0.2, true)) /
        (2 * eps),
      6,
    );
  });
  it("K-Means computes arithmetic means and preserves empty clusters", () => {
    const d = [
        { x: 0, y: 0 },
        { x: 2, y: 0 },
        { x: 10, y: 0 },
      ],
      r = kmeansStep(d, [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 100, y: 100 },
      ]);
    expect(r.centers).toEqual([
      { x: 1, y: 0 },
      { x: 10, y: 0 },
      { x: 100, y: 100 },
    ]);
    expect(r.inertia).toBe(2);
  });
  it("attention matches a closed-form two-token result", () => {
    const r = attention(
      [
        [1, 0],
        [0, 1],
      ],
      [
        [1, 0],
        [0, 1],
      ],
      [
        [1, 0],
        [0, 1],
      ],
      false,
    );
    const p = Math.exp(1 / Math.sqrt(2)) / (Math.exp(1 / Math.sqrt(2)) + 1);
    expect(r.weights[0][0]).toBeCloseTo(p, 12);
    expect(r.output).toEqual(r.weights);
    const masked = attention(
      [
        [1, 0],
        [0, 1],
      ],
      [
        [1, 0],
        [0, 1],
      ],
      [
        [1, 0],
        [0, 1],
      ],
      true,
    );
    expect(masked.weights[0]).toEqual([1, 0]);
  });
  const xor = [
    { x: [0, 0], y: 0 },
    { x: [0, 1], y: 1 },
    { x: [1, 0], y: 1 },
    { x: [1, 1], y: 0 },
  ];
  const loss = (net: ReturnType<typeof createNetwork>) =>
    xor.reduce((sum, p) => {
      const q = forward(net, p.x, "tanh").output;
      return sum - (p.y * Math.log(q)) / 4 - ((1 - p.y) * Math.log(1 - q)) / 4;
    }, 0);
  it("backprop agrees with finite differences across every layer and bias", () => {
    const net = createNetwork(4, 2, 2),
      next = networkStep(net, 0.001, "tanh"),
      eps = 1e-5;
    net.weights.forEach((matrix, l) =>
      matrix.forEach((row, j) =>
        row.forEach((v, k) => {
          const plus = structuredClone(net),
            minus = structuredClone(net);
          plus.weights[l][j][k] += eps;
          minus.weights[l][j][k] -= eps;
          const numerical = (loss(plus) - loss(minus)) / (2 * eps),
            analytic = (v - next.weights[l][j][k]) / 0.001;
          expect(analytic).toBeCloseTo(numerical, 6);
        }),
      ),
    );
    net.biases.forEach((row, l) =>
      row.forEach((v, j) => {
        const plus = structuredClone(net),
          minus = structuredClone(net);
        plus.biases[l][j] += eps;
        minus.biases[l][j] -= eps;
        expect((v - next.biases[l][j]) / 0.001).toBeCloseTo(
          (loss(plus) - loss(minus)) / (2 * eps),
          6,
        );
      }),
    );
  });
  it("Adam genuinely learns XOR from the default seed", () => {
    let net = createNetwork(42, 4, 1);
    for (let i = 0; i < 1200; i++) net = networkStep(net, 0.03, "tanh", true);
    expect(net.loss).toBeLessThan(0.02);
    xor.forEach((p) =>
      expect(forward(net, p.x, "tanh").output > 0.5).toBe(Boolean(p.y)),
    );
  });
  it("chunk overlap is bounded and BM25 / TF-IDF retrieve the matching source", () => {
    expect(() => chunkDocuments("a b c", 2, 2)).toThrow();
    const chunks = chunkDocuments(
      "cats sleep quietly\n\ndogs run outside",
      8,
      0,
    );
    for (const method of ["tfidf", "bm25"] as const) {
      expect(retrieve(chunks, "cats", method)[0].source).toBe(1);
      expect(
        retrieve(chunks, "unknown", method).every((r) => r.score === 0),
      ).toBe(true);
    }
    expect(chunkDocuments("", 8, 0)).toEqual([]);
  });
  it("Q-learning updates a terminal transition with no bootstrap value", () => {
    let state = qInitial(1);
    for (let i = 0; i < 400; i++)
      state = qEpisode(state, 0.2, 0.95, 0.3, [7, 12, 17], 1);
    expect(state.success).toBeGreaterThan(200);
    expect(Math.max(...state.q[23])).toBeGreaterThan(0.5);
    expect(state.q[24]).toEqual([0, 0, 0, 0]);
    expect(move(0, 0, [])).toBe(0);
    expect(move(6, 1, [7])).toBe(6);
  });
  it("queue estimates match the documented reference and saturation is explicit", () => {
    expect(queueModel(10, 100, 2, 0, false).latency).toBe(200);
    expect(queueModel(20, 100, 2, 0, false).latency).toBe(Infinity);
    expect(queueModel(5, 100, 2, 0, true).throughput).toBe(0);
  });
  it("synthetic datasets are reproducible", () => {
    expect(dataset(1)).toEqual(dataset(1));
    expect(dataset(1)).not.toEqual(dataset(2));
  });
});
describe("bounded agent state machine", () => {
  const base: AgentConfig = {
    failure: "none",
    retries: 2,
    approval: false,
    strategy: "sequential",
    tool: "Tool",
    prompt: "Policy",
  };
  it("persistent failure stops after initial attempt plus retry budget", () => {
    let s = initialAgent();
    for (let i = 0; i < 10; i++)
      s = stepAgent(s, { ...base, failure: "persistent" });
    expect(s.status).toBe("failed");
    expect(s.attempts).toBe(3);
    expect(s.events.filter((e) => e.status === "error")).toHaveLength(3);
  });
  it("transient failure recovers and explicit approval gates progress", () => {
    let s = initialAgent();
    for (let i = 0; i < 7; i++)
      s = stepAgent(s, { ...base, failure: "transient", approval: true });
    expect(s.status).toBe("waiting");
    expect(s.attempts).toBe(2);
    expect(stepAgent(s, { ...base, approval: true })).toEqual(s);
    s = stepAgent(s, { ...base, approval: true }, true);
    s = stepAgent(s, { ...base, approval: true });
    expect(s.status).toBe("complete");
  });
});
describe("curriculum and untrusted persistence", () => {
  it("validates prerequisites and all 15 taxonomy domains", () => {
    expect(validateCurriculum()).toBe(true);
    expect(domains).toHaveLength(15);
    expect(lessons).toHaveLength(11);
    expect(domains.reduce((s, d) => s + d.topics.length, 0)).toBe(337);
  });
  it("sanitizes numeric bounds, integer constraints, strings, and enums", () => {
    const c = sanitize("neural-network", {
      width: 100000,
      depth: 1.5,
      activation: "eval",
      lr: NaN,
      seed: 3,
    });
    expect(c.width).toBe(4);
    expect(c.depth).toBe(1);
    expect(c.activation).toBe("tanh");
    expect(c.lr).toBe(0.03);
    expect(c.seed).toBe(3);
  });
  it("rejects inherited-object identifiers in imported files", () => {
    expect(() => parseExperiment('{"lab":"__proto__","config":{}}')).toThrow();
    expect(() => parseExperiment("null")).toThrow();
    expect(() => parseExperiment("x".repeat(100001))).toThrow();
  });
  it("recovers from corrupted storage", () => {
    localStorage.setItem("aiverse.v1.progress", "{bad");
    expect(loadProgress()).toEqual({ completed: [] });
    storage.write("progress", {
      completed: ["optimization", "nope", "optimization"],
      last: "__proto__",
    });
    expect(loadProgress().completed).toEqual(["optimization"]);
    expect(loadProgress().last).toBeUndefined();
    storage.write("experiments", [
      { id: "x", name: "x", created: "x", lab: "__proto__", config: {} },
    ]);
    expect(loadExperiments()).toEqual([]);
  });
});
