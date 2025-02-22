export interface Position {
  x: number;
  y: number;
}

export interface Connection {
  from: string;
  to: string;
  label?: string;
  key?: string;
}

export interface WorkflowElement {
  id: string;
  type: 'circle' | 'arrow' | 'text';
  position: Position;
  content: string;
  connections?: {
    from?: string;
    to?: string;
    label?: string;
    key?: string;
  };
}

export interface WorkflowData {
  id?: string;
  name: string;
  type: string;
  elements: WorkflowElement[];
  connections: Connection[];
  workflowKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowJSON {
  key: string;
  nodes: {
    id: string;
    type: string;
    content: string;
    children: WorkflowJSON[];
  }[];
}

export type WorkflowKey = {
  label: string;
  value: string;
}

export interface WorkflowCategory {
  id: string;
  name: string;
}

export interface WorkflowType {
  category: string;
  subcategory: string;
}