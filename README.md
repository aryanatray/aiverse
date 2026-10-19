# AIverse

**Learn AI by changing the inputs and seeing what happens.**

AIverse is a browser-based learning laboratory for mathematics, machine learning, neural networks, language models, retrieval, and agent systems. Interactive visualizations connect parameter changes to the calculations behind them, with concise guidance beside the canvas and detailed lessons for deeper study.

Built with **React, TypeScript, and Vite**. No backend, account, API key, or paid inference service is required.

## Features

- **11 interactive laboratories** with real calculations or explicitly labeled simulations.
- **Live controls** with automatic playback, pause, single-step execution, and reset.
- **Contextual explanations** covering definitions, computational flows, current settings, and common mistakes.
- **Detailed lessons** with learning objectives, equations, worked examples, references, and knowledge checks.
- **Learning paths and a prerequisite graph** for structured study or independent exploration.
- **Local progress and experiment settings**, with JSON import and export.
- **Light, dark, and system themes**, responsive layouts, keyboard controls, and reduced-motion styles.

## Quick start

Requires **Node.js 22.12 or newer**. Node.js 24 is recommended; the repository includes an `.nvmrc` file.

```bash
git clone https://github.com/aryanatray/aiverse.git
cd aiverse
npm ci
npm run dev
```

Open the local URL printed by Vite. No environment variables are needed.

## Laboratories

| Laboratory                  | Implementation                                                                    |
| --------------------------- | --------------------------------------------------------------------------------- |
| Vectors and transformations | Matrix multiplication, determinants, transformed coordinates                      |
| Gradient descent            | Two-parameter optimization, momentum, loss curves, trajectories                   |
| Model playground            | Linear and logistic regression, K-Means, editable synthetic observations          |
| Neural networks             | Configurable dense networks, forward/backward propagation, SGD/Adam, XOR training |
| Fine-tuning and LoRA        | Frozen-parameter training and scaled low-rank matrix composition                  |
| Attention                   | Scaled dot-product attention, causal masking, heatmaps, weighted outputs          |
| Token sampling              | Temperature, Top-K, Top-P, reproducible sampling                                  |
| Retrieval                   | Chunking, overlap, TF-IDF/cosine, BM25, context assembly                          |
| Agent execution             | Deterministic workflow simulation, retries, failure injection, approval gates     |
| Reinforcement learning      | Tabular Q-learning in an editable grid environment                                |
| System capacity             | A documented utilization-based delay heuristic with caching and failure controls  |

The distinction between computation and simulation is part of the interface. Synthetic embeddings are not pretrained semantic representations; the agent workflow does not make external tool calls; the LoRA matrix view does not train a language model.

## Development

| Command                  | Purpose                                                            |
| ------------------------ | ------------------------------------------------------------------ |
| `npm run dev`            | Start the development server                                       |
| `npm test`               | Run numerical and component integration tests                      |
| `npm run typecheck`      | Check strict TypeScript types                                      |
| `npm run lint`           | Run ESLint                                                         |
| `npm run build`          | Type-check and generate `dist/`                                    |
| `npm run preview`        | Serve the production build locally                                 |
| `npm run format`         | Format source, tests, configuration, and documentation             |
| `npm run check:examples` | Execute the Python reference examples; requires Python 3 and NumPy |

GitHub Actions runs linting, tests, and the production build on pushes and pull requests. Numerical tests include independent matrix cases, finite-difference gradient checks, seeded learning, probability normalization, and bounded workflow transitions. See [Testing](docs/testing.md) for coverage and limitations.

## Project structure

```text
src/
  components/       Reusable controls, plots, and learning interfaces
  labs/             Interactive laboratory workspaces
  lib/              Numerical kernels, curriculum, state, and persistence
  App.tsx           Application shell and navigation
  main.tsx          Client entry point
  styles.css        Base design system
  workspace.css     Learning workspace layouts
tests/              Numerical, integration, and bounded performance checks
scripts/            Reference-example verification
docs/               Architecture, curriculum, coverage, and roadmap
.github/            Continuous integration and contribution templates
```

## Deployment

```bash
npm ci
npm run build
```

Deploy the contents of `dist/` to a static host. Routes use URL fragments and assets use a relative base, so repository subpaths do not require server-side route rewrites. For a local production check, run `npm run preview`.

The app has no runtime service dependencies. A cold page load still needs a server connection; it does not currently include a service worker or installable offline cache.

## Data and privacy

Progress and saved settings use local browser storage. Documents are processed in the browser, with retrieval calculations delegated to a worker when supported. There is no configured analytics or inference endpoint.

Saved experiments preserve control settings, retrieval text, and grid obstacles. They do not preserve trained model checkpoints, optimizer histories, or manually edited ML observations. Clearing browser storage removes local progress; export important experiments first. Exported JSON can contain any document text entered into the retrieval lab.

## Current scope

Version 0.2 provides eleven working starter laboratories. The 15 learning paths are starter sequences, and the 337-topic curriculum is a roadmap rather than a claim of complete course coverage. Advanced framework execution, pretrained inference, arbitrary graph editors, and complete role-based courses remain planned.

Real-browser end-to-end tests, visual regression checks, screen-reader audits, and device-level performance profiling remain outstanding. See the [coverage matrix](docs/coverage.md) and [roadmap](docs/roadmap.md).

## Documentation

- [Architecture](docs/architecture.md)
- [Curriculum](docs/curriculum.md)
- [Feature coverage](docs/coverage.md)
- [Testing](docs/testing.md)
- [Roadmap](docs/roadmap.md)
- [Educational references](docs/references.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## License

[MIT](LICENSE).
