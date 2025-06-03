import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
  useMemo,
} from "react";
import * as d3 from "d3";
import { rawGraphData } from "./data";
// Define TypeScript interfaces for your data
interface Node {
  id: string;
  group: number; // For unique coloring
  degree: number; // Number of connections (total degree)
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string | Node;
  target: string | Node;
  value: number; // Defaulting to 1 as new format doesn't specify values
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

// Function to transform the raw data into D3's expected format
const transformData = (rawData: { [key: string]: string[] }): GraphData => {
  const nodesMap = new Map<string, Node>();
  const links: Link[] = [];
  const nodeDegrees = new Map<string, number>(); // Stores total degree

  // First pass: Identify all unique nodes and initialize their degrees to 0
  const allUniqueIds = new Set<string>();
  for (const sourceId in rawData) {
    if (Object.prototype.hasOwnProperty.call(rawData, sourceId)) {
      allUniqueIds.add(sourceId);
      rawData[sourceId].forEach((targetId) => {
        allUniqueIds.add(targetId);
      });
    }
  }
  allUniqueIds.forEach((id) => nodeDegrees.set(id, 0));

  // Second pass: Calculate degrees (in-degree + out-degree) and create links
  for (const sourceId in rawData) {
    if (Object.prototype.hasOwnProperty.call(rawData, sourceId)) {
      // Add out-degree for the source node
      nodeDegrees.set(
        sourceId,
        (nodeDegrees.get(sourceId) || 0) + rawData[sourceId].length,
      );

      rawData[sourceId].forEach((targetId) => {
        links.push({ source: sourceId, target: targetId, value: 1 });
      });
    }
  }

  // Third pass: Create final node objects with assigned groups and calculated degrees
  let groupCounter = 0;
  const finalNodes: Node[] = Array.from(allUniqueIds)
    .sort() // Sort for consistent group assignment
    .map((nodeId) => {
      return {
        id: nodeId,
        group: groupCounter++, // Assign unique group for coloring
        degree: nodeDegrees.get(nodeId) || 0, // Assign the calculated total degree
      } as Node;
    });

  return {
    nodes: finalNodes,
    links: links,
  };
};

const App: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null); // State to filter graph
  const [searchTerm, setSearchTerm] = useState<string>(""); // State for search input

  // Transform the raw data once to get the full graph data
  const fullGraphData = transformData(rawGraphData);

  // Extract unique source IDs for the sidebar directly from the rawGraphData format
  const allUniqueSourceIds = useMemo(() => Object.keys(rawGraphData), []);

  // Filter unique source IDs based on search term
  const filteredUniqueSourceIds = useMemo(() => {
    return allUniqueSourceIds.filter((id) =>
      id.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [allUniqueSourceIds, searchTerm]);

  // Filtered graph data based on selectedSourceId
  const getFilteredGraphData = useCallback(
    (sourceId: string | null): GraphData => {
      if (!sourceId) {
        return fullGraphData; // Return full graph if no source is selected
      }

      const filteredLinks: Link[] = fullGraphData.links.filter(
        (link) =>
          (link.source as Node).id === sourceId || link.source === sourceId,
      );

      const filteredNodesMap = new Map<string, Node>();
      filteredLinks.forEach((link) => {
        const sourceNode = fullGraphData.nodes.find(
          (n) => n.id === (link.source as Node).id || n.id === link.source,
        );
        const targetNode = fullGraphData.nodes.find(
          (n) => n.id === (link.target as Node).id || n.id === link.target,
        );
        if (sourceNode) filteredNodesMap.set(sourceNode.id, sourceNode);
        if (targetNode) filteredNodesMap.set(targetNode.id, targetNode);
      });

      return {
        nodes: Array.from(filteredNodesMap.values()),
        links: filteredLinks,
      };
    },
    [fullGraphData],
  );

  // Derive the current graph data based on selection
  const currentGraphData = getFilteredGraphData(selectedSourceId);

  // Use useLayoutEffect to get dimensions synchronously after DOM mutations
  useLayoutEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current && svgRef.current.parentElement) {
        const { width, height } =
          svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions(); // Set initial dimensions
    window.addEventListener("resize", updateDimensions); // Add resize listener

    return () => {
      window.removeEventListener("resize", updateDimensions); // Clean up
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  useEffect(() => {
    // Only proceed with D3 rendering if dimensions are valid
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0)
      return;

    const svg = d3
      .select(svgRef.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.selectAll("*").remove(); // Clear previous elements

    // Create a group element for the graph to apply transformations (zoom/pan)
    const g = svg.append("g");

    // Create a deep copy of the current data for D3 simulation
    const nodes: Node[] = currentGraphData.nodes.map((d) => ({ ...d }));
    const links: d3.SimulationLinkDatum<Node>[] = currentGraphData.links.map(
      (d) => ({ ...d }),
    );

    // Define color scale for nodes to ensure each has a different color
    const color = d3.scaleOrdinal(
      d3.quantize(d3.interpolateRainbow, nodes.length),
    );

    // Initialize the force simulation
    const simulation = d3
      .forceSimulation<Node, d3.SimulationLinkDatum<Node>>(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(150),
      ) // Increased link distance
      .force("charge", d3.forceManyBody().strength(-800)) // Increased repulsion strength
      .force("collide", d3.forceCollide().radius(25)) // Added forceCollide to prevent node overlap
      .force(
        "center",
        d3.forceCenter(dimensions.width / 2, dimensions.height / 2),
      );

    // Add links to the SVG
    const link = g
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    // Add nodes to the SVG
    const node = g
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 10)
      .attr("fill", (d) => color(d.group.toString())) // Color nodes by their unique group
      .call(drag(simulation) as any); // Apply drag behavior

    // Add text labels (IDs) to nodes (outside)
    const labels = g
      .append("g")
      .attr("class", "labels")
      .selectAll("text.node-id") // Use a class to distinguish
      .data(nodes)
      .join("text")
      .attr("class", "node-id")
      .attr("dx", 12) // Offset from circle
      .attr("dy", ".35em")
      .text((d) => d.id)
      .style("font-size", "9px")
      .style("fill", "#000")
      .style("pointer-events", "none")
      .style("opacity", 0.3)
      .style(
        "text-shadow",
        "0.5px 0.5px 0 #fff, -0.5px -0.5px 0 #fff, 0.5px -0.5px 0 #fff, -0.5px 0.5px 0 #fff",
      );

    // Add degree text (numbers) inside the nodes
    const degreeText = g
      .append("g")
      .attr("class", "degree-labels")
      .selectAll("text.node-degree") // Use a class to distinguish
      .data(nodes)
      .join("text")
      .attr("class", "node-degree")
      .attr("text-anchor", "middle") // Center horizontally
      .attr("dominant-baseline", "central") // Center vertically
      .text((d) => d.degree.toString()) // Display the degree
      .style("font-size", "8px") // Adjust font size to fit inside circle
      .style("fill", "#fff") // White text for contrast on colored nodes
      .style("pointer-events", "none"); // Prevent text from interfering with hover/click

    // Add hover effects for nodes and labels
    node
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(100).attr("r", 12);
        labels
          .filter((l: Node) => l.id === d.id)
          .transition()
          .duration(100)
          .style("opacity", 1)
          .style("font-size", "11px");
        labels
          .filter((l: Node) => l.id !== d.id)
          .transition()
          .duration(100)
          .style("opacity", 0.1);
        degreeText
          .filter((l: Node) => l.id === d.id) // Also affect degree text on hover
          .transition()
          .duration(100)
          .style("font-size", "10px"); // Slightly larger on hover
      })
      .on("mouseout", function (event, d) {
        d3.select(this).transition().duration(100).attr("r", 10);
        labels
          .transition()
          .duration(100)
          .style("opacity", 0.3)
          .style("font-size", "9px");
        degreeText
          .transition()
          .duration(100) // Revert degree text
          .style("font-size", "8px");
      });

    // Update positions of elements on each simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as Node).x || 0)
        .attr("y1", (d) => (d.source as Node).y || 0)
        .attr("x2", (d) => (d.target as Node).x || 0)
        .attr("y2", (d) => (d.target as Node).y || 0);

      node.attr("cx", (d) => d.x || 0).attr("cy", (d) => d.y || 0);

      labels.attr("x", (d) => d.x || 0).attr("y", (d) => d.y || 0);

      degreeText.attr("x", (d) => d.x || 0).attr("y", (d) => d.y || 0);
    });

    // Define drag behavior for nodes
    function drag(
      simulation: d3.Simulation<Node, d3.SimulationLinkDatum<Node>>,
    ) {
      function dragstarted(event: d3.D3DragEvent<Element, Node, any>) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: d3.D3DragEvent<Element, Node, any>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: d3.D3DragEvent<Element, Node, any>) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3
        .drag<Element, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    // Define zoom behavior for the entire graph
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8]) // Allow zooming from 10% to 800%
      .on("zoom", (event) => {
        g.attr("transform", event.transform); // Apply the zoom and pan transform to the group
      });

    // Apply the zoom behavior to the SVG
    svg.call(zoomBehavior);

    // Cleanup function for useEffect
    return () => {
      simulation.stop(); // Stop the simulation to prevent memory leaks
    };
  }, [dimensions.width, dimensions.height, currentGraphData]); // Re-run effect if dimensions or graph data change

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-100 font-inter">
      <div className="flex w-full h-full bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/4 p-4 border-r border-gray-200 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Sources</h2>
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search sources..."
            className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => setSelectedSourceId(null)}
            className={`w-full text-left p-2 mb-2 rounded-md transition-colors duration-200
              ${selectedSourceId === null ? "bg-blue-500 text-white shadow-md" : "bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700"}`}
          >
            Show All
          </button>
          {filteredUniqueSourceIds.map((sourceId) => (
            <button
              key={sourceId}
              onClick={() => setSelectedSourceId(sourceId)}
              className={`w-full text-left p-2 mb-2 rounded-md transition-colors duration-200
                ${selectedSourceId === sourceId ? "bg-blue-500 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
            >
              {sourceId}
            </button>
          ))}
        </div>

        {/* Graph Container */}
        <div className="flex-1 relative">
          <svg ref={svgRef} className="w-full h-full"></svg>
        </div>
      </div>
    </div>
  );
};

export default App;
