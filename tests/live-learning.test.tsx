import { useState } from "react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import Lab from "../src/labs";
import { lessons, type LabId } from "../src/lib/curriculum";
import { sanitize, type Config } from "../src/lib/storage";
import { details } from "../src/lib/lessonDetails";
import { liveExplanation } from "../src/components/ConceptGuide";
import DetailedLesson from "../src/components/DetailedLesson";
function Harness({
  id = "optimization",
  active = true,
}: {
  id?: LabId;
  active?: boolean;
}) {
  const [snapshot, setSnapshot] = useState<Config>(() =>
    sanitize(id, undefined),
  );
  return (
    <Lab id={id} active={active} snapshot={snapshot} onConfig={setSnapshot} />
  );
}
const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const metric = (label: string) =>
  within(screen.getByText(label, { selector: ".metrics span" }).parentElement!);
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
});
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
describe("automatic, reactive, bounded playback", () => {
  it("starts immediately, uses current controls, and supports pause / step / reset", () => {
    render(<Harness />);
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
    tick(160);
    expect(metric("Loss").getByText("5.64800")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    tick(1000);
    expect(metric("Iteration").getByText("1")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Learning rate η"), {
      target: { value: ".1" },
    });
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
    expect(
      screen.getByRole("complementary", { name: "Live concept guide" })
        .textContent,
    ).toContain("η = 0.1");
    tick(160);
    expect(metric("Loss").getByText("6.52500")).toBeTruthy();
    tick(160);
    expect(metric("Loss").getByText("3.98925")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    fireEvent.click(screen.getByRole("button", { name: "Step" }));
    expect(metric("Iteration").getByText("3")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reset experiment" }));
    expect(metric("Iteration").getByText("0")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pause" })).toBeTruthy();
  });
  it("applies starting-position changes without a manual reset", () => {
    render(<Harness />);
    tick(320);
    fireEvent.change(screen.getByLabelText("Initial x"), {
      target: { value: "1" },
    });
    expect(metric("Loss").getByText("8.50000")).toBeTruthy();
    tick(160);
    expect(metric("Loss").getByText("2.55040")).toBeTruthy();
  });
  it("suspends hidden workspace work and preserves a deliberate pause", () => {
    const { rerender } = render(<Harness />);
    tick(160);
    rerender(<Harness active={false} />);
    tick(1000);
    expect(metric("Iteration").getByText("1")).toBeTruthy();
    rerender(<Harness active />);
    tick(160);
    expect(metric("Iteration").getByText("2")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    rerender(<Harness active={false} />);
    rerender(<Harness active />);
    tick(160);
    expect(metric("Iteration").getByText("2")).toBeTruthy();
  });
  it("releases its own playback interval on unmount", () => {
    const intervals = vi.spyOn(window, "setInterval"),
      cleared = vi.spyOn(window, "clearInterval");
    const { unmount } = render(<Harness />);
    const handle = intervals.mock.results.at(-1)!.value;
    unmount();
    expect(cleared).toHaveBeenCalledWith(handle);
  });
  it("rebuilds neural architecture and continues training automatically", () => {
    render(<Harness id="neural-network" />);
    tick(120);
    expect(metric("Epoch").getByText("5")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Hidden layers"), {
      target: { value: "2" },
    });
    expect(metric("Epoch").getByText("0")).toBeTruthy();
    tick(120);
    expect(metric("Epoch").getByText("5")).toBeTruthy();
    expect(
      screen.getByRole("complementary", { name: "Live concept guide" })
        .textContent,
    ).toContain("2 hidden layers");
  });
  it("continues fine-tuning while honoring a frozen slope", () => {
    render(<Harness id="fine-tuning" />);
    fireEvent.click(screen.getByLabelText("Freeze slope w"));
    tick(160);
    expect(metric("Current slope").getByText("0.300")).toBeTruthy();
    expect(
      metric("Current bias").queryByText("0.000", { exact: true }),
    ).toBeNull();
  });
  it("samples automatically and recomputes filtering live", () => {
    render(<Harness id="sampling" />);
    tick(850);
    expect(metric("Draws").getByText("1")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Top-K"), {
      target: { value: "1" },
    });
    tick(1700);
    expect(metric("Draws").getByText("2")).toBeTruthy();
    expect(metric("Last token").getByText("learn")).toBeTruthy();
    expect(screen.getByText("100.0%")).toBeTruthy();
  });
  it("stops after persistent failure instead of looping autoplay", () => {
    render(<Harness id="agents" />);
    fireEvent.change(screen.getByLabelText("Inject a tool failure"), {
      target: { value: "persistent" },
    });
    tick(3000);
    expect(
      screen.getByText("Stopped safely: retry budget exhausted"),
    ).toBeTruthy();
    expect(metric("Tool attempts").getByText("3")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Run" }).hasAttribute("disabled"),
    ).toBe(true);
    tick(4000);
    expect(metric("Tool attempts").getByText("3")).toBeTruthy();
  });
  it("never treats autoplay as approval and resumes after explicit approval", () => {
    render(<Harness id="agents" />);
    fireEvent.click(screen.getByLabelText("Require human approval"));
    tick(3000);
    expect(screen.getByText("Paused at the human approval gate")).toBeTruthy();
    tick(10000);
    expect(screen.getByText("Paused at the human approval gate")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Approve this response" }),
    );
    tick(500);
    expect(screen.getByText("Workflow completed")).toBeTruthy();
  });
  it("starts Q-learning and resets on environment changes", () => {
    render(<Harness id="reinforcement" />);
    tick(100);
    expect(metric("Episodes").getByText("1")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Cell 4" }));
    expect(metric("Episodes").getByText("0")).toBeTruthy();
    tick(100);
    expect(metric("Episodes").getByText("1")).toBeTruthy();
  });
});
describe("additional live interaction safeguards", () => {
  it("suspends computation while the browser document is hidden", () => {
    const visibility = vi.spyOn(document, "visibilityState", "get");
    visibility.mockReturnValue("visible");
    render(<Harness />);
    tick(160);
    visibility.mockReturnValue("hidden");
    fireEvent(document, new Event("visibilitychange"));
    tick(1000);
    expect(metric("Iteration").getByText("1")).toBeTruthy();
    visibility.mockReturnValue("visible");
    fireEvent(document, new Event("visibilitychange"));
    tick(160);
    expect(metric("Iteration").getByText("2")).toBeTruthy();
  });
  it("supports validated numeric data entry and refits without Run", () => {
    render(<Harness id="machine-learning" />);
    fireEvent.change(screen.getByLabelText("New point x"), {
      target: { value: "1.5" },
    });
    fireEvent.change(screen.getByLabelText("New point y"), {
      target: { value: "2.5" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Add point & fit live" }),
    );
    expect(metric("Observations").getByText("37")).toBeTruthy();
    tick(160);
    expect(metric("Epoch").getByText("1")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("New point x"), {
      target: { value: "999" },
    });
    expect(
      screen
        .getByRole("button", { name: "Add point & fit live" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
});
describe("contextual learning and content integrity", () => {
  it.each(lessons.map((l) => [l.id] as [LabId]))(
    "shows a live guide and real flow for %s",
    (id) => {
      render(<Harness id={id} />);
      expect(
        screen.getByRole("complementary", { name: "Live concept guide" }),
      ).toBeTruthy();
      expect(
        screen.getByRole("img", {
          name: `${lessons.find((l) => l.id === id)!.title}: computation flow`,
        }),
      ).toBeTruthy();
      expect(screen.getByText("Three ideas to know")).toBeTruthy();
    },
  );
  it("covers every working lesson with depth, objectives, worked math and references", () => {
    for (const l of lessons) {
      const d = details[l.id];
      expect(d.sections.length).toBeGreaterThanOrEqual(4);
      expect(
        d.sections
          .flatMap((s) => s.paragraphs)
          .join(" ")
          .split(/\s+/).length,
      ).toBeGreaterThan(270);
      expect(d.goals).toHaveLength(3);
      expect(d.terms).toHaveLength(3);
      expect(d.worked.steps).toHaveLength(3);
      expect(d.references.some((r) => r.kind === "Primary reference")).toBe(
        true,
      );
    }
  });
  it("makes the full explanation navigable and includes supplementary reading", () => {
    const back = vi.fn(),
      check = vi.fn();
    render(
      <DetailedLesson id="optimization" onExperiment={back} onCheck={check} />,
    );
    expect(
      screen.getByRole("navigation", { name: "Lesson contents" }),
    ).toBeTruthy();
    expect(screen.getByText("A numerical example")).toBeTruthy();
    expect(
      screen.getByRole("link", { name: /GeeksforGeeks/ }).getAttribute("href"),
    ).toContain("geeksforgeeks.org");
    fireEvent.click(
      screen.getByRole("button", { name: /Test this in the live lab/ }),
    );
    expect(back).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: /Knowledge check/ }));
    expect(check).toHaveBeenCalledOnce();
  });
  it("explains actual LoRA counts and frozen parameter constraints", () => {
    expect(
      liveExplanation(
        "fine-tuning",
        { ...sanitize("fine-tuning", {}), tab: "lora", rank: 4 },
        [],
      ),
    ).toContain("32 adapter values");
    expect(
      liveExplanation(
        "fine-tuning",
        { ...sanitize("fine-tuning", {}), freezeW: true, freezeB: true },
        [],
      ),
    ).toContain("Both parameters are frozen");
  });
});
