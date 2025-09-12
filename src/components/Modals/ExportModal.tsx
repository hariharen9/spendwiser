import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileDown } from 'lucide-react';
import { modalVariants } from '../Common/AnimationVariants';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'png') => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">Export Dashboard</h2>
              <button
                onClick={onClose}
                className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Choose a format to export your current dashboard view.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => onExport('pdf')}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
                >
                  <FileDown className="h-5 w-5" />
                  <span>Export as PDF</span>
                </button>
                <button
                  onClick={() => onExport('png')}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-all duration-200"
                >
                  <FileDown className="h-5 w-5" />
                  <span>Export as PNG</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExportModal;