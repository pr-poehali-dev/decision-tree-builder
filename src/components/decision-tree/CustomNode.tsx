import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { DecisionNode } from '@/types/decision-tree';

interface CustomNodeProps extends NodeProps<DecisionNode> {
  data: DecisionNode & {
    onSelectionChange?: (nodeId: string, selectedOptions: string[]) => void;
  };
}

export const CustomNode = memo(({ data, selected }: CustomNodeProps) => {
  const node = data;
  const [selectedRadio, setSelectedRadio] = useState<string | null>(null);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);

  const handleRadioChange = useCallback((optionId: string) => {
    setSelectedRadio(optionId);
    if (node.onSelectionChange) {
      node.onSelectionChange(node.id, [optionId]);
    }
  }, [node]);

  const handleCheckboxChange = useCallback((optionId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedCheckboxes, optionId]
      : selectedCheckboxes.filter(id => id !== optionId);
    setSelectedCheckboxes(newSelection);
    if (node.onSelectionChange) {
      node.onSelectionChange(node.id, newSelection);
    }
  }, [selectedCheckboxes, node]);

  // Determine active handles based on selection
  const getActiveHandles = (): Set<string> => {
    const active = new Set<string>();

    if (node.type === 'single') {
      if (selectedRadio) {
        active.add(selectedRadio);
      }
    } else if (node.type === 'recursive') {
      // For recursive, default connection is always active
      if (node.defaultConnection) {
        active.add('default');
      }
      // Plus any selected option
      if (selectedRadio) {
        active.add(selectedRadio);
      }
    } else if (node.type === 'multi') {
      // Check combo connections
      node.comboConnections?.forEach((combo) => {
        const allSelected = combo.optionIds.every(id => selectedCheckboxes.includes(id));
        const exactMatch = combo.optionIds.length === selectedCheckboxes.length;
        if (allSelected && exactMatch) {
          active.add(combo.id);
        }
      });
    }

    return active;
  };

  const activeHandles = getActiveHandles();
  const hasSelection = selectedRadio || selectedCheckboxes.length > 0;

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555', width: 10, height: 10 }}
      />
      
      <Card
        className={cn(
          'w-[320px] transition-all duration-200 hover:shadow-md border border-slate-200 rounded-lg overflow-hidden bg-white',
          selected ? 'ring-2 ring-blue-500 shadow-lg' : ''
        )}
      >
        <div className="bg-blue-600 px-4 py-2 flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 bg-white/20 rounded shrink-0">
            <Icon
              name={
                node.type === 'single'
                  ? 'List'
                  : node.type === 'end'
                  ? 'Flag'
                  : node.type === 'recursive'
                  ? 'RefreshCw'
                  : 'CheckSquare'
              }
              size={16}
              className="text-white"
            />
          </div>
          <h3 className="text-sm font-semibold text-white tracking-tight uppercase">
            {node.title}
          </h3>
        </div>
        
        <div className="p-4">
          {node.description && (
            <p className="text-sm text-slate-700 mb-4 leading-relaxed">{node.description}</p>
          )}

          {node.type === 'recursive' && node.defaultConnection && (
            <Handle
              type="source"
              position={Position.Right}
              id="default"
              style={{
                background: '#10b981',
                width: 10,
                height: 10,
                right: -22,
                top: '50%',
              }}
            />
          )}

          {node.options && node.options.length > 0 && (
            <div className="space-y-3 mb-4">
              {(node.type === 'single' || node.type === 'recursive') ? (
                <RadioGroup value={selectedRadio || ''} onValueChange={handleRadioChange}>
                  {node.options.map((option) => {
                    const hasConnection = node.optionConnections?.some(
                      oc => oc.optionId === option.id
                    );
                    const isActive = activeHandles.has(option.id);
                    const isInactive = hasSelection && !isActive;

                    return (
                      <div key={option.id} className={cn(
                        "flex items-start gap-2 group relative py-1 transition-opacity",
                        isInactive && "opacity-40"
                      )}>
                        <RadioGroupItem value={option.id} id={option.id} className="shrink-0 mt-0.5" />
                        <Label
                          htmlFor={option.id}
                          className="text-sm font-normal leading-relaxed cursor-pointer flex-1 text-slate-700"
                        >
                          {option.label}
                        </Label>
                        <Handle
                          type="source"
                          position={Position.Right}
                          id={option.id}
                          style={{
                            background: isActive ? '#3b82f6' : isInactive ? '#94a3b8' : '#3b82f6',
                            width: 10,
                            height: 10,
                            right: -22,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            opacity: hasConnection ? 1 : 0,
                            pointerEvents: hasConnection ? 'auto' : 'none'
                          }}
                        />
                      </div>
                    );
                  })}
                </RadioGroup>
              ) : (
                <>
                  {node.options.map((option) => {
                    const isChecked = selectedCheckboxes.includes(option.id);
                    return (
                      <div key={option.id} className="flex items-start gap-2 relative py-1">
                        <Checkbox 
                          id={option.id} 
                          className="mt-0.5"
                          checked={isChecked}
                          onCheckedChange={(checked) => handleCheckboxChange(option.id, checked as boolean)}
                        />
                        <Label
                          htmlFor={option.id}
                          className="text-sm font-normal leading-relaxed cursor-pointer flex-1 text-slate-700"
                        >
                          {option.label}
                        </Label>
                      </div>
                    );
                  })}
                  {node.comboConnections?.map((combo, index) => {
                    const optionLabels = combo.optionIds
                      .map(id => node.options.find(o => o.id === id)?.label)
                      .filter(Boolean)
                      .join(' + ');
                    const isActive = activeHandles.has(combo.id);
                    const isInactive = hasSelection && !isActive;

                    return (
                      <div key={combo.id} className={cn(
                        "relative transition-opacity",
                        isInactive && "opacity-40"
                      )}>
                        <div className="text-xs text-blue-600 font-medium mt-2 pt-2 border-t border-slate-200">
                          {optionLabels}
                        </div>
                        <Handle
                          type="source"
                          position={Position.Right}
                          id={combo.id}
                          style={{
                            background: isActive ? '#8b5cf6' : isInactive ? '#94a3b8' : '#8b5cf6',
                            width: 10,
                            height: 10,
                            right: -22,
                            top: `${50 + index * 20}%`,
                          }}
                        />
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
          
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white text-xs px-4 rounded-full">
              Continue
            </Button>
          </div>
        </div>
      </Card>

      {node.type === 'end' && (
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#555', width: 10, height: 10 }}
        />
      )}
    </>
  );
});

CustomNode.displayName = 'CustomNode';