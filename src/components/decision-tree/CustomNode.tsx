import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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
          'w-[280px] transition-all duration-200 hover:shadow-lg border-2 border-slate-400',
          selected ? 'ring-2 ring-primary shadow-lg' : ''
        )}
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
                    const hasConnection = node.optionConnections?.some(
                      oc => oc.optionId === option.id
                    );
                    return (
                      <div key={option.id} className="flex items-center gap-2 group relative">
                        <Label
                          htmlFor={option.id}
                          className="text-xs font-normal leading-relaxed cursor-pointer flex-1"
                        >
                          {option.label}
                        </Label>
                        {hasConnection && (
                          <div className="flex-1 border-b border-dashed border-muted-foreground/30 mx-2 min-w-[20px]" />
                        )}
                        {hasConnection && (
                          <Icon name="ArrowRight" size={12} className="text-primary shrink-0" />
                        )}
                        <RadioGroupItem value={option.id} id={option.id} className="shrink-0" />
                        <Handle
                          type="source"
                          position={Position.Right}
                          id={option.id}
                          style={{
                            background: '#3b82f6',
                            width: 8,
                            height: 8,
                            right: -20,
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
                    <div key={option.id} className="flex items-center gap-2 relative">
                      <Checkbox id={option.id} />
                      <Label
                        htmlFor={option.id}
                        className="text-xs font-normal leading-relaxed cursor-pointer flex-1"
                      >
                        {option.label}
                      </Label>
                      {hasConnection && (
                        <>
                          <div className="flex-1 border-b border-dashed border-muted-foreground/30 mx-2 min-w-[20px]" />
                          <Icon name="ArrowRight" size={12} className="text-primary shrink-0" />
                          <Handle
                            type="source"
                            position={Position.Right}
                            id={option.id}
                            style={{
                              background: '#3b82f6',
                              width: 8,
                              height: 8,
                              right: -20,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              opacity: hasConnection ? 1 : 0,
                              pointerEvents: hasConnection ? 'auto' : 'none'
                            }}
                          />
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
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