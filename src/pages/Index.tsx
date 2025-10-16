import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDecisionTree } from '@/hooks/useDecisionTree';
import { DecisionTreeSidebar } from '@/components/decision-tree/DecisionTreeSidebar';
import { DecisionTreeHeader } from '@/components/decision-tree/DecisionTreeHeader';
import { DecisionTreeCanvas } from '@/components/decision-tree/DecisionTreeCanvas';
import { NodeEditDialog } from '@/components/decision-tree/NodeEditDialog';
import { AddNodeDialog } from '@/components/decision-tree/AddNodeDialog';

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
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
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
    isAutoLayouting,
    newNode,
    setNewNode,
    handleEditNode,
    handleSaveNode,
    handleDeleteNode,
    handleAddNode,
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
  } = useDecisionTree();

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
  }, [draggedNode, dragOffset, setNodes]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, [setDraggedNode]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

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
    toast({ title: 'Tree exported successfully' });
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.nodes && Array.isArray(data.nodes)) {
          setNodes(data.nodes);
          if (data.template) {
            setSelectedTemplate(data.template);
          }
          toast({ title: 'Tree imported successfully' });
        } else {
          toast({ title: 'Invalid file format', variant: 'destructive' });
        }
      } catch (error) {
        toast({ title: 'Failed to import tree', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleClearAll = () => {
    setNodes([]);
    localStorage.removeItem('decisionTreeNodes');
    toast({ title: 'All nodes cleared' });
  };

  return (
    <div className="flex h-screen bg-background">
      <DecisionTreeSidebar
        collapsed={sidebarCollapsed}
        selectedTemplate={selectedTemplate}
        selectedNode={selectedNode}
        templates={sampleTemplates}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSelectTemplate={setSelectedTemplate}
        onAddNode={() => setIsAddNodeDialogOpen(true)}
        onEditNode={() => {
          const node = nodes.find(n => n.id === selectedNode);
          if (node) handleEditNode(node);
        }}
        onStartConnection={() => selectedNode && handleStartConnection(selectedNode)}
        onDeleteNode={() => selectedNode && handleDeleteNode(selectedNode)}
      />

      <main className="flex-1 flex flex-col">
        <DecisionTreeHeader
          isAutoLayouting={isAutoLayouting}
          fileInputRef={fileInputRef}
          onAutoLayout={handleAutoLayout}
          onImport={handleImportJSON}
          onExport={handleExportJSON}
          onClearAll={handleClearAll}
          onTriggerFileInput={triggerFileInput}
        />

        <DecisionTreeCanvas
          nodes={nodes}
          connections={getConnections()}
          selectedNode={selectedNode}
          draggedNode={draggedNode}
          connectingFrom={connectingFrom}
          canvasRef={canvasRef}
          onNodeDragStart={handleNodeDragStart}
          onNodeClick={setSelectedNode}
          onCompleteConnection={handleCompleteConnection}
          getTargetNodeForOption={getTargetNodeForOption}
        />
      </main>

      <NodeEditDialog
        isOpen={isEditDialogOpen}
        editingNode={editingNode}
        nodes={nodes}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveNode}
        onUpdateNode={(updates) => setEditingNode(editingNode ? { ...editingNode, ...updates } : null)}
        onAddOption={addOptionToEditingNode}
        onRemoveOption={removeOptionFromEditingNode}
        onUpdateOption={updateOptionInEditingNode}
        onConnectOption={handleConnectOption}
        onRemoveOptionConnection={handleRemoveOptionConnection}
        getTargetNodeForOption={getTargetNodeForOption}
      />

      <AddNodeDialog
        isOpen={isAddNodeDialogOpen}
        newNode={newNode}
        onClose={() => setIsAddNodeDialogOpen(false)}
        onAdd={handleAddNode}
        onUpdateNewNode={(updates) => setNewNode({ ...newNode, ...updates })}
      />
    </div>
  );
};

export default Index;
