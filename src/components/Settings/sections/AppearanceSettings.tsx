import React from 'react';
import { Moon, Type, Globe, Sun, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInVariants } from '../../Common/AnimationVariants';
import AnimatedDropdown from '../../Common/AnimatedDropdown';
import { TIMEZONES } from '../../../lib/timezone';

interface AppearanceSettingsProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  selectedFont: string;
  onUpdateFont: (font: string) => void;
  userTimezone: string;
  onUpdateTimezone: (timezone: string) => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ 
  darkMode, 
  onToggleDarkMode, 
  selectedFont, 
  onUpdateFont, 
  userTimezone, 
  onUpdateTimezone 
}) => {
  return (
    <motion.div
      className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden"
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <motion.h3
        className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3 relative z-10"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
          <Monitor size={20} />
        </div>
        <span>Look & Feel</span>
      </motion.h3>

      <div className="space-y-8 relative z-10">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${darkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-orange-100 text-orange-500'}`}>
              {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Reduce eye strain</p>
            </div>
          </div>
          
          <motion.button
            onClick={onToggleDarkMode}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
              animate={{ left: darkMode ? 'calc(100% - 1.75rem)' : '0.25rem' }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {darkMode ? <Moon size={12} className="text-indigo-600" /> : <Sun size={12} className="text-orange-500" />}
            </motion.div>
          </motion.button>
        </div>

        {/* Font Selection */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
              <Type size={18} />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Typography</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Preview: <span className="text-blue-500" style={{ fontFamily: `'${selectedFont}', sans-serif` }}>The quick brown fox</span>
              </p>
            </div>
          </div>
          <div className="w-full md:w-56">
            <AnimatedDropdown
              selectedValue={selectedFont}
              options={['Montserrat', 'Roboto', 'Poppins', 'Open Sans', 'Lato', 'Press Start 2P', 'Nunito Sans', 'Inter', 'Source Sans Pro', 'Work Sans', 'Rubik', 'Merriweather', 'IBM Plex Sans', 'Dancing Script', 'Pacifico', 'Caveat', 'Lobster']}
              onChange={onUpdateFont}
            />
          </div>
        </div>

        {/* Timezone Selection */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
              <Globe size={18} />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Timezone</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Local time settings
              </p>
            </div>
          </div>
          <div className="w-full md:w-56">
            <AnimatedDropdown
              selectedValue={userTimezone}
              options={TIMEZONES.map(tz => ({ value: tz.value, label: tz.label }))}
              onChange={onUpdateTimezone}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AppearanceSettings;