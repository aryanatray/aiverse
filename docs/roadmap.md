# Roadmap

## Current: v0.2 guided live laboratory

Eleven guided live starter labs with expanded explanations and worked examples, 15 starter path definitions, all requested topic names, local progress/settings, a working prerequisite graph, primary references, knowledge checks, and static production packaging. See coverage.md for precise scope.

## P0: validation and richer persistence

- Execute Chromium/Firefox/WebKit Playwright journeys and inspect screenshots at 375, 768, 1440 pixels, light/dark. Add browser-based coverage to continuous integration.
- Audit keyboard-only and screen-reader journeys; run axe and contrast checks with rendered styles.
- Measure initial navigation, worker latency, animation frame pacing, memory after 100 runs, and device/GPU fallbacks. Current numerical-kernel timings are not browser performance evidence.
- Add experiment snapshot schemas for edited ML points, neural checkpoints, optimizer state, timeline rewind, and A/B comparison.
- Split individual labs into lazy chunks if bundle profiling justifies it.

## P1: complete foundation lessons

- Derivatives, chain rule, eigenvectors, SVD, distributions, Bayes, entropy, bias/variance, held-out evaluation, data leakage, trees, ensembles, PCA, DBSCAN, and hyperparameter optimization.
- Dedicated modules require complete written explanations, exercises, actual computations where feasible, independent numerical cases, and integration tests before becoming discoverable as finished lessons.
- Promote role roadmaps into full learning paths only when every required module and milestone exists. Add meaningful assessments beyond one question per starter lab.

## P2: deep learning and generative AI

- Manual per-edge edits, additional objectives, checkpoint comparison, optimizer comparisons, CNN convolution, vision, recurrent models.
- Real BPE examples, Q/K/V projections, positional encodings, multi-head attention, complete block traces, KV-cache and decoding stages.
- Train LoRA A/B on a small differentiable task, then optionally support actual browser model inference. Model downloads remain optional with accurate size/runtime disclosures.

## P3: RAG, agents, data, and operations

- Labeled retrieval datasets and Recall@K/MRR/NDCG; hybrid scoring, actual embedding options, reranking and evaluation of grounded generation.
- Arbitrary node/edge editing with graph validation, tool schemas, conditional transitions, parallel state reducers, checkpointing, timeouts, and safe framework adapters.
- Framework lessons must use verified, version-pinned official APIs; none are currently implemented.
- Data modeling, medallion architecture, CDC, lineage, orchestration, MLOps/LLMOps/AgentOps, monitoring, drift, and rollback labs.

## P4: complete breadth

Computer vision, advanced RL, security/fairness/privacy, research concepts, multimodal learning, and deeper system design. Every one of the 337 taxonomy entries is a scope item rather than a claim of delivered instruction. Some broad labels may eventually map to multiple lessons. Expand the catalog for numerical stability, data governance, evaluation uncertainty, accessibility of ML interfaces, and distributed training when lesson ownership is clear.
