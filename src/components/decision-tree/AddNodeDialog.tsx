import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DecisionNode } from '@/types/decision-tree';

interface AddNodeDialogProps {
  isOpen: boolean;
  newNode: Partial<DecisionNode>;
  onClose: () => void;
  onAdd: () => void;
  onUpdateNewNode: (updates: Partial<DecisionNode>) => void;
}

export const AddNodeDialog = ({
  isOpen,
  newNode,
  onClose,
  onAdd,
  onUpdateNewNode
}: AddNodeDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Node</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="node-type">Type</Label>
            <Select
              value={newNode.type || 'single'}
              onValueChange={(value) => onUpdateNewNode({ type: value as any })}
            >
              <SelectTrigger id="node-type">
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
            <Label htmlFor="node-title">Title</Label>
            <Input
              id="node-title"
              value={newNode.title || ''}
              onChange={(e) => onUpdateNewNode({ title: e.target.value })}
              placeholder="Enter node title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="node-description">Description (Optional)</Label>
            <Textarea
              id="node-description"
              value={newNode.description || ''}
              onChange={(e) => onUpdateNewNode({ description: e.target.value })}
              placeholder="Enter node description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onAdd}>Add Node</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
