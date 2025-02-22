import React from 'react';
import { Circle, ArrowRight, Type } from 'lucide-react';

interface Props {
  onDragStart: (type: string) => void;
}

export const Toolbox: React.FC<Props> = ({ onDragStart }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Toolbox</h2>
      <div className="flex flex-col gap-4">
        <div
          className="flex items-center gap-2 p-3 bg-gray-50 rounded cursor-move hover:bg-gray-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart('circle')}
        >
          <Circle className="text-blue-500" />
          <span>Circle</span>
        </div>
        <div
          className="flex items-center gap-2 p-3 bg-gray-50 rounded cursor-move hover:bg-gray-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart('arrow')}
        >
          <ArrowRight className="text-green-500" />
          <span>Arrow</span>
        </div>
        <div
          className="flex items-center gap-2 p-3 bg-gray-50 rounded cursor-move hover:bg-gray-100 transition-colors"
          draggable
          onDragStart={(e) => onDragStart('text')}
        >
          <Type className="text-purple-500" />
          <span>Text</span>
        </div>
      </div>
    </div>
  );
}