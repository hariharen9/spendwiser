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
  order: number; // Add explicit order field
}

interface DashboardContainerProps {
  widgets: WidgetItem[];
  isEditMode: boolean;
  onReorder: (newOrder: WidgetItem[]) => void;
  onRemoveWidget: (widgetId: string) => void;
  onAddWidget?: () => void;
  columnCount?: number;
  widgetLayout: { id: string; column: number; order: number }[]; // Add layout prop
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  widgets,
  isEditMode,
  onReorder,
  onRemoveWidget,
  onAddWidget,
  columnCount = 3,
  widgetLayout
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

  // Organize widgets by column with exact same logic as modal
  const columns = useMemo(() => {
    const cols: WidgetItem[][] = Array.from({ length: columnCount }, () => []);
    
    // Create widgets with layout information
    const widgetsWithLayout = widgets.map(widget => {
      const layout = widgetLayout.find(l => l.id === widget.id);
      return {
        ...widget,
        column: layout?.column ?? widget.column,
        order: layout?.order ?? 0
      };
    });
    
    // Group by column
    widgetsWithLayout.forEach(widget => {
      const targetColumn = Math.min(widget.column, columnCount - 1);
      cols[targetColumn].push(widget);
    });
    
    // Sort each column by order (EXACT same logic as modal)
    cols.forEach(column => {
      column.sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    
    return cols;
  }, [widgets, columnCount, widgetLayout]);

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
      
      // Update widget layout to match new position
      const newLayout = widgetLayout.map(layout => {
        if (layout.id === active.id) {
          return { ...layout, column: targetColumn, order: targetPosition };
        }
        // Adjust orders in target column for widgets at or after target position
        if (layout.column === targetColumn && layout.order >= targetPosition && layout.id !== active.id) {
          return { ...layout, order: layout.order + 1 };
        }
        return layout;
      });
      
      // Create new widgets array with updated layout
      const newWidgets = widgets.map(widget => {
        const layout = newLayout.find(l => l.id === widget.id);
        return {
          ...widget,
          column: layout?.column ?? widget.column,
          order: layout?.order ?? 0
        };
      });
      
      console.log('Updated layout:', newLayout);
      console.log('Result widgets:', newWidgets.map(w => `${w.id}(col:${w.column},ord:${w.order})`));
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
      
      const activeLayout = widgetLayout.find(l => l.id === active.id);
      const targetLayout = widgetLayout.find(l => l.id === overId);
      
      if (!activeLayout || !targetLayout) {
        console.error('Layout not found for widgets');
        return;
      }
      
      // Swap the positions in layout
      const newLayout = widgetLayout.map(layout => {
        if (layout.id === active.id) {
          return { ...layout, column: targetLayout.column, order: targetLayout.order };
        }
        if (layout.id === overId) {
          return { ...layout, column: activeLayout.column, order: activeLayout.order };
        }
        return layout;
      });
      
      // Create new widgets array with swapped layout
      const newWidgets = widgets.map(widget => {
        const layout = newLayout.find(l => l.id === widget.id);
        return {
          ...widget,
          column: layout?.column ?? widget.column,
          order: layout?.order ?? 0
        };
      });
      
      console.log('Swap result:', newWidgets.map(w => `${w.id}(col:${w.column},ord:${w.order})`));
      onReorder(newWidgets);
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
      <div className={`grid gap-3 md:gap-4 ${
        columnCount === 1 ? 'grid-cols-1' :
        columnCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1 md:grid-cols-3'
      }`}>
        {columns.map((columnWidgets, columnIndex) => (
          <React.Fragment key={columnIndex}>
            {/* Mobile column separator - only show on mobile and not for first column */}
            {columnIndex > 0 && (
              <div className="md:hidden border-t border-gray-200 dark:border-gray-700 my-3 -mx-2"></div>
            )}
            
            <div className="space-y-0 sm:space-y-0.5 relative">
            {/* Column Label for debugging */}
            {isEditMode && (
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2 text-center">
                Column {columnIndex + 1} ({columnWidgets.length} widgets)
              </div>
            )}
            {/* Drop zone at top of column - Extra padding for better detection */}
            <div className="relative" style={{ minHeight: '40px', margin: '-5px -5px 5px -5px', padding: '5px' }}>
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
                  <div className="relative" style={{ minHeight: '30px', margin: '5px -5px', padding: '2px' }}>
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
          </React.Fragment>
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