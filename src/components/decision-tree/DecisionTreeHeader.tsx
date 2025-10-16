import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface DecisionTreeHeaderProps {
  isAutoLayouting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onAutoLayout: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onClearAll: () => void;
  onTriggerFileInput: () => void;
}

export const DecisionTreeHeader = ({
  isAutoLayouting,
  fileInputRef,
  onAutoLayout,
  onImport,
  onExport,
  onClearAll,
  onTriggerFileInput
}: DecisionTreeHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-foreground">
          Decision Tree Editor
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onAutoLayout}
          disabled={isAutoLayouting}
        >
          <Icon name="LayoutGrid" size={16} className="mr-2" />
          {isAutoLayouting ? 'Layouting...' : 'Auto Layout'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onTriggerFileInput}>
          <Icon name="Upload" size={16} className="mr-2" />
          Import JSON
        </Button>
        <Button variant="ghost" size="sm" onClick={onExport}>
          <Icon name="Download" size={16} className="mr-2" />
          Export JSON
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearAll}
        >
          <Icon name="RotateCcw" size={16} className="mr-2" />
          Clear All
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={onImport}
          className="hidden"
        />
      </div>
    </header>
  );
};
