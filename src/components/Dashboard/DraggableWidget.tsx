import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';

interface DraggableWidgetProps {
  id: string;
  children: React.ReactNode;
  isEditMode: boolean;
  onRemove?: (id: string) => void;
  index: number;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  id,
  children,
  isEditMode,
  onRemove,
  index
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({
    id,
    disabled: !isEditMode,
    // Ensure the widget itself is droppable for position replacement
    data: {
      type: 'widget',
      index,
      supportsReplacement: true
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`
        relative group transition-all duration-200
        ${isDragging ? 'opacity-20 scale-[1.01] shadow-2xl z-50' : ''}
        ${isEditMode && !isDragging ? 'hover:shadow-lg hover:scale-[1.01]' : ''}
        ${isOver && !isDragging ? 'ring-4 ring-blue-400 ring-opacity-75 bg-blue-50 dark:bg-blue-900/30 scale-[1.02]' : ''}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.2 : 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: isDragging ? 0.1 : 0.3 }}
    >
      {/* Edit Mode Overlay */}
      {isEditMode && (
        <div className={`absolute inset-0 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg transition-opacity duration-200 pointer-events-none ${
          isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`} />
      )}
      
      {/* Position Replacement Indicator */}
      {isOver && !isDragging && (
        <motion.div
          className="absolute inset-0 bg-blue-100 dark:bg-blue-900/40 border-4 border-blue-500 rounded-lg flex items-center justify-center z-20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.15 }}
        >
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            Replace Position
          </div>
        </motion.div>
      )}
      
      {/* Drag Handle */}
      {isEditMode && (
        <div
          {...attributes}
          {...listeners}
          className={`absolute top-2 left-2 z-10 p-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded cursor-grab active:cursor-grabbing shadow-sm transition-all duration-200 ${
            isDragging ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
          }`}
          title="Drag to reorder"
        >
          <GripVertical size={16} className="text-gray-500 dark:text-gray-400" />
        </div>
      )}
      
      {/* Remove Button */}
      {isEditMode && onRemove && (
        <button
          onClick={() => onRemove(id)}
          className={`absolute top-2 right-2 z-10 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 ${
            isDragging ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
          }`}
          title="Hide widget"
        >
          <X size={12} />
        </button>
      )}
      
      {/* Widget Content */}
      <div className={`${isEditMode ? 'pointer-events-auto' : ''} ${isDragging ? 'pointer-events-none' : ''}`}>
        {children}
      </div>
    </motion.div>
  );
};

export default DraggableWidget;