# Contributing

1. Fork or clone the source; use Node 24 and `npm ci`.
2. Add a pure kernel in `src/lib/` with independent reference tests before implementing a visualization.
3. Add a bounded configuration schema in `src/lib/storage.ts` and a matching typed lesson in `src/lib/curriculum.ts`. Provide objectives through the exercise and concept; explicitly document what executes, data assumptions, equation, failure mode, Python example, and a primary reference.
4. Add the lab component and register it in `src/labs/index.tsx`. Reuse controls where they match the scientific interaction. All visible actions must work. Keep computation state separate from rendering and explain reset behavior.
5. Set prerequisite IDs. Registry validation rejects missing references and cycles. Reuse lesson IDs across paths; do not duplicate lesson content.
6. Add numerical reference tests and integration tests for the parameter → computation → visualization chain, reset, and persistence where applicable. Use finite differences for new gradients, independently derived expectations for matrix math, and fixed seeds for stochastic kernels.
7. Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run check:examples` with Python + NumPy. Update coverage and the testing documentation. Do not report browser tests or screenshots unless actually executed.
8. Format with `npm run format`. Do not add secrets, API requirements, generated build output, or node_modules to commits.

PRs should identify the learning behavior, actual vs simulated computation, supported range, numerical verification, UI checks, and known limitations. Changing a catalog entry never upgrades its implementation status automatically.
