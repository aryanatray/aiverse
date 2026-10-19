import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
  within,
} from "@testing-library/react";
import App from "../src/App";
import { Optimization, MachineLearning } from "../src/labs/Foundations";
import { FineTuning, NeuralNetwork } from "../src/labs/DeepLearning";
import { Rag, Sampling } from "../src/labs/Language";
import { Agents } from "../src/labs/Systems";
const props = { onConfig: () => {} };
function pause() {
  const button = screen.queryByRole("button", { name: "Pause" });
  if (button) fireEvent.click(button);
}
beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, "", "#explore");
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  vi.stubGlobal("scrollTo", () => {});
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("controls, computations, and state transitions", () => {
  it("gradient descent controls affect the actual next step and reset", () => {
    render(<Optimization {...props} />);
    fireEvent.change(screen.getByLabelText("Learning rate η"), {
      target: { value: ".1" },
    });
    pause();
    fireEvent.click(screen.getByRole("button", { name: "Step" }));
    expect(screen.getByText("6.52500")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reset experiment" }));
    expect(screen.getByText("12.50000")).toBeTruthy();
  });
  it("ML algorithm changes update the experiment", () => {
    render(<MachineLearning {...props} />);
    fireEvent.change(screen.getByLabelText("Algorithm"), {
      target: { value: "kmeans" },
    });
    expect(screen.getByLabelText("Clusters K")).toBeTruthy();
    pause();
    fireEvent.click(screen.getByRole("button", { name: "Step" }));
    expect(screen.getByText("2 centroids")).toBeTruthy();
  });
  it("neural architecture changes reset training", () => {
    render(<NeuralNetwork {...props} />);
    pause();
    fireEvent.click(screen.getByRole("button", { name: "Step" }));
    const epoch = screen.getByText("Epoch").parentElement!;
    expect(within(epoch).getByText("1")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Hidden layers"), {
      target: { value: "2" },
    });
    expect(within(epoch).getByText("0")).toBeTruthy();
  });
  it("frozen fine-tuning slope stays fixed and LoRA rank changes parameter count", () => {
    render(<FineTuning {...props} />);
    fireEvent.click(screen.getByLabelText("Freeze slope w"));
    pause();
    fireEvent.click(screen.getByRole("button", { name: "Step" }));
    const slope = screen.getByText("Current slope").parentElement!;
    expect(within(slope).getByText("0.300")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "LoRA matrix lab" }));
    fireEvent.change(screen.getByLabelText("Adapter rank r"), {
      target: { value: "4" },
    });
    expect(
      within(screen.getByText("Adapter parameters").parentElement!).getByText(
        "32",
      ),
    ).toBeTruthy();
  });
  it("retrieval updates when query changes and handles an empty corpus", async () => {
    render(<Rag {...props} />);
    await waitFor(() =>
      expect(screen.getByText(/Source 1 · Chunk/)).toBeTruthy(),
    );
    fireEvent.change(screen.getByLabelText("Search query"), {
      target: { value: "xyznotpresent" },
    });
    expect(
      screen
        .getByRole("button", { name: "Export retrieval" })
        .hasAttribute("disabled"),
    ).toBe(true);
    await waitFor(() =>
      expect(screen.getByText(/No lexical matches/)).toBeTruthy(),
    );
    expect(
      screen
        .getByRole("button", { name: "Export retrieval" })
        .hasAttribute("disabled"),
    ).toBe(false);
    fireEvent.change(screen.getByLabelText("Source documents"), {
      target: { value: "" },
    });
    await waitFor(() =>
      expect(screen.getByText("No context assembled.")).toBeTruthy(),
    );
  });
  it("sampling filters to a single candidate and changes the displayed token", () => {
    render(<Sampling {...props} />);
    fireEvent.change(screen.getByLabelText("Top-K"), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sample a token" }));
    expect(screen.getByText("100.0%")).toBeTruthy();
    expect(
      within(screen.getByText("Last token").parentElement!).getByText("learn"),
    ).toBeTruthy();
  });
  it("agent simulation waits for explicit approval", () => {
    render(<Agents {...props} />);
    fireEvent.click(screen.getByLabelText("Require human approval"));
    pause();
    for (let i = 0; i < 4; i++)
      fireEvent.click(screen.getByRole("button", { name: "Step" }));
    expect(screen.getByText("Paused at the human approval gate")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Approve this response" }),
    );
    pause();
    fireEvent.click(screen.getByRole("button", { name: "Step" }));
    expect(screen.getByText("Workflow completed")).toBeTruthy();
  });
});
describe("application journeys", () => {
  it("completes a knowledge check and restores progress on remount", async () => {
    const { unmount } = render(<App />);
    fireEvent.click(
      screen.getByRole("button", { name: /Start with a guided lab/ }),
    );
    await screen.findByText("THE LOSS LANDSCAPE");
    fireEvent.click(screen.getByRole("button", { name: "Knowledge check" }));
    fireEvent.click(screen.getByText("0.1"));
    fireEvent.click(screen.getByRole("button", { name: /Check answer/ }));
    expect(screen.getByText("Exactly.")).toBeTruthy();
    expect(
      JSON.parse(localStorage.getItem("aiverse.v1.progress")!).completed,
    ).toContain("optimization");
    unmount();
    history.replaceState(null, "", "#learning");
    render(<App />);
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText("Your completed labs")).toBeTruthy();
  });
  it("saves settings and restores them without losing them to hash navigation", async () => {
    render(<App />);
    fireEvent.click(
      screen.getByRole("button", { name: /Start with a guided lab/ }),
    );
    await screen.findByLabelText("Learning rate η");
    fireEvent.change(screen.getByLabelText("Learning rate η"), {
      target: { value: ".3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save settings" }));
    fireEvent.click(screen.getByRole("button", { name: "My learning" }));
    fireEvent.click(screen.getByRole("button", { name: "Restore" }));
    expect(
      ((await screen.findByLabelText("Learning rate η")) as HTMLInputElement)
        .value,
    ).toBe("0.3");
  });
  it("explores paths, the knowledge graph, and honest planned-topic results", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Learning paths" }));
    expect(screen.getByText("Mathematics for Machine Learning")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Knowledge graph" }));
    expect(
      screen.getByRole("img", { name: "Lesson prerequisite graph" }),
    ).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Search concepts and labs"), {
      target: { value: "Mamba" },
    });
    expect(screen.getByText("Mamba-style architectures")).toBeTruthy();
    expect(screen.getByText("Planned")).toBeTruthy();
  });
  it("reading the lesson does not discard an experiment in progress", async () => {
    render(<App />);
    fireEvent.click(
      screen.getByRole("button", { name: /Start with a guided lab/ }),
    );
    await screen.findByText("THE LOSS LANDSCAPE");
    pause();
    fireEvent.click(screen.getByRole("button", { name: "Step" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Understand the concept" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /^Experiment$/ }));
    expect(
      within(screen.getByText("Iteration").parentElement!).getByText("1"),
    ).toBeTruthy();
  });
  it("opens the in-depth explanation directly from the contextual guide", async () => {
    render(<App />);
    fireEvent.click(
      screen.getByRole("button", { name: /Start with a guided lab/ }),
    );
    await screen.findByRole("complementary", { name: "Live concept guide" });
    pause();
    fireEvent.click(
      screen.getByRole("button", { name: /Read the full explanation/ }),
    );
    await screen.findByText("A numerical example");
    expect(
      screen.getByRole("navigation", { name: "Lesson contents" }),
    ).toBeTruthy();
    expect(screen.getByRole("link", { name: /GeeksforGeeks/ })).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: /Back to the live lab/ }),
    );
    expect(screen.getByRole("button", { name: "Run" })).toBeTruthy();
  });
});
