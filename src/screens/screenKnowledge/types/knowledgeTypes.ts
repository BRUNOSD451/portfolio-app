export type KnowledgeStatus = {
  ready: boolean;
  filename?: string;
  indexed_at?: string;
  chunk_count?: number;
  unchanged?: boolean;
};
