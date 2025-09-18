
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlinePill, setShowOnlinePill] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // when back online, show online pill for 3 seconds
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlinePill(true);
      setTimeout(() => {
        setShowOnlinePill(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlinePill(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show online pill on initial load
    if (isOnline) {
      setShowOnlinePill(true);
      setTimeout(() => {
        setShowOnlinePill(false);
      }, 3000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  useEffect(() => {
    if (!isOnline) {
      const interval = setInterval(() => {
        setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isOnline]);

  return (
    <AnimatePresence>
      {!isOnline ? (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg z-50"
        >
          Systems are offline {dots}
        </motion.div>
      ) : showOnlinePill ? (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg z-50"
        >
          All systems are online
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default ConnectionStatus;
