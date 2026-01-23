import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Tag } from '../../types/types';
import { getTagColorClasses } from './TagColors';

interface TagChipProps {
  tag: Tag;
  size?: 'sm' | 'md';
  onRemove?: () => void;
  onClick?: () => void;
}

const TagChip: React.FC<TagChipProps> = ({ tag, size = 'sm', onRemove, onClick }) => {
  const colorClasses = getTagColorClasses(tag.color);

  if (size === 'sm') {
    return (
      <motion.span
        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses.bg} ${colorClasses.text} ${onClick ? 'cursor-pointer' : ''}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        whileHover={onClick ? { scale: 1.05 } : undefined}
        whileTap={onClick ? { scale: 0.95 } : undefined}
        onClick={onClick}
      >
        {tag.name}
      </motion.span>
    );
  }

  return (
    <motion.span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-sm font-medium rounded-full ${colorClasses.bg} ${colorClasses.text}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      layout
    >
      {tag.name}
      {onRemove && (
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </motion.span>
  );
};

export default TagChip;
