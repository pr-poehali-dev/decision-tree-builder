import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DecisionNode, NodeOption, Connection, NodeType } from '@/types/decision-tree';
import ELK from 'elkjs/lib/elk.bundled.js';

const DEFAULT_NODES: DecisionNode[] = [
  {
    id: 'node-1',
    type: 'single',
    title: 'CLINICAL PRESENTATION',
    description: 'Initial patient assessment',
    options: [
      { id: 'opt-1', label: 'Pedunculated or sessile polyp', type: 'radio' },
      { id: 'opt-2', label: 'Colon cancer for resection', type: 'radio' },
      { id: 'opt-3', label: 'Metastatic adenocarcinoma', type: 'radio' }
    ],
    connections: [],
    optionConnections: [],
    position: { x: 50, y: 150 }
  },
  {
    id: 'node-2',
    type: 'multi',
    title: 'FINDINGS',
    options: [
      { id: 'opt-4', label: 'Pathology review', type: 'checkbox' },
      { id: 'opt-5', label: 'Colonoscopy', type: 'checkbox' }
    ],
    connections: [],
    optionConnections: [],
    position: { x: 400, y: 150 }
  },
  {
    id: 'node-3',
    type: 'end',
    title: 'TREATMENT PLAN',
    description: 'Final recommendation',
    options: [],
    connections: [],
    optionConnections: [],
    position: { x: 750, y: 150 }
  }
];

export const useDecisionTree = () => {
  const { toast } = useToast();
  const autoLayoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [nodes, setNodes] = useState<DecisionNode[]>(() => {
    const saved = localStorage.getItem('decisionTreeNodes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return DEFAULT_NODES;
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<DecisionNode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isAutoLayouting, setIsAutoLayouting] = useState(false);

  const [newNode, setNewNode] = useState<Partial<DecisionNode>>({
    type: 'single',
    title: '',
    description: '',
    options: [],
    optionConnections: []
  });

  useEffect(() => {
    if (autoLayoutTimeoutRef.current) {
      clearTimeout(autoLayoutTimeoutRef.current);
    }
    autoLayoutTimeoutRef.current = setTimeout(() => {
      localStorage.setItem('decisionTreeNodes', JSON.stringify(nodes));
    }, 500);

    return () => {
      if (autoLayoutTimeoutRef.current) {
        clearTimeout(autoLayoutTimeoutRef.current);
      }
    };
  }, [nodes]);

  const handleEditNode = (node: DecisionNode) => {
    setEditingNode({ ...node });
    setIsEditDialogOpen(true);
  };

  const handleSaveNode = () => {
    if (!editingNode) return;

    setNodes(prev => prev.map(node =>
      node.id === editingNode.id ? editingNode : node
    ));
    setIsEditDialogOpen(false);
    toast({ title: 'Node updated successfully' });
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId).map(node => ({
      ...node,
      connections: (node.connections || []).filter(c => c !== nodeId),
      optionConnections: (node.optionConnections || []).filter(oc => oc.targetNodeId !== nodeId)
    })));
    setSelectedNode(null);
    toast({ title: 'Node deleted' });
  };

  const handleAddNode = () => {
    if (!newNode.title) {
      toast({ title: 'Please enter a title', variant: 'destructive' });
      return;
    }

    const id = `node-${Date.now()}`;
    const node: DecisionNode = {
      id,
      type: newNode.type as NodeType || 'single',
      title: newNode.title,
      description: newNode.description,
      options: newNode.options || [],
      connections: [],
      optionConnections: [],
      position: { x: 400, y: 300 }
    };

    setNodes(prev => [...prev, node]);
    setIsAddNodeDialogOpen(false);
    setNewNode({ type: 'single', title: '', description: '', options: [], optionConnections: [] });
    toast({ title: 'Node created successfully' });
    setTimeout(() => handleAutoLayout(), 100);
  };

  const handleToggleConnection = (fromId: string, toId: string) => {
    setNodes(prev => prev.map(node => {
      if (node.id === fromId) {
        const hasConnection = node.connections.includes(toId);
        return {
          ...node,
          connections: hasConnection
            ? node.connections.filter(c => c !== toId)
            : [...node.connections, toId]
        };
      }
      return node;
    }));
  };

  const handleConnectOption = (nodeId: string, optionId: string, targetNodeId: string) => {
    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        const optionConnections = node.optionConnections || [];
        const existingConnection = optionConnections.find(oc => oc.optionId === optionId);
        if (existingConnection) {
          return {
            ...node,
            optionConnections: optionConnections.map(oc =>
              oc.optionId === optionId ? { ...oc, targetNodeId } : oc
            )
          };
        } else {
          return {
            ...node,
            optionConnections: [...optionConnections, { optionId, targetNodeId }]
          };
        }
      }
      return node;
    }));
  };

  const handleRemoveOptionConnection = (nodeId: string, optionId: string) => {
    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          optionConnections: (node.optionConnections || []).filter(oc => oc.optionId !== optionId)
        };
      }
      return node;
    }));
  };

  const handleStartConnection = (nodeId: string) => {
    setConnectingFrom(nodeId);
    toast({ title: 'Click on another node to connect' });
  };

  const handleCompleteConnection = (toNodeId: string) => {
    if (connectingFrom && connectingFrom !== toNodeId) {
      handleToggleConnection(connectingFrom, toNodeId);
      toast({ title: 'Connection created' });
    }
    setConnectingFrom(null);
  };

  const addOptionToEditingNode = () => {
    if (!editingNode) return;
    const newOption: NodeOption = {
      id: `opt-${Date.now()}`,
      label: 'New option',
      type: 'checkbox'
    };
    setEditingNode({
      ...editingNode,
      options: [...editingNode.options, newOption]
    });
  };

  const removeOptionFromEditingNode = (optionId: string) => {
    if (!editingNode) return;
    setEditingNode({
      ...editingNode,
      options: editingNode.options.filter(o => o.id !== optionId)
    });
  };

  const updateOptionInEditingNode = (optionId: string, label: string) => {
    if (!editingNode) return;
    setEditingNode({
      ...editingNode,
      options: editingNode.options.map(o =>
        o.id === optionId ? { ...o, label } : o
      )
    });
  };

  const getTargetNodeForOption = (nodeId: string, optionId: string): string | null => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !node.optionConnections) return null;
    const connection = node.optionConnections.find(oc => oc.optionId === optionId);
    return connection?.targetNodeId || null;
  };

  const getConnections = (): Connection[] => {
    const connections: Connection[] = [];
    nodes.forEach(node => {
      if (node.connections && Array.isArray(node.connections)) {
        node.connections.forEach(toId => {
          connections.push({ from: node.id, to: toId });
        });
      }
      if (node.optionConnections && Array.isArray(node.optionConnections)) {
        node.optionConnections.forEach(oc => {
          connections.push({ from: node.id, to: oc.targetNodeId });
        });
      }
    });
    return connections;
  };

  const handleAutoLayout = async () => {
    if (nodes.length === 0 || isAutoLayouting) return;
    
    setIsAutoLayouting(true);
    try {
      const elk = new ELK();
      
      const graph = {
        id: 'root',
        layoutOptions: {
          'elk.algorithm': 'layered',
          'elk.direction': 'RIGHT',
          'elk.spacing.nodeNode': '80',
          'elk.layered.spacing.nodeNodeBetweenLayers': '100',
          'elk.spacing.edgeNode': '40'
        },
        children: nodes.map(node => ({
          id: node.id,
          width: 320,
          height: 150 + (node.options?.length || 0) * 30
        })),
        edges: getConnections().map((conn, idx) => ({
          id: `edge-${idx}`,
          sources: [conn.from],
          targets: [conn.to]
        }))
      };

      const layout = await elk.layout(graph);
      
      setNodes(prev => prev.map(node => {
        const elkNode = layout.children?.find(n => n.id === node.id);
        if (elkNode && elkNode.x !== undefined && elkNode.y !== undefined) {
          return {
            ...node,
            position: { x: elkNode.x, y: elkNode.y }
          };
        }
        return node;
      }));
      
      toast({ title: 'Layout applied successfully' });
    } catch (error) {
      console.error('Layout error:', error);
      toast({ title: 'Layout failed', variant: 'destructive' });
    } finally {
      setIsAutoLayouting(false);
    }
  };

  return {
    nodes,
    setNodes,
    selectedNode,
    setSelectedNode,
    editingNode,
    setEditingNode,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isAddNodeDialogOpen,
    setIsAddNodeDialogOpen,
    draggedNode,
    setDraggedNode,
    dragOffset,
    setDragOffset,
    connectingFrom,
    setConnectingFrom,
    isAutoLayouting,
    newNode,
    setNewNode,
    handleEditNode,
    handleSaveNode,
    handleDeleteNode,
    handleAddNode,
    handleToggleConnection,
    handleConnectOption,
    handleRemoveOptionConnection,
    handleStartConnection,
    handleCompleteConnection,
    addOptionToEditingNode,
    removeOptionFromEditingNode,
    updateOptionInEditingNode,
    getTargetNodeForOption,
    getConnections,
    handleAutoLayout
  };
};
