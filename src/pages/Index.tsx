import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type NodeType = 'start' | 'decision' | 'end';

interface DecisionNode {
  id: string;
  type: NodeType;
  title: string;
  description?: string;
  options?: { id: string; label: string; type: 'checkbox' | 'radio' }[];
  connections?: string[];
  position: { x: number; y: number };
}

const sampleTemplates = [
  {
    id: 'cancer-treatment',
    name: 'Pedunculated or Sessile Polyp (Adenoma) with Invasive Cancer',
    category: 'Oncology'
  },
  {
    id: 'colon-cancer',
    name: 'Workup for Colon Cancer Appropriate for Resection',
    category: 'Oncology'
  },
  {
    id: 'metastatic',
    name: 'Workup for Suspected or Proven Metastatic Adenocarcinoma',
    category: 'Oncology'
  }
];

const Index = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('cancer-treatment');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>('node-1');
  
  const [nodes] = useState<DecisionNode[]>([
    {
      id: 'node-1',
      type: 'start',
      title: 'CLINICAL PRESENTATION',
      description: 'Initial patient assessment',
      options: [
        { id: 'opt-1', label: 'Pedunculated or sessile polyp (adenoma) with invasive cancer', type: 'radio' },
        { id: 'opt-2', label: 'Colon cancer appropriate for resection (Non-metastatic)', type: 'radio' },
        { id: 'opt-3', label: 'Suspected or proven metastatic adenocarcinoma', type: 'radio' }
      ],
      position: { x: 50, y: 150 }
    },
    {
      id: 'node-2',
      type: 'decision',
      title: 'FINDINGS',
      options: [
        { id: 'opt-4', label: 'Pathology review', type: 'checkbox' },
        { id: 'opt-5', label: 'Colonoscopy', type: 'checkbox' },
        { id: 'opt-6', label: 'Laboratory studies (at time of colonoscopy or within 2 weeks if appropriate)', type: 'checkbox' },
        { id: 'opt-7', label: 'Inherited testing', type: 'checkbox' }
      ],
      position: { x: 350, y: 100 }
    },
    {
      id: 'node-3',
      type: 'decision',
      title: 'WORKUP',
      options: [
        { id: 'opt-8', label: 'CBC, chemistry profile, CEA', type: 'checkbox' },
        { id: 'opt-9', label: 'Colonoscopy/endoscopy', type: 'checkbox' }
      ],
      position: { x: 650, y: 100 }
    },
    {
      id: 'node-4',
      type: 'end',
      title: 'TREATMENT: PEDUNCULATED POLYP WITH INVASIVE CANCER',
      description: 'Competing with an icon derivae of regional lymph nodes',
      options: [
        { id: 'opt-10', label: 'Observe', type: 'radio' }
      ],
      position: { x: 950, y: 50 }
    },
    {
      id: 'node-5',
      type: 'end',
      title: 'TREATMENT: SESSILE POLYP WITH INVASIVE CANCER',
      options: [
        { id: 'opt-11', label: 'Observe', type: 'radio' }
      ],
      position: { x: 950, y: 250 }
    }
  ]);

  return (
    <div className="flex h-screen bg-background font-inter">
      <aside
        className={cn(
          'transition-all duration-300 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border',
          sidebarCollapsed ? 'w-16' : 'w-80'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!sidebarCollapsed && (
            <h1 className="text-lg font-semibold">Table of Contents</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Icon name={sidebarCollapsed ? 'PanelLeft' : 'PanelLeftClose'} size={20} />
          </Button>
        </div>

        {!sidebarCollapsed && (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-1">
              {sampleTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                    selectedTemplate === template.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground/80'
                  )}
                >
                  {template.name}
                </button>
              ))}
            </div>

            <Separator className="my-4 bg-sidebar-border" />

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                Primary Treatment
              </h3>
              <div className="space-y-1 text-sm text-sidebar-foreground/80">
                <div className="px-3 py-1.5">pMMR or MSS</div>
                <div className="px-3 py-1.5">dMMR/MSH-H or POLE/POLD1 mutation</div>
              </div>

              <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 mt-4">
                Adjuvant Treatment
              </h3>
              <div className="space-y-1 text-sm text-sidebar-foreground/80">
                <div className="px-3 py-1.5">Localized Disease</div>
              </div>

              <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 mt-4">
                Surveillance
              </h3>

              <h3 className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 mt-4">
                Recurrence
              </h3>
            </div>
          </ScrollArea>
        )}
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-3 border-b bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-foreground">
              Pedunculated or Sessile Polyp (Adenoma) with Invasive Cancer
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Icon name="RotateCcw" size={16} className="mr-2" />
              Reset
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="Maximize2" size={16} className="mr-2" />
              Fullscreen
            </Button>
            <Label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" />
              Non-active paths
            </Label>
          </div>
        </header>

        <div className="flex-1 overflow-hidden bg-muted/30">
          <ScrollArea className="h-full">
            <div className="relative min-h-[800px] p-8">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
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
                </defs>
                
                <line
                  x1="240"
                  y1="200"
                  x2="340"
                  y2="180"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <line
                  x1="540"
                  y1="180"
                  x2="640"
                  y2="180"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <line
                  x1="830"
                  y1="150"
                  x2="940"
                  y2="120"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <line
                  x1="830"
                  y1="200"
                  x2="940"
                  y2="300"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              </svg>

              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute animate-fade-in"
                  style={{
                    left: `${node.position.x}px`,
                    top: `${node.position.y}px`,
                    zIndex: 1
                  }}
                >
                  <Card
                    className={cn(
                      'w-[280px] transition-all duration-200 hover:shadow-lg cursor-pointer',
                      selectedNode === node.id
                        ? 'ring-2 ring-primary shadow-lg'
                        : 'hover:ring-1 hover:ring-border'
                    )}
                    onClick={() => setSelectedNode(node.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={cn(
                            'flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
                            node.type === 'start' && 'bg-primary text-primary-foreground',
                            node.type === 'decision' && 'bg-info text-white',
                            node.type === 'end' && 'bg-info text-white'
                          )}
                        >
                          <Icon
                            name={
                              node.type === 'start'
                                ? 'PlayCircle'
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
                          {node.options[0].type === 'radio' ? (
                            <RadioGroup>
                              {node.options.map((option) => (
                                <div key={option.id} className="flex items-start space-x-2">
                                  <RadioGroupItem value={option.id} id={option.id} />
                                  <Label
                                    htmlFor={option.id}
                                    className="text-xs font-normal leading-relaxed cursor-pointer"
                                  >
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
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

                      {node.type !== 'start' && (
                        <Button
                          size="sm"
                          className="w-full mt-4 bg-secondary hover:bg-secondary/90"
                        >
                          Continue →
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </main>

      <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg">
        <Icon name="Zap" size={16} />
        <span className="text-sm font-medium">Interactive Mode</span>
      </div>
    </div>
  );
};

export default Index;
