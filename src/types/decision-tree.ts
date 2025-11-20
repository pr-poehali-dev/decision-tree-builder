export type NodeType = 'single' | 'multi' | 'end' | 'recursive';

export interface NodeOption {
  id: string;
  label: string;
  type: 'checkbox' | 'radio';
}

export interface OptionConnection {
  optionId: string;
  targetNodeId: string;
}

export interface ComboConnection {
  id: string;
  optionIds: string[]; // Комбинация выбранных опций
  targetNodeId: string;
  label?: string; // Описание комбинации
}

export interface DecisionNode {
  id: string;
  type: NodeType;
  title: string;
  description?: string;
  options: NodeOption[];
  connections: string[];
  optionConnections: OptionConnection[];
  comboConnections?: ComboConnection[]; // Комбинации для multi типа
  defaultConnection?: string; // Автоматический переход для recursive типа
  position: { x: number; y: number };
}

export interface Connection {
  from: string;
  to: string;
}