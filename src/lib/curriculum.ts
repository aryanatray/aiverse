import taxonomy from "./taxonomy.json";
export const domains = taxonomy;
export type LabId =
  | "mathematics"
  | "optimization"
  | "machine-learning"
  | "neural-network"
  | "fine-tuning"
  | "transformers"
  | "sampling"
  | "rag"
  | "agents"
  | "reinforcement"
  | "systems";
export type Lesson = {
  id: LabId;
  title: string;
  subtitle: string;
  domain: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  minutes: number;
  icon: string;
  accent: string;
  prereqs: LabId[];
  kind: string;
  concept: string;
  intuition: string;
  equation: string;
  variables: string;
  observe: string;
  pitfall: string;
  application: string;
  exercise: string;
  code: string;
  question: string;
  answers: string[];
  correct: number;
  reason: string;
  source: { title: string; url: string };
};
export const lessons: Lesson[] = [
  {
    id: "mathematics",
    title: "Vectors & transformations",
    subtitle: "Give linear algebra a new perspective.",
    domain: 1,
    level: "Beginner",
    minutes: 15,
    icon: "vector",
    accent: "sage",
    prereqs: [],
    kind: "Actual matrix computation",
    concept:
      "A matrix represents a linear map. Its columns show where the unit basis vectors land. Multiplying a vector by the matrix combines these transformed basis vectors.",
    intuition:
      "Stretch, rotate, or shear the coordinate grid. Every point moves according to the same rule, and straight lines stay straight.",
    equation: "y = Ax · det(A) = ad − bc",
    variables:
      "A = [[a, b], [c, d]]; x is the input vector; y is its transformed position.",
    observe:
      "Change a matrix entry and compare the green output vector with the original. A zero determinant collapses the plane into a line or point.",
    pitfall:
      "Matrix multiplication is order-dependent. A negative determinant reverses orientation; it does not make the transformation invalid.",
    application:
      "Coordinate transforms, image warping, dense neural layers, and embedding projections.",
    exercise:
      "Create a matrix with determinant zero. Then build a 90° counterclockwise rotation.",
    code: "import numpy as np\nA = np.array([[0., -1.], [1., 0.]])\nx = np.array([2., 1.])\nprint(A @ x)  # [-1.  2.]",
    question: "Which matrix rotates a vector 90° counterclockwise?",
    answers: ["[[0, −1], [1, 0]]", "[[2, 0], [0, 2]]", "[[1, 1], [0, 1]]"],
    correct: 0,
    reason: "(x, y) becomes (−y, x), preserving vector length and orientation.",
    source: {
      title: "MIT 18.06 · Linear algebra",
      url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
    },
  },
  {
    id: "optimization",
    title: "Gradient descent",
    subtitle: "Follow the slope. Find the minimum.",
    domain: 1,
    level: "Beginner",
    minutes: 20,
    icon: "curve",
    accent: "sage",
    prereqs: ["mathematics"],
    kind: "Actual numerical optimization",
    concept:
      "Gradient descent updates parameters in the direction opposite the local derivative. Here a two-dimensional quadratic makes every update directly inspectable.",
    intuition:
      "Imagine walking downhill in fog. The gradient tells you which direction is uphill; the learning rate controls how far you step downhill.",
    equation: "L(x, y) = ½(x² + 4y²) · θₜ₊₁ = θₜ − η∇L(θₜ)",
    variables:
      "∇L = [x, 4y]; η is the learning rate. The unique minimum is (0, 0).",
    observe:
      "A small learning rate converges slowly. Beyond 0.5 the steep y direction oscillates or diverges. Momentum may overshoot even sooner.",
    pitfall:
      "A lower loss after one step does not prove convergence. Large steps can bounce across the valley and grow without bound.",
    application:
      "Training regression models and neural networks, and optimizing differentiable objectives.",
    exercise:
      "Compare η = 0.05, 0.3, and 0.55 from the same starting point. Explain the difference in the path.",
    code: "import numpy as np\ntheta = np.array([3., 2.])\neta = 0.1\ngrad = np.array([theta[0], 4 * theta[1]])\ntheta = theta - eta * grad\nprint(theta)  # [2.7, 1.2]",
    question:
      "For this quadratic, which learning rate guarantees convergence with plain gradient descent?",
    answers: ["0.1", "0.5", "0.8"],
    correct: 0,
    reason:
      "The largest Hessian eigenvalue is 4. Constant-step gradient descent converges for 0 < η < 2/4.",
    source: {
      title: "Stanford CS229 · Optimization notes",
      url: "https://cs229.stanford.edu/notes2022fall/main_notes.pdf",
    },
  },
  {
    id: "machine-learning",
    title: "The model playground",
    subtitle: "From data points to learned patterns.",
    domain: 2,
    level: "Beginner",
    minutes: 25,
    icon: "scatter",
    accent: "blue",
    prereqs: ["optimization"],
    kind: "Actual model fitting · synthetic data",
    concept:
      "Linear regression minimizes mean squared error. Logistic regression learns probabilities with binary cross-entropy. K-Means alternates nearest-centroid assignments and centroid means.",
    intuition:
      "A fitted model compresses patterns in observations. Different objectives ask different questions, so the same data representation may be inappropriate for another algorithm.",
    equation: "ŷ = wx + b · MSE = (1/n)Σ(ŷᵢ − yᵢ)²",
    variables:
      "w is the slope, b is the intercept. Logistic mode applies sigmoid(wx + b). K-Means uses Euclidean distance.",
    observe:
      "Step through parameter updates. Click the plot to add observations. Regenerate data to test whether the same setting still behaves sensibly.",
    pitfall:
      "These are training-set metrics on tiny synthetic data. They cannot establish generalization. Real evaluation needs an untouched test set and leakage-safe preprocessing.",
    application:
      "Demand estimation, binary classification, and discovering rough groups in exploratory analysis.",
    exercise:
      "Fit a line, add an extreme outlier, and refit. Compare the parameter sensitivity with K-Means centroid movement.",
    code: "import numpy as np\nx = np.array([-1., 0., 1.])\ny = np.array([-1., 1., 3.])\nX = np.c_[x, np.ones_like(x)]\nw, b = np.linalg.lstsq(X, y, rcond=None)[0]\nprint(round(w), round(b))  # 2, 1",
    question: "Why is training loss alone insufficient?",
    answers: [
      "It does not measure performance on unseen data.",
      "It always increases during training.",
      "It measures model size only.",
    ],
    correct: 0,
    reason:
      "Models can fit the training observations while failing on new observations. Hold out evaluation data before preprocessing.",
    source: {
      title: "scikit-learn · Model evaluation",
      url: "https://scikit-learn.org/stable/modules/model_evaluation.html",
    },
  },
  {
    id: "neural-network",
    title: "Inside a neural network",
    subtitle: "Build it. Train it. Inspect every layer.",
    domain: 3,
    level: "Intermediate",
    minutes: 30,
    icon: "network",
    accent: "lavender",
    prereqs: ["machine-learning"],
    kind: "Actual forward & backward propagation",
    concept:
      "A dense neural network alternates affine transformations and nonlinear activations. Backpropagation applies the chain rule to compute how each parameter affects the loss.",
    intuition:
      "Hidden units learn intermediate features. XOR is deliberately small but cannot be separated by a single straight line, making nonlinear representations necessary.",
    equation: "aˡ = φ(Wˡaˡ⁻¹ + bˡ) · ∂L/∂Wˡ = δˡ(aˡ⁻¹)ᵀ",
    variables:
      "Hidden layers use the selected activation; the output uses sigmoid and binary cross-entropy. Training uses all four XOR examples per epoch.",
    observe:
      "Watch weights, prediction confidence, gradient norm, and loss change together. Rebuilding the architecture reinitializes every weight from the seed.",
    pitfall:
      "A low gradient can mean convergence or a saturated/stuck network. More layers do not guarantee better learning; ReLU units can become inactive.",
    application:
      "Small dense classifiers and the fundamental training mechanism behind larger differentiable models.",
    exercise:
      "Train XOR with one hidden layer. Compare SGD and Adam from the same seed, keeping the architecture fixed.",
    code: "import numpy as np\nx = np.array([0., 1.])\nW = np.array([[1., -1.], [-1., 1.]])\nh = np.tanh(W @ x)\np = 1 / (1 + np.exp(-np.array([1., 1.]) @ h))\nprint(p)  # 0.5",
    question: "Why does XOR require a nonlinear hidden representation?",
    answers: [
      "A single linear decision boundary cannot separate it.",
      "XOR contains too many data points.",
      "Biases cannot be trained.",
    ],
    correct: 0,
    reason:
      "The two positive corners lie diagonally opposite each other, so no single line separates both classes.",
    source: {
      title: "Deep Learning · Backpropagation",
      url: "https://www.deeplearningbook.org/contents/mlp.html",
    },
  },
  {
    id: "fine-tuning",
    title: "Fine-tuning & LoRA",
    subtitle: "Small updates. A different behavior.",
    domain: 5,
    level: "Intermediate",
    minutes: 25,
    icon: "sliders",
    accent: "peach",
    prereqs: ["neural-network"],
    kind: "Actual small-model training & matrix computation",
    concept:
      "Fine-tuning updates an existing model on a new objective or dataset. Freezing parameters removes them from updates. LoRA represents a weight update as a low-rank product.",
    intuition:
      "The base model remains the starting point. Trainable parameters determine what can adapt. LoRA changes the space of possible updates, not merely their numeric precision.",
    equation: "W′ = W + (α/r)BA · A ∈ ℝʳˣᵈ, B ∈ ℝᵈˣʳ",
    variables:
      "The toy adapter uses d = 4. Rank r sets the bottleneck and adapter count 2dr. The separate linear model trains slope and intercept.",
    observe:
      "Freeze the slope and see whether changing only the intercept can match the new data. In the adapter view, inspect the actual composed matrix and output.",
    pitfall:
      "This is a tiny model and a matrix demonstration, not LLM fine-tuning. At small dimensions, high-rank adapters may have more parameters than the base matrix.",
    application:
      "Domain adaptation and parameter-efficient adaptation of large pretrained models.",
    exercise:
      "Train with w frozen, then unfreeze it. Compare the losses. Set LoRA rank to 4 and compare parameter counts.",
    code: "import numpy as np\nW = np.eye(4)\nA = np.ones((1, 4)) * 0.1\nB = np.ones((4, 1)) * 0.2\nalpha, rank = 2., 1\nupdated = W + (alpha / rank) * B @ A\nprint(updated[0, 1])  # 0.04",
    question: "What remains unchanged in LoRA adaptation?",
    answers: [
      "The frozen base matrix W.",
      "The adapter matrices.",
      "All model outputs.",
    ],
    correct: 0,
    reason:
      "LoRA learns a low-rank update through A and B while the pretrained base weights remain frozen.",
    source: {
      title: "Hu et al. · LoRA",
      url: "https://arxiv.org/abs/2106.09685",
    },
  },
  {
    id: "transformers",
    title: "Attention, made visible",
    subtitle: "See which tokens look at each other.",
    domain: 4,
    level: "Intermediate",
    minutes: 25,
    icon: "grid",
    accent: "lavender",
    prereqs: ["mathematics", "neural-network"],
    kind: "Actual attention math · synthetic embeddings",
    concept:
      "Scaled dot-product attention compares queries with keys, normalizes scores with softmax, and mixes value vectors using the resulting weights.",
    intuition:
      "Each row asks a question and decides which positions contribute to its output. Causal masking prevents a position from consulting tokens that come later.",
    equation: "Attention(Q,K,V) = softmax(QKᵀ / √dₖ)V",
    variables:
      "This toy uses seeded 4-dimensional token vectors, Q = K = V, and explicit optional temperature. It has no pretrained weights or semantic understanding.",
    observe:
      "Choose a query row, toggle causal masking, and vary temperature. The heatmap probabilities and weighted output update from the same calculation.",
    pitfall:
      "Attention weights are not a complete causal explanation of a trained language model. Whitespace and character splitting are demonstrations, not BPE tokenization.",
    application:
      "Transformers for language, vision, and multimodal representation learning.",
    exercise:
      "Enable causal masking and inspect the first row. Why can its only nonzero weight be the first token?",
    code: "import numpy as np\nQ = K = V = np.eye(2)\nscores = Q @ K.T / np.sqrt(2)\ne = np.exp(scores - scores.max(axis=1, keepdims=True))\nweights = e / e.sum(axis=1, keepdims=True)\nprint(weights @ V)",
    question: "What does a causal mask prevent?",
    answers: [
      "Attending to future positions.",
      "Attending to the current token.",
      "Computing any gradients.",
    ],
    correct: 0,
    reason:
      "Future tokens are unavailable during autoregressive generation, so their scores are masked before softmax.",
    source: {
      title: "Vaswani et al. · Attention Is All You Need",
      url: "https://arxiv.org/abs/1706.03762",
    },
  },
  {
    id: "sampling",
    title: "The next-token lab",
    subtitle: "Explore the shape of a choice.",
    domain: 5,
    level: "Beginner",
    minutes: 15,
    icon: "bars",
    accent: "peach",
    prereqs: [],
    kind: "Actual probability computation · fixed logits",
    concept:
      "Decoding transforms model logits into a distribution, filters candidate tokens, and samples from the remaining probability mass. This lab uses fixed illustrative logits.",
    intuition:
      "Temperature reshapes confidence. Top-K limits the candidate count. Top-P limits the cumulative probability mass. The seed controls repeatability.",
    equation: "P(tokenᵢ) = exp(zᵢ / T) / Σⱼexp(zⱼ / T)",
    variables:
      "T > 0. Top-K is applied first, then nucleus selection on the normalized retained candidates. Sampling uses an explicit deterministic seed.",
    observe:
      "Low temperature concentrates the bars. Small K or P removes alternatives. Sampling changes the selected token without changing its probability.",
    pitfall:
      "Higher temperature does not create knowledge or guarantee creativity. These fixed logits do not come from a running LLM.",
    application:
      "Tuning diversity and repeatability in autoregressive text generation.",
    exercise:
      "Set K = 1 and sample with several seeds. Then increase K and explain why the outputs differ.",
    code: "import numpy as np\nlogits = np.array([2., 1., 0.])\ntemperature = 0.5\nz = logits / temperature\np = np.exp(z - z.max())\np /= p.sum()\nprint(p.round(3))  # [0.867, 0.117, 0.016]",
    question: "What happens when Top-K equals 1?",
    answers: [
      "The highest-probability token is always chosen.",
      "Every token becomes equally likely.",
      "The temperature becomes zero.",
    ],
    correct: 0,
    reason:
      "Only one candidate survives filtering, so its normalized probability is one.",
    source: {
      title: "Holtzman et al. · Nucleus sampling",
      url: "https://arxiv.org/abs/1904.09751",
    },
  },
  {
    id: "rag",
    title: "Retrieval under the hood",
    subtitle: "Turn documents into useful context.",
    domain: 6,
    level: "Intermediate",
    minutes: 30,
    icon: "pipeline",
    accent: "blue",
    prereqs: ["mathematics"],
    kind: "Actual lexical retrieval · no generation",
    concept:
      "RAG retrieves relevant information and supplies it as context to a generator. Here you can inspect the retrieval half using TF-IDF cosine similarity or BM25.",
    intuition:
      "Chunk boundaries determine what can be retrieved together. A retriever ranks chunks; assembling more chunks can increase coverage while introducing irrelevant context.",
    equation: "cos(q,d) = (q·d)/(‖q‖‖d‖)",
    variables:
      "TF-IDF uses smoothed inverse document frequency. BM25 uses k₁ = 1.5 and b = 0.75. Paragraphs are source documents; chunks use word counts.",
    observe:
      "Edit documents, search, and vary chunk size, overlap, and K. Read the exact context rather than assuming high scores mean factual correctness.",
    pitfall:
      "Lexical retrieval is not semantic embedding search. Without relevance labels, precision and recall cannot be measured honestly. No answer generation is performed.",
    application:
      "Document search, knowledge assistants, and assembling grounded context for a downstream model.",
    exercise:
      "Search with a synonym absent from the corpus. Why can lexical retrieval miss the relevant passage?",
    code: "import numpy as np\nq = np.array([1., 0., 1.])\nd = np.array([1., 1., 0.])\nscore = q @ d / (np.linalg.norm(q) * np.linalg.norm(d))\nprint(round(score, 2))  # 0.5",
    question: "What must you have to measure retrieval Recall@K?",
    answers: [
      "Ground-truth relevant documents.",
      "Only similarity scores.",
      "A paid embedding API.",
    ],
    correct: 0,
    reason:
      "Recall requires knowing how many relevant items exist and how many were retrieved.",
    source: {
      title: "Stanford · Introduction to Information Retrieval",
      url: "https://nlp.stanford.edu/IR-book/",
    },
  },
  {
    id: "agents",
    title: "Agent execution studio",
    subtitle: "Trace decisions. Break tools. Recover.",
    domain: 7,
    level: "Intermediate",
    minutes: 25,
    icon: "workflow",
    accent: "sage",
    prereqs: ["rag"],
    kind: "Deterministic workflow simulation · no LLM calls",
    concept:
      "An agentic system coordinates state, model decisions, and tool effects. A workflow makes transitions explicit. This studio simulates a bounded router, retrieval, tool, approval, and response sequence.",
    intuition:
      "Reliability comes from state transitions and failure policy. A retry only helps transient failures, and approvals should gate sensitive side effects.",
    equation: "stateₜ₊₁ = transition(stateₜ, eventₜ)",
    variables:
      "Steps and latencies are educational rules. A transient injected failure recovers on retry; a persistent failure exhausts the retry budget.",
    observe:
      "Step the trace, inject a tool failure, change the retry budget, or enable approval. Read each recorded input/output before the next transition.",
    pitfall:
      "This is an editable deterministic workflow, not an autonomous reasoning model or actual framework execution. Real tool effects need idempotency and permissions.",
    application:
      "Enterprise assistants, support automation, and observable tool orchestration.",
    exercise:
      "Inject a persistent failure with two retries. How many total attempts occur? Explain why an approval should remain pending.",
    code: "def run_with_retry(tool, retries):\n    for attempt in range(retries + 1):\n        try:\n            return tool()\n        except TimeoutError:\n            if attempt == retries:\n                raise",
    question:
      "With a retry budget of 2, how many total tool attempts are allowed?",
    answers: ["3", "2", "1"],
    correct: 0,
    reason:
      "The initial attempt is followed by at most two retries. Persistent errors must terminate.",
    source: {
      title: "Anthropic · Building effective agents",
      url: "https://www.anthropic.com/research/building-effective-agents",
    },
  },
  {
    id: "reinforcement",
    title: "Learn by reward",
    subtitle: "Watch a policy discover its way.",
    domain: 10,
    level: "Intermediate",
    minutes: 30,
    icon: "grid",
    accent: "peach",
    prereqs: ["optimization"],
    kind: "Actual tabular Q-learning",
    concept:
      "Q-learning estimates the value of taking an action in a state and then behaving optimally. It updates from observed rewards and the best estimated next-state value.",
    intuition:
      "Exploration discovers routes; exploitation uses current knowledge. The agent initially knows nothing about the goal or obstacles.",
    equation: "Q(s,a) ← Q(s,a) + α[r + γ maxₐ′Q(s′,a′) − Q(s,a)]",
    variables:
      "A 5×5 grid, four actions, start at top left, terminal goal at bottom right. Each nonterminal move costs 0.04. Episodes stop after 100 steps.",
    observe:
      "Click cells to change obstacles. The policy arrows and values update after each training episode. Changes to rewards or obstacles reset learning.",
    pitfall:
      "A truncated episode is not a solved environment. Exploration remains necessary, and a blocked goal can make success impossible.",
    application:
      "Sequential decision problems and the core ideas behind reinforcement learning.",
    exercise:
      "Compare ε = 0 and ε = 0.3 from a fresh start. Why might a purely greedy policy never find the goal?",
    code: "q, reward, next_best = 0.2, 1.0, 0.5\nalpha, gamma = 0.1, 0.9\nupdated = q + alpha * (reward + gamma * next_best - q)\nprint(round(updated, 3))  # 0.325",
    question: "What is the purpose of ε-greedy exploration?",
    answers: [
      "Try alternatives instead of always following current estimates.",
      "Guarantee a reward every step.",
      "Eliminate the need for training.",
    ],
    correct: 0,
    reason:
      "Current estimates can be wrong; random actions reveal outcomes that a greedy policy may never discover.",
    source: {
      title: "Sutton & Barto · Reinforcement Learning",
      url: "http://incompleteideas.net/book/the-book-2nd.html",
    },
  },
  {
    id: "systems",
    title: "Design for the real world",
    subtitle: "Find the bottleneck before production.",
    domain: 15,
    level: "Advanced",
    minutes: 25,
    icon: "layers",
    accent: "blue",
    prereqs: ["agents"],
    kind: "Queueing heuristic · explicit assumptions",
    concept:
      "Systems have finite service capacity. When incoming work approaches capacity, queueing delay grows rapidly. Caches reduce backend demand; replicas add approximate capacity.",
    intuition:
      "A fast model can still create a slow product if requests pile up. Capacity headroom matters more than service time alone near saturation.",
    equation: "ρ = λ / μ · E[T] ≈ service_time / (1 − ρ)",
    variables:
      "Each replica serves 1000/service_ms requests per second. A utilization-based delay heuristic approximates the effect of replica headroom. Cache hits bypass the backend.",
    observe:
      "Increase arrival rate until utilization crosses one. Inject a backend outage and observe the failed path. Add replicas or cache hits to restore headroom.",
    pitfall:
      "This pooled approximation is not an M/M/c simulation or benchmark. It ignores network, batching, burstiness, cache lookup time, and correlated failures.",
    application:
      "Capacity planning intuition for RAG services, inference endpoints, and enterprise AI applications.",
    exercise:
      "At 100 ms service time and two replicas, find the highest uncached arrival rate below saturation.",
    code: "arrival, service_ms, replicas = 10., 100., 2\ncapacity = replicas * 1000 / service_ms\nrho = arrival / capacity\nlatency = service_ms / (1 - rho)\nprint(latency)  # 200.0 ms",
    question: "What happens when backend arrival rate exceeds capacity?",
    answers: [
      "The unbounded queue model has no finite steady-state latency.",
      "Latency becomes zero.",
      "Every extra request is cached.",
    ],
    correct: 0,
    reason:
      "Without admission control or sufficient capacity, queued work grows. The model intentionally reports saturation rather than a finite latency.",
    source: {
      title: "MIT · Queueing theory",
      url: "https://ocw.mit.edu/courses/6-262-discrete-stochastic-processes-spring-2011/",
    },
  },
];
export const lessonById = Object.fromEntries(
  lessons.map((l) => [l.id, l]),
) as Record<LabId, Lesson>;
export const paths = [
  {
    title: "Mathematics for Machine Learning",
    domain: 1,
    ids: ["mathematics", "optimization"],
  },
  {
    title: "Machine Learning Foundations",
    domain: 2,
    ids: ["mathematics", "optimization", "machine-learning"],
  },
  {
    title: "Complete Machine Learning Engineer",
    domain: 2,
    ids: [
      "mathematics",
      "optimization",
      "machine-learning",
      "neural-network",
      "systems",
    ],
  },
  {
    title: "Deep Learning Engineer",
    domain: 3,
    ids: [
      "mathematics",
      "optimization",
      "machine-learning",
      "neural-network",
      "fine-tuning",
    ],
  },
  {
    title: "NLP Engineer",
    domain: 4,
    ids: ["mathematics", "neural-network", "transformers", "sampling"],
  },
  {
    title: "Generative AI Engineer",
    domain: 5,
    ids: ["neural-network", "transformers", "sampling", "fine-tuning", "rag"],
  },
  {
    title: "LLM Engineer",
    domain: 5,
    ids: [
      "neural-network",
      "transformers",
      "sampling",
      "fine-tuning",
      "systems",
    ],
  },
  {
    title: "RAG Engineer",
    domain: 6,
    ids: ["mathematics", "rag", "agents", "systems"],
  },
  {
    title: "Agentic AI Engineer",
    domain: 7,
    ids: ["rag", "agents", "systems"],
  },
  { title: "MLOps Engineer", domain: 11, ids: ["machine-learning", "systems"] },
  {
    title: "Data Engineer for AI",
    domain: 12,
    ids: ["mathematics", "rag", "systems"],
  },
  {
    title: "Computer Vision Engineer",
    domain: 9,
    ids: ["mathematics", "neural-network"],
  },
  {
    title: "Reinforcement Learning Engineer",
    domain: 10,
    ids: ["optimization", "reinforcement"],
  },
  {
    title: "AI Systems Architect",
    domain: 15,
    ids: ["rag", "agents", "systems"],
  },
  {
    title: "Advanced AI Research Foundations",
    domain: 14,
    ids: ["neural-network", "transformers", "fine-tuning"],
  },
].map((p, i) => ({
  ...p,
  id: `path-${i + 1}`,
  ids: p.ids as LabId[],
  objective: `Build practical foundations for ${p.title.toLowerCase()} through inspectable experiments.`,
  project:
    i === 7
      ? "Compare BM25 and TF-IDF on a small corpus, then document failure cases."
      : i === 8
        ? "Design a bounded workflow with retries, approval, and a persistent-failure test."
        : "Save a reproducible experiment, vary one parameter, and explain the result.",
}));
export function validateCurriculum() {
  const seen = new Set<string>(),
    active = new Set<string>();
  function visit(id: LabId) {
    if (active.has(id)) throw Error(`Prerequisite cycle at ${id}`);
    if (seen.has(id)) return;
    if (!lessonById[id]) throw Error(`Missing lesson ${id}`);
    active.add(id);
    lessonById[id].prereqs.forEach(visit);
    active.delete(id);
    seen.add(id);
  }
  lessons.forEach((l) => visit(l.id));
  const ids = domains.flatMap((d) => d.topics.map((t) => t.id));
  if (new Set(ids).size !== ids.length) throw Error("Duplicate taxonomy ID");
  paths.forEach((p) =>
    p.ids.forEach((id) => {
      if (!lessonById[id]) throw Error("Invalid path");
    }),
  );
  return true;
}
validateCurriculum();
