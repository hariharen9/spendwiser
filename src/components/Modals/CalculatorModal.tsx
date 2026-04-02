import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete, Calculator as CalculatorIcon, History } from 'lucide-react';
import { modalVariants } from '../Common/AnimationVariants';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to reliably evaluate arithmetic strings safely
const evaluateExpression = (expr: string): string => {
  try {
    // Basic sanitization: only permit numbers, basic operators, and decimals
    if (!/^[0-9+\-*/.\s()]+$/.test(expr)) return '';
    
    // Evaluate safely via constrained Function sandbox
    const func = new Function('return ' + expr);
    const resultNum = func();
    
    if (resultNum === Infinity || resultNum === -Infinity) return 'Error';
    if (isNaN(resultNum) || resultNum === undefined || resultNum === null) return 'Error';
    
    // Fix standard JS float precision (rounds safely to 8 decimal places max)
    const rounded = Math.round(resultNum * 100000000) / 100000000;
    return rounded.toString();
  } catch (e) {
    return 'Error';
  }
};

const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  // Load persistent state from local storage or fallback to defaults
  const getInitialState = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(`spendwiser_calc_${key}`);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [display, setDisplay] = useState(() => getInitialState('display', '0'));
  const [equation, setEquation] = useState(() => getInitialState('equation', ''));
  const [history, setHistory] = useState<string[]>(() => getInitialState('history', []));
  const [showHistory, setShowHistory] = useState(false);
  const [liveResult, setLiveResult] = useState('');

  // Persist state to local storage when changed
  useEffect(() => {
    localStorage.setItem('spendwiser_calc_display', JSON.stringify(display));
    localStorage.setItem('spendwiser_calc_equation', JSON.stringify(equation));
    localStorage.setItem('spendwiser_calc_history', JSON.stringify(history));
  }, [display, equation, history]);

  // Handle keyboard input (when modal is open)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in some specific input elsewhere
      const activeElement = document.activeElement;
      const isInputFocused = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
      
      // Allow Escape to close calculator even if input is focused, unless standard behavior handles it
      if (isInputFocused && e.key !== 'Escape') {
        return;
      }
      
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
      } else if (key === '%') {
        handlePercentage();
      } else if (key.toLowerCase() === 'c') {
        clear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display, equation]);

  // Live Result Hook
  useEffect(() => {
    if (!equation && display === '0') {
      setLiveResult('');
      return;
    }
    
    // Safely construct evaluatable string
    const safeDisplay = display === 'Error' ? '' : display;
    let fullEquation = equation + safeDisplay;
    
    let evaluatable = fullEquation.trim();
    // Trim trailing operators if incomplete
    if (['+', '-', '*', '/'].includes(evaluatable.slice(-1))) {
      evaluatable = evaluatable.slice(0, -1);
    }
    
    if (evaluatable.length > 0) {
      const res = evaluateExpression(evaluatable);
      if (res !== 'Error' && res !== '' && res !== safeDisplay) {
        setLiveResult(res);
      } else {
        setLiveResult('');
      }
    } else {
      setLiveResult('');
    }
  }, [display, equation]);

  const handleNumber = (num: string) => {
    setDisplay(prev => {
      if (prev === '0' || prev === 'Error') return num;
      // Prevent excessively long numbers
      if (prev.length > 15) return prev; 
      return prev + num;
    });
  };

  const handleOperator = (op: string) => {
    if (display === 'Error') {
      setDisplay('0');
      setEquation('0 ' + op + ' ');
      return;
    }
    
    // If the user just pressed an operator and wants to change it
    if (display === '0' && equation !== '') {
      const trimmed = equation.trim();
      if (['+', '-', '*', '/'].includes(trimmed.slice(-1))) {
        setEquation(trimmed.slice(0, -1) + ' ' + op + ' ');
        return;
      }
    }

    // Append standard chain
    setEquation(prev => prev + display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    if (display === 'Error') return;
    
    const fullEquation = equation + display;
    const result = evaluateExpression(fullEquation);
    
    if (result !== 'Error' && result !== '') {
      setHistory(prev => [`${fullEquation} = ${result}`, ...prev].slice(0, 10));
      setDisplay(result);
      setEquation('');
      setLiveResult('');
    } else {
      setDisplay('Error');
      setEquation('');
      setLiveResult('');
    }
  };

  const handlePercentage = () => {
    if (display === 'Error') return;
    const val = parseFloat(display);
    if (!isNaN(val)) {
      // Safely convert displayed number to a percentage
      const floatRes = val / 100;
      const rounded = Math.round(floatRes * 100000000) / 100000000;
      setDisplay(rounded.toString());
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setLiveResult('');
  };

  const handleDelete = () => {
    if (display === 'Error') {
      setDisplay('0');
      return;
    }
    setDisplay(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleDot = () => {
    if (display === 'Error') {
      setDisplay('0.');
      return;
    }
    if (!display.includes('.')) {
      setDisplay(prev => prev + '.');
    }
  };

  const buttons = [
    { label: 'C', type: 'action', onClick: clear, className: 'text-red-500' },
    { label: '⌫', type: 'action', onClick: handleDelete, icon: <Delete className="w-5 h-5" /> },
    { label: '%', type: 'action', onClick: handlePercentage },
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
          className="fixed top-20 right-8 z-[60] w-full max-w-xs focus:outline-none"
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
                <div className="hidden sm:flex text-xs text-slate-400 dark:text-slate-500 font-medium px-2 bg-slate-200 dark:bg-slate-800 rounded mr-1">
                  Alt+C
                </div>
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-1.5 rounded-lg transition-colors ${showHistory ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500'}`}
                  title="History"
                >
                  <History className="w-4 h-4" />
                </button>
                <button 
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Display */}
            <div className="p-6 bg-gray-50 dark:bg-[#1f1f1f] text-right flex flex-col justify-end h-32 relative">
              <div className="h-6 text-sm text-gray-500 dark:text-gray-400 font-mono mb-1 overflow-hidden">
                <div className="truncate w-full block ml-auto" dir="rtl">{equation}</div>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div 
                  key={display}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.1 }}
                  className={`text-4xl font-bold font-mono tracking-wider overflow-hidden truncate ${display === 'Error' ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}
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
                      <button 
                        onClick={() => setHistory([])}
                        className="w-full text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded mt-2"
                      >
                        Clear History
                      </button>
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
