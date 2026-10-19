# Educational references

The laboratories use small, inspectable implementations and independently derived worked examples. Each lesson distinguishes mathematical computation, trained toy models, synthetic data, and conceptual simulation.

## Primary references

- [MIT 18.06: Linear Algebra](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/)
- [Google Machine Learning Crash Course: gradient descent](https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent)
- [scikit-learn: linear models](https://scikit-learn.org/stable/modules/linear_model.html), [clustering](https://scikit-learn.org/stable/modules/clustering.html#k-means), and [data leakage](https://scikit-learn.org/stable/common_pitfalls.html)
- [Deep Learning: feedforward networks](https://www.deeplearningbook.org/contents/mlp.html)
- [PyTorch: automatic differentiation](https://docs.pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html)
- [Hu et al.: LoRA](https://arxiv.org/abs/2106.09685)
- [Hugging Face PEFT: LoRA](https://huggingface.co/docs/peft/developer_guides/lora)
- [Vaswani et al.: Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Holtzman et al.: The Curious Case of Neural Text Degeneration](https://arxiv.org/abs/1904.09751)
- [Stanford: Introduction to Information Retrieval](https://nlp.stanford.edu/IR-book/)
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Sutton and Barto: Reinforcement Learning](http://incompleteideas.net/book/the-book-2nd.html)
- [MIT: Discrete Stochastic Processes](https://ocw.mit.edu/courses/6-262-discrete-stochastic-processes-spring-2011/)

## Additional reading

- [GeeksforGeeks: gradient descent](https://www.geeksforgeeks.org/machine-learning/gradient-descent-algorithm-and-its-variants/)
- [Harvard NLP: The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/)
- [AWS Builders’ Library: timeouts, retries, and backoff](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)

## Modeling notes

The queue-delay calculation is a utilization-based teaching heuristic. It preserves a per-request service-time floor while approximating replica headroom; it is not the exact M/M/c result or a benchmark of real infrastructure.

Attention uses deterministic synthetic vectors rather than pretrained representations. Sampling uses fixed illustrative logits. The LoRA composition view computes matrix updates without training a language model. The workflow studio simulates tool results without external side effects.
