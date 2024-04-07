import { ChunkData, FileData, GraphData, PageData } from "../models";

export const getGraphData = async () => {
  return (await (
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get_graph`, {
      cache: "no-cache",
    })
  ).json()) as GraphData;
};
