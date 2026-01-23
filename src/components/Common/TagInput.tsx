import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Hash, Edit2, Trash2, Check, X } from 'lucide-react';
import { Tag } from '../../types/types';
import { TAG_COLORS, getTagColorClasses, getDefaultTagColor } from './TagColors';
import TagChip from './TagChip';

interface TagInputProps {
  selectedTagIds: string[];
  availableTags: Tag[];
  onChange: (tagIds: string[]) => void;
  onCreateTag: (name: string, color: string) => Promise<Tag | null>;
  onUpdateTag?: (tagId: string, name: string, color: string) => Promise<void>;
  onDeleteTag?: (tagId: string) => Promise<void>;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  selectedTagIds,
  availableTags,
  onChange,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  placeholder = 'Add tags...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(getDefaultTagColor());
  const [isCreating, setIsCreating] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Get selected tag objects
  const selectedTags = selectedTagIds
    .map(id => availableTags.find(t => t.id === id))
    .filter((t): t is Tag => t !== undefined);

  // Filter available tags based on input and exclude already selected
  const filteredTags = availableTags.filter(tag =>
    !selectedTagIds.includes(tag.id) &&
    tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // All tags for management section (includes selected)
  const allTagsFiltered = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Check if input matches an existing tag name exactly
  const exactMatch = availableTags.find(
    t => t.name.toLowerCase() === inputValue.toLowerCase()
  );

  // Show create option if input has value and no exact match
  const showCreateOption = inputValue.trim() && !exactMatch;

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 280),
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowColorPicker(false);
        setEditingTagId(null);
        setDeletingTagId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTag = (tag: Tag) => {
    if (!selectedTagIds.includes(tag.id)) {
      onChange([...selectedTagIds, tag.id]);
    } else {
      // If already selected, remove it
      onChange(selectedTagIds.filter(id => id !== tag.id));
    }
    setInputValue('');
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTagIds.filter(id => id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!inputValue.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const newTag = await onCreateTag(inputValue.trim(), selectedColor);
      if (newTag) {
        onChange([...selectedTagIds, newTag.id]);
      }
      setInputValue('');
      setShowColorPicker(false);
      setSelectedColor(getDefaultTagColor());
    } finally {
      setIsCreating(false);
    }
    inputRef.current?.focus();
  };

  const handleStartEdit = (tag: Tag, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTagId(tag.id);
    setEditingName(tag.name);
    setEditingColor(tag.color);
    setDeletingTagId(null);
  };

  const handleSaveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingTagId || !editingName.trim() || !onUpdateTag || isUpdating) return;

    setIsUpdating(true);
    try {
      await onUpdateTag(editingTagId, editingName.trim(), editingColor);
      setEditingTagId(null);
      setEditingName('');
      setEditingColor('');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTagId(null);
    setEditingName('');
    setEditingColor('');
  };

  const handleStartDelete = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingTagId(tagId);
    setEditingTagId(null);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!deletingTagId || !onDeleteTag || isDeleting) return;

    setIsDeleting(true);
    try {
      // Remove from selected if it was selected
      if (selectedTagIds.includes(deletingTagId)) {
        onChange(selectedTagIds.filter(id => id !== deletingTagId));
      }
      await onDeleteTag(deletingTagId);
      setDeletingTagId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingTagId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (showCreateOption) {
        handleCreateTag();
      } else if (filteredTags.length > 0) {
        handleSelectTag(filteredTags[0]);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTagIds.length > 0) {
      handleRemoveTag(selectedTagIds[selectedTagIds.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setShowColorPicker(false);
      setEditingTagId(null);
      setDeletingTagId(null);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Input container */}
      <div
        className={`flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2 rounded-lg border transition-all cursor-text ${
          isOpen
            ? 'border-blue-500 ring ring-blue-200 dark:ring-blue-800 ring-opacity-50'
            : 'border-gray-300 dark:border-gray-600'
        } bg-white dark:bg-[#1A1A1A]`}
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {/* Selected tags */}
        <AnimatePresence mode="popLayout">
          {selectedTags.map(tag => (
            <TagChip
              key={tag.id}
              tag={tag}
              size="md"
              onRemove={() => handleRemoveTag(tag.id)}
            />
          ))}
        </AnimatePresence>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
        />
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            className="bg-white dark:bg-[#2c2c2c] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            data-lenis-prevent
            style={{
              position: 'fixed',
              zIndex: 9999,
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxHeight: 350,
            }}
          >
            {/* Create new tag option - shown at top when typing */}
            {showCreateOption && (
              <div className="border-b border-gray-200 dark:border-gray-700">
                <motion.button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Create "{inputValue.trim()}"
                  </span>
                </motion.button>

                {/* Color picker for new tag */}
                <AnimatePresence>
                  {showColorPicker && (
                    <motion.div
                      className="px-3 pb-3"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Choose a color:</p>
                      <div className="flex flex-wrap gap-2">
                        {TAG_COLORS.map((color) => (
                          <motion.button
                            key={color.name}
                            type="button"
                            onClick={() => setSelectedColor(color.name)}
                            className={`w-6 h-6 rounded-full ${color.dot} transition-all ${
                              selectedColor === color.name
                                ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800'
                                : 'hover:scale-110'
                            }`}
                            whileTap={{ scale: 0.9 }}
                          />
                        ))}
                      </div>
                      <motion.button
                        type="button"
                        onClick={handleCreateTag}
                        disabled={isCreating}
                        className="mt-3 w-full py-1.5 px-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Hash className="w-4 h-4" />
                        {isCreating ? 'Creating...' : 'Create Tag'}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Tags list with select/edit/delete */}
            <div className="max-h-[250px] overflow-y-auto py-1" data-lenis-prevent>
              {allTagsFiltered.length === 0 && !showCreateOption ? (
                <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No tags yet. Type to create one.
                </div>
              ) : (
                allTagsFiltered.map((tag, index) => {
                  const colorClasses = getTagColorClasses(tag.color);
                  const isSelected = selectedTagIds.includes(tag.id);
                  const isEditing = editingTagId === tag.id;
                  const isDeleting = deletingTagId === tag.id;

                  // Editing mode
                  if (isEditing) {
                    return (
                      <motion.div
                        key={tag.id}
                        className="px-3 py-2 bg-gray-50 dark:bg-gray-800"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <motion.button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={isUpdating}
                            className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                            whileTap={{ scale: 0.9 }}
                          >
                            <Check className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {TAG_COLORS.map((color) => (
                            <motion.button
                              key={color.name}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingColor(color.name);
                              }}
                              className={`w-5 h-5 rounded-full ${color.dot} transition-all ${
                                editingColor === color.name
                                  ? 'ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-gray-800'
                                  : 'hover:scale-110'
                              }`}
                              whileTap={{ scale: 0.9 }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    );
                  }

                  // Delete confirmation mode
                  if (isDeleting) {
                    return (
                      <motion.div
                        key={tag.id}
                        className="px-3 py-2 bg-red-50 dark:bg-red-900/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                          Delete "{tag.name}"?
                        </p>
                        <div className="flex gap-2">
                          <motion.button
                            type="button"
                            onClick={handleConfirmDelete}
                            className="flex-1 py-1 px-2 text-xs bg-red-500 hover:bg-red-600 text-white rounded"
                            whileTap={{ scale: 0.95 }}
                          >
                            Delete
                          </motion.button>
                          <motion.button
                            type="button"
                            onClick={handleCancelDelete}
                            className="flex-1 py-1 px-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                            whileTap={{ scale: 0.95 }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  }

                  // Normal tag row
                  return (
                    <motion.div
                      key={tag.id}
                      className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => handleSelectTag(tag)}
                    >
                      <span className={`w-3 h-3 rounded-full ${colorClasses.dot} flex-shrink-0`} />
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-200 truncate">
                        {tag.name}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                      {/* Edit/Delete buttons - show on hover */}
                      {(onUpdateTag || onDeleteTag) && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onUpdateTag && (
                            <motion.button
                              type="button"
                              onClick={(e) => handleStartEdit(tag, e)}
                              className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                              whileTap={{ scale: 0.9 }}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </motion.button>
                          )}
                          {onDeleteTag && (
                            <motion.button
                              type="button"
                              onClick={(e) => handleStartDelete(tag.id, e)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TagInput;
