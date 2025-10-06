
import React from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  selectedTab: string;
  onSelectTab: (id: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, selectedTab, onSelectTab }) => {
  return (
    <div className="flex justify-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={`relative w-full py-2 text-sm font-medium rounded-md ${selectedTab === tab.id ? 'text-white' : 'text-gray-500'}`}>
          {selectedTab === tab.id && (
            <motion.div
              layoutId="active-strategy-tab"
              className="absolute inset-0 bg-blue-500 rounded-md z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
