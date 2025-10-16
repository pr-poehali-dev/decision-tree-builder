export type NodeType = 'single' | 'multi' | 'end';

export interface NodeOption {
  id: string;
  label: string;
  type: 'checkbox' | 'radio';
}

export interface OptionConnection {
  optionId: string;
  targetNodeId: string;
}

export interface DecisionNode {
  id: string;
  type: NodeType;
  title: string;
  description?: string;
  options: NodeOption[];
  connections: string[];
  optionConnections: OptionConnection[];
  position: { x: number; y: number };
}

export interface Connection {
  from: string;
  to: string;
}
