import { createContext, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LabId } from "./curriculum";
import { sanitize, type Config } from "./storage";
export type Metric = [string, string | number];
type Runtime = {
  id: LabId;
  config: Config;
  metrics: Metric[];
  active: boolean;
  playing: boolean | null;
  onLearn: () => void;
  reportMetrics: (m: Metric[]) => void;
  reportPlaying: (b: boolean) => void;
};
export const LabRuntime = createContext<Runtime | null>(null);
export function LabRuntimeProvider({
  id,
  config,
  active,
  onLearn,
  children,
}: {
  id: LabId;
  config?: Config;
  active: boolean;
  onLearn: () => void;
  children: ReactNode;
}) {
  const [metrics, setMetrics] = useState<Metric[]>([]),
    [playing, setPlaying] = useState<boolean | null>(null);
  const reportMetrics = useCallback(
    (m: Metric[]) =>
      setMetrics((p) => (JSON.stringify(p) === JSON.stringify(m) ? p : m)),
    [],
  );
  const reportPlaying = useCallback((b: boolean) => setPlaying(b), []);
  const value = useMemo(
    () => ({
      id,
      config: sanitize(id, config),
      metrics,
      active,
      playing,
      onLearn,
      reportMetrics,
      reportPlaying,
    }),
    [
      id,
      config,
      metrics,
      active,
      playing,
      onLearn,
      reportMetrics,
      reportPlaying,
    ],
  );
  return <LabRuntime.Provider value={value}>{children}</LabRuntime.Provider>;
}
