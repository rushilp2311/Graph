// src/components/ForceGraph.jsx
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

// Remove centerNodeId from props
const ForceGraph = ({ data, onNodeClick }) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const zoomBehaviorRef = useRef(null);
  const gRef = useRef(null);
  // Removed simulationRef as its primary purpose was for external centering control

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    const g = svg.append("g");
    gRef.current = g;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-800))
      .force(
        "center",
        d3.forceCenter(dimensions.width / 2, dimensions.height / 2),
      );

    const link = g
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(data.links)
      .join("line");

    const node = g
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", 10)
      .attr("fill", (d) => color(d.id)) // Reverted to always use default color
      .call(drag(simulation));

    node.on("click", (event, d) => {
      if (event.defaultPrevented) return;
      if (onNodeClick) {
        onNodeClick(d.id);
      }
    });

    const labels = g
      .append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .attr("dx", 12)
      .attr("dy", 3)
      .text((d) => d.id)
      .style("font-size", "10px")
      .style("fill", "black")
      .style("pointer-events", "none");

    node.append("title").text((d) => d.id);

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });

    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      simulation.stop(); // Stop simulation on unmount
    };
  }, [data, dimensions, onNodeClick]);

  // Removed the useEffect for centerNodeId and highlighting

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ForceGraph;
