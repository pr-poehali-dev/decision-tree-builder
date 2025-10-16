import { useState, useRef, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { useToast } from '@/hooks/use-toast';
import { useDecisionTreeFlow } from '@/hooks/useDecisionTreeFlow';
import { DecisionTreeSidebar } from '@/components/decision-tree/DecisionTreeSidebar';
import { DecisionTreeHeader } from '@/components/decision-tree/DecisionTreeHeader';
import { NodeEditDialog } from '@/components/decision-tree/NodeEditDialog';
import { AddNodeDialog } from '@/components/decision-tree/AddNodeDialog';
import { CustomNode } from '@/components/decision-tree/CustomNode';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    nodes,
    edges,
    decisionNodes,
    setDecisionNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDragStop,
    selectedNode,
    setSelectedNode,
    editingNode,
    setEditingNode,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isAddNodeDialogOpen,
    setIsAddNodeDialogOpen,
    isAutoLayouting,
    newNode,
    setNewNode,
    handleEditNode,
    handleSaveNode,
    handleDeleteNode,
    handleAddNode,
    handleConnectOption,
    handleRemoveOptionConnection,
    addOptionToEditingNode,
    removeOptionFromEditingNode,
    updateOptionInEditingNode,
    getTargetNodeForOption,
    handleAutoLayout
  } = useDecisionTreeFlow();

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const handleExportJSON = () => {
    const data = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      template: selectedTemplate,
      nodes: decisionNodes
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
          setDecisionNodes(data.nodes);
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
    setDecisionNodes([]);
    localStorage.removeItem('decisionTreeNodes');
    toast({ title: 'All nodes cleared' });
  };

  const onNodeClick = (_event: React.MouseEvent, node: any) => {
    setSelectedNode(node.id);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
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
          const node = decisionNodes.find(n => n.id === selectedNode);
          if (node) handleEditNode(node);
        }}
        onStartConnection={() => {
          toast({ title: 'Connect nodes by dragging from one handle to another' });
        }}
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

        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: false,
              style: { stroke: '#94a3b8', strokeWidth: 2 }
            }}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </main>

      <NodeEditDialog
        isOpen={isEditDialogOpen}
        editingNode={editingNode}
        nodes={decisionNodes}
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