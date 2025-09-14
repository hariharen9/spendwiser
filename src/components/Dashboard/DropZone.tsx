import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowDown } from 'lucide-react';

interface DropZoneProps {
  id: string;
  isActive: boolean;
  isEmpty?: boolean;
  onAddWidget?: () => void;
  columnIndex: number;
  position?: number;
}

const DropZone: React.FC<DropZoneProps> = ({ 
  id, 
  isActive, 
  isEmpty = false, 
  onAddWidget,
  columnIndex,
  position = 0
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const shouldShow = isActive || isOver || isEmpty;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          ref={setNodeRef}
          initial={{ opacity: 0, height: 0, scaleY: 0 }}
          animate={{ 
            opacity: 1, 
            height: isEmpty ? 200 : (isOver ? 100 : 50),
            scaleY: 1,
            backgroundColor: isOver ? 'rgba(59, 130, 246, 0.15)' : 'transparent'
          }}
          exit={{ opacity: 0, height: 0, scaleY: 0 }}
          transition={{ 
            duration: 0.2,
            ease: "easeOut",
            height: { duration: isOver ? 0.1 : 0.2 }
          }}
          className={`
            relative border-2 border-dashed rounded-lg transition-all duration-200 flex items-center justify-center mx-1
            ${isOver 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg scale-105 z-50' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${isEmpty ? 'min-h-[200px]' : 'min-h-[50px]'}
            ${isActive ? 'cursor-pointer' : ''}
            ${position === 0 ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : ''}
          `}
          style={{
            // Ensure the drop zone has enough surface area for detection
            minWidth: '100%',
            boxSizing: 'border-box',
            // Increase z-index for top position drop zones
            zIndex: position === 0 ? 100 : (isOver ? 50 : 1)
          }}
        >
          {/* Glowing border effect when dragging over */}
          {isOver && (
            <motion.div
              className="absolute inset-0 border-2 border-blue-400 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
          
          {isEmpty ? (
            <div className="text-center p-6">
              <div className="text-gray-400 dark:text-gray-600 mb-3">
                <Plus size={40} className="mx-auto" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Column {columnIndex + 1} is empty
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                Drag widgets here or add new ones
              </p>
              {onAddWidget && (
                <motion.button
                  onClick={onAddWidget}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Add Widget
                </motion.button>
              )}
            </div>
          ) : isOver ? (
            <motion.div 
              className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-medium"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <motion.div 
                className="w-3 h-3 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
              <span className="text-sm font-semibold">
                Drop here {position === 0 ? '(TOP OF COLUMN)' : `(position ${position})`}
              </span>
              <ArrowDown size={16} className="animate-bounce" />
              <motion.div 
                className="w-3 h-3 bg-blue-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
              />
            </motion.div>
          ) : (
            <motion.div 
              className="flex items-center gap-2 text-gray-400 dark:text-gray-600"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: isActive ? 0.8 : 0.3 }}
            >
              <Plus size={16} />
              <span className="text-xs font-medium">
                {position === 0 ? 'TOP POSITION' : `Position ${position}`}
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DropZone;