// src/components/ForceGraph.tsx
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { type GraphNode, type Link, type GraphData } from "./types"; // Import types

// Define the interface for ForceGraph's props
interface ForceGraphProps {
  data: GraphData;
  onNodeClick: (nodeId: number) => void;
}

const ForceGraph: React.FC<ForceGraphProps> = ({ data, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement | null>(null); // Type for SVG element ref
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Type for D3 zoom behavior ref
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>(null);
  // Type for D3 'g' element selection ref
  const gRef = useRef<d3.Selection<
    SVGGElement,
    unknown,
    null,
    undefined
  > | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // Ensure SVG ref is current before proceeding
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>() // Type the zoom behavior
      .scaleExtent([0.1, 8])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        if (gRef.current) {
          // Ensure gRef.current exists before using
          gRef.current.attr("transform", event.transform.toString()); // Convert transform to string
        }
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Append a 'g' element for graph elements
    const g = svg.append("g");
    gRef.current = g;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Type the simulation with our Node and Link interfaces
    const simulation = d3
      .forceSimulation<Node, Link>(data.nodes)
      .force(
        "link",
        d3.forceLink<Node, Link>(data.links).id((d: Node) => d.id),
      ) // Type d
      .force("charge", d3.forceManyBody<Node>().strength(-800)) // Type d
      .force(
        "center",
        d3.forceCenter<Node>(dimensions.width / 2, dimensions.height / 2),
      ); // Type d

    // Type the link selection
    const link = g
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll<SVGLineElement, Link>("line") // Type selection for SVGLineElement and Link datum
      .data(data.links)
      .join("line");

    // Type the node selection
    const node = g
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll<SVGCircleElement, Node>("circle") // Type selection for SVGCircleElement and Node datum
      .data(data.nodes)
      .join("circle")
      .attr("r", 10)
      .attr("fill", (d: Node) => color(String(d.id))) // color expects string or number, d.id is number
      .call(drag(simulation));

    node.on("click", (event: MouseEvent, d: Node) => {
      // Type event and d
      if (event.defaultPrevented) return;
      if (onNodeClick) {
        onNodeClick(d.id);
      }
    });

    // Type the label selection
    const labels = g
      .append("g")
      .attr("class", "labels")
      .selectAll<SVGTextElement, Node>("text") // Type selection for SVGTextElement and Node datum
      .data(data.nodes)
      .join("text")
      .attr("dx", 12)
      .attr("dy", 3)
      .text((d: Node) => String(d.id)) // Ensure text is string
      .style("font-size", "10px")
      .style("fill", "black")
      .style("pointer-events", "none");

    node.append("title").text((d: Node) => String(d.id));

    // Type the tick function callback
    simulation.on("tick", () => {
      link
        .attr("x1", (d: Link) => (d.source as Node).x || 0) // Cast d.source to Node and handle potential undefined
        .attr("y1", (d: Link) => (d.source as Node).y || 0)
        .attr("x2", (d: Link) => (d.target as Node).x || 0)
        .attr("y2", (d: Link) => (d.target as Node).y || 0);

      node.attr("cx", (d: Node) => d.x || 0).attr("cy", (d: Node) => d.y || 0);

      labels.attr("x", (d: Node) => d.x || 0).attr("y", (d: Node) => d.y || 0);
    });

    // Type the drag function and its callbacks
    function drag(sim: d3.Simulation<Node, Link>) {
      // Type sim
      function dragstarted(
        event: d3.D3DragEvent<SVGCircleElement, Node, Node>,
        d: Node,
      ) {
        // Type event and d
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(
        event: d3.D3DragEvent<SVGCircleElement, Node, Node>,
        d: Node,
      ) {
        // Type event and d
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(
        event: d3.D3DragEvent<SVGCircleElement, Node, Node>,
        d: Node,
      ) {
        // Type event and d
        if (!event.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag<SVGCircleElement, Node>() // Type for d3.drag
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      simulation.stop(); // Stop simulation on unmount
    };
  }, [data, dimensions, onNodeClick]); // Dependencies

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ForceGraph;
