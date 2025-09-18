
import React from 'react';
import { Moon, Type } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInVariants } from '../../Common/AnimationVariants';
import AnimatedDropdown from '../../Common/AnimatedDropdown';

interface AppearanceSettingsProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  selectedFont: string;
  onUpdateFont: (font: string) => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ darkMode, onToggleDarkMode, selectedFont, onUpdateFont }) => {
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
        <Moon className="h-5 w-5" />
        <span>Appearance</span>
      </motion.h3>

      <div className="space-y-6">
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div>
            <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-[#888888]">Use dark theme across the application</p>
          </div>
          <motion.button
            onClick={onToggleDarkMode}
            className={`relative w-12 h-6 rounded-full transition-all duration-200 ${darkMode ? 'bg-[#007BFF]' : 'bg-gray-300'}`}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${darkMode ? 'left-7' : 'left-1'}`}
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </motion.div>

        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div>
            <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">Select Font</p>
            <p className="text-sm text-gray-500 dark:text-[#888888]">
              Current font: <span style={{ fontFamily: `'${selectedFont}', sans-serif` }}>{selectedFont}</span>
            </p>
          </div>
          <div className="w-48">
            <AnimatedDropdown
              selectedValue={selectedFont}
              options={['Montserrat', 'Roboto', 'Poppins', 'Open Sans', 'Lato', 'Press Start 2P', 'Nunito Sans', 'Inter', 'Source Sans Pro', 'Work Sans', 'Rubik', 'Merriweather', 'IBM Plex Sans', 'Dancing Script', 'Pacifico', 'Caveat', 'Lobster']}
              onChange={onUpdateFont}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AppearanceSettings;
