import { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  addEdge,
  Background,
  useNodesState,
  useEdgesState,
  reconnectEdge,
  Controls,
  Handle,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes = [
  {
    id: "1",
    type: "editableNode",
    data: { label: "1" },
    position: { x: 250, y: 5 },
    className: "light",
  },
  {
    id: "2",
    type: "editableNode",
    data: { label: "2" },
    position: { x: 250, y: 200 },
    className: "light",
  },
];

const EditableNode = ({ data, id, setNodes }) => {
  const [label, setLabel] = useState(data.label);

  const onChange = (event) => {
    setLabel(event.target.value);
  };

  const onBlur = () => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label } } : node
      )
    );
  };

  return (
    <div className="editable-node">
      <Handle type="target" position="top" />
      <input
        value={label}
        onChange={onChange}
        onBlur={onBlur}
        style={{
          border: "1px solid gray",
          padding: "5px",
          fontSize: "16px",
          textAlign: "center",
        }}
      />
      <Handle type="source" position="bottom" />
    </div>
  );
};

export default function App() {
  // Load nodes and edges from localStorage or use initial values
  const loadFromLocalStorage = () => {
    const storedNodes = JSON.parse(localStorage.getItem('nodes'));
    const storedEdges = JSON.parse(localStorage.getItem('edges'));

    return {
      nodes: storedNodes || initialNodes,
      edges: storedEdges || []
    };
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(loadFromLocalStorage().nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(loadFromLocalStorage().edges);

  // Save nodes and edges to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('edges', JSON.stringify(edges));
  }, [edges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onReconnect = useCallback(
    (oldEdge, newConnection) =>
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
    [setEdges]
  );

  const addNode = () => {
    const newNode = {
      id: (nodes.length + 1).toString(),
      type: "editableNode",
      data: { label: `${nodes.length + 1}` },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      className: "red",
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onNodeClick = (event, node) => {
    event.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== node.id));
  };

  const onEdgeClick = (event, edge) => {
    event.stopPropagation();
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onNodeDoubleClick={onNodeClick}
        onEdgeDoubleClick={onEdgeClick}
        nodeTypes={{ editableNode: (props) => <EditableNode {...props} setNodes={setNodes} /> }}
        connectionLineType="smoothstep"
      >
        <Background variant="dots" color="red" gap="10" />
        <Controls />
      </ReactFlow>
      <button
        onClick={addNode}
        style={{
          cursor: "pointer",
          position: "fixed",
          bottom: 50,
          left: 100,
          zIndex: 10,
          padding: "18px 46px",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        Add Node
      </button>
    </div>
  );
}
