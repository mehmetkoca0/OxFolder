"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { GraphData } from "../models";
import { convertToRange } from "../_utils/lerp";
import ForceGraph, {
  ForceGraphMethods,
  LinkObject,
  NodeObject,
} from "react-force-graph-2d";
import { useResizeDetector } from "react-resize-detector";
import styles from "./page.module.scss";

export const Graph = ({ data }: { data: GraphData }) => {
  const transformedData = useMemo(() => {
    const nodes: NodeObject[] = [];
    const links: LinkObject[] = [];
    const links_cache = new Set<string>();

    const color_cache = new Map<string, string>();
    let colorIndex = 0;
    const colors: string[] = [
      "#45e0bb",
      "#9ae045",
      "#d77cf6",
      "#e04545",
      "#6145e0",
      "#e07b45",
      "#111bce",
      "#8fb28f",
      "#7a6e67",
    ];

    const filteredEdges = (list: Array<[string, number]>) =>
      list.sort(([_, a], [__, b]) => b - a).filter((_, i) => i < 5);

    Object.entries(data).forEach(([key, value]) => {
      const color =
        color_cache.get(value.doc_label) ??
        colors[colorIndex++ % colors.length];
      color_cache.set(value.doc_label, color);

      nodes.push({
        id: key,
        label: `${value.doc_label}-${value.page_num}-${value.chunk_num}`,
        filename: value.doc_label,
        data: value,
        color,
      });
    });

    const minWeight = Object.values(data).reduce((acc, val) => {
      return Math.min(
        acc,
        filteredEdges(Object.entries(val.strongNeighbours))
          .map(([_, i]) => i)
          .reduce((acc, num) => Math.min(acc, num), 1),
      );
    }, 1);

    const maxWeight = Object.values(data).reduce(
      (acc, val) =>
        Math.max(
          acc,
          filteredEdges(Object.entries(val.strongNeighbours))
            .map(([_, i]) => i)
            .reduce((acc, num) => Math.max(acc, num), 0),
        ),
      0,
    );

    console.log([minWeight, maxWeight]);

    Object.entries(data).forEach(([key, value]) => {
      filteredEdges(Object.entries(value.strongNeighbours)).forEach(
        ([neighbourKey, score]) => {
          if (
            !links_cache.has(`${key}@@${neighbourKey}`) &&
            !links_cache.has(`${neighbourKey}@@${key}`)
          ) {
            const va = convertToRange(
              score,
              [minWeight, maxWeight],
              [0.25, 15],
            );
            links.push({
              source: key,
              target: neighbourKey,
              value: va,
            });
          }
        },
      );
    });

    return { nodes, links };
  }, [data]);

  const [selectedNode, setSelectedNode] = useState<NodeObject | null>(null);

  const graphRef = useRef<ForceGraphMethods>(null);
  const { width, height, ref: measureRef } = useResizeDetector();

  const paintRing = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D) => {
      if (node.id === selectedNode?.id) {
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, 3.5 * 1.2, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#fff202";
        ctx.fill();
      }
    },
    [selectedNode],
  );

  return (
    <div className={styles["grid"]}>
      <div className={styles["graph-container"]} ref={measureRef}>
        <ForceGraph
          ref={graphRef as any}
          width={width ?? 500}
          height={height ?? 600}
          nodeRelSize={3.5}
          nodeLabel={(node) => node.label}
          linkColor={() => "rgb(124,124,124, 0.5)"}
          linkWidth={(link) => link.value}
          onBackgroundClick={() => {
            // if (selectedNode) {
            //   selectedNode.fx = undefined;
            //   selectedNode.fy = undefined;
            // }
            setSelectedNode(null);
          }}
          nodeCanvasObjectMode={() =>
            selectedNode !== null ? "before" : undefined
          }
          nodeCanvasObject={paintRing}
          onNodeClick={(node) => {
            // node.fx = 0;
            // node.fy = 0;
            setSelectedNode(node);
          }}
          // nodeCanvasObject={(node, ctx, globalScale) => {
          //   const label = node.label;
          //   const fontSize = 12 / globalScale;
          //   ctx.font = `${fontSize}px Sans-Serif`;
          //   const textWidth = ctx.measureText(label + "").width;
          //   const bckgDimensions = [textWidth, fontSize].map(
          //     (n) => n + fontSize * 0.2,
          //   ); // some padding
          //
          //   // ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          //   // ctx.fillRect(
          //   //   node.x - bckgDimensions[0] / 2,
          //   //   node.y - bckgDimensions[1] / 2,
          //   //   ...bckgDimensions,
          //   // );
          //
          //   ctx.textAlign = "center";
          //   ctx.textBaseline = "middle";
          //   ctx.fillStyle = node.color;
          //   ctx.fillText(label + "", node.x!, node.y!);
          // }}
          graphData={transformedData}
        />
      </div>
      <div className={styles["info-panel"]}>
        {selectedNode !== null && (
          <>
            <div>
              <span>File:</span> {selectedNode.data.doc_label}.pdf
            </div>
            <div>
              <span>Page Number:</span> {selectedNode.data.page_num}
            </div>
            <div>
              <span>Chunk:</span> {selectedNode.data.chunk_num}
            </div>

            <div
              style={{
                height: "1px",
                background: "var(--border-1)",
                marginBlock: 15,
              }}
            />

            <div className={styles["text"]}>{selectedNode.data.text}</div>
          </>
        )}
      </div>
    </div>
  );
};
