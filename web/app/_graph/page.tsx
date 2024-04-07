"use client";
import Image from "next/image";
import styles from "../files/page.module.scss";
import {useEffect, useRef} from "react";
import G6, {Graph} from "@antv/g6";

const initData = {
  // The array of nodes
  nodes: [{
    id: 'node1',   // String, unique and required
    x: 100,        // Number, the x coordinate
    y: 200,        // Number, the y coordinate
    label: 'Source' // The label of the node
  },{
    id: 'node2',
    x: 300,
    y: 200,
    label: 'Target'
  }],
  // The array of edges
  edges: [
    // An edge links from node1 to node2
    {
      source: 'node1',  // String, required, the id of the source node
      target: 'node2',  // String, required, the id of the target node
      label: 'I am an edge'   // The label of the edge
    }
  ]
};


export default function Home() {

  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);

  useEffect(() => {
    if (containerRef.current && !graphRef.current) {
      const graph = new G6.Graph({
        container: containerRef.current,
        width: 800,
        height: 500,
        animate: true,
        layout: {                // Object, layout configuration. random by default
          type: 'force',         // Force layout
          preventOverlap: true,  // Prevent node overlappings
          // nodeSize: 30        // The size of nodes for collide detection. Since we have assigned sizes for each node to their data in last chapter, the nodeSize here is not required any more.
        }

      });
      graph.data(initData);
      graph.render();
      graphRef.current = graph;
    }
  }, []);

  return (
    <main className={styles.main}>
      <div ref={containerRef}/>
    </main>
  );
}
