import { useCallback, useEffect, useState } from "react";
import type { LabId } from "../lib/curriculum";
import { sanitize, type Config } from "../lib/storage";
export type LabProps = { initial?: Config; onConfig: (c: Config) => void };
export function useConfig(id: LabId, { initial, onConfig }: LabProps) {
  const [c, setC] = useState(() => sanitize(id, initial));
  useEffect(() => onConfig(c), [c, onConfig]);
  const set = useCallback(
    (key: string, value: number | string | boolean) =>
      setC((p) => sanitize(id, { ...p, [key]: value })),
    [id],
  );
  return {
    c,
    set,
    n: (k: string) => Number(c[k]),
    s: (k: string) => String(c[k]),
    b: (k: string) => Boolean(c[k]),
  };
}
export const fixed = (n: number, d = 3) =>
  Number.isFinite(n) ? n.toFixed(d) : "∞";
