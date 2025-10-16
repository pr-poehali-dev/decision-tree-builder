import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { DecisionNode } from '@/types/decision-tree';

export const CustomNode = memo(({ data, selected }: NodeProps<DecisionNode>) => {
  const node = data;
  
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

          {node.options && node.options.length > 0 && (
            <div className="space-y-3 mb-4">
              {(node.type === 'single' || node.type === 'recursive') ? (
                <RadioGroup>
                  {node.options.map((option) => {
                    const hasConnection = node.optionConnections?.some(
                      oc => oc.optionId === option.id
                    );
                    return (
                      <div key={option.id} className="flex items-start gap-2 group relative py-1">
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
                            background: '#3b82f6',
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
                node.options.map((option) => {
                  const hasConnection = node.optionConnections?.some(
                    oc => oc.optionId === option.id
                  );
                  return (
                    <div key={option.id} className="flex items-start gap-2 relative py-1">
                      <Checkbox id={option.id} className="mt-0.5" />
                      <Label
                        htmlFor={option.id}
                        className="text-sm font-normal leading-relaxed cursor-pointer flex-1 text-slate-700"
                      >
                        {option.label}
                      </Label>
                      {hasConnection && (
                        <Handle
                          type="source"
                          position={Position.Right}
                          id={option.id}
                          style={{
                            background: '#3b82f6',
                            width: 10,
                            height: 10,
                            right: -22,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            opacity: hasConnection ? 1 : 0,
                            pointerEvents: hasConnection ? 'auto' : 'none'
                          }}
                        />
                      )}
                    </div>
                  );
                })
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