import { useCallback, useState, useRef } from 'react';
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
import { DecisionTreeHeader } from './DecisionTreeHeader';
import { AddNodeDialog } from './AddNodeDialog';
import { NodeEditDialog } from './NodeEditDialog';
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newNode, setNewNode] = useState<Partial<DecisionNode>>({
    type: 'single',
    title: '',
    description: '',
    options: [],
  });

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

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setSelectedNodeId(nodeId);
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            selected: n.id === nodeId,
          }))
        );
      }
    },
    [nodes, setNodes]
  );

  const handleAddNode = useCallback(() => {
    const id = `node-${Date.now()}`;
    const node: Node<DecisionNode> = {
      id,
      type: 'custom',
      position: { x: 100, y: 100 },
      data: {
        id,
        type: newNode.type || 'single',
        title: newNode.title || 'New Node',
        description: newNode.description || '',
        options: [],
      },
    };
    setNodes((nds) => [...nds, node]);
    setNewNode({ type: 'single', title: '', description: '', options: [] });
    setIsAddDialogOpen(false);
  }, [newNode, setNodes]);

  const handleEditNode = useCallback(() => {
    setIsEditDialogOpen(true);
  }, []);

  const handleDeleteNode = useCallback(() => {
    if (selectedNodeId) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
      );
      setSelectedNodeId(null);
    }
  }, [selectedNodeId, setNodes, setEdges]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const data = {
      nodes: nodes.map((n) => n.data),
      edges: edges.map((e) => ({
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
      })),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decision-tree.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          const importedNodes: Node<DecisionNode>[] = data.nodes.map(
            (nodeData: DecisionNode, index: number) => ({
              id: nodeData.id,
              type: 'custom',
              position: { x: 100 + index * 50, y: 100 + index * 50 },
              data: nodeData,
            })
          );

          const importedEdges: Edge[] = data.edges.map(
            (edge: any, index: number) => ({
              id: `edge-${index}`,
              source: edge.source,
              target: edge.target,
              sourceHandle: edge.sourceHandle,
              targetHandle: edge.targetHandle,
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#3b82f6', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#3b82f6',
              },
            })
          );

          setNodes(importedNodes);
          setEdges(importedEdges);
        } catch (error) {
          console.error('Failed to import:', error);
          alert('Failed to import JSON file');
        }
      };
      reader.readAsText(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [setNodes, setEdges]
  );

  const handleClearAll = useCallback(() => {
    if (confirm('Are you sure you want to clear all nodes and edges?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
    }
  }, [setNodes, setEdges]);

  const handleSaveEdit = useCallback(() => {
    setIsEditDialogOpen(false);
  }, []);

  const handleUpdateNode = useCallback(
    (updates: Partial<DecisionNode>) => {
      if (!selectedNodeId) return;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === selectedNodeId ? { ...n, data: { ...n.data, ...updates } } : n
        )
      );
    },
    [selectedNodeId, setNodes]
  );

  const handleAddOption = useCallback(() => {
    if (!selectedNodeId) return;
    const optionId = `option-${Date.now()}`;
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              options: [
                ...(n.data.options || []),
                { id: optionId, label: 'New Option' },
              ],
            },
          };
        }
        return n;
      })
    );
  }, [selectedNodeId, setNodes]);

  const handleRemoveOption = useCallback(
    (optionId: string) => {
      if (!selectedNodeId) return;
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === selectedNodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                options: n.data.options.filter((opt) => opt.id !== optionId),
                optionConnections: n.data.optionConnections?.filter(
                  (oc) => oc.optionId !== optionId
                ),
              },
            };
          }
          return n;
        })
      );
      setEdges((eds) => eds.filter((e) => e.sourceHandle !== optionId));
    },
    [selectedNodeId, setNodes, setEdges]
  );

  const handleUpdateOption = useCallback(
    (optionId: string, label: string) => {
      if (!selectedNodeId) return;
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === selectedNodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                options: n.data.options.map((opt) =>
                  opt.id === optionId ? { ...opt, label } : opt
                ),
              },
            };
          }
          return n;
        })
      );
    },
    [selectedNodeId, setNodes]
  );

  const handleConnectOption = useCallback(
    (nodeId: string, optionId: string, targetNodeId: string) => {
      // Remove existing connection for this option
      setEdges((eds) =>
        eds.filter((e) => !(e.source === nodeId && e.sourceHandle === optionId))
      );

      // Add new edge
      const newEdge: Edge = {
        id: `${nodeId}-${optionId}-${targetNodeId}`,
        source: nodeId,
        sourceHandle: optionId,
        target: targetNodeId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3b82f6',
        },
      };
      setEdges((eds) => [...eds, newEdge]);

      // Update node optionConnections
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            const connections = n.data.optionConnections || [];
            const existingIndex = connections.findIndex((oc) => oc.optionId === optionId);
            const newConnections =
              existingIndex >= 0
                ? connections.map((oc) =>
                    oc.optionId === optionId ? { ...oc, targetNodeId } : oc
                  )
                : [...connections, { optionId, targetNodeId }];
            return {
              ...n,
              data: { ...n.data, optionConnections: newConnections },
            };
          }
          return n;
        })
      );
    },
    [setEdges, setNodes]
  );

  const handleRemoveOptionConnection = useCallback(
    (nodeId: string, optionId: string) => {
      setEdges((eds) =>
        eds.filter((e) => !(e.source === nodeId && e.sourceHandle === optionId))
      );
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                optionConnections: n.data.optionConnections?.filter(
                  (oc) => oc.optionId !== optionId
                ),
              },
            };
          }
          return n;
        })
      );
    },
    [setEdges, setNodes]
  );

  const getTargetNodeForOption = useCallback(
    (nodeId: string, optionId: string): string | null => {
      const edge = edges.find(
        (e) => e.source === nodeId && e.sourceHandle === optionId
      );
      return edge?.target || null;
    },
    [edges]
  );

  const editingNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId)?.data
    : null;

  const decisionNodes = nodes.map((n) => n.data);

  return (
    <div className="flex h-screen bg-slate-50">
      {showToc && (
        <TableOfContents
          nodes={decisionNodes}
          onNodeClick={handleNodeClick}
          onClose={() => setShowToc(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        <DecisionTreeHeader
          selectedNodeId={selectedNodeId}
          fileInputRef={fileInputRef}
          onAddNode={() => setIsAddDialogOpen(true)}
          onEditNode={handleEditNode}
          onDeleteNode={handleDeleteNode}
          onExport={handleExport}
          onImport={handleImport}
          onClearAll={handleClearAll}
          onTriggerFileInput={() => fileInputRef.current?.click()}
        />

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
            onNodeClick={(_, node) => handleNodeClick(node.id)}
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

      <AddNodeDialog
        isOpen={isAddDialogOpen}
        newNode={newNode}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddNode}
        onUpdateNewNode={(updates) => setNewNode({ ...newNode, ...updates })}
      />

      <NodeEditDialog
        isOpen={isEditDialogOpen}
        editingNode={editingNode}
        nodes={decisionNodes}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEdit}
        onUpdateNode={handleUpdateNode}
        onAddOption={handleAddOption}
        onRemoveOption={handleRemoveOption}
        onUpdateOption={handleUpdateOption}
        onConnectOption={handleConnectOption}
        onRemoveOptionConnection={handleRemoveOptionConnection}
        getTargetNodeForOption={getTargetNodeForOption}
      />
    </div>
  );
}