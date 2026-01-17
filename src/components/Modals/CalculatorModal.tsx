import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete, Calculator as CalculatorIcon, History } from 'lucide-react';
import { modalVariants } from '../Common/AnimationVariants';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [liveResult, setLiveResult] = useState('');

  // Handle keyboard input
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      
      if (/[0-9]/.test(key)) {
        handleNumber(key);
      } else if (['+', '-', '*', '/'].includes(key)) {
        handleOperator(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
      } else if (key === 'Escape') {
        onClose();
      } else if (key === 'Backspace') {
        handleDelete();
      } else if (key === '.') {
        handleDot();
      } else if (key.toLowerCase() === 'c') {
        clear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display, equation]);

  // Calculate live result whenever display or equation changes
  useEffect(() => {
    if (!equation && !display) {
      setLiveResult('');
      return;
    }

    try {
      // Don't calculate if just an operator
      if (['+', '-', '*', '/'].includes(display)) {
        setLiveResult('');
        return;
      }

      const fullEquation = equation + display;
      // Basic validation to prevent errors on incomplete equations
      if (!/\d$/.test(fullEquation) && !/\)$/.test(fullEquation)) {
         // check if it ends with a digit or closing parenthesis
         // if not, it might be incomplete, try calculating without the last operator
         // But simple logic: just try eval if it looks somewhat complete or let it throw
      }

      // eslint-disable-next-line no-eval
      const result = eval(fullEquation).toString();
      
      if (result !== display && result !== 'Infinity' && !isNaN(parseFloat(result))) {
         const formattedResult = result.includes('.') && result.split('.')[1].length > 4 
          ? parseFloat(result).toFixed(4)
          : result;
         setLiveResult(formattedResult);
      } else {
        setLiveResult('');
      }
    } catch (error) {
      setLiveResult('');
    }
  }, [display, equation]);

  const handleNumber = (num: string) => {
    setDisplay(prev => (prev === '0' ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      // eslint-disable-next-line no-eval
      const result = eval(fullEquation).toString();
      
      // Limit decimal places
      const formattedResult = result.includes('.') && result.split('.')[1].length > 4 
        ? parseFloat(result).toFixed(4)
        : result;

      setHistory(prev => [`${fullEquation} = ${formattedResult}`, ...prev].slice(0, 10));
      setDisplay(formattedResult);
      setEquation('');
      setLiveResult('');
    } catch (error) {
      setDisplay('Error');
      setEquation('');
      setLiveResult('');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setLiveResult('');
  };

  const handleDelete = () => {
    setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleDot = () => {
    if (!display.includes('.')) {
      setDisplay(prev => prev + '.');
    }
  };

  const buttons = [
    { label: 'C', type: 'action', onClick: clear, className: 'text-red-500' },
    { label: '⌫', type: 'action', onClick: handleDelete, icon: <Delete className="w-5 h-5" /> },
    { label: '%', type: 'operator', onClick: () => handleOperator('%') },
    { label: '/', type: 'operator', onClick: () => handleOperator('/') },
    { label: '7', type: 'number', onClick: () => handleNumber('7') },
    { label: '8', type: 'number', onClick: () => handleNumber('8') },
    { label: '9', type: 'number', onClick: () => handleNumber('9') },
    { label: '*', type: 'operator', onClick: () => handleOperator('*') },
    { label: '4', type: 'number', onClick: () => handleNumber('4') },
    { label: '5', type: 'number', onClick: () => handleNumber('5') },
    { label: '6', type: 'number', onClick: () => handleNumber('6') },
    { label: '-', type: 'operator', onClick: () => handleOperator('-') },
    { label: '1', type: 'number', onClick: () => handleNumber('1') },
    { label: '2', type: 'number', onClick: () => handleNumber('2') },
    { label: '3', type: 'number', onClick: () => handleNumber('3') },
    { label: '+', type: 'operator', onClick: () => handleOperator('+') },
    { label: '0', type: 'number', onClick: () => handleNumber('0'), className: 'col-span-2 w-full text-left pl-6' },
    { label: '.', type: 'number', onClick: handleDot },
    { label: '=', type: 'equal', onClick: calculate, className: 'bg-blue-500 text-white hover:bg-blue-600' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-20 right-8 z-50 w-full max-w-xs"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="bg-white dark:bg-[#242424] rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1f1f1f]">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <CalculatorIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Calculator</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-1.5 rounded-lg transition-colors ${showHistory ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500'}`}
                >
                  <History className="w-4 h-4" />
                </button>
                <button 
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Display */}
            <div className="p-6 bg-gray-50 dark:bg-[#1f1f1f] text-right flex flex-col justify-end h-32 relative">
              <div className="h-6 text-sm text-gray-500 dark:text-gray-400 font-mono mb-1 truncate">
                {equation}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div 
                  key={display}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className="text-4xl font-bold text-gray-900 dark:text-white font-mono tracking-wider overflow-hidden truncate"
                >
                  {display}
                </motion.div>
              </AnimatePresence>

              {/* Live Result Subtext */}
              <AnimatePresence>
                {liveResult && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-2 left-6 text-lg text-gray-400 dark:text-gray-500 font-mono"
                  >
                    = {liveResult}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* History Panel */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 150, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-gray-100 dark:bg-[#1a1a1a] border-y border-gray-200 dark:border-gray-700 overflow-y-auto absolute top-[60px] left-0 right-0 z-10"
                >
                  {history.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No history yet</div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {history.map((item, i) => (
                        <div key={i} className="text-right text-sm text-gray-600 dark:text-gray-300 p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer transition-colors"
                             onClick={() => {
                               const result = item.split('=')[1].trim();
                               setDisplay(result);
                               setEquation('');
                               setLiveResult('');
                               setShowHistory(false);
                             }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Keypad */}
            <div className="p-4 grid grid-cols-4 gap-3 bg-white dark:bg-[#242424]">
              {buttons.map((btn, index) => (
                <motion.button
                  key={index}
                  onClick={btn.onClick}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    h-14 rounded-2xl text-xl font-medium flex items-center justify-center transition-all shadow-sm
                    ${btn.type === 'number' ? 'bg-gray-50 dark:bg-[#2f2f2f] text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#383838]' : ''}
                    ${btn.type === 'operator' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40' : ''}
                    ${btn.type === 'action' ? 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]' : ''}
                    ${btn.type === 'equal' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30 shadow-lg' : ''}
                    ${btn.className || ''}
                  `}
                >
                  {btn.icon || btn.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default CalculatorModal;
