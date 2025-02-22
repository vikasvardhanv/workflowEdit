import React, { useState } from 'react';
import { ArrowRight, Edit2, Plus, Trash2 } from 'lucide-react';
import { WorkflowNode as WorkflowNodeType } from '../types/workflow';

interface Props {
  node: WorkflowNodeType;
  level?: number;
  onAddChild: (parentId: string) => void;
  onEditNode: (nodeId: string, newName: string) => void;
  onDeleteNode: (nodeId: string) => void;
}

export const WorkflowNode: React.FC<Props> = ({ 
  node, 
  level = 0, 
  onAddChild, 
  onEditNode,
  onDeleteNode 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [showActions, setShowActions] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditName(node.name);
  };

  const handleSave = () => {
    onEditNode(node.id, editName);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative group"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="w-32 h-32 rounded-full bg-blue-500 flex items-center justify-center text-white p-4 text-center transition-all hover:bg-blue-600">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-24 px-2 py-1 text-sm text-black rounded"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          ) : (
            node.name
          )}
        </div>
        
        {showActions && !isEditing && (
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white p-2 rounded-lg shadow-lg">
            <button
              onClick={() => onAddChild(node.id)}
              className="p-1 hover:bg-gray-100 rounded"
              title="Add child"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={handleEdit}
              className="p-1 hover:bg-gray-100 rounded"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
            {level > 0 && (
              <button
                onClick={() => onDeleteNode(node.id)}
                className="p-1 hover:bg-gray-100 rounded text-red-500"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>
      
      {node.children.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-8">
            {node.children.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="h-8 flex items-center">
                  <ArrowRight className="text-gray-400" size={24} />
                </div>
                <WorkflowNode 
                  node={child} 
                  level={level + 1}
                  onAddChild={onAddChild}
                  onEditNode={onEditNode}
                  onDeleteNode={onDeleteNode}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}