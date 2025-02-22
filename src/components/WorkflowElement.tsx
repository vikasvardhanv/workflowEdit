import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { WorkflowElement as WorkflowElementType, Position } from '../types/workflow';

interface Props {
  element: WorkflowElementType;
  elements: WorkflowElementType[];
  isDrawingConnection: boolean;
  onStartConnection: (elementId: string, position: Position) => void;
  onEndConnection: (targetId: string) => void;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, element: WorkflowElementType) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export const WorkflowElement: React.FC<Props> = ({
  element,
  isDrawingConnection,
  onStartConnection,
  onEndConnection,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(element.content);
  const [showActions, setShowActions] = useState(false);

  const handleSave = () => {
    onUpdate(element.id, editContent);
    setIsEditing(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (element.type === 'circle') {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate if click is near the circumference
      const clickX = e.clientX;
      const clickY = e.clientY;
      const distance = Math.sqrt(
        Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2)
      );
      
      const radius = rect.width / 2;
      const threshold = 10; // pixels from circumference
      
      if (Math.abs(distance - radius) < threshold) {
        onStartConnection(element.id, {
          x: clickX - rect.left + element.position.x,
          y: clickY - rect.top + element.position.y,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawingConnection && element.type === 'circle') {
      onEndConnection(element.id);
    }
  };

  const getElementStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      zIndex: 1,
    };

    switch (element.type) {
      case 'circle':
        return {
          ...baseStyle,
          width: '100px',
          height: '100px',
        };
      case 'text':
        return {
          ...baseStyle,
          minWidth: '100px',
          padding: '8px',
        };
      default:
        return baseStyle;
    }
  };

  const renderElement = () => {
    if (isEditing) {
      return (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-24 px-2 py-1 text-sm text-black rounded"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
          />
          <button
            onClick={handleSave}
            className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"
          >
            Save
          </button>
        </div>
      );
    }

    switch (element.type) {
      case 'circle':
        return (
          <div 
            className={`w-full h-full rounded-full flex items-center justify-center text-white p-4 transition-colors cursor-pointer ${
              isDrawingConnection ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            {element.content}
          </div>
        );
      case 'text':
        return (
          <div className="bg-white p-2 rounded shadow-sm border border-gray-200">
            <div className="text-gray-700">{element.content}</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id={element.id}
      style={getElementStyle()}
      className="relative group"
      draggable={!isDrawingConnection}
      onDragStart={(e) => onDragStart(e, element)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onDoubleClick={() => setIsEditing(true)}
    >
      {renderElement()}
      
      {showActions && !isEditing && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white p-2 rounded-lg shadow-lg">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(element.id)}
            className="p-1 hover:bg-gray-100 rounded text-red-500"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};