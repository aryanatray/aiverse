import { it, expect } from "vitest";
import {
  chunkDocuments,
  retrieve,
  createNetwork,
  networkStep,
} from "../src/lib/math";
it("measures bounded large-corpus retrieval and a neural training batch", () => {
  const text = Array.from({ length: 2000 }, (_, i) => `term${i}`).join(" ");
  const chunks = chunkDocuments(text, 24, 4);
  const start = performance.now();
  const rows = retrieve(chunks, "term142 term143", "tfidf");
  const retrievalMs = performance.now() - start;
  expect(rows[0].text).toContain("term142");
  expect(rows.every((r) => Number.isFinite(r.score))).toBe(true);
  let net = createNetwork(42, 8, 3);
  const trainStart = performance.now();
  for (let i = 0; i < 10; i++) net = networkStep(net, 0.03, "tanh", true);
  expect(Number.isFinite(net.loss)).toBe(true);
  console.log(
    JSON.stringify({
      environment: "Node/jsdom; not browser UI",
      corpusCharacters: text.length,
      chunks: chunks.length,
      retrievalMs: +retrievalMs.toFixed(2),
      tenEpochsMs: +(performance.now() - trainStart).toFixed(2),
    }),
  );
});
