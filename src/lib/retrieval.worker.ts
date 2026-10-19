import { retrieve } from "./math";
self.onmessage = (e: MessageEvent<ParametersMessage>) => {
  self.postMessage(retrieve(e.data.chunks, e.data.query, e.data.method));
};
type ParametersMessage = {
  chunks: { id: number; text: string; source: number }[];
  query: string;
  method: "tfidf" | "bm25";
};
