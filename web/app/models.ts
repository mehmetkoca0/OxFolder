export interface ChunkData {
  chunk_num: string;
  doc_label: string;
  page_num: string;
  similarities: Record<string, number>;
  text: string;
}

export interface FileData {
  name: string;
  pages: PageData[];
  total_chunks: number;
}

export interface PageData {
  page_num: string;
  chunks: ChunkData[];
}

export type GraphData = Record<
  string,
  {
    chunk_num: number;
    degree: number;
    doc_label: string;
    page_num: number;
    strongNeighbours: Record<string, number>;
  }
>;
