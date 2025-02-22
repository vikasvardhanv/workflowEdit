import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { WorkflowEditor as Editor } from '../components/WorkflowEditor';
import { WorkflowType, WorkflowData } from '../types/workflow';

const WORKFLOW_CATEGORIES = {
  process: {
    label: 'Process',
    subcategories: ['Approval', 'Review', 'Decision']
  },
  system: {
    label: 'System',
    subcategories: ['Integration', 'Automation', 'Monitoring']
  },
  business: {
    label: 'Business',
    subcategories: ['Sales', 'Marketing', 'Support']
  }
};

export function WorkflowEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<WorkflowType>({
    category: '',
    subcategory: ''
  });
  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);

  useEffect(() => {
    if (id !== 'new') {
      const savedWorkflows = JSON.parse(localStorage.getItem('workflows') || '[]');
      const existingWorkflow = savedWorkflows.find((w: WorkflowData) => w.id === id);
      if (existingWorkflow) {
        setWorkflow(existingWorkflow);
        setName(existingWorkflow.name);
        const [category, subcategory] = existingWorkflow.type.split('/');
        setSelectedCategories({ category, subcategory });
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!name) {
      alert('Please enter a workflow name');
      return;
    }
    if (!selectedCategories.category || !selectedCategories.subcategory) {
      alert('Please select both category and subcategory');
      return;
    }
    if (!workflow) {
      alert('Please create a workflow before saving');
      return;
    }

    const workflowData: WorkflowData = {
      ...workflow,
      id: id === 'new' ? Math.random().toString(36).substr(2, 9) : id,
      name,
      type: `${selectedCategories.category}/${selectedCategories.subcategory}`,
      createdAt: workflow.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const savedWorkflows = JSON.parse(localStorage.getItem('workflows') || '[]');
    const updatedWorkflows = id === 'new'
      ? [...savedWorkflows, workflowData]
      : savedWorkflows.map((w: WorkflowData) => w.id === id ? workflowData : w);

    localStorage.setItem('workflows', JSON.stringify(updatedWorkflows));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Workflow Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={selectedCategories.category}
                  onChange={(e) => setSelectedCategories(prev => ({
                    ...prev,
                    category: e.target.value,
                    subcategory: ''
                  }))}
                  className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {Object.entries(WORKFLOW_CATEGORIES).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <select
                  value={selectedCategories.subcategory}
                  onChange={(e) => setSelectedCategories(prev => ({
                    ...prev,
                    subcategory: e.target.value
                  }))}
                  disabled={!selectedCategories.category}
                  className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Subcategory</option>
                  {selectedCategories.category && WORKFLOW_CATEGORIES[selectedCategories.category as keyof typeof WORKFLOW_CATEGORIES].subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Save size={20} />
              Save Workflow
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Editor
          initialWorkflow={workflow}
          onChange={setWorkflow}
          workflowType={`${selectedCategories.category}/${selectedCategories.subcategory}`}
        />
      </div>
    </div>
  );
}