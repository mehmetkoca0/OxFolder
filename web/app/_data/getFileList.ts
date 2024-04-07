import { ChunkData, FileData, PageData } from "../models";

export const getFileList = async () => {
  const allSimilarities: Record<string, ChunkData> = await (
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/all_similarities`, {
      cache: "no-cache",
    })
  ).json();

  const fileMap: Record<string, Record<string, ChunkData[]>> = {};

  Object.values(allSimilarities).forEach((chunk) => {
    const pageMap: Record<string, ChunkData[]> =
      chunk.doc_label in fileMap ? fileMap[chunk.doc_label] : {};
    fileMap[chunk.doc_label] = pageMap;

    const chunkList: ChunkData[] =
      chunk.page_num in pageMap ? pageMap[chunk.page_num] : [];
    pageMap[chunk.page_num] = chunkList;
    chunkList.push(chunk);
  });

  return Object.entries(fileMap).map(([file_name, pageMap]) => {
    const sortedPages: PageData[] = Object.entries(pageMap)
      .sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10))
      .map(([page_num, chunks]) => ({
        page_num,
        chunks: chunks.sort(
          ({ chunk_num: a }, { chunk_num: b }) =>
            parseInt(a, 10) - parseInt(b, 10),
        ),
      }));

    return {
      name: file_name,
      pages: sortedPages,
      total_chunks: sortedPages.reduce(
        (acc, val) => acc + val.chunks.length,
        0,
      ),
    } as FileData;
  });
};
