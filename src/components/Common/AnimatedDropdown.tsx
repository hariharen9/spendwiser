import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// Define the shape of an option if it's an object
interface Option {
  value: string;
  label: string;
}

// The options prop can be an array of strings or an array of Option objects
type Options = string[] | Option[];

interface AnimatedDropdownProps {
  options: Options;
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const dropdownVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: -10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.1 } },
};

const optionVariants: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 400, damping: 25 },
  }),
};

const AnimatedDropdown: React.FC<AnimatedDropdownProps> = ({ options, selectedValue, onChange, placeholder = 'Select an option' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Helper to check if an option is of type Option (object with value and label)
  const isOptionObject = (option: string | Option): option is Option => {
    return typeof option === 'object' && 'value' in option && 'label' in option;
  };

  const handleSelect = (option: string | Option) => {
    onChange(isOptionObject(option) ? option.value : option);
    setIsOpen(false);
  };

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // For position: fixed, use viewport coordinates directly (no scroll offset)
      setDropdownPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Find the label for the currently selected value
  const getSelectedLabel = () => {
    const selectedOption = options.find(option => {
      const value = isOptionObject(option) ? option.value : option;
      return value === selectedValue;
    });

    if (!selectedOption) return placeholder;

    return isOptionObject(selectedOption) ? selectedOption.label : selectedOption;
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <motion.button
        ref={buttonRef}
        type="button"
        className="w-full flex items-center justify-between rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-2 px-3 transition-all text-left"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.98 }}
      >
        <span className="capitalize">{getSelectedLabel()}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bg-white dark:bg-[#2c2c2c] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-60"
            variants={dropdownVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            data-lenis-prevent
            style={{
              position: 'fixed',
              zIndex: 9999,
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width
            }}
          >
            <ul className="py-1">
              {options.map((option, i) => {
                const value = isOptionObject(option) ? option.value : option;
                const label = isOptionObject(option) ? option.label : option;
                return (
                  <motion.li
                    key={value}
                    className={`px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 cursor-pointer capitalize ${selectedValue === value ? 'bg-blue-100 dark:bg-blue-800/50 font-semibold' : ''}`}
                    onClick={() => handleSelect(option)}
                    custom={i}
                    variants={optionVariants}
                    initial="initial"
                    animate="animate"
                    style={{ fontFamily: `'${label}', 'Montserrat', sans-serif` }}
                  >
                    {label}
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedDropdown;