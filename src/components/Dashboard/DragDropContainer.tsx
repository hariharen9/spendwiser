import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface DropZone {
  id: string;
  accepts: string[];
  position: { column: number; index: number };
}

interface DragDropContainerProps {
  children: React.ReactNode[];
  columnCount: number;
  isEditMode: boolean;
  onReorder: (newOrder: { id: string; column: number; index: number }[]) => void;
  getItemId: (child: React.ReactNode, index: number) => string;
}

const DragDropContainer: React.FC<DragDropContainerProps> = ({
  children,
  columnCount,
  isEditMode,
  onReorder,
  getItemId
}) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropZones, setDropZones] = useState<DropZone[]>([]);

  // Create drop zones for flexible positioning
  const generateDropZones = useCallback(() => {
    const zones: DropZone[] = [];
    
    // Create drop zones for each column
    for (let col = 0; col < columnCount; col++) {
      const columnItems = children.filter((_, index) => {
        return index % columnCount === col;
      });
      
      // Add zones before each item and after the last item
      for (let i = 0; i <= columnItems.length; i++) {
        zones.push({
          id: `zone-${col}-${i}`,
          accepts: ['widget'],
          position: { column: col, index: i }
        });
      }
    }
    
    setDropZones(zones);
  }, [children, columnCount]);

  React.useEffect(() => {
    if (isEditMode) {
      generateDropZones();
    }
  }, [isEditMode, generateDropZones]);

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = (dropZoneId: string) => {
    if (!draggedItem) return;
    
    const zone = dropZones.find(z => z.id === dropZoneId);
    if (!zone) return;

    // Calculate new positions for all items
    const newOrder = children.map((child, index) => {
      const itemId = getItemId(child, index);
      const currentColumn = index % columnCount;
      const currentIndex = Math.floor(index / columnCount);
      
      if (itemId === draggedItem) {
        return {
          id: itemId,
          column: zone.position.column,
          index: zone.position.index
        };
      }
      
      return {
        id: itemId,
        column: currentColumn,
        index: currentIndex
      };
    });

    onReorder(newOrder);
  };

  // Organize children into columns
  const columns = Array.from({ length: columnCount }, (_, colIndex) => {
    return children.filter((_, index) => index % columnCount === colIndex);
  });

  if (!isEditMode) {
    // Normal rendering when not in edit mode
    return (
      <div className={`grid grid-cols-1 md:grid-cols-${columnCount} gap-6`}>
        {children.map((child, index) => (
          <motion.div
            key={getItemId(child, index)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    );
  }

  // Edit mode rendering with drop zones
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columnCount} gap-6`}>
      {columns.map((columnChildren, colIndex) => (
        <div key={colIndex} className="space-y-4">
          {/* Drop zone at the top of each column */}
          <div
            className={`h-4 border-2 border-dashed border-transparent transition-colors ${
              draggedItem ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(`zone-${colIndex}-0`)}
          />
          
          {columnChildren.map((child, itemIndex) => {
            const globalIndex = colIndex + itemIndex * columnCount;
            const itemId = getItemId(child, globalIndex);
            
            return (
              <React.Fragment key={itemId}>
                <motion.div
                  className={`transition-transform ${
                    draggedItem === itemId ? 'scale-105 shadow-lg z-50' : ''
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(itemId)}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.05, zIndex: 1000 }}
                >
                  <div className="cursor-move p-2 border-2 border-dashed border-transparent hover:border-blue-300 rounded-lg">
                    {child}
                  </div>
                </motion.div>
                
                {/* Drop zone after each item */}
                <div
                  className={`h-4 border-2 border-dashed border-transparent transition-colors ${
                    draggedItem ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(`zone-${colIndex}-${itemIndex + 1}`)}
                />
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default DragDropContainer;