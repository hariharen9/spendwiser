
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInVariants, buttonHoverVariants } from '../../Common/AnimationVariants';

interface DataManagementProps {
  onBackupData?: () => void;
  onExportPDF?: () => void;
  onRestoreData?: (data: any) => void;
  onLoadMockData?: () => void;
  onClearMockData?: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ 
  onBackupData, 
  onExportPDF, 
  onRestoreData, 
  onLoadMockData, 
  onClearMockData 
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportPDF = async () => {
    if (onExportPDF) {
      setIsExportingPDF(true);
      try {
        await onExportPDF();
      } finally {
        setIsExportingPDF(false);
      }
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
        <Settings className="h-5 w-5" />
        <span>Data Management</span>
      </motion.h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <motion.button
            onClick={onBackupData}
            className="flex items-center justify-center space-x-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg font-medium text-sm w-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200"
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={isExportingPDF}
          >
            <span>Backup Data</span>
          </motion.button>
          <div className="absolute bottom-full mb-2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-black text-white text-xs rounded py-1 px-2">Download all your data as a JSON file.</span>
          </div>
        </div>
        <div className="relative group">
          <motion.button
            onClick={handleExportPDF}
            className="flex items-center justify-center space-x-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-3 py-2 rounded-lg font-medium text-sm w-full hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors duration-200"
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={isExportingPDF}
          >
            {isExportingPDF ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-700 dark:text-green-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Preparing PDF...</span>
              </>
            ) : (
              <span>Export PDF</span>
            )}
          </motion.button>
          <div className="absolute bottom-full mb-2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-black text-white text-xs rounded py-1 px-2">Export all your data as a PDF bank statement.</span>
          </div>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">Your SpendWiser Statement</p>
        </div>
        <div className="relative group">
          <motion.button
            onClick={() => document.getElementById('restore-input')?.click()}
            className="flex items-center justify-center space-x-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg font-medium text-sm w-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-200"
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={isExportingPDF}
          >
            <span>Restore Data</span>
          </motion.button>
          <input
            type="file"
            id="restore-input"
            className="hidden"
            accept=".json"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result) {
                    try {
                      const data = JSON.parse(event.target.result as string);
                      if (onRestoreData) {
                        onRestoreData(data);
                      }
                    } catch (error) {
                      console.error("Error parsing JSON file:", error);
                    }
                  }
                };
                reader.readAsText(e.target.files[0]);
              }
            }}
          />
          <div className="absolute bottom-full mb-2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-black text-white text-xs rounded py-1 px-2">Restore your data from a JSON backup file.</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

      <div>
        <h4 className="text-md font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Mock Data (Demo)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group">
            <motion.button
              onClick={onLoadMockData}
              className="flex items-center justify-center space-x-1 bg-[#007BFF] text-white px-3 py-2 rounded-lg font-medium text-sm w-full"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <span>Load MockData</span>
            </motion.button>
            <div className="absolute bottom-full mb-2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-black text-white text-xs rounded py-1 px-2">Load demo data</span>
            </div>
          </div>
          <div className="relative group">
            <motion.button
              onClick={onClearMockData}
              className="flex items-center justify-center space-x-1 bg-red-500 text-white px-3 py-2 rounded-lg font-medium text-sm w-full"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <span>Clear MockData</span>
            </motion.button>
            <div className="absolute bottom-full mb-2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-black text-white text-xs rounded py-1 px-2">Clear demo data</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DataManagement;
