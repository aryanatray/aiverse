# Testing

## Commands

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

The optional Python reference check requires Python 3 and NumPy:

```bash
npm run check:examples
```

GitHub Actions runs the required JavaScript checks on pushes and pull requests. Python examples are a separate local verification step.

## Test organization

| File                           | Coverage                                                                                                                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/math.test.ts`           | Numerical reference cases, finite-difference gradients, seeded learning, workflow invariants, curriculum validation, persistence guards               |
| `tests/ui.test.tsx`            | Parameter controls, retrieval updates, progress, setting restoration, navigation, and lesson journeys                                                 |
| `tests/live-learning.test.tsx` | Autoplay, live parameter changes, pause/step/reset, visibility suspension, timer cleanup, approval boundaries, contextual guides, keyboard data entry |
| `tests/performance.test.ts`    | Bounded kernel timing observations and finite-output assertions                                                                                       |

## Numerical acceptance cases

- Stable softmax, normalized Top-K/Top-P filtering, and deterministic seeded samples.
- Matrix multiplication and scaled LoRA composition against independent arithmetic.
- Linear/logistic gradients and every tested neural weight/bias against central finite differences.
- Genuine XOR learning with the default seed and optimizer configuration.
- K-Means centroids and empty-cluster handling.
- Closed-form two-token attention and exact causal masking.
- Lexical matching, no-match behavior, chunk overlap, and empty retrieval input.
- Q-learning terminal handling, obstacle boundaries, and seeded learning.
- Queue-delay heuristic arithmetic, saturation, and outages.
- Bounded retries, persistent errors, and explicit human approval.
- Rejected malformed imports, invalid integer sizes, inherited-property identifiers, and corrupted storage.

## Coverage limits

Component tests run in jsdom. They do not replace real-browser end-to-end tests, actual worker execution checks, rendered contrast measurements, screen-reader audits, viewport screenshots, or mobile performance profiling. The current repository has no Playwright suite.

Performance tests record kernel timings under the executing runtime. Their measurements are not browser latency or frame-rate guarantees. Run device-level profiling before setting user-facing performance expectations.

## Latest local verification

Before the initial repository upload, strict TypeScript checking, ESLint, all 61 tests across four files, and the production build passed. All 11 Python reference examples executed successfully with NumPy. These are local results; GitHub Actions reports remote CI separately.
