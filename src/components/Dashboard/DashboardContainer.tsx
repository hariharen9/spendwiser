import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  CollisionDetection,
  rectIntersection
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import DraggableWidget from './DraggableWidget';
import DropZone from './DropZone';

interface WidgetItem {
  id: string;
  component: React.ReactNode;
  column: number;
}

interface DashboardContainerProps {
  widgets: WidgetItem[];
  isEditMode: boolean;
  onReorder: (newOrder: WidgetItem[]) => void;
  onRemoveWidget: (widgetId: string) => void;
  onAddWidget?: () => void;
  columnCount?: number;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  widgets,
  isEditMode,
  onReorder,
  onRemoveWidget,
  onAddWidget,
  columnCount = 3
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Simplified and robust collision detection
  const customCollisionDetection: CollisionDetection = (args) => {
    const { droppableRects, droppableContainers, active, pointerCoordinates } = args;
    
    if (!pointerCoordinates || !active) {
      return closestCenter(args);
    }

    // Find all containers that contain the pointer
    const intersections = [];
    
    for (const container of droppableContainers) {
      const rect = droppableRects.get(container.id);
      if (!rect) continue;
      
      // Check if pointer is within container bounds with some tolerance
      const tolerance = 5; // pixels
      const isWithin = 
        pointerCoordinates.x >= rect.left - tolerance &&
        pointerCoordinates.x <= rect.right + tolerance &&
        pointerCoordinates.y >= rect.top - tolerance &&
        pointerCoordinates.y <= rect.bottom + tolerance;
        
      if (isWithin) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(pointerCoordinates.x - centerX, 2) +
          Math.pow(pointerCoordinates.y - centerY, 2)
        );
        
        intersections.push({ id: container.id, distance });
      }
    }
    
    // Sort by distance and return the closest one
    if (intersections.length > 0) {
      intersections.sort((a, b) => a.distance - b.distance);
      return [{ id: intersections[0].id }];
    }
    
    // No intersections found, fallback to closest center
    return closestCenter(args);
  };

  // Organize widgets into columns
  const columns = useMemo(() => {
    const cols: WidgetItem[][] = Array.from({ length: columnCount }, () => []);
    
    widgets.forEach(widget => {
      const targetColumn = Math.min(widget.column, columnCount - 1);
      cols[targetColumn].push(widget);
    });
    
    return cols;
  }, [widgets, columnCount]);

  // Get all widget IDs for sortable context
  const widgetIds = useMemo(() => widgets.map(w => w.id), [widgets]);

  // Generate drop zone IDs
  const getDropZoneId = (column: number, position: number) => 
    `dropzone-${column}-${position}`;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    console.log('Drag ended:', { activeId: active.id, overId: over?.id });
    
    if (!over || !active.id) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const activeWidget = widgets.find(w => w.id === active.id);
    if (!activeWidget) {
      console.error('Active widget not found:', active.id);
      return;
    }

    const overId = over.id.toString();
    
    // Handle dropping on drop zone
    if (overId.startsWith('dropzone-')) {
      const parts = overId.split('-');
      if (parts.length !== 3) {
        console.error('Invalid dropzone ID format:', overId);
        return;
      }
      
      const targetColumn = parseInt(parts[1]);
      const targetPosition = parseInt(parts[2]);
      
      if (isNaN(targetColumn) || isNaN(targetPosition)) {
        console.error('Invalid column or position:', { targetColumn, targetPosition });
        return;
      }
      
      console.log(`Drop zone: Moving ${active.id} to column ${targetColumn}, position ${targetPosition}`);
      
      // Create new widget with updated column
      const updatedWidget = { ...activeWidget, column: targetColumn };
      
      // Remove active widget from current position
      const widgetsWithoutActive = widgets.filter(w => w.id !== active.id);
      
      // Get widgets in target column, sorted by their current array position
      const targetColumnWidgets = widgetsWithoutActive
        .filter(w => w.column === targetColumn)
        .map((widget, idx) => ({
          widget,
          arrayIndex: widgets.findIndex(w => w.id === widget.id)
        }))
        .sort((a, b) => a.arrayIndex - b.arrayIndex);
      
      console.log('Target column widgets:', targetColumnWidgets.map(item => ({ id: item.widget.id, arrayIndex: item.arrayIndex })));
      
      // Find insertion point
      let insertionIndex;
      
      if (targetPosition === 0) {
        // Insert at beginning of column
        if (targetColumnWidgets.length === 0) {
          // Empty column - add to end of array
          insertionIndex = widgetsWithoutActive.length;
        } else {
          // Insert before first widget in column
          insertionIndex = targetColumnWidgets[0].arrayIndex;
        }
      } else if (targetPosition >= targetColumnWidgets.length) {
        // Insert at end of column
        if (targetColumnWidgets.length === 0) {
          insertionIndex = widgetsWithoutActive.length;
        } else {
          insertionIndex = targetColumnWidgets[targetColumnWidgets.length - 1].arrayIndex + 1;
        }
      } else {
        // Insert at specific position
        insertionIndex = targetColumnWidgets[targetPosition].arrayIndex;
      }
      
      console.log(`Inserting at index: ${insertionIndex}`);
      
      // Create final array
      const newWidgets = [...widgetsWithoutActive];
      newWidgets.splice(insertionIndex, 0, updatedWidget);
      
      console.log('Result:', newWidgets.map(w => `${w.id}(col:${w.column})`));
      onReorder(newWidgets);
    }
    // Handle dropping on another widget (swap positions)
    else {
      const targetWidget = widgets.find(w => w.id === overId);
      if (!targetWidget) {
        console.error('Target widget not found:', overId);
        return;
      }
      
      console.log(`Widget swap: ${active.id} <-> ${overId}`);
      
      const activeIndex = widgets.findIndex(w => w.id === active.id);
      const targetIndex = widgets.findIndex(w => w.id === overId);
      
      if (activeIndex === -1 || targetIndex === -1) {
        console.error('Widget indices not found');
        return;
      }
      
      // Create new array with swapped positions
      const newWidgets = [...widgets];
      
      // Update the active widget's column to match target
      newWidgets[activeIndex] = { ...activeWidget, column: targetWidget.column };
      
      // Move to target position
      const reorderedWidgets = arrayMove(newWidgets, activeIndex, targetIndex);
      
      console.log('Swap result:', reorderedWidgets.map(w => `${w.id}(col:${w.column})`));
      onReorder(reorderedWidgets);
    }

    setActiveId(null);
    setOverId(null);
  };

  const activeWidget = widgets.find(w => w.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={`grid gap-6 ${
        columnCount === 1 ? 'grid-cols-1' :
        columnCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1 md:grid-cols-3'
      }`}>
        {columns.map((columnWidgets, columnIndex) => (
          <div key={columnIndex} className="space-y-4 relative">
            {/* Column Label for debugging */}
            {isEditMode && (
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2 text-center">
                Column {columnIndex + 1} ({columnWidgets.length} widgets)
              </div>
            )}
            {/* Drop zone at top of column - Extra padding for better detection */}
            <div className="relative" style={{ minHeight: '60px', margin: '-10px -5px 10px -5px', padding: '10px 5px' }}>
              <DropZone
                id={getDropZoneId(columnIndex, 0)}
                isActive={isEditMode}
                isEmpty={columnWidgets.length === 0}
                onAddWidget={onAddWidget}
                columnIndex={columnIndex}
                position={0}
              />
            </div>
            
            <SortableContext
              items={columnWidgets.map(w => w.id)}
              strategy={verticalListSortingStrategy}
            >
              {columnWidgets.map((widget, index) => (
                <React.Fragment key={widget.id}>
                  <DraggableWidget
                    id={widget.id}
                    isEditMode={isEditMode}
                    onRemove={onRemoveWidget}
                    index={index}
                  >
                    {widget.component}
                  </DraggableWidget>
                  
                  {/* Drop zone between widgets - Enhanced spacing */}
                  <div className="relative" style={{ minHeight: '50px', margin: '10px -5px', padding: '5px' }}>
                    <DropZone
                      id={getDropZoneId(columnIndex, index + 1)}
                      isActive={isEditMode && activeId !== null}
                      columnIndex={columnIndex}
                      position={index + 1}
                    />
                  </div>
                </React.Fragment>
              ))}
            </SortableContext>
          </div>
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeWidget ? (
          <motion.div
            className="transform-gpu opacity-90 shadow-2xl"
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-400 shadow-2xl">
              {activeWidget.component}
            </div>
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default DashboardContainer;