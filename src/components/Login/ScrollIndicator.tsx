import React from 'react';
import { motion } from 'framer-motion';

const ScrollIndicator = () => {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
      <motion.div
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center items-start p-1">
          <motion.div
            className="w-1 h-2 bg-gray-400 rounded-full"
            animate={{
              y: [0, 12, 0],
              opacity: [1, 0, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ScrollIndicator;
