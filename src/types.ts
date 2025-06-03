// src/types.ts

// Define the structure for your nodes, extending D3's SimulationNodeDatum
// D3 will add x, y, vx, vy, fx, fy automatically.
export interface GraphNode extends d3.SimulationNodeDatum {
  id: number;
  isSelected?: boolean; // Used in App.tsx
}

// Define the structure for your links, extending D3's SimulationLinkDatum
// Source and target can initially be numbers (IDs) or Node objects.
// D3's forceLink will resolve IDs to Node objects.
export interface Link extends d3.SimulationLinkDatum<GraphNode> {
  source: number | GraphNode;
  target: number | GraphNode;
}

// Define the structure for the complete graph data
export interface GraphData {
  nodes: GraphNode[];
  links: Link[];
}

// Define the structure for your idRelationships object
export interface IdRelationships {
  [key: number]: Set<number>;
}
