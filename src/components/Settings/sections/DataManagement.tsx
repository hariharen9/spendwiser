import React, { useState } from 'react';
import { Settings, Download, Upload, FileText, Database, Trash2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInVariants, buttonHoverVariants } from '../../Common/AnimationVariants';

interface DataManagementProps {
  onBackupData?: () => void;
  onExportPDF?: () => void;
  onRestoreData?: (data: any) => void;
  onLoadMockData?: () => void;
  onClearMockData?: () => void;
}

const DataButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
  colorClass: string;
  disabled?: boolean;
}> = ({ onClick, icon, label, description, colorClass, disabled }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    className={`group flex flex-col items-start p-5 rounded-xl border transition-all duration-300 ${colorClass} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1'}`}
    whileTap={{ scale: 0.98 }}
  >
    <div className="mb-3 p-2 bg-white dark:bg-black/20 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="font-bold text-sm mb-1">{label}</span>
    <span className="text-xs opacity-70 text-left leading-relaxed">{description}</span>
  </motion.button>
);

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
      className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden"
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <motion.h3
        className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3 relative z-10"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
          <Database size={20} />
        </div>
        <span>Data Control</span>
      </motion.h3>

      <div className="space-y-8 relative z-10">
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Export & Backup</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DataButton 
              onClick={onBackupData!} 
              icon={<Download size={18} />} 
              label="Backup JSON" 
              description="Save a complete snapshot of your financial data locally."
              colorClass="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-300"
            />
            <div className="relative">
              <input
                type="file"
                id="restore-input"
                className="hidden"
                accept=".json"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result && onRestoreData) {
                        try {
                          const data = JSON.parse(event.target.result as string);
                          onRestoreData(data);
                        } catch (error) {
                          console.error("Error parsing JSON:", error);
                        }
                      }
                    };
                    reader.readAsText(e.target.files[0]);
                  }
                }}
              />
              <DataButton 
                onClick={() => document.getElementById('restore-input')?.click()} 
                icon={<Upload size={18} />} 
                label="Restore Data" 
                description="Import your data from a previously saved JSON file."
                colorClass="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-300"
              />
            </div>
            <DataButton 
              onClick={handleExportPDF} 
              icon={<FileText size={18} />} 
              label={isExportingPDF ? "Generating..." : "Export PDF"} 
              description="Download a printable summary report of your finances."
              colorClass="bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30 text-purple-700 dark:text-purple-300"
              disabled={isExportingPDF}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1">Demo Zone</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DataButton 
              onClick={onLoadMockData!} 
              icon={<RefreshCw size={18} />} 
              label="Load Demo Data" 
              description="Populate the app with sample data to test features."
              colorClass="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
            />
            <DataButton 
              onClick={onClearMockData!} 
              icon={<Trash2 size={18} />} 
              label="Clear Demo Data" 
              description="Remove all sample transactions and reset to empty."
              colorClass="bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DataManagement;