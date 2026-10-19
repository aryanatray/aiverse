import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LabFrame,
  Playback,
  usePlayback,
  Range,
  Select,
  Toggle,
  Metrics,
  Icon,
} from "../components/UI";
import {
  attention,
  toyEmbeddings,
  sampling,
  sample,
  chunkDocuments,
  retrieve,
  tokenize,
} from "../lib/math";
import { download } from "../lib/storage";
import { Matrix } from "./DeepLearning";
import { useConfig, fixed, type LabProps } from "./core";
export function Transformers(props: LabProps) {
  const { n, s, b, set } = useConfig("transformers", props);
  const tokens = (
      s("tokenizer") === "words"
        ? s("text").trim().split(/\s+/)
        : Array.from(s("text").trim())
    )
      .filter(Boolean)
      .slice(0, 8),
    ts = tokens.length ? tokens : ["∅"],
    emb = toyEmbeddings(ts),
    result = attention(emb, emb, emb, b("causal"), n("temperature")),
    selected = Math.min(n("selected"), ts.length - 1);
  return (
    <LabFrame
      controls={
        <>
          <label className="text-control">
            Input text
            <input
              value={s("text")}
              maxLength={100}
              onChange={(e) => set("text", e.target.value)}
            />
          </label>
          <Select
            label="Token splitting demonstration"
            value={s("tokenizer")}
            options={[
              ["words", "Whitespace"],
              ["characters", "Characters"],
            ]}
            onChange={(v) => set("tokenizer", v)}
          />
          <Toggle
            label="Causal attention mask"
            value={b("causal")}
            onChange={(v) => set("causal", v)}
          />
          <Range
            label="Softmax temperature"
            min={0.1}
            max={3}
            step={0.1}
            value={n("temperature")}
            onChange={(v) => set("temperature", v)}
          />
          <p className="control-help">
            Up to 8 tokens, 4 dimensions. Select a token to inspect its weighted
            representation. Seeded vectors use Q = K = V; no trained embeddings,
            positions, or multi-head projections.
          </p>
        </>
      }
      note="Real scaled dot-product attention on synthetic token vectors. This is a single attention operation, not a full pretrained transformer."
    >
      <div className="viz-heading">
        <span>WHO ATTENDS TO WHOM?</span>
        <span className="tag">Query → Key</span>
      </div>
      <div className="token-row">
        {ts.map((t, i) => (
          <button
            key={i}
            className={`token ${selected === i ? "selected" : ""}`}
            onClick={() => set("selected", i)}
          >
            <small>{i}</small>
            {t}
          </button>
        ))}
      </div>
      <div className="attention-area">
        <div className="attention-labels">
          {ts.map((t, i) => (
            <button
              key={i}
              onClick={() => set("selected", i)}
              className={selected === i ? "selected" : ""}
            >
              {t}
            </button>
          ))}
        </div>
        <div
          className="attention-matrix"
          style={{ gridTemplateColumns: `repeat(${ts.length},1fr)` }}
        >
          {result.weights.flatMap((row, i) =>
            row.map((w, j) => (
              <button
                key={`${i}-${j}`}
                style={{ background: `rgba(83,130,91,${0.06 + w * 0.85})` }}
                className={selected === i ? "selected" : ""}
                onClick={() => set("selected", i)}
                aria-label={`${ts[i]} attends to ${ts[j]}: ${fixed(w, 3)}`}
                title={`${ts[i]} → ${ts[j]}: ${fixed(w, 4)}`}
              >
                {w === 0 ? "—" : fixed(w, 2)}
              </button>
            )),
          )}
        </div>
      </div>
      <div className="attention-detail">
        <Matrix
          data={[emb[selected]]}
          label={`Input vector · ${ts[selected]}`}
        />
        <Icon name="arrow" />
        <Matrix data={[result.output[selected]]} label="Weighted output" />
      </div>
      <Metrics
        items={[
          ["Tokens", ts.length],
          ["Dimension dₖ", 4],
          [
            "Selected row sum",
            fixed(
              result.weights[selected].reduce((a, b) => a + b, 0),
              4,
            ),
          ],
          ["Mask", b("causal") ? "Causal" : "Bidirectional"],
        ]}
      />
    </LabFrame>
  );
}
const words = [
  "learn",
  "build",
  "explore",
  "understand",
  "question",
  "create",
  "imagine",
  "repeat",
];
const logits = [3.1, 2.7, 2.2, 1.8, 1.3, 1, 0.6, 0.1];
export function Sampling(props: LabProps) {
  const { n, set } = useConfig("sampling", props);
  const [draws, setDraws] = useState<number[]>([]),
    [drawCount, setDrawCount] = useState(0),
    probs = sampling(logits, n("temperature"), n("k"), n("p"));
  const step = useCallback(() => {
    setDraws((p) => [...p, sample(probs, n("seed") + drawCount)].slice(-100));
    setDrawCount((v) => v + 1);
  }, [probs, n("seed"), drawCount]);
  const { running, setRunning } = usePlayback(step, 850);
  useEffect(() => {
    setDraws([]);
    setDrawCount(0);
    setRunning(true);
  }, [n("temperature"), n("k"), n("p"), n("seed")]);
  return (
    <LabFrame
      controls={
        <>
          <Range
            label="Temperature"
            min={0.1}
            max={2}
            step={0.05}
            value={n("temperature")}
            onChange={(v) => set("temperature", v)}
          />
          <Range
            label="Top-K"
            min={1}
            max={8}
            step={1}
            value={n("k")}
            onChange={(v) => set("k", v)}
          />
          <Range
            label="Top-P"
            min={0.05}
            max={1}
            step={0.05}
            value={n("p")}
            onChange={(v) => set("p", v)}
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
            onRun={() => setRunning(!running)}
            onStep={step}
            onReset={() => {
              setDraws([]);
              setDrawCount(0);
              setRunning(true);
            }}
          />
          <button className="button full" onClick={step}>
            Sample a token
          </button>
          <p className="control-help">
            Sampling is reproducible from the seed. Parameter changes reset the
            draws. Distribution is fixed, so this is not autoregressive
            generation.
          </p>
        </>
      }
      note="Logits are fixed educational values. Top-K filtering precedes Top-P on normalized candidates. No language model is running."
    >
      <div className="viz-heading">
        <span>“TODAY, LET’S…”</span>
        <span className="tag">Next-token probabilities</span>
      </div>
      <div className="prob-bars">
        {words.map((w, i) => (
          <div key={w} className={draws.at(-1) === i ? "last-draw" : ""}>
            <span>{w}</span>
            <div className="bar-track">
              <div style={{ width: `${probs[i] * 100}%` }} />
            </div>
            <strong>{(probs[i] * 100).toFixed(1)}%</strong>
          </div>
        ))}
      </div>
      <div className="draws">
        <span className="eyebrow">SAMPLED TOKENS</span>
        <div>
          {draws.length ? (
            draws.slice(-20).map((i, j) => <span key={j}>{words[i]}</span>)
          ) : (
            <p>Sample a token to see the distribution in action.</p>
          )}
        </div>
      </div>
      <Metrics
        items={[
          ["Candidates", probs.filter((p) => p > 0).length],
          [
            "Entropy (nats)",
            fixed(-probs.reduce((a, p) => a + (p ? p * Math.log(p) : 0), 0)),
          ],
          ["Draws", drawCount],
          ["Last token", draws.length ? words[draws.at(-1)!] : "—"],
        ]}
      />
    </LabFrame>
  );
}
type Retrieved = ReturnType<typeof retrieve>;
export function Rag(props: LabProps) {
  const { n, s, set } = useConfig("rag", props);
  const [error, setError] = useState(""),
    [ranked, setRanked] = useState<Retrieved>([]),
    [busy, setBusy] = useState(false);
  const chunks = useMemo(
    () => chunkDocuments(s("documents"), n("size"), n("overlap")),
    [s("documents"), n("size"), n("overlap")],
  );
  useEffect(() => {
    let worker: Worker | undefined;
    let alive = true;
    setBusy(true);
    setRanked([]);
    const t = setTimeout(() => {
      const done = (rows: Retrieved) => {
        if (alive) {
          setRanked(rows);
          setBusy(false);
        }
      };
      if (typeof Worker !== "undefined") {
        try {
          worker = new Worker(
            new URL("../lib/retrieval.worker.ts", import.meta.url),
            { type: "module" },
          );
          worker.onmessage = (e) => done(e.data as Retrieved);
          worker.onerror = () => {
            setError(
              "Background worker failed. Using bounded local retrieval.",
            );
            done(retrieve(chunks, s("query"), s("method") as "tfidf" | "bm25"));
          };
          worker.postMessage({
            chunks,
            query: s("query"),
            method: s("method"),
          });
        } catch {
          done(retrieve(chunks, s("query"), s("method") as "tfidf" | "bm25"));
        }
      } else
        done(retrieve(chunks, s("query"), s("method") as "tfidf" | "bm25"));
    }, 150);
    return () => {
      alive = false;
      clearTimeout(t);
      worker?.terminate();
    };
  }, [chunks, s("query"), s("method")]);
  const results = ranked.filter((r) => r.score > 0).slice(0, n("k"));
  return (
    <>
      <LabFrame
        controls={
          <>
            <label className="text-control">
              Search query
              <input
                value={s("query")}
                maxLength={200}
                onChange={(e) => set("query", e.target.value)}
              />
            </label>
            <Select
              label="Retrieval algorithm"
              value={s("method")}
              options={[
                ["tfidf", "TF-IDF + cosine"],
                ["bm25", "BM25"],
              ]}
              onChange={(v) => set("method", v)}
            />
            <Range
              label="Chunk size · words"
              min={8}
              max={80}
              step={1}
              value={n("size")}
              onChange={(v) => set("size", v)}
            />
            <Range
              label="Overlap · words"
              min={0}
              max={7}
              step={1}
              value={n("overlap")}
              onChange={(v) => set("overlap", v)}
            />
            <Range
              label="Top-K chunks"
              min={1}
              max={8}
              step={1}
              value={n("k")}
              onChange={(v) => set("k", v)}
            />
            <label className="upload-label">
              Import .txt or .md
              <input
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 20000) {
                    setError("Use a text file smaller than 20 KB.");
                    return;
                  }
                  if (!/\.(txt|md)$/i.test(file.name)) {
                    setError("Only .txt and .md files are supported.");
                    return;
                  }
                  try {
                    set("documents", await file.text());
                    setError("");
                  } catch {
                    setError("This file could not be read.");
                  }
                }}
              />
            </label>
            <button
              className="button full"
              disabled={busy}
              onClick={() =>
                download("aiverse-retrieval.json", {
                  query: s("query"),
                  method: s("method"),
                  results,
                })
              }
            >
              <Icon name="download" size={16} />
              Export retrieval
            </button>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
          </>
        }
        note="Offline lexical retrieval. Scores are not calibrated relevance probabilities. No generation or ground-truth evaluation is performed."
      >
        <div className="viz-heading">
          <span>DOCUMENT → CHUNKS → RETRIEVAL → CONTEXT</span>
          <span className="tag">{busy ? "Computing…" : "Live results"}</span>
        </div>
        <div className="pipeline-strip">
          {[
            ["Documents", new Set(chunks.map((c) => c.source)).size],
            ["Chunks", chunks.length],
            ["Matches", results.length],
            [
              "Context tokens*",
              tokenize(results.map((r) => r.text).join(" ")).length,
            ],
          ].map(([name, v]) => (
            <div key={name}>
              <Icon name="pipeline" />
              <strong>{v}</strong>
              <span>{name}</span>
            </div>
          ))}
        </div>
        <div className="retrieval-list" aria-live="polite" aria-busy={busy}>
          {results.length ? (
            results.map((r, i) => (
              <article key={r.id}>
                <div>
                  <span className="rank">{i + 1}</span>
                  <strong>
                    Source {r.source} · Chunk {r.id + 1}
                  </strong>
                  <code>{fixed(r.score, 4)}</code>
                </div>
                <p>{r.text}</p>
              </article>
            ))
          ) : (
            <div className="empty-state">
              {busy
                ? "Updating retrieval…"
                : "No lexical matches. Try a term present in the documents."}
            </div>
          )}
        </div>
        <p className="control-help">
          *Word-like tokens, not a model tokenizer.
        </p>
      </LabFrame>
      <details className="document-editor" open>
        <summary>
          Edit source documents{" "}
          <span>
            Separate sources with a blank line · 20,000 characters max
          </span>
        </summary>
        <textarea
          aria-label="Source documents"
          value={s("documents")}
          maxLength={20000}
          rows={7}
          onChange={(e) => set("documents", e.target.value)}
        />
      </details>
      <details className="document-editor">
        <summary>Inspect assembled context</summary>
        <pre>
          {results
            .map((r) => `[Source ${r.source}, chunk ${r.id + 1}]\n${r.text}`)
            .join("\n\n") || "No context assembled."}
        </pre>
      </details>
    </>
  );
}
