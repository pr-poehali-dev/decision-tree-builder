import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { DecisionNode, Connection } from '@/types/decision-tree';

interface DecisionTreeCanvasProps {
  nodes: DecisionNode[];
  connections: Connection[];
  selectedNode: string | null;
  draggedNode: string | null;
  connectingFrom: string | null;
  canvasRef: React.RefObject<HTMLDivElement>;
  onNodeDragStart: (e: React.MouseEvent, nodeId: string) => void;
  onNodeClick: (nodeId: string) => void;
  onCompleteConnection: (toNodeId: string) => void;
  getTargetNodeForOption: (nodeId: string, optionId: string) => string | null;
}

export const DecisionTreeCanvas = ({
  nodes,
  connections,
  selectedNode,
  draggedNode,
  connectingFrom,
  canvasRef,
  onNodeDragStart,
  onNodeClick,
  onCompleteConnection,
  getTargetNodeForOption
}: DecisionTreeCanvasProps) => {
  return (
    <div className="flex-1 bg-muted/30 overflow-hidden relative">
      <div
        ref={canvasRef}
        className="w-full h-full overflow-auto relative"
        style={{ minWidth: '2000px', minHeight: '2000px' }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
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

          {connections.map((conn, idx) => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);

            if (!fromNode || !toNode) return null;

            const fromX = fromNode.position.x + 280;
            const fromY = fromNode.position.y + 75;
            const toX = toNode.position.x;
            const toY = toNode.position.y + 75;

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
            onMouseDown={(e) => onNodeDragStart(e, node.id)}
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
                  onCompleteConnection(node.id);
                } else {
                  onNodeClick(node.id);
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
                            <div key={option.id} className="flex items-center gap-2 group relative">
                              <Label
                                htmlFor={option.id}
                                className="text-xs font-normal leading-relaxed cursor-pointer flex-1"
                              >
                                {option.label}
                              </Label>
                              {targetId && (
                                <div className="flex-1 border-b border-dashed border-muted-foreground/30 mx-2 min-w-[20px]" />
                              )}
                              {targetId && (
                                <Icon name="ArrowRight" size={12} className="text-primary shrink-0" />
                              )}
                              <RadioGroupItem value={option.id} id={option.id} className="shrink-0" />
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
    </div>
  );
};
