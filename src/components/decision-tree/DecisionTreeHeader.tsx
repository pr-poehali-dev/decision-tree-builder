import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DecisionTreeHeaderProps {
  selectedNodeId: string | null;
  onAddNode: () => void;
  onEditNode: () => void;
  onDeleteNode: () => void;
}

export const DecisionTreeHeader = ({
  selectedNodeId,
  onAddNode,
  onEditNode,
  onDeleteNode,
}: DecisionTreeHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          Decision Tree Editor
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" onClick={onAddNode}>
          <Icon name="Plus" size={16} className="mr-2" />
          Add Node
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onEditNode}
          disabled={!selectedNodeId}
        >
          <Icon name="Edit" size={16} className="mr-2" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteNode}
          disabled={!selectedNodeId}
        >
          <Icon name="Trash2" size={16} className="mr-2" />
          Delete
        </Button>
      </div>
    </header>
  );
};
