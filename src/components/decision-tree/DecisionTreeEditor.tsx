import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CustomNode } from './CustomNode';
import { TableOfContents } from './TableOfContents';
import { DecisionNode } from '@/types/decision-tree';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const nodeTypes = {
  custom: CustomNode,
};

interface DecisionTreeEditorProps {
  initialNodes?: Node<DecisionNode>[];
  initialEdges?: Edge[];
}

export function DecisionTreeEditor({
  initialNodes = [],
  initialEdges = [],
}: DecisionTreeEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showToc, setShowToc] = useState(true);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#3b82f6',
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const handleNodeClick = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          selected: n.id === nodeId,
        }))
      );
    }
  }, [nodes, setNodes]);

  return (
    <div className="flex h-screen bg-slate-50">
      {showToc && (
        <TableOfContents
          nodes={nodes.map((n) => n.data)}
          onNodeClick={handleNodeClick}
          onClose={() => setShowToc(false)}
        />
      )}

      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {!showToc && (
            <Button
              onClick={() => setShowToc(true)}
              variant="secondary"
              size="sm"
              className="bg-white shadow-md"
            >
              <Icon name="Menu" size={16} className="mr-2" />
              Table of Contents
            </Button>
          )}
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          className="bg-slate-50"
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#3b82f6',
            },
          }}
        >
          <Background color="#94a3b8" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.data.type === 'single') return '#3b82f6';
              if (node.data.type === 'multi') return '#8b5cf6';
              if (node.data.type === 'end') return '#10b981';
              if (node.data.type === 'recursive') return '#f97316';
              return '#64748b';
            }}
            className="bg-white border border-slate-200 rounded-lg"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
