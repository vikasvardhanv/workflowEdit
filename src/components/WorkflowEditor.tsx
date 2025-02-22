import React from 'react';
import { WorkflowData } from '../types/workflow';
import App from '../App';

interface Props {
  initialWorkflow: WorkflowData | null;
  onChange: (workflow: WorkflowData) => void;
  workflowType: string;
}

export function WorkflowEditor({ initialWorkflow, onChange, workflowType }: Props) {
  return (
    <App
      initialWorkflow={initialWorkflow}
      onChange={onChange}
      workflowType={workflowType}
    />
  );
}