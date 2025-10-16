import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type NodeType = 'single' | 'multi' | 'end';

interface NodeOption {
  id: string;
  label: string;
  type: 'checkbox' | 'radio';
}

interface OptionConnection {
  optionId: string;
  targetNodeId: string;
}

interface DecisionNode {
  id: string;
  type: NodeType;
  title: string;
  description?: string;
  options: NodeOption[];
  connections: string[];
  optionConnections: OptionConnection[];
  position: { x: number; y: number };
}

interface Connection {
  from: string;
  to: string;
}

const sampleTemplates = [
  {
    id: 'sample-tree',
    name: 'Sample Decision Tree',
    category: 'Templates'
  }
];

const Index = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('sample-tree');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<DecisionNode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nodes, setNodes] = useState<DecisionNode[]>(() => {
    const saved = localStorage.getItem('decisionTreeNodes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
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
    }];
  });

  const [newNode, setNewNode] = useState<Partial<DecisionNode>>({
    type: 'single',
    title: '',
    description: '',
    options: [],
    optionConnections: []
  });

  const [isOptionConnectionDialogOpen, setIsOptionConnectionDialogOpen] = useState(false);
  const [selectedOptionForConnection, setSelectedOptionForConnection] = useState<{nodeId: string, optionId: string} | null>(null);

  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    if ((e.target as HTMLElement).closest('input, button, label')) return;
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setDraggedNode(nodeId);
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedNode || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setNodes(prev => prev.map(node =>
      node.id === draggedNode
        ? { ...node, position: { x: Math.max(0, x), y: Math.max(0, y) } }
        : node
    ));
  }, [draggedNode, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    localStorage.setItem('decisionTreeNodes', JSON.stringify(nodes));
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

  const handleExportJSON = () => {
    const data = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      template: selectedTemplate,
      nodes: nodes
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `decision-tree-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: 'Decision tree exported successfully' });
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        if (!data.nodes || !Array.isArray(data.nodes)) {
          throw new Error('Invalid JSON format');
        }

        setNodes(data.nodes);
        localStorage.setItem('decisionTreeNodes', JSON.stringify(data.nodes));
        if (data.template) {
          setSelectedTemplate(data.template);
        }
        setSelectedNode(null);

        toast({ title: 'Decision tree imported successfully' });
      } catch (error) {
        toast({
          title: 'Import failed',
          description: 'Invalid JSON file format',
          variant: 'destructive'
        });
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-screen bg-background font-inter">
      <aside
        className={cn(
          'transition-all duration-300 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border',
          sidebarCollapsed ? 'w-16' : 'w-80'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!sidebarCollapsed && (
            <h1 className="text-lg font-semibold">Table of Contents</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Icon name={sidebarCollapsed ? 'PanelLeft' : 'PanelLeftClose'} size={20} />
          </Button>
        </div>

        {!sidebarCollapsed && (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-1">
              {sampleTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    selectedTemplate === template.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/80'
                  )}
                >
                  {template.name}
                </button>
              ))}
            </div>

            <Separator className="my-4 bg-sidebar-border" />

            <div className="space-y-2">
              <Button
                onClick={() => setIsAddNodeDialogOpen(true)}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Add Node
              </Button>
            </div>

            {selectedNode && (
              <>
                <Separator className="my-4 bg-sidebar-border" />
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 mb-2">
                    Selected Node Actions
                  </h3>
                  <Button
                    onClick={() => {
                      const node = nodes.find(n => n.id === selectedNode);
                      if (node) handleEditNode(node);
                    }}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    <Icon name="Edit" size={14} className="mr-2" />
                    Edit Node
                  </Button>
                  <Button
                    onClick={() => handleStartConnection(selectedNode)}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    <Icon name="Link" size={14} className="mr-2" />
                    Add Connection
                  </Button>
                  <Button
                    onClick={() => handleDeleteNode(selectedNode)}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Icon name="Trash2" size={14} className="mr-2" />
                    Delete Node
                  </Button>
                </div>
              </>
            )}
          </ScrollArea>
        )}
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-3 border-b bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-foreground">
              Decision Tree Editor
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={triggerFileInput}>
              <Icon name="Upload" size={16} className="mr-2" />
              Import JSON
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExportJSON}>
              <Icon name="Download" size={16} className="mr-2" />
              Export JSON
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setNodes([]);
                localStorage.removeItem('decisionTreeNodes');
                toast({ title: 'All nodes cleared' });
              }}
            >
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Clear All
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </div>
        </header>

        <div className="flex-1 overflow-hidden bg-muted/30">
          <ScrollArea className="h-full">
            <div
              ref={canvasRef}
              className="relative min-h-[1000px] min-w-[1400px] p-8"
            >
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
                  </marker>
                  <marker
                    id="arrowhead-active"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#0ea5e9" />
                  </marker>
                </defs>

                {getConnections().map((conn, idx) => {
                  const fromNode = nodes.find(n => n.id === conn.from);
                  const toNode = nodes.find(n => n.id === conn.to);
                  if (!fromNode || !toNode) return null;

                  const fromX = fromNode.position.x + 280;
                  const fromY = fromNode.position.y + 60;
                  const toX = toNode.position.x;
                  const toY = toNode.position.y + 60;

                  const isActive = selectedNode === conn.from || selectedNode === conn.to;

                  return (
                    <line
                      key={idx}
                      x1={fromX}
                      y1={fromY}
                      x2={toX}
                      y2={toY}
                      stroke={isActive ? '#0ea5e9' : '#94a3b8'}
                      strokeWidth={isActive ? '3' : '2'}
                      markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                    />
                  );
                })}
              </svg>

              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute animate-fade-in"
                  style={{
                    left: `${node.position.x}px`,
                    top: `${node.position.y}px`,
                    zIndex: draggedNode === node.id ? 10 : 1,
                    cursor: draggedNode === node.id ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                >
                  <Card
                    className={cn(
                      'w-[280px] transition-all duration-200 hover:shadow-lg',
                      selectedNode === node.id
                        ? 'ring-2 ring-primary shadow-lg'
                        : connectingFrom === node.id
                        ? 'ring-2 ring-secondary shadow-lg'
                        : 'hover:ring-1 hover:ring-border'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (connectingFrom && connectingFrom !== node.id) {
                        handleCompleteConnection(node.id);
                      } else {
                        setSelectedNode(node.id);
                      }
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={cn(
                            'flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
                            node.type === 'single' && 'bg-primary text-primary-foreground',
                            node.type === 'multi' && 'bg-secondary text-secondary-foreground',
                            node.type === 'end' && 'bg-destructive text-destructive-foreground'
                          )}
                        >
                          <Icon
                            name={
                              node.type === 'single'
                                ? 'Circle'
                                : node.type === 'end'
                                ? 'Flag'
                                : 'GitBranch'
                            }
                            size={20}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                            {node.title}
                          </h3>
                          {node.description && (
                            <p className="text-xs text-muted-foreground">{node.description}</p>
                          )}
                        </div>
                      </div>

                      {node.options && node.options.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {node.type === 'single' ? (
                            <RadioGroup>
                              {node.options.map((option) => {
                                const targetId = getTargetNodeForOption(node.id, option.id);
                                return (
                                  <div key={option.id} className="flex items-start justify-between space-x-2 group">
                                    <div className="flex items-start space-x-2 flex-1">
                                      <RadioGroupItem value={option.id} id={option.id} />
                                      <Label
                                        htmlFor={option.id}
                                        className="text-xs font-normal leading-relaxed cursor-pointer flex-1"
                                      >
                                        {option.label}
                                      </Label>
                                    </div>
                                    {targetId && (
                                      <Icon name="ArrowRight" size={12} className="text-primary mt-0.5" />
                                    )}
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          ) : (
                            node.options.map((option) => (
                              <div key={option.id} className="flex items-start space-x-2">
                                <Checkbox id={option.id} />
                                <Label
                                  htmlFor={option.id}
                                  className="text-xs font-normal leading-relaxed cursor-pointer"
                                >
                                  {option.label}
                                </Label>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Node</DialogTitle>
          </DialogHeader>
          {editingNode && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Node Type</Label>
                <Select
                  value={editingNode.type}
                  onValueChange={(value: NodeType) =>
                    setEditingNode({ ...editingNode, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single (Radio buttons)</SelectItem>
                    <SelectItem value="multi">Multi (Checkboxes)</SelectItem>
                    <SelectItem value="end">End (Result)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingNode.title}
                  onChange={(e) =>
                    setEditingNode({ ...editingNode, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={editingNode.description || ''}
                  onChange={(e) =>
                    setEditingNode({ ...editingNode, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button size="sm" onClick={addOptionToEditingNode}>
                    <Icon name="Plus" size={14} className="mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingNode.options.map((option) => {
                    const targetId = getTargetNodeForOption(editingNode.id, option.id);
                    const targetNode = nodes.find(n => n.id === targetId);
                    return (
                      <div key={option.id} className="space-y-2 border rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={option.label}
                            onChange={(e) =>
                              updateOptionInEditingNode(option.id, e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeOptionFromEditingNode(option.id)}
                          >
                            <Icon name="X" size={16} />
                          </Button>
                        </div>
                        {editingNode.type === 'single' && (
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Connects to:</Label>
                            <Select
                              value={targetId || 'none'}
                              onValueChange={(value) => {
                                if (value === 'none') {
                                  handleRemoveOptionConnection(editingNode.id, option.id);
                                } else {
                                  handleConnectOption(editingNode.id, option.id, value);
                                }
                              }}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="No connection" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No connection</SelectItem>
                                {nodes
                                  .filter(n => n.id !== editingNode.id)
                                  .map(n => (
                                    <SelectItem key={n.id} value={n.id}>
                                      {n.title}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            {targetNode && (
                              <span className="text-xs text-muted-foreground">→ {targetNode.title}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNode}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddNodeDialogOpen} onOpenChange={setIsAddNodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Node</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Node Type</Label>
              <Select
                value={newNode.type}
                onValueChange={(value: NodeType) =>
                  setNewNode({ ...newNode, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single (Radio buttons)</SelectItem>
                  <SelectItem value="multi">Multi (Checkboxes)</SelectItem>
                  <SelectItem value="end">End (Result)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newNode.title}
                onChange={(e) =>
                  setNewNode({ ...newNode, title: e.target.value })
                }
                placeholder="Enter node title"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={newNode.description}
                onChange={(e) =>
                  setNewNode({ ...newNode, description: e.target.value })
                }
                placeholder="Enter description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddNodeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNode}>Add Node</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {connectingFrom && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full shadow-lg z-50">
          <Icon name="Link" size={16} />
          <span className="text-sm font-medium">Click on a node to connect</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConnectingFrom(null)}
            className="h-6 w-6 p-0"
          >
            <Icon name="X" size={14} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;