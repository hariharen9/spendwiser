import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Edit3 } from 'lucide-react';

interface EditInputProps {
  value: string;
  onSave: (newValue: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

const EditInput: React.FC<EditInputProps> = ({
  value,
  onSave,
  onCancel,
  placeholder = '',
  className = '',
  maxLength = 50
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    onCancel?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          maxLength={maxLength}
          className="flex-grow px-2 py-1 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
        />
        <motion.button
          onClick={handleSave}
          className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Check className="h-4 w-4" />
        </motion.button>
        <motion.button
          onClick={handleCancel}
          className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="font-medium text-gray-900 dark:text-[#F5F5F5] truncate">
        {value}
      </span>
      <motion.button
        onClick={() => setIsEditing(true)}
        className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Edit3 className="h-4 w-4" />
      </motion.button>
    </div>
  );
};

export default EditInput;