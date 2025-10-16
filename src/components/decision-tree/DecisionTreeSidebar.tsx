import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  category: string;
}

interface DecisionTreeSidebarProps {
  collapsed: boolean;
  selectedTemplate: string;
  selectedNode: string | null;
  templates: Template[];
  onToggleCollapse: () => void;
  onSelectTemplate: (templateId: string) => void;
  onAddNode: () => void;
  onEditNode: () => void;
  onStartConnection: () => void;
  onDeleteNode: () => void;
}

export const DecisionTreeSidebar = ({
  collapsed,
  selectedTemplate,
  selectedNode,
  templates,
  onToggleCollapse,
  onSelectTemplate,
  onAddNode,
  onEditNode,
  onStartConnection,
  onDeleteNode
}: DecisionTreeSidebarProps) => {
  return (
    <aside
      className={cn(
        'border-r bg-sidebar transition-all duration-300',
        collapsed ? 'w-0 overflow-hidden' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b bg-sidebar-accent/50">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Templates</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggleCollapse}
        >
          <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
        </Button>
      </div>

      {!collapsed && (
        <ScrollArea className="h-[calc(100vh-57px)]">
          <div className="p-4 space-y-1">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template.id)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
                  selectedTemplate === template.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/80'
                )}
              >
                {template.name}
              </button>
            ))}
          </div>

          <Separator className="my-4 bg-sidebar-border" />

          <div className="space-y-2 px-4">
            <Button
              onClick={onAddNode}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Add Node
            </Button>
          </div>

          {selectedNode && (
            <>
              <Separator className="my-4 bg-sidebar-border" />
              <div className="space-y-2 px-4 pb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 mb-2">
                  Selected Node Actions
                </h3>
                <Button
                  onClick={onEditNode}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <Icon name="Edit" size={14} className="mr-2" />
                  Edit Node
                </Button>
                <Button
                  onClick={onStartConnection}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <Icon name="Link" size={14} className="mr-2" />
                  Add Connection
                </Button>
                <Button
                  onClick={onDeleteNode}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  <Icon name="Trash2" size={14} className="mr-2" />
                  Delete Node
                </Button>
              </div>
            </>
          )}
        </ScrollArea>
      )}
    </aside>
  );
};
