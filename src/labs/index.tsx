import { LabRuntimeProvider } from "../lib/LabRuntime";
import type { Config } from "../lib/storage";
import type { LabId } from "../lib/curriculum";
import type { LabProps } from "./core";
import { Mathematics, Optimization, MachineLearning } from "./Foundations";
import { NeuralNetwork, FineTuning } from "./DeepLearning";
import { Transformers, Sampling, Rag } from "./Language";
import { Agents, Reinforcement, Systems } from "./Systems";
const registry = {
  mathematics: Mathematics,
  optimization: Optimization,
  "machine-learning": MachineLearning,
  "neural-network": NeuralNetwork,
  "fine-tuning": FineTuning,
  transformers: Transformers,
  sampling: Sampling,
  rag: Rag,
  agents: Agents,
  reinforcement: Reinforcement,
  systems: Systems,
};
export default function Lab({
  id,
  active = true,
  snapshot,
  onLearn = () => {},
  ...props
}: LabProps & {
  id: LabId;
  active?: boolean;
  snapshot?: Config;
  onLearn?: () => void;
}) {
  const Component = registry[id];
  return (
    <LabRuntimeProvider
      id={id}
      config={snapshot || props.initial}
      active={active}
      onLearn={onLearn}
    >
      <Component {...props} />
    </LabRuntimeProvider>
  );
}
