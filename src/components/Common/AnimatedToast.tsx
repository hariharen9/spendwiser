import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';

interface AnimatedToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

const AnimatedToast: React.FC<AnimatedToastProps> = ({ message, type, onClose }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-500/90 border-green-400',
          icon: <CheckCircle className="h-5 w-5 text-white" />,
          title: 'Success'
        };
      case 'error':
        return {
          container: 'bg-red-500/90 border-red-400',
          icon: <XCircle className="h-5 w-5 text-white" />,
          title: 'Error'
        };
      case 'warning':
        return {
          container: 'bg-yellow-500/90 border-yellow-400',
          icon: <AlertCircle className="h-5 w-5 text-white" />,
          title: 'Warning'
        };
      default:
        return {
          container: 'bg-blue-500/90 border-blue-400',
          icon: <CheckCircle className="h-5 w-5 text-white" />,
          title: 'Info'
        };
    }
  };

  const { container, icon, title } = getTypeStyles();

  return (
    <motion.div
      className={`fixed top-4 right-4 z-50 w-11/12 max-w-xs sm:w-full sm:max-w-sm ${container} border rounded-lg shadow-lg`}
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="mt-1 text-sm text-white/90">{message}</p>
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              className="inline-flex rounded-md text-white hover:text-white/80 focus:outline-none"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/30"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 6, ease: "linear" }} // toast duration
        onAnimationComplete={onClose}
      />
    </motion.div>
  );
};

export default AnimatedToast;