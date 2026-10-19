export type AgentConfig = {
  failure: string;
  retries: number;
  approval: boolean;
  strategy: string;
  tool: string;
  prompt: string;
};
export type TraceEvent = {
  step: string;
  status: "ok" | "error" | "waiting";
  input: string;
  output: string;
  ms: number;
};
export type AgentState = {
  cursor: number;
  attempts: number;
  events: TraceEvent[];
  status: "idle" | "running" | "waiting" | "failed" | "complete";
};
export const initialAgent = (): AgentState => ({
  cursor: 0,
  attempts: 0,
  events: [],
  status: "idle",
});
export function stepAgent(
  state: AgentState,
  c: AgentConfig,
  approved = false,
): AgentState {
  if (
    state.status === "failed" ||
    state.status === "complete" ||
    (state.status === "waiting" && !approved)
  )
    return state;
  const n = structuredClone(state);
  n.status = "running";
  const emit = (
    step: string,
    status: TraceEvent["status"],
    input: string,
    output: string,
    ms: number,
  ) => n.events.push({ step, status, input, output, ms });
  if (n.cursor === 0) {
    emit("Router", "ok", c.prompt, "Route: knowledge + policy tools", 40);
    n.cursor++;
  } else if (n.cursor === 1) {
    emit(
      c.strategy === "parallel"
        ? "Parallel: retrieval + policy"
        : "Retrieve knowledge",
      "ok",
      "Search the illustrative local knowledge store",
      "Retrieved: renewal notice is 30 days before expiry.",
      c.strategy === "parallel" ? 180 : 160,
    );
    n.cursor++;
  } else if (n.cursor === 2) {
    n.attempts++;
    const fail =
      c.failure === "persistent" ||
      (c.failure === "transient" && n.attempts === 1);
    if (fail) {
      emit(
        c.tool,
        "error",
        `Attempt ${n.attempts}`,
        n.attempts <= c.retries
          ? "Timeout · retry scheduled"
          : "Timeout · retry budget exhausted",
        250,
      );
      if (n.attempts > c.retries) n.status = "failed";
    } else {
      emit(
        c.strategy === "parallel" ? "Merge parallel results" : c.tool,
        "ok",
        `Attempt ${n.attempts}`,
        "Policy validation succeeded. No external action performed.",
        c.strategy === "parallel" ? 10 : 120,
      );
      n.cursor++;
    }
  } else if (n.cursor === 3) {
    if (c.approval && !approved) {
      emit(
        "Human approval",
        "waiting",
        "Proposed response is ready",
        "Waiting for explicit approval.",
        0,
      );
      n.status = "waiting";
    } else {
      if (c.approval)
        emit(
          "Human approval",
          "ok",
          "User action",
          "Approved in the studio.",
          0,
        );
      else
        emit(
          "Approval gate",
          "ok",
          "Read-only response",
          "Approval not configured.",
          0,
        );
      n.cursor++;
    }
  } else {
    emit(
      "Respond",
      "ok",
      "Retrieved policy + tool result",
      "Illustrative response: send a renewal notice 30 days before expiry.",
      30,
    );
    n.cursor++;
    n.status = "complete";
  }
  return n;
}
