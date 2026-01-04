
import React, { useState } from 'react';
import { DollarSign, Tag, Edit, Trash2, X, Plus, RotateCcw, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInVariants, buttonHoverVariants, modalVariants } from '../../Common/AnimationVariants';
import AnimatedDropdown from '../../Common/AnimatedDropdown';
import { currencies } from '../../../data/mockData';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FinancialSettingsProps {
  currency: string;
  onUpdateCurrency: (currency: string) => void;
  defaultAccountId?: string | null;
  onSetDefaultAccount?: (accountId: string) => void;
  accounts: any[];
  categories: string[];
  onAddCategory: (category: string) => void;
  onEditCategory: (oldCategory: string, newCategory: string) => void;
  onDeleteCategory: (category: string) => void;
  onResetCategories: () => void;
  onUpdateCategories: (categories: string[]) => void;
}

// Sortable Item Component
function SortableCategoryItem({ category, onEdit, onDelete }: { category: string, onEdit: () => void, onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-gray-600 ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-center space-x-3 flex-1">
        <button
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="font-medium text-gray-900 dark:text-[#F5F5F5]">{category}</span>
      </div>
      <div className="flex items-center space-x-1">
        <motion.button
          onClick={onEdit}
          className="p-1 text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#242424] rounded transition-all duration-200"
          variants={buttonHoverVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Edit className="h-4 w-4" />
        </motion.button>
        <motion.button
          onClick={onDelete}
          className="p-1 text-gray-500 dark:text-[#888888] hover:text-red-500 dark:hover:text-[#DC3545] hover:bg-gray-100 dark:hover:bg-[#242424] rounded transition-all duration-200"
          variants={buttonHoverVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}

const FinancialSettings: React.FC<FinancialSettingsProps> = ({ 
  currency, 
  onUpdateCurrency, 
  defaultAccountId, 
  onSetDefaultAccount, 
  accounts, 
  categories, 
  onAddCategory, 
  onEditCategory, 
  onDeleteCategory, 
  onResetCategories, 
  onUpdateCategories 
}) => {
  const [showCategoryEditorModal, setShowCategoryEditorModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showResetCategoriesConfirm, setShowResetCategoriesConfirm] = useState(false);

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

  const handleOpenCategoryEditor = () => {
    setShowCategoryEditorModal(true);
  };

  const handleCloseCategoryEditor = () => {
    setShowCategoryEditorModal(false);
    setEditingCategory('');
    setNewCategoryName('');
  };

  const handleOpenEditCategoryModal = (category: string) => {
    setEditingCategory(category);
    setNewCategoryName(category);
  };

  const handleCloseEditCategoryModal = () => {
    setEditingCategory('');
    setNewCategoryName('');
  };

  const handleSaveEditedCategory = () => {
    if (newCategoryName.trim() && newCategoryName.trim() !== editingCategory) {
      onEditCategory(editingCategory, newCategoryName.trim());
      handleCloseEditCategoryModal();
    }
  };

  const handleOpenDeleteCategoryConfirm = (category: string) => {
    setCategoryToDelete(category);
  };

  const handleCloseDeleteCategoryConfirm = () => {
    setCategoryToDelete(null);
  };

  const handleConfirmDeleteCategory = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete);
      handleCloseDeleteCategoryConfirm();
    }
  };

  const handleConfirmResetCategories = () => {
    onResetCategories();
    setShowResetCategoriesConfirm(false);
  };

  const handleSaveNewCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.indexOf(active.id as string);
      const newIndex = categories.indexOf(over.id as string);

      onUpdateCategories(arrayMove(categories, oldIndex, newIndex));
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
    >
      <motion.h3
        className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-6 flex items-center space-x-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DollarSign className="h-5 w-5" />
        <span>Financial Settings</span>
      </motion.h3>

      <div className="space-y-6">
        <motion.div
          className="max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-600 dark:text-[#888888] mb-2">
            Default Currency
          </label>
          <AnimatedDropdown
            selectedValue={currency}
            options={currencies.map(c => ({ value: c.symbol, label: `${c.symbol} - ${c.name}` }))}
            onChange={onUpdateCurrency}
          />
        </motion.div>

        {accounts.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
              Select Default Account
            </label>
            <p className="text-sm text-gray-500 dark:text-[#888888] mb-4">
              This account will be automatically selected when adding new transactions.
            </p>
            <AnimatedDropdown
              selectedValue={defaultAccountId || ''}
              placeholder="No default account"
              options={[{ value: '', label: 'No default account' }, ...accounts.map(account => ({ value: account.id, label: account.name })) ]}
              onChange={(value) => onSetDefaultAccount && onSetDefaultAccount(value)}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
            Manage Categories
          </label>
          <p className="text-sm text-gray-500 dark:text-[#888888] mb-4">
            Add, edit, or delete your transaction categories.
          </p>
          <motion.button
            onClick={handleOpenCategoryEditor}
            className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium"
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Tag className="h-4 w-4" />
            <span>Edit Categories</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Category Editor Modal */}
      <AnimatePresence>
        {showCategoryEditorModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseCategoryEditor}
          >
            <motion.div
              className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                  Edit Categories
                </h2>
                <motion.button
                  onClick={handleCloseCategoryEditor}
                  className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </motion.div>

              <motion.div
                className="p-6 space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                    placeholder="New category name"
                  />
                  <motion.button
                    onClick={handleSaveNewCategory}
                    className="bg-[#007BFF] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!newCategoryName.trim() || categories.includes(newCategoryName.trim())}
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={categories}
                      strategy={verticalListSortingStrategy}
                    >
                      {categories.map((category) => (
                        <SortableCategoryItem
                          key={category}
                          category={category}
                          onEdit={() => handleOpenEditCategoryModal(category)}
                          onDelete={() => handleOpenDeleteCategoryConfirm(category)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>

                <div className="flex justify-between pt-4">
                  <motion.button
                    onClick={() => setShowResetCategoriesConfirm(true)}
                    className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg font-medium text-sm"
                    variants={buttonHoverVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Add/Reset to Default Categories</span>
                  </motion.button>
                  <motion.button
                    onClick={handleCloseCategoryEditor}
                    className="bg-[#007BFF] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseEditCategoryModal}
            >
              <motion.div 
                className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md"
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div 
                  className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                    Edit Category
                  </h2>
                  <motion.button
                    onClick={handleCloseEditCategoryModal}
                    className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </motion.div>
                
                <motion.div 
                  className="p-6 space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                      placeholder="e.g., Entertainment, Groceries"
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center justify-end space-x-4 pt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.button
                      onClick={handleCloseEditCategoryModal}
                      className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleSaveEditedCategory}
                      className="bg-[#007BFF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!newCategoryName.trim() || (newCategoryName.trim() === editingCategory) || categories.includes(newCategoryName.trim())}
                    >
                      Update Category
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Delete Category Confirmation Modal */}
      <AnimatePresence>
        {categoryToDelete && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDeleteCategoryConfirm}
            >
              <motion.div
                className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md"
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div 
                  className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                    Confirm Deletion
                  </h2>
                  <motion.button
                    onClick={handleCloseDeleteCategoryConfirm}
                    className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </motion.div>
                
                <motion.div 
                  className="p-6 space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to delete the category "<strong>{categoryToDelete}</strong>"? 
                    All transactions with this category will be changed to "Other".
                    This action cannot be undone.
                  </p>
                  
                  <motion.div 
                    className="flex items-center justify-end space-x-4 pt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.button
                      onClick={handleCloseDeleteCategoryConfirm}
                      className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleConfirmDeleteCategory}
                      className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Delete Category
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Reset Categories Confirmation Modal */}
      <AnimatePresence>
        {showResetCategoriesConfirm && (
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetCategoriesConfirm(false)}
            >
              <motion.div
                className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md"
                variants={modalVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div 
                  className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                    Confirm Reset
                  </h2>
                  <motion.button
                    onClick={() => setShowResetCategoriesConfirm(false)}
                    className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </motion.div>
                
                <motion.div 
                  className="p-6 space-y-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-gray-700 dark:text-gray-300">
                    Are you sure you want to reset all categories to the default list? 
                    Your custom categories will be removed and all transactions will be updated accordingly.
                    This action cannot be undone.
                  </p>
                  
                  <motion.div 
                    className="flex items-center justify-end space-x-4 pt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.button
                      onClick={() => setShowResetCategoriesConfirm(false)}
                      className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleConfirmResetCategories}
                      className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Reset Categories
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </motion.div>
  );
};

export default FinancialSettings;
