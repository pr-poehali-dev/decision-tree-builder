import { ChevronRight, X } from 'lucide-react';
import { DecisionNode } from '@/types/decision-tree';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface TableOfContentsProps {
  nodes: DecisionNode[];
  onNodeClick: (nodeId: string) => void;
  onClose?: () => void;
}

export function TableOfContents({ nodes, onNodeClick, onClose }: TableOfContentsProps) {
  const groupedNodes = nodes.reduce((acc, node) => {
    const category = node.title.split(':')[0] || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(node);
    return acc;
  }, {} as Record<string, DecisionNode[]>);

  return (
    <div className="w-80 bg-white border-r border-slate-200 h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">Table of Contents</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(groupedNodes).map(([category, categoryNodes]) => (
            <div key={category} className="mb-4">
              <div className="flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                <ChevronRight className="h-3 w-3" />
                <span>{category}</span>
              </div>
              <div className="space-y-1">
                {categoryNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => onNodeClick(node.id)}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-2 group"
                  >
                    <div className={`
                      w-6 h-6 rounded flex items-center justify-center shrink-0
                      ${node.type === 'single' ? 'bg-blue-100 text-blue-600' : ''}
                      ${node.type === 'multi' ? 'bg-purple-100 text-purple-600' : ''}
                      ${node.type === 'end' ? 'bg-green-100 text-green-600' : ''}
                      ${node.type === 'recursive' ? 'bg-orange-100 text-orange-600' : ''}
                    `}>
                      <Icon
                        name={
                          node.type === 'single' ? 'List' :
                          node.type === 'end' ? 'Flag' :
                          node.type === 'recursive' ? 'RefreshCw' :
                          'CheckSquare'
                        }
                        size={14}
                      />
                    </div>
                    <span className="flex-1 truncate group-hover:text-blue-600">
                      {node.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
