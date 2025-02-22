import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, ChevronDown } from 'lucide-react';
import { Toolbox } from './components/Toolbox';
import { WorkflowElement as WorkflowElementComponent } from './components/WorkflowElement';
import { WorkflowData, WorkflowElement, Connection, WorkflowJSON, WorkflowKey, Position } from './types/workflow';

const generateId = () => Math.random().toString(36).substr(2, 9);

const WORKFLOW_KEYS: WorkflowKey[] = [
  { label: 'Approval Flow', value: 'approval' },
  { label: 'Review Process', value: 'review' },
  { label: 'Decision Tree', value: 'decision' },
  { label: 'Custom', value: 'custom' }
];

interface Props {
  initialWorkflow?: WorkflowData | null;
  onChange?: (workflow: WorkflowData) => void;
  workflowType?: string;
}

function App({ initialWorkflow, onChange, workflowType }: Props = {}) {
  const [workflow, setWorkflow] = useState<WorkflowData>(initialWorkflow || { 
    elements: [],
    connections: [],
    workflowKey: workflowType || 'approval',
    name: '',
    type: workflowType || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [draggedType, setDraggedType] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<WorkflowElement | null>(null);
  const [isDrawingConnection, setIsDrawingConnection] = useState(false);
  const [connectionStart, setConnectionStart] = useState<{ id: string; x: number; y: number } | null>(null);
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [showKeyDropdown, setShowKeyDropdown] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange?.(workflow);
  }, [workflow, onChange]);

  const generateJSON = (): WorkflowJSON => {
    const rootNodes = workflow.elements.filter(el => 
      el.type === 'circle' && 
      !workflow.connections.some(conn => conn.to === el.id)
    );

    const buildNode = (element: WorkflowElement): any => {
      const children = workflow.connections
        .filter(conn => conn.from === element.id)
        .map(conn => {
          const childElement = workflow.elements.find(el => el.id === conn.to);
          return childElement ? buildNode(childElement) : null;
        })
        .filter(Boolean);

      const connectedTexts = workflow.connections
        .filter(conn => conn.from === element.id)
        .map(conn => {
          const textElement = workflow.elements.find(el => el.id === conn.to && el.type === 'text');
          return textElement ? textElement.content : null;
        })
        .filter(Boolean);

      return {
        id: element.id,
        type: element.type,
        content: element.content,
        labels: connectedTexts,
        children: children
      };
    };

    return {
      key: workflow.workflowKey,
      nodes: rootNodes.map(buildNode)
    };
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const json = JSON.parse(e.target?.result as string);
            setWorkflow({
              ...json,
              workflowKey: json.key || 'approval'
            });
          } catch (error) {
            alert('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    const json = generateJSON();
    const dataStr = JSON.stringify(json, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'workflow.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleToolboxDragStart = (type: string) => {
    setDraggedType(type);
  };

  const handleElementDragStart = (e: React.DragEvent, element: WorkflowElement) => {
    if (!isDrawingConnection) {
      setDraggedElement(element);
    }
  };

  const handleDragEnd = () => {
    setDraggedType(null);
    setDraggedElement(null);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current.getBoundingClientRect();
    const position: Position = {
      x: e.clientX - canvas.left,
      y: e.clientY - canvas.top,
    };

    if (draggedType) {
      const newElement: WorkflowElement = {
        id: generateId(),
        type: draggedType as WorkflowElement['type'],
        position,
        content: draggedType === 'text' ? 'Text' : draggedType === 'circle' ? 'Circle' : '',
      };

      setWorkflow(prev => ({
        ...prev,
        elements: [...prev.elements, newElement],
      }));
    } else if (draggedElement) {
      setWorkflow(prev => ({
        ...prev,
        elements: prev.elements.map(el =>
          el.id === draggedElement.id
            ? { ...el, position }
            : el
        ),
      }));
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - canvas.left,
      y: e.clientY - canvas.top,
    });
  };

  const handleStartConnection = (elementId: string, position: Position) => {
    setIsDrawingConnection(true);
    setConnectionStart({ id: elementId, ...position });
  };

  const handleEndConnection = (targetId: string) => {
    if (connectionStart && connectionStart.id !== targetId) {
      const newConnection: Connection = {
        from: connectionStart.id,
        to: targetId,
        key: workflow.workflowKey
      };
      
      setWorkflow(prev => ({
        ...prev,
        connections: [...prev.connections, newConnection]
      }));
    }
    setIsDrawingConnection(false);
    setConnectionStart(null);
  };

  const handleUpdateElement = (id: string, content: string) => {
    setWorkflow(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === id
          ? { ...el, content }
          : el
      ),
    }));
  };

  const handleDeleteElement = (id: string) => {
    setWorkflow(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id),
      connections: prev.connections.filter(conn => 
        conn.from !== id && conn.to !== id
      )
    }));
  };

  const handleKeyChange = (key: string) => {
    setWorkflow(prev => ({
      ...prev,
      workflowKey: key
    }));
    setShowKeyDropdown(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8">
          <div className="w-64">
            <Toolbox onDragStart={handleToolboxDragStart} />
            <div className="mt-4 bg-white p-4 rounded-lg shadow-lg">
              <h3 className="text-sm font-semibold mb-2">Instructions</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Drag elements from toolbox to canvas</li>
                <li>• Click and drag from circle edge to create connections</li>
                <li>• Double click elements to edit text</li>
                <li>• Drag elements to reposition</li>
              </ul>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-gray-800">Workflow Editor</h1>
                  <div className="relative">
                    <button
                      onClick={() => setShowKeyDropdown(!showKeyDropdown)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      {WORKFLOW_KEYS.find(k => k.value === workflow.workflowKey)?.label || workflow.workflowKey}
                      <ChevronDown size={16} />
                    </button>
                    {showKeyDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10">
                        {WORKFLOW_KEYS.map(key => (
                          <button
                            key={key.value}
                            onClick={() => handleKeyChange(key.value)}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            {key.label}
                          </button>
                        ))}
                        <div className="p-2 border-t">
                          <input
                            type="text"
                            placeholder="Custom key..."
                            value={customKey}
                            onChange={(e) => setCustomKey(e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customKey) {
                                handleKeyChange(customKey);
                                setCustomKey('');
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleImport}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Upload size={20} />
                    Import
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    <Download size={20} />
                    Export
                  </button>
                </div>
              </div>
              
              <div
                ref={canvasRef}
                className="relative h-[600px] border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleCanvasDrop}
                onMouseMove={handleCanvasMouseMove}
              >
                {workflow.connections.map((connection, index) => {
                  const fromElement = workflow.elements.find(el => el.id === connection.from);
                  const toElement = workflow.elements.find(el => el.id === connection.to);
                  
                  if (!fromElement || !toElement) return null;
                  
                  const startX = fromElement.position.x + 50;
                  const startY = fromElement.position.y + 50;
                  const endX = toElement.position.x + 50;
                  const endY = toElement.position.y + 50;
                  
                  const angle = Math.atan2(endY - startY, endX - startX);
                  const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                  
                  return (
                    <div key={`${connection.from}-${connection.to}`} className="absolute">
                      <div
                        className="absolute bg-green-500"
                        style={{
                          width: `${length}px`,
                          height: '2px',
                          left: `${startX}px`,
                          top: `${startY}px`,
                          transform: `rotate(${angle}rad)`,
                          transformOrigin: '0 0',
                          pointerEvents: 'none',
                          zIndex: 0,
                        }}
                      >
                        <div
                          className="absolute right-0 w-3 h-3 bg-green-500"
                          style={{
                            clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
                            transform: 'translateX(100%)',
                          }}
                        />
                      </div>
                      <div
                        className="absolute bg-white px-2 py-1 text-xs rounded shadow-sm"
                        style={{
                          left: `${(startX + endX) / 2}px`,
                          top: `${(startY + endY) / 2}px`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: 1,
                        }}
                      >
                        {connection.key || workflow.workflowKey}
                      </div>
                    </div>
                  );
                })}

                {isDrawingConnection && connectionStart && (
                  <div
                    className="absolute bg-blue-400"
                    style={{
                      width: `${Math.sqrt(
                        Math.pow(mousePosition.x - connectionStart.x, 2) +
                        Math.pow(mousePosition.y - connectionStart.y, 2)
                      )}px`,
                      height: '2px',
                      left: `${connectionStart.x}px`,
                      top: `${connectionStart.y}px`,
                      transform: `rotate(${Math.atan2(
                        mousePosition.y - connectionStart.y,
                        mousePosition.x - connectionStart.x
                      )}rad)`,
                      transformOrigin: '0 0',
                      pointerEvents: 'none',
                      zIndex: 0,
                    }}
                  >
                    <div
                      className="absolute right-0 w-3 h-3 bg-blue-400"
                      style={{
                        clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
                        transform: 'translateX(100%)',
                      }}
                    />
                  </div>
                )}
                
                {workflow.elements.map(element => (
                  <WorkflowElementComponent
                    key={element.id}
                    element={element}
                    elements={workflow.elements}
                    isDrawingConnection={isDrawingConnection}
                    onStartConnection={handleStartConnection}
                    onEndConnection={handleEndConnection}
                    onUpdate={handleUpdateElement}
                    onDelete={handleDeleteElement}
                    onDragStart={handleElementDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;