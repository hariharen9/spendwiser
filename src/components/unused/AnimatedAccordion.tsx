import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AnimatedAccordionProps {
  items: AccordionItem[];
  className?: string;
}

const AnimatedAccordion: React.FC<AnimatedAccordionProps> = ({ items, className = '' }) => {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => (
        <div 
          key={item.id} 
          className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <button
            className="flex justify-between items-center w-full p-4 text-left font-medium text-gray-900 dark:text-[#F5F5F5]"
            onClick={() => toggleItem(item.id)}
          >
            <span>{item.title}</span>
            <motion.div
              animate={{ rotate: openItemId === item.id ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openItemId === item.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default AnimatedAccordion;