import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { DecisionNode } from '@/types/decision-tree';

interface NodeEditDialogProps {
  isOpen: boolean;
  editingNode: DecisionNode | null;
  nodes: DecisionNode[];
  onClose: () => void;
  onSave: () => void;
  onUpdateNode: (updates: Partial<DecisionNode>) => void;
  onAddOption: () => void;
  onRemoveOption: (optionId: string) => void;
  onUpdateOption: (optionId: string, label: string) => void;
  onConnectOption: (nodeId: string, optionId: string, targetNodeId: string) => void;
  onRemoveOptionConnection: (nodeId: string, optionId: string) => void;
  getTargetNodeForOption: (nodeId: string, optionId: string) => string | null;
}

export const NodeEditDialog = ({
  isOpen,
  editingNode,
  nodes,
  onClose,
  onSave,
  onUpdateNode,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
  onConnectOption,
  onRemoveOptionConnection,
  getTargetNodeForOption
}: NodeEditDialogProps) => {
  if (!editingNode) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Node</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-type">Type</Label>
            <Select
              value={editingNode.type}
              onValueChange={(value) => onUpdateNode({ type: value as any })}
            >
              <SelectTrigger id="edit-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single (Radio buttons)</SelectItem>
                <SelectItem value="multi">Multi (Checkboxes)</SelectItem>
                <SelectItem value="recursive">Recursive (Loop)</SelectItem>
                <SelectItem value="end">End (Result)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={editingNode.title}
              onChange={(e) => onUpdateNode({ title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={editingNode.description || ''}
              onChange={(e) => onUpdateNode({ description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button size="sm" onClick={onAddOption}>
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
                          onUpdateOption(option.id, e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onRemoveOption(option.id)}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
                    {(editingNode.type === 'single' || editingNode.type === 'recursive') && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">Connects to:</Label>
                        <Select
                          value={targetId || 'none'}
                          onValueChange={(value) => {
                            if (value === 'none') {
                              onRemoveOptionConnection(editingNode.id, option.id);
                            } else {
                              onConnectOption(editingNode.id, option.id, value);
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
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};