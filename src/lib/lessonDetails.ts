import type { LabId } from "./curriculum";
export type LessonSection = {
  title: string;
  paragraphs: string[];
  equation?: string;
};
export type LessonDetail = {
  summary: string;
  goals: string[];
  terms: [string, string][];
  flow: string[];
  readCanvas: string;
  tryThis: string;
  sections: LessonSection[];
  worked: { given: string; steps: string[]; result: string };
  references: {
    title: string;
    url: string;
    kind: "Primary reference" | "Further reading";
  }[];
};
export const details: Record<LabId, LessonDetail> = {
  mathematics: {
    summary:
      "A matrix moves a vector by transforming the coordinate system. The green arrow is the exact result of that multiplication.",
    goals: [
      "Read a matrix as transformed basis vectors.",
      "Compute a matrix–vector product by hand.",
      "Explain what determinant zero means geometrically.",
    ],
    terms: [
      [
        "Vector",
        "An ordered list of coordinates representing a position or direction.",
      ],
      ["Matrix", "A table of numbers defining a linear transformation."],
      [
        "Determinant",
        "The signed factor by which a square matrix scales oriented area.",
      ],
    ],
    flow: ["Input vector x", "Apply matrix A", "Output vector Ax"],
    readCanvas:
      "The dashed purple arrow is the original vector. The solid green arrow is Ax. The faint grid is the original coordinate system; the green grid is its transformed image.",
    tryThis:
      "Use the 90° rotation preset. The arrow should turn without changing its length.",
    sections: [
      {
        title: "1. Start with coordinates and basis vectors",
        paragraphs: [
          "In two dimensions, a vector x = [x₁, x₂]ᵀ is a weighted combination of the unit vectors e₁ = [1, 0]ᵀ and e₂ = [0, 1]ᵀ. The coordinates tell you how much of each direction to combine. A vector is not inherently a data point: the same representation can describe a displacement, a feature vector, or an embedding.",
          "A linear map preserves addition and scalar multiplication. Instead of specifying where every point goes, it is enough to specify the destinations of the basis vectors. Those destinations form the columns of its matrix.",
        ],
      },
      {
        title: "2. Read the columns before multiplying",
        paragraphs: [
          "For A = [[a, b], [c, d]], the first column [a, c]ᵀ is the image of e₁ and the second column [b, d]ᵀ is the image of e₂. Multiplying Ax combines those columns using x₁ and x₂ as coefficients.",
          "This column view explains the moving grid. Changing one matrix entry changes a transformed basis direction, so every grid point must move consistently. A matrix can rotate, scale, reflect, shear, or collapse a space. Translation requires an extra affine offset or homogeneous coordinates.",
        ],
        equation: "Ax = [a·x₁ + b·x₂, c·x₁ + d·x₂]ᵀ",
      },
      {
        title: "3. Connect the determinant to geometry",
        paragraphs: [
          "The determinant ad − bc measures signed area scaling. Magnitude 2 means a unit square becomes a parallelogram with twice the area. A negative sign indicates reversed orientation. It does not mean the output coordinates or area are invalid.",
          "A determinant of zero means the two transformed basis vectors are linearly dependent. The image of the plane collapses to a line or a point, and information is lost. A two-dimensional square matrix is invertible exactly when its determinant is nonzero.",
        ],
        equation: "det(A) = ad − bc",
      },
      {
        title: "4. Composition and applications",
        paragraphs: [
          "Applying B first and then A produces A(Bx) = (AB)x. Reversing the order generally produces a different result. Test rotation followed by an unequal stretch on paper: the stretched direction depends on which operation occurs first.",
          "Dense neural layers compute an affine map Wx + b before a nonlinearity. Image warps and coordinate transforms use the same multiplication. This lab isolates the linear part and does not claim that a single 2×2 matrix explains a complete learned model.",
        ],
      },
    ],
    worked: {
      given: "A = [[0, −1], [1, 0]] and x = [2, 1]ᵀ.",
      steps: [
        "First coordinate: 0·2 + (−1)·1 = −1.",
        "Second coordinate: 1·2 + 0·1 = 2.",
        "The determinant is 0·0 − (−1)·1 = 1; oriented area is preserved.",
      ],
      result:
        "Ax = [−1, 2]ᵀ. The original and transformed vectors both have length √5.",
    },
    references: [
      {
        title: "MIT OpenCourseWare · Linear Algebra",
        url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/",
        kind: "Primary reference",
      },
    ],
  },
  optimization: {
    summary:
      "Gradient descent repeatedly moves parameters downhill on a loss surface. The learning rate controls the size of each move.",
    goals: [
      "Distinguish a derivative, gradient, and update.",
      "Predict one optimization step numerically.",
      "Recognize slow convergence, oscillation, and divergence.",
    ],
    terms: [
      [
        "Loss",
        "A scalar objective measuring how undesirable the current parameters are.",
      ],
      [
        "Gradient",
        "The vector of partial derivatives; it points toward steepest local increase.",
      ],
      [
        "Learning rate η",
        "The multiplier that turns a gradient into an update step.",
      ],
    ],
    flow: [
      "Evaluate loss",
      "Calculate gradient",
      "Update parameters",
      "Evaluate again",
    ],
    readCanvas:
      "Ellipses connect positions with equal loss. Dots show actual parameter positions. The white-ringed point is the current position; the center is the minimum.",
    tryThis:
      "Increase η above 0.5. Watch the steep direction oscillate or diverge; then lower η to recover automatically.",
    sections: [
      {
        title: "1. Separate the objective from the optimizer",
        paragraphs: [
          "The objective defines what counts as a good parameter setting. The optimizer defines how to search for it. Here the objective is a known two-parameter quadratic, not a model trained on observations. Its minimum is at x = y = 0.",
          "A contour line joins positions with the same objective value. Moving across tightly spaced contours changes loss rapidly. Because the y term is weighted by four, the surface curves more steeply in that direction.",
        ],
        equation: "L(x,y) = ½(x² + 4y²)",
      },
      {
        title: "2. Derive the update",
        paragraphs: [
          "Differentiating with respect to each coordinate gives ∂L/∂x = x and ∂L/∂y = 4y. These partial derivatives form the gradient. The minus sign in the update matters: following the positive gradient would increase the objective locally.",
          "The gradient is local information, so a finite step is not guaranteed to improve the loss. The learning rate must respect curvature. Changing the rate here restarts the trajectory from the chosen initial position so the comparison uses the same starting conditions.",
        ],
        equation: "xₜ₊₁ = (1 − η)xₜ; yₜ₊₁ = (1 − 4η)yₜ",
      },
      {
        title: "3. Understand the convergence threshold",
        paragraphs: [
          "For a coordinate to shrink under this update, its multiplier must have magnitude below one. The y direction requires |1 − 4η| < 1, which yields 0 < η < 0.5. The x direction is less restrictive. At η = 0.5, a nonzero y alternates sign without shrinking.",
          "This threshold belongs to this quadratic and plain gradient descent. It is not a universal recommended learning rate for neural networks. Feature scaling, model structure, optimizer choice, and the objective all change the appropriate scale.",
        ],
        equation: "H = diag(1,4); plain GD needs 0 < η < 2/λmax(H) = 0.5",
      },
      {
        title: "4. Add momentum carefully",
        paragraphs: [
          "Momentum accumulates past gradients in a velocity. This can accelerate movement along consistent directions, but it can also overshoot or amplify oscillations. In this lab vₜ = βvₜ₋₁ + ∇L(θₜ), then θₜ₊₁ = θₜ − ηvₜ.",
          "Compare momentum settings from the same start and inspect the entire loss history. One lower loss value does not establish stable convergence. When the bounded numerical experiment diverges, it stops safely; changing a parameter rebuilds the trajectory automatically.",
        ],
      },
    ],
    worked: {
      given: "Start at (3,2), choose η = 0.1 and momentum β = 0.",
      steps: [
        "Initial loss: ½(9 + 16) = 12.5.",
        "Gradient: [3,8]. Update: [3,2] − 0.1[3,8] = [2.7,1.2].",
        "New loss: ½(2.7² + 4·1.2²) = 6.525.",
      ],
      result: "The loss decreases from 12.5 to 6.525 after one actual update.",
    },
    references: [
      {
        title: "Google ML Crash Course · Gradient descent",
        url: "https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent",
        kind: "Primary reference",
      },
      {
        title: "GeeksforGeeks · Gradient descent walkthrough",
        url: "https://www.geeksforgeeks.org/machine-learning/gradient-descent-algorithm-and-its-variants/",
        kind: "Further reading",
      },
    ],
  },
  "machine-learning": {
    summary:
      "A model learns a pattern by optimizing an objective. This lab compares fitting a line, learning class probabilities, and grouping nearby points.",
    goals: [
      "Choose a task-appropriate objective.",
      "Relate learned parameters to visible predictions.",
      "Explain why training loss does not prove generalization.",
    ],
    terms: [
      [
        "Feature x",
        "An input used to predict a target or describe an observation.",
      ],
      ["Target y", "The observed output used for supervised learning."],
      [
        "Training loss",
        "The objective evaluated on the same observations used to fit the model.",
      ],
    ],
    flow: [
      "Generate observations",
      "Choose an objective",
      "Fit parameters",
      "Inspect predictions",
    ],
    readCanvas:
      "Dots are observations. The curve is the fitted regression model; in K-Means mode, colors show assignments and crosses mark centroids.",
    tryThis:
      "Fit linear regression, then add an outlier. Observe how squared error pulls the line toward that point.",
    sections: [
      {
        title: "1. Match the model to the question",
        paragraphs: [
          "Regression predicts continuous values, classification estimates class membership, and clustering groups observations without target labels. These are different tasks, not interchangeable buttons for the same claim. The lab generates task-specific synthetic data when the algorithm changes.",
          "The model is deliberately small so every update is inspectable. A smooth-looking fitted line does not establish causality, robustness, or usefulness outside the generated sample.",
        ],
      },
      {
        title: "2. Fit linear regression",
        paragraphs: [
          "The prediction is wx + b. The weight sets slope and the bias sets intercept. Mean squared error averages squared residuals, so larger mistakes receive disproportionately larger penalties. Its derivatives are averages over all training observations.",
          "Each step uses the full current dataset to update both parameters. A seed recreates the generated sample. Adding observations changes the objective; compare metrics before and after fitting again. The displayed loss has no separate validation set.",
        ],
        equation: "MSE = mean((wx+b−y)²); ∂L/∂w = 2·mean((wx+b−y)x)",
      },
      {
        title: "3. Use probabilities for binary labels",
        paragraphs: [
          "Logistic regression applies sigmoid to the linear score. Its outputs lie between zero and one, and binary cross-entropy penalizes assigning low probability to the observed class. The slope changes how quickly probabilities transition; the bias shifts the transition along x.",
          "A probability estimate is not automatically calibrated. The synthetic sample is tiny, and a threshold of 0.5 is only a convention. In real applications choose thresholds using validation data, error costs, and the deployment population.",
        ],
        equation: "p = 1/(1+exp(−(wx+b))); BCE = −mean(y·ln p + (1−y)·ln(1−p))",
      },
      {
        title: "4. Alternate assignments and means in K-Means",
        paragraphs: [
          "K-Means assigns each observation to its closest centroid, then replaces each centroid with the mean of its assigned observations. The objective is the sum of squared distances to assigned centers. Empty clusters retain their previous centers in this implementation.",
          "K is chosen in advance. Different initial centroids can reach different local solutions. Euclidean distance also makes feature scale important: a feature measured in thousands can dominate another measured in fractions.",
        ],
      },
      {
        title: "5. Evaluate beyond the training canvas",
        paragraphs: [
          "A production evaluation separates training, model selection, and final testing. Fit preprocessing only on training data; split by time or entity when ordinary random splitting would leak information. Compare against simple baselines.",
          "This lab shows the mechanics of fitting, not a reliable estimate of future performance. Treat added points as interventions on the training sample and explain why the chosen objective reacts the way it does.",
        ],
      },
    ],
    worked: {
      given: "Observations (−1,−1), (0,1), (1,3). Try w = 2 and b = 1.",
      steps: [
        "Predictions are −1, 1, and 3, exactly matching all three targets.",
        "Every residual is zero, so the MSE and both parameter gradients are zero.",
        "Adding (1,10) introduces a residual of −7 and a squared error contribution of 49.",
      ],
      result:
        "The same line was optimal for the original sample but no longer minimizes the expanded sample.",
    },
    references: [
      {
        title: "scikit-learn · Linear models",
        url: "https://scikit-learn.org/stable/modules/linear_model.html",
        kind: "Primary reference",
      },
      {
        title: "scikit-learn · K-Means",
        url: "https://scikit-learn.org/stable/modules/clustering.html#k-means",
        kind: "Primary reference",
      },
      {
        title: "scikit-learn · Common pitfalls and data leakage",
        url: "https://scikit-learn.org/stable/common_pitfalls.html",
        kind: "Primary reference",
      },
    ],
  },
  "neural-network": {
    summary:
      "A neural network transforms inputs through learned layers. Forward propagation makes predictions; backpropagation computes how each parameter should change.",
    goals: [
      "Trace activations through a dense network.",
      "Distinguish computing gradients from applying updates.",
      "Explain why nonlinear hidden units can represent XOR.",
    ],
    terms: [
      [
        "Activation",
        "A neuron’s output after an affine transform and nonlinearity.",
      ],
      [
        "Backpropagation",
        "An efficient application of the chain rule to compute parameter gradients.",
      ],
      ["Epoch", "One full pass over the four training examples in this lab."],
    ],
    flow: [
      "Inputs → hidden activations",
      "Sigmoid prediction",
      "Binary cross-entropy",
      "Backpropagate → update",
    ],
    readCanvas:
      "Edges encode actual weights: green is positive and purple is negative. Nodes display activations for the selected XOR input. The table exposes every weight, bias, and most recent gradient.",
    tryThis:
      "Change the hidden activation from tanh to ReLU. Training restarts from the same seed so you can compare the learning behavior.",
    sections: [
      {
        title: "1. Why use hidden layers?",
        paragraphs: [
          "A linear classifier cannot separate the two positive XOR corners from the two negative ones with a single line. Hidden units transform the inputs into another representation, where a later layer can separate them. Nonlinearity is essential: stacking linear layers without nonlinear activations still produces a linear map.",
          "This network has two inputs, one to three dense hidden layers, and one sigmoid output. Depth and width change representational capacity and optimization behavior. A larger network is not automatically easier to train or more reliable.",
        ],
      },
      {
        title: "2. Follow the forward pass",
        paragraphs: [
          "At each hidden layer, multiply the previous activations by a weight matrix, add biases, and apply the selected activation. Tanh bounds outputs between −1 and 1; sigmoid between 0 and 1; ReLU keeps positive preactivations and zeroes negative ones.",
          "The final sigmoid output is interpreted as the estimated probability of XOR class 1. Selecting an input changes the displayed activations without changing the learned parameters. Edge opacity shows weight magnitude, not a measured importance score.",
        ],
        equation: "zˡ = Wˡaˡ⁻¹ + bˡ; aˡ = φ(zˡ)",
      },
      {
        title: "3. Compute loss and backpropagate",
        paragraphs: [
          "Binary cross-entropy compares the output probability with the observed binary label. For sigmoid output combined with this loss, the derivative with respect to the output preactivation simplifies to p − y. Backpropagation transports that sensitivity toward earlier layers using the chain rule.",
          "For a dense layer, each weight gradient is a product of a downstream error term and an incoming activation. Bias gradients use the same error term without multiplying by an input. The lab averages these contributions across all four XOR examples before an update.",
        ],
        equation: "δout = p − y; ∂L/∂Wˡ = δˡ(aˡ⁻¹)ᵀ",
      },
      {
        title: "4. Distinguish SGD from Adam",
        paragraphs: [
          "SGD here means a plain gradient update applied to the full four-example batch, not sampling one random example. Adam maintains running estimates of gradient first and second moments, corrects their initialization bias, and scales updates per parameter.",
          "The learning rate still matters. Saturated activations can produce very small gradients, while inactive ReLU units can receive zero gradient. A small gradient norm can indicate either a solution or an optimization problem. Inspect predictions and loss together.",
        ],
      },
      {
        title: "5. Interpret the inspector honestly",
        paragraphs: [
          "The table shows current parameter values and gradients computed immediately before the most recent update. They refer to adjacent parameter states, so use the gradient to explain the last update rather than assuming it was recomputed afterward.",
          "XOR is an instructional fitting task, not a generalization benchmark. All examples are used for training. Numerical tests compare gradients with central finite differences; these check calculus and implementation, not the usefulness of this architecture on other data.",
        ],
      },
    ],
    worked: {
      given:
        "A sigmoid output predicts p = 0.7 for an example with label y = 1.",
      steps: [
        "The output preactivation derivative is p − y = −0.3.",
        "If a hidden activation feeding this output weight is 0.5, that example contributes −0.15 to its weight gradient.",
        "A plain learning-rate-0.1 update increases that weight by 0.015 before batch averaging.",
      ],
      result:
        "The sign of the update increases this example’s output score, moving probability toward its positive label.",
    },
    references: [
      {
        title: "Goodfellow, Bengio & Courville · Deep feedforward networks",
        url: "https://www.deeplearningbook.org/contents/mlp.html",
        kind: "Primary reference",
      },
      {
        title: "PyTorch · Automatic differentiation fundamentals",
        url: "https://docs.pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html",
        kind: "Primary reference",
      },
      {
        title: "GeeksforGeeks · Backpropagation overview",
        url: "https://www.geeksforgeeks.org/machine-learning/backpropagation-in-neural-network/",
        kind: "Further reading",
      },
    ],
  },
  "fine-tuning": {
    summary:
      "Adaptation changes a model’s parameters. Freezing restricts which values can change; LoRA represents a matrix update through smaller factors.",
    goals: [
      "Explain the difference between training, freezing, and prompting.",
      "Predict how a frozen parameter restricts fitting.",
      "Compute the scaled LoRA update and its parameter count.",
    ],
    terms: [
      ["Frozen parameter", "A parameter excluded from optimization updates."],
      ["Adapter rank r", "The bottleneck dimension in the product BA."],
      [
        "Scaling α/r",
        "A multiplier controlling the magnitude of the adapter contribution.",
      ],
    ],
    flow: [
      "Existing parameters",
      "Choose trainable subset",
      "Compute loss & gradients",
      "Apply allowed updates",
    ],
    readCanvas:
      "The small-model view shows the starting line, current line, and target observations. The LoRA view shows frozen W, the actual update, and the composed matrix W′.",
    tryThis:
      "Freeze w while leaving b trainable. The line can shift vertically but cannot match a different target slope.",
    sections: [
      {
        title: "1. What adaptation changes",
        paragraphs: [
          "Fine-tuning starts from existing parameters and optimizes them on an additional task or dataset. Prompting changes the input context; retrieval supplies information; neither operation by itself updates model weights. These mechanisms can be combined, but they solve different problems.",
          "The training view deliberately uses a small linear model. Its slope and bias are actual trainable parameters. This makes freezing easy to inspect without pretending the browser is adapting a large language model.",
        ],
      },
      {
        title: "2. Freeze parameters to restrict the solution",
        paragraphs: [
          "If the slope is frozen, optimization can only move the line vertically through the bias. If the bias is frozen, optimization can tilt the line but cannot change its intercept. If both are frozen, the loss can be evaluated but training cannot alter predictions.",
          "Freezing is an optimization constraint, not a guarantee against overfitting or unwanted behavior. The trainable subset must still have enough capacity for the desired change. In this toy task, an incorrect frozen slope imposes an irreducible fitting error.",
        ],
      },
      {
        title: "3. Factor a weight update with LoRA",
        paragraphs: [
          "For a base matrix W with output dimension dₒ and input dimension dᵢ, LoRA adds a product BA where A has shape r × dᵢ and B has shape dₒ × r. The product has the same shape as W but rank at most r. Practical formulations scale it by α/r.",
          "This reduces the number of trainable values when r is small relative to the matrix dimensions. It constrains the update, not the rank of the entire adapted matrix: W may already be full rank. The base remains frozen while adapters are optimized in real LoRA training.",
        ],
        equation: "W′ = W + (α/r)BA; adapter count = r(dᵢ + dₒ)",
      },
      {
        title: "4. Read this matrix demonstration",
        paragraphs: [
          "The base here is a 4×4 identity. Rank and amplitude controls create deterministic illustrative A and B factors; the composed matrix and its output are computed exactly. These factors are not learned by the LoRA view.",
          "Because the matrix is tiny, rank 2 already gives 16 adapter values, equal to the base count. Rank 4 uses 32. This is a useful counterexample to the claim that an adapter always saves parameters; the advantage depends on dimension and rank.",
        ],
      },
      {
        title: "5. What a real adaptation evaluation needs",
        paragraphs: [
          "A production adaptation requires representative training examples, a held-out evaluation set, a fixed base-model version, and comparison with simpler alternatives such as prompting or retrieval. Measure behavior on tasks that should remain unchanged as well as the target task.",
          "Inspect training and validation loss separately, document parameter selection, and preserve a rollback path. This lab demonstrates update mechanics and does not provide an evaluation of an adapted LLM.",
        ],
      },
    ],
    worked: {
      given:
        "W = I₄, r = 1, α = 2; every A entry is 0.1 and every B entry is 0.2.",
      steps: [
        "Each BA entry is 0.2 × 0.1 = 0.02.",
        "Scaling by α/r = 2 gives a 0.04 update in every position.",
        "Diagonal entries become 1.04 and off-diagonal entries become 0.04. The base W remains unchanged.",
      ],
      result:
        "Eight adapter parameters describe the update to a sixteen-parameter base matrix in this rank-1 example.",
    },
    references: [
      {
        title: "Hu et al. · LoRA: Low-Rank Adaptation",
        url: "https://arxiv.org/abs/2106.09685",
        kind: "Primary reference",
      },
      {
        title: "Hugging Face PEFT · LoRA developer guide",
        url: "https://huggingface.co/docs/peft/developer_guides/lora",
        kind: "Primary reference",
      },
    ],
  },
  transformers: {
    summary:
      "Attention mixes value vectors according to query–key similarity. Each heatmap row is a probability distribution over visible token positions.",
    goals: [
      "Trace scores → probabilities → weighted values.",
      "Explain scaling and causal masking.",
      "Recognize what synthetic attention does not demonstrate.",
    ],
    terms: [
      ["Query Q", "A vector used to score which positions should contribute."],
      ["Key K", "A vector compared with a query to compute a relevance score."],
      [
        "Value V",
        "The vector that is mixed into the resulting representation.",
      ],
    ],
    flow: [
      "Query–key dot products",
      "Scale & apply mask",
      "Row-wise softmax",
      "Weighted value sum",
    ],
    readCanvas:
      "Rows are query positions; columns are key positions. Darker cells mean more attention weight. Select a token to compare its input vector and computed weighted output.",
    tryThis:
      "Toggle the causal mask. In the first row, only the first position remains available when masking is enabled.",
    sections: [
      {
        title: "1. Begin with a weighted average",
        paragraphs: [
          "Suppose several vectors might inform an output. Attention assigns a nonnegative weight to each available vector and normalizes the weights to sum to one. The output is their weighted sum. Different query positions can produce different mixtures.",
          "The weights depend on similarities between queries and keys. In a learned transformer, linear projections usually construct Q, K, and V from representations. This lab uses Q = K = V from deterministic synthetic vectors to expose the core operation.",
        ],
      },
      {
        title: "2. Calculate scaled dot-product scores",
        paragraphs: [
          "For every query, take its dot product with each key. Divide the score by the square root of the key dimension before normalization. The scaling controls score magnitude as the vector dimension changes.",
          "Softmax is applied independently to every row. A row therefore describes how one position distributes weight across key positions. Raising the optional temperature flattens that row’s distribution; lowering it concentrates probability on its larger scores.",
        ],
        equation: "S = QKᵀ/√dₖ; Aᵢⱼ = exp(Sᵢⱼ/T)/Σₖ exp(Sᵢₖ/T)",
      },
      {
        title: "3. Mask future positions",
        paragraphs: [
          "An autoregressive token cannot use future positions that do not yet exist. A causal mask removes positions j > i from query row i before softmax. Those weights become exactly zero rather than simply receiving a small penalty afterward.",
          "The current position remains available. For the first query, the mask leaves only the first key; its weight must be one. This invariant is checked by an independent reference test.",
        ],
      },
      {
        title: "4. Mix the values",
        paragraphs: [
          "Multiply the attention matrix by V. The output for each query is a weighted combination of value vectors, not a token label or generated sentence. Selecting a query changes which mixture is shown in the inspector.",
          "Identical words receive identical synthetic vectors here because vectors derive from token text. There are no positional encodings, learned projections, residual connections, feed-forward blocks, or multiple heads. This is a single exact attention kernel.",
        ],
        equation: "Oᵢ = Σⱼ AᵢⱼVⱼ",
      },
      {
        title: "5. Avoid over-interpreting the heatmap",
        paragraphs: [
          "A high weight indicates a larger contribution to this particular weighted mixture. It is not by itself a causal explanation of a complete model’s final behavior. Other heads, layers, values, and nonlinear operations can change the downstream effect.",
          "Whitespace and character splitting are teaching tools, not BPE. The text entry does not run a pretrained tokenizer or infer semantic relationships. Use the lab to learn shapes, masking, normalization, and composition.",
        ],
      },
    ],
    worked: {
      given: "Q = K = V = [[1,0],[0,1]], dimension 2, no mask, temperature 1.",
      steps: [
        "The first row of QKᵀ/√2 is [1/√2,0].",
        "After softmax, the row is approximately [0.6698,0.3302].",
        "Multiplying by V leaves the same two coordinates. With a causal mask, the first output instead becomes [1,0].",
      ],
      result:
        "The output is a real weighted mixture; changing the mask changes the set of allowable contributors.",
    },
    references: [
      {
        title: "Vaswani et al. · Attention Is All You Need",
        url: "https://arxiv.org/abs/1706.03762",
        kind: "Primary reference",
      },
      {
        title: "The Annotated Transformer · Harvard NLP",
        url: "https://nlp.seas.harvard.edu/annotated-transformer/",
        kind: "Primary reference",
      },
    ],
  },
  sampling: {
    summary:
      "Sampling turns token scores into a controlled random choice. Temperature changes confidence; Top-K and Top-P remove candidates before a draw.",
    goals: [
      "Convert logits into normalized probabilities.",
      "Distinguish temperature from candidate filtering.",
      "Reproduce a sampling sequence with a fixed seed.",
    ],
    terms: [
      ["Logit", "An unnormalized numeric score assigned to a token candidate."],
      ["Top-K", "Keep at most the K highest-probability candidates."],
      [
        "Top-P",
        "Keep the smallest ranked prefix reaching cumulative probability P.",
      ],
    ],
    flow: [
      "Fixed token logits",
      "Temperature softmax",
      "Top-K → Top-P",
      "Seeded random draw",
    ],
    readCanvas:
      "Bars show the filtered, renormalized probabilities. The darker highlighted row is the most recent sampled token, not a different probability distribution.",
    tryThis:
      "Set Top-K to 1. The highest-logit token will be selected on every draw regardless of seed.",
    sections: [
      {
        title: "1. Scores are not yet probabilities",
        paragraphs: [
          "A model usually produces a score for each vocabulary item. Softmax exponentiates relative scores and normalizes them into a probability distribution. Adding the same constant to every logit leaves that distribution unchanged.",
          "For numerical stability, the implementation subtracts the largest logit before exponentiation. This prevents avoidable overflow while preserving the mathematical result. The lab uses eight fixed illustrative logits; no language model supplies them.",
        ],
        equation: "pᵢ = exp(zᵢ/T) / Σⱼ exp(zⱼ/T), with T > 0",
      },
      {
        title: "2. Temperature reshapes confidence",
        paragraphs: [
          "Dividing by a temperature below one exaggerates score differences, concentrating probability. A temperature above one compresses relative differences and spreads probability more broadly. The ranking of unequal finite logits does not change.",
          "Higher temperature is not a factuality control and cannot create missing knowledge. For fixed logits, it changes how frequently alternatives are sampled. Temperature zero is excluded here because the displayed formula would divide by zero.",
        ],
      },
      {
        title: "3. Filter candidates explicitly",
        paragraphs: [
          "Top-K retains the highest K probabilities. This lab then renormalizes that candidate set and applies Top-P to it. Nucleus selection keeps a ranked prefix until its cumulative probability reaches P, always retaining at least one candidate.",
          "The surviving probabilities are normalized again before sampling. Filtering order is part of the algorithm specification: applying Top-P to the full vocabulary before Top-K can produce a different set. Do not compare decoding systems without checking those details.",
        ],
      },
      {
        title: "4. Interpret reproducible randomness",
        paragraphs: [
          "A seed initializes the deterministic random generator. Equal parameters and seeds reproduce the same sequence in this implementation. Successive draws use successive seed offsets while only a bounded recent history is kept in memory.",
          "Autoplay repeatedly samples from the same distribution. It does not append a token to a model context and recompute new logits. The token history is therefore a sequence of independent illustrative choices rather than coherent generated text.",
        ],
      },
      {
        title: "5. Use entropy as a description, not a score",
        paragraphs: [
          "Entropy summarizes how dispersed the final distribution is. A single surviving token has entropy zero; a uniform distribution over more candidates has higher entropy. The displayed unit is nats because natural logarithms are used.",
          "Neither high nor low entropy implies a better answer. Suitable decoding settings depend on the task and model; evaluate actual outputs with a representative task set rather than judging the bars alone.",
        ],
        equation: "H(p) = −Σᵢ pᵢ ln pᵢ",
      },
    ],
    worked: {
      given: "Logits [2,1,0] and temperature 0.5, with no candidate removal.",
      steps: [
        "Scaled logits are [4,2,0]. Subtracting the maximum gives [0,−2,−4].",
        "Exponentiate and normalize to obtain approximately [0.867,0.117,0.016].",
        "If Top-K is then set to 1, only the first token survives and its final probability becomes 1.",
      ],
      result:
        "Sampling is random only when at least two candidates retain nonzero probability.",
    },
    references: [
      {
        title: "Holtzman et al. · The Curious Case of Neural Text Degeneration",
        url: "https://arxiv.org/abs/1904.09751",
        kind: "Primary reference",
      },
      {
        title: "Hugging Face Transformers · Generation strategies",
        url: "https://huggingface.co/docs/transformers/generation_strategies",
        kind: "Primary reference",
      },
    ],
  },
  rag: {
    summary:
      "Retrieval selects passages that could support an answer. Inspect chunks, ranking scores, and assembled context before trusting a downstream generator.",
    goals: [
      "Explain how chunking changes retrievable evidence.",
      "Compare lexical TF-IDF/cosine with BM25.",
      "Separate retrieval scores from factual correctness and evaluation labels.",
    ],
    terms: [
      ["Chunk", "A passage treated as an independent retrieval unit."],
      [
        "Retrieval score",
        "An algorithm-specific ranking value, not a calibrated correctness probability.",
      ],
      [
        "Context",
        "The selected source passages assembled for a downstream model.",
      ],
    ],
    flow: [
      "Source documents",
      "Word chunks & overlap",
      "Score and rank",
      "Assemble context",
    ],
    readCanvas:
      "The pipeline counters come from your actual text. Results show exact source passages and scores. No generated answer is inserted after retrieval.",
    tryThis:
      "Replace a query word with a synonym absent from the corpus. Lexical retrieval may miss a semantically relevant passage.",
    sections: [
      {
        title: "1. Separate retrieval from generation",
        paragraphs: [
          "A RAG pipeline retrieves information and supplies it to a generator as context. Retrieval determines what evidence is available; generation determines how that evidence is used. This lab implements only the retrieval and context-construction stages.",
          "An empty result is visible instead of being replaced with an invented answer. Your documents are processed locally. A real end-to-end system would additionally need source attribution, answer evaluation, security boundaries, and model behavior checks.",
        ],
      },
      {
        title: "2. Choose the retrieval unit",
        paragraphs: [
          "The lab treats blank-line-separated paragraphs as source documents, then splits each source into word-count chunks. Overlap repeats some boundary words in adjacent chunks. A 24-word chunk with overlap 4 advances by 20 words.",
          "Smaller chunks can focus matching but lose surrounding explanation; larger chunks retain more context but may mix topics. Overlap can preserve boundary evidence while adding redundancy. These are empirical design choices, not universal constants.",
        ],
      },
      {
        title: "3. Rank with TF-IDF and cosine",
        paragraphs: [
          "Term frequency describes how much a term appears in a chunk. Inverse document frequency reduces the influence of terms that occur across many chunks. The implementation uses a smoothed IDF and compares query and chunk vectors with cosine similarity.",
          "Cosine normalizes vector lengths and measures their angle. A score of zero means there is no weighted lexical overlap here; it does not prove the passage is irrelevant. The tokenizer lowercases word-like sequences and does not perform semantic inference or stemming.",
        ],
        equation: "idf(t) = ln((N+1)/(df(t)+1))+1; cosine(q,d) = q·d/(‖q‖‖d‖)",
      },
      {
        title: "4. Compare BM25",
        paragraphs: [
          "BM25 also uses inverse document frequency, but term frequency saturates and document length affects normalization. Here k₁ = 1.5 controls saturation and b = 0.75 controls length normalization. Its numeric scores are not on the same scale as cosine.",
          "Top-K selects up to K positive-scoring chunks. The assembled context includes source and chunk labels so you can inspect exactly what would be passed onward. Increasing K can improve coverage while adding irrelevant or repeated material.",
        ],
      },
      {
        title: "5. Evaluate with ground truth",
        paragraphs: [
          "Recall@K needs a set of known relevant items: it is the fraction retrieved among all relevant items. Precision@K asks what fraction of retrieved items are relevant. Ranking metrics such as MRR additionally care where a relevant result appears.",
          "No relevance labels are provided for arbitrary imported text, so the app does not fabricate those metrics. Test several query types, including paraphrases, ambiguous terms, and no-answer cases, before selecting a production retriever.",
        ],
      },
    ],
    worked: {
      given:
        "A document contains 50 words. Choose chunk size 24 and overlap 4.",
      steps: [
        "The first chunk covers words 1–24.",
        "The second starts at word 21 and covers 21–44.",
        "The third covers 41–50. Adjacent chunks share four words.",
      ],
      result:
        "Three independently scored chunks are produced. Changing overlap changes both the retrieval units and their lexical statistics.",
    },
    references: [
      {
        title: "Stanford · Introduction to Information Retrieval",
        url: "https://nlp.stanford.edu/IR-book/",
        kind: "Primary reference",
      },
      {
        title: "scikit-learn · TF-IDF text features",
        url: "https://scikit-learn.org/stable/modules/feature_extraction.html#tfidf-term-weighting",
        kind: "Primary reference",
      },
    ],
  },
  agents: {
    summary:
      "A reliable agentic system makes state transitions and tool failures observable. This studio simulates a bounded workflow rather than calling a real model.",
    goals: [
      "Trace input, tool result, and state transition separately.",
      "Predict retry counts and terminal failures.",
      "Explain why approval needs an explicit human action.",
    ],
    terms: [
      ["State", "The information the workflow carries between transitions."],
      [
        "Retry budget",
        "The number of additional attempts after the initial tool attempt.",
      ],
      [
        "Approval gate",
        "A transition that requires an explicit human decision before continuing.",
      ],
    ],
    flow: [
      "Route the task",
      "Retrieve / validate",
      "Retry or stop on error",
      "Approve → respond",
    ],
    readCanvas:
      "Stages highlight the current transition. The trace records illustrative inputs, outputs, and simulated latency. Failure injections change real state-machine behavior, not real external services.",
    tryThis:
      "Choose a persistent timeout and retry budget 2. The trace should stop after exactly three tool attempts.",
    sections: [
      {
        title: "1. Distinguish a workflow from an autonomous agent",
        paragraphs: [
          "A workflow follows explicit transitions. A more autonomous agent can delegate some decisions to a model, including tool choice or next action. Both still need boundaries around state, side effects, and failure handling.",
          "This studio is an editable fixed workflow with deterministic outputs. It does not run a model, a framework, or external tools. You can test orchestration ideas without mistaking an animation for evidence of real reasoning.",
        ],
      },
      {
        title: "2. Make transitions inspectable",
        paragraphs: [
          "The router assigns a knowledge-and-policy route, retrieval supplies an illustrative renewal policy, validation returns a result, and response construction consumes those outputs. The trace exposes what enters and leaves each stage.",
          "A stage should not silently replace a failed tool result with success. Explicit error events make failures distinguishable from missing information. In a real system, persistent state and trace identifiers also help correlate events across services.",
        ],
      },
      {
        title: "3. Bound retries",
        paragraphs: [
          "A transient failure can recover on a later attempt. A persistent failure cannot be fixed by repeatedly doing the same thing forever. A retry budget of r allows at most r + 1 total attempts, including the initial call.",
          "The lab models a single transient timeout or a persistent timeout and terminates safely when the budget is exhausted. A production system also needs deadlines, backoff, and idempotency for side-effecting tools; those are not executed by this simulator.",
        ],
      },
      {
        title: "4. Treat approval as a state boundary",
        paragraphs: [
          "When approval is enabled, ordinary Run or Step must not advance beyond the waiting state. Only the explicit Approve action releases that gate. Opening a guide, changing the playback speed, or waiting longer is not approval.",
          "This protects the educational invariant. A real approval flow would need to bind the reviewer’s decision to the exact proposed action and reject changed payloads rather than approving a stale preview.",
        ],
      },
      {
        title: "5. Compare sequential and parallel assumptions",
        paragraphs: [
          "The parallel preset combines two illustrative tool activities into a declared latency rule. Independent activities can overlap, while dependent activities must wait for their inputs. The resulting trace is a model of those assumptions, not a wall-clock benchmark.",
          "Evaluate actual agent systems using task success, tool correctness, bounded cost/latency, and recovery behavior. More agents or longer traces do not by themselves mean better outcomes.",
        ],
      },
    ],
    worked: {
      given: "The validation tool always times out, with retry budget 2.",
      steps: [
        "Attempt 1 fails and schedules retry 1.",
        "Attempt 2 fails and schedules retry 2.",
        "Attempt 3 fails, exhausts the budget, and enters the terminal failed state.",
      ],
      result:
        "There are three attempts, three error events, and no fabricated successful response.",
    },
    references: [
      {
        title: "Anthropic · Building effective agents",
        url: "https://www.anthropic.com/engineering/building-effective-agents",
        kind: "Primary reference",
      },
      {
        title: "AWS Builders’ Library · Timeouts, retries, and backoff",
        url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
        kind: "Primary reference",
      },
    ],
  },
  reinforcement: {
    summary:
      "Q-learning improves action-value estimates from rewards. Exploration tries routes; exploitation follows the best current estimates.",
    goals: [
      "Interpret state, action, reward, and Q-value.",
      "Calculate a temporal-difference update.",
      "Explain exploration and terminal-state handling.",
    ],
    terms: [
      ["State s", "The agent’s current grid cell."],
      [
        "Q(s,a)",
        "An estimate of discounted return for taking action a in state s.",
      ],
      [
        "Exploration ε",
        "The probability of choosing a random action instead of the current greedy one.",
      ],
    ],
    flow: [
      "Observe a state",
      "Choose an action",
      "Receive reward & next state",
      "Update Q-value",
    ],
    readCanvas:
      "Arrows show the greedy action from current estimates. Cell numbers are the largest Q-value at that cell. Highlighted cells were visited during the last training episode.",
    tryThis:
      "Set exploration to zero from a fresh start, then compare with 0.3. A greedy learner may keep repeating a poor initial choice.",
    sections: [
      {
        title: "1. Define the decision problem",
        paragraphs: [
          "An agent occupies one of 25 grid cells and can attempt four moves. Boundaries and obstacles keep it in place. The start is top left and the terminal goal is bottom right. Each nonterminal move costs 0.04; the goal produces the configured reward.",
          "An episode ends at the goal or after 100 transitions. The cap prevents an unproductive policy from running forever. A truncated episode is counted in the displayed success-rate denominator, so the metric does not hide failed attempts.",
        ],
      },
      {
        title: "2. Estimate action values",
        paragraphs: [
          "A Q-value estimates the discounted return from a state-action choice followed by good future decisions. It is not the immediate reward alone. The discount factor γ controls how strongly later rewards influence the target.",
          "All values begin at zero. At first, ties in the greedy choice follow a deterministic action order. Without exploration, these ties can trap the learner in repeatedly unhelpful behavior.",
        ],
        equation: "Q(s,a) ← Q(s,a) + α[r + γ maxₐ′Q(s′,a′) − Q(s,a)]",
      },
      {
        title: "3. Read the temporal-difference error",
        paragraphs: [
          "The bracketed difference is the temporal-difference error: an observed one-step target minus the current estimate. Learning rate α chooses how much of that correction to incorporate. Bootstrapping uses a current next-state estimate rather than waiting for an entire return.",
          "For a terminal next state, the target is just the terminal reward. There is no future value after the episode ends. The implementation explicitly removes the bootstrap term for the goal, and the tests verify terminal values remain unchanged.",
        ],
      },
      {
        title: "4. Balance exploration and exploitation",
        paragraphs: [
          "With probability ε the learner samples an action; otherwise it chooses an action with the highest current value. Random exploration can discover a route that an initially greedy policy would never try. Excessive exploration can also make the displayed last episode look inefficient after good values have been learned.",
          "The shown arrows are greedy, but the last episode may contain exploratory moves. Do not infer an inconsistency when that path differs from the arrows. The path highlight is a set of visited cells, not an animation of their temporal order.",
        ],
      },
      {
        title: "5. Change the environment responsibly",
        paragraphs: [
          "Toggling obstacles or changing the goal reward changes the task. The lab resets values and resumes training so old values are not presented as if they already describe the new environment. A seed makes the instructional trajectory repeatable.",
          "Obstacles can make the goal unreachable. A low success rate may therefore reflect an impossible environment rather than a bad optimizer. This tabular experiment does not train a deep reinforcement-learning model or establish a general policy-learning benchmark.",
        ],
      },
    ],
    worked: {
      given:
        "Q(s,a) = 0.2, reward = 1, best next value = 0.5, α = 0.1, γ = 0.9.",
      steps: [
        "The target is 1 + 0.9·0.5 = 1.45.",
        "The temporal-difference error is 1.45 − 0.2 = 1.25.",
        "The new estimate is 0.2 + 0.1·1.25 = 0.325.",
      ],
      result:
        "If that same transition were terminal, the target would be 1 and the new estimate would instead be 0.28.",
    },
    references: [
      {
        title: "Sutton & Barto · Reinforcement Learning, second edition",
        url: "http://incompleteideas.net/book/the-book-2nd.html",
        kind: "Primary reference",
      },
    ],
  },
  systems: {
    summary:
      "As demand approaches capacity, queues can dominate response time. Cache hits reduce backend work; replicas add approximate capacity.",
    goals: [
      "Distinguish arrival rate, service time, and response time.",
      "Recognize a saturated queue.",
      "State the limits of this pooled approximation.",
    ],
    terms: [
      [
        "Arrival rate λ",
        "The average number of requests reaching the backend per second.",
      ],
      [
        "Service capacity μ",
        "The average request-processing capacity per second.",
      ],
      [
        "Utilization ρ",
        "Demand divided by capacity; stability requires it to stay below one in this model.",
      ],
    ],
    flow: [
      "Incoming requests",
      "Cache hit or miss",
      "Backend service pool",
      "Queueing response time",
    ],
    readCanvas:
      "The pipeline separates cached traffic from backend demand. The utilization bar marks saturation; an outage removes backend throughput while cached requests can still be served.",
    tryThis:
      "Raise demand close to backend capacity, then add a replica. Notice how headroom affects delay more sharply near saturation.",
    sections: [
      {
        title: "1. Separate processing time from response time",
        paragraphs: [
          "A request can wait before it is processed. Service time describes the actual processing interval; response time includes queueing delay. A model that processes a request in 100 ms can still produce far slower user responses if work accumulates.",
          "This lab uses an analytical teaching approximation. It assumes Poisson arrivals, exponentially distributed service times, an unbounded queue, and a single pooled capacity equivalent. Real multi-replica scheduling is not exactly an M/M/1 queue.",
        ],
      },
      {
        title: "2. Compute backend demand and capacity",
        paragraphs: [
          "With an ideal cache hit fraction h, only λincoming(1 − h) reaches the backend. If each replica takes s milliseconds per request, its average service capacity is 1000/s requests per second. The pool approximation multiplies this by the replica count.",
          "Cache hits are assumed instantaneous, with a fixed hit fraction independent of load. Network overhead, cache lookup cost, batching, token-length variation, and cold starts are omitted. Those omissions are why the numbers should not be used as a production sizing guarantee.",
        ],
        equation: "λbackend = λincoming(1−h); μpool = replicas·1000/service_ms",
      },
      {
        title: "3. Understand saturation",
        paragraphs: [
          "Utilization is ρ = λbackend/μpool. When it approaches one from below, the queue has less spare capacity to absorb randomness. At or above one, the unbounded model has no finite steady-state response time.",
          "The display intentionally returns infinity instead of inventing a reassuring finite latency. A real service would eventually encounter timeouts, admission limits, dropped requests, or resource exhaustion rather than maintain an actually infinite queue.",
        ],
        equation: "Estimated T = service_ms/(1−ρ), for ρ < 1",
      },
      {
        title: "4. Interpret the replica approximation",
        paragraphs: [
          "The formula preserves the configured per-request service-time floor while using pooled capacity to approximate the effect of extra replicas. It is an educational utilization model, not the exact M/M/c response-time formula or a true merged-server simulation.",
          "Use it to reason about sensitivity: reducing effective demand or adding headroom helps most near saturation. Do not treat its millisecond estimate as a benchmark for any specific inference server.",
        ],
      },
      {
        title: "5. Model a failure explicitly",
        paragraphs: [
          "A backend outage sets backend throughput to zero. The simplified cache path remains available for cache hits. The served-traffic metric sums these surviving hits with any backend completions.",
          "Real failure handling needs timeout budgets, circuit breakers, queue bounds, cache freshness rules, and load tests using realistic traffic. Validate tail latency as well as averages, and preserve a rollback path when changing serving configuration.",
        ],
      },
    ],
    worked: {
      given:
        "10 requests/s, no cache, two replicas, each request takes 100 ms to process.",
      steps: [
        "Approximate pooled capacity is 2·1000/100 = 20 requests/s.",
        "Utilization is 10/20 = 0.5.",
        "The lab’s delay approximation is 100/(1−0.5) = 200 ms.",
      ],
      result:
        "At 20 uncached requests/s, utilization reaches one and the model reports saturation rather than a finite steady-state latency.",
    },
    references: [
      {
        title: "MIT OpenCourseWare · Discrete Stochastic Processes",
        url: "https://ocw.mit.edu/courses/6-262-discrete-stochastic-processes-spring-2011/",
        kind: "Primary reference",
      },
    ],
  },
};
