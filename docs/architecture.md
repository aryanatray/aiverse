# Architecture

## Flow

The React shell chooses a curriculum lesson, mounts the matching lab, and receives a sanitized configuration snapshot. Each lab owns its bounded numerical state and rendering. A control change updates the relevant config; computation kernels return new results; SVG and textual metrics consume that same result. Training uses explicit step transitions, with automatic playback on entry. This deliberately avoids a single abstract simulator that would obscure differences between regression, Q-learning, retrieval, and workflow execution.

```text
src/App.tsx                 application shell, routes, progress, notebook, lesson UI
src/components/UI.tsx       shared accessible controls, plots, playback, metrics
src/labs/core.tsx            configuration hook and lab contract
src/labs/Foundations.tsx     algebra, optimization, model fitting
src/labs/DeepLearning.tsx    network training and low-rank adaptation
src/labs/Language.tsx        attention, sampling, retrieval
src/labs/Systems.tsx         workflow, Q-learning, queueing
src/lib/math.ts             pure numerical kernels and seeded randomness
src/lib/agent.ts            pure workflow state machine
src/lib/curriculum.ts       typed implemented lessons, paths, dependency validation
src/lib/taxonomy.json       all requested domain/topic entries, labeled planned
src/lib/storage.ts          bounded config schemas, defensive persistence, JSON export
src/lib/retrieval.worker.ts CPU isolation for lexical retrieval
```

## Learning workspace runtime

`LabRuntimeProvider` owns only the active lesson, sanitized settings, a small latest-metrics snapshot, and playback status. `Metrics` reports observable outputs through a stable callback; the right-hand guide combines them with the exact current settings. The guide never invents a model result. `lessonDetails.ts` holds the authored quick definitions, flow labels, deep explanations, independently derived worked examples, and references. The detailed reading component is lazy-loaded.

`usePlayback` keeps one interval, calls the latest step through a ref, and clears work when the workspace or browser document is hidden. It defaults to running, but manual pause intent survives lesson-tab changes. Parameter reset rules live beside each simulation so unrelated kernels are not forced into one reset model. Human approval and terminal errors remain enforced by the pure workflow state machine.

Desktop uses a compact navigation rail and controls/canvas/guide columns. Smaller screens move the guide into a compact expandable banner and stack the canvas and controls. Numerical plot colors have dark-theme tokens; browser visual audit is still outstanding.

## Interfaces and numerical assumptions

`LabProps` accepts an optional sanitized configuration and an `onConfig` callback. Each lab follows input → parameters → state → transition → observable values → visualization. Independent `math.ts` kernels do not access React, browser storage, or network services. `agent.ts` is a deterministic transition reducer with terminal failure and explicit approval handling. Network Adam uses bias-corrected first and second moments for both weights and biases. XOR uses binary cross-entropy plus a sigmoid output, so the output delta is prediction minus target.

All randomness derives from an explicit integer seed. Playback rates determine how fast steps are displayed, not simulated scientific time. Retrieval runs in a dedicated module worker with 150 ms debouncing and termination on replacement/unmount. A bounded synchronous fallback is available if workers cannot start. Heavy neural training is bounded to 5,000 epochs, at most three hidden layers and eight neurons per hidden layer. Training histories are capped; retrieval text is capped at 20,000 characters, uploaded text at 20 KB, notebook items at 40, Q-learning episodes at 100 transitions, sample history at 100.

## Routing, persistence, and state

Hash routes make deployment possible without server fallback configuration. Programmatic history changes avoid race conditions between notebook restore and hash handlers; browser back/forward is handled separately. Experiment/lesson/code/check tabs keep the mounted lab state. Leaving a lab releases its timers and worker.

Preferences, progress, and saved experiment configurations use version-prefixed localStorage keys. Reads tolerate invalid JSON. Config reconstruction checks types, ranges, integer constraints, enums, and own-property lesson IDs. Saved settings do not include model checkpoint tensors or edited training observations. The app reports unsuccessful persistence and continues with in-memory state. User content is rendered as React text, never HTML or executable code. External references use `rel=noreferrer`.

## Design and tradeoffs

System fonts, inline SVG, CSS tokens, light/dark/system themes, visible focus, reduced-motion CSS, small reusable controls, and no third-party visualization runtime keep the bundle small. Exact shapes are custom SVG because the supported algorithms are tiny and fully inspectable. A lazy lab entry separates most computation workspaces from the shell; the React runtime is a separate cacheable vendor chunk. The home preview reuses the optimization rendering, so some foundation kernels enter the initial bundle.

No paid dependencies or mandatory services exist. A later expansion can add an IndexedDB schema, numerical libraries for larger decompositions, separate lazy chunks per lab, a general workflow editor, worker-based neural training, and optional downloaded inference. Do not add these until a verified lesson needs them.
