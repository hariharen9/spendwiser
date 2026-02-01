import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

interface SuccessAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  message?: string;
  subMessage?: string;
  duration?: number;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  isVisible,
  onComplete,
  message = 'Success!',
  subMessage,
  duration = 2000
}) => {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete, duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop with blur */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Success container */}
          <motion.div
            className="relative flex flex-col items-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 1
                }}
                animate={{
                  x: Math.cos(i * 45 * Math.PI / 180) * 120,
                  y: Math.sin(i * 45 * Math.PI / 180) * 120,
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: 1,
                  delay: 0.2,
                  ease: 'easeOut'
                }}
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>
            ))}

            {/* Expanding rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute w-24 h-24 rounded-full border-2 border-green-400"
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{
                  scale: [0.8, 2.5 + i * 0.5],
                  opacity: [0.8, 0]
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.15,
                  ease: 'easeOut'
                }}
              />
            ))}

            {/* Main circle with checkmark */}
            <motion.div
              className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 15,
                delay: 0.1
              }}
            >
              {/* Inner glow */}
              <motion.div
                className="absolute inset-0 rounded-full bg-white/20"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />

              {/* Checkmark */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 15,
                  delay: 0.3
                }}
              >
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>

            {/* Message */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.h3
                className="text-2xl font-bold text-white drop-shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {message}
              </motion.h3>
              {subMessage && (
                <motion.p
                  className="text-white/80 mt-2 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {subMessage}
                </motion.p>
              )}
            </motion.div>

            {/* Bottom confetti burst */}
            <motion.div
              className="absolute -bottom-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`confetti-${i}`}
                  className={`absolute w-2 h-2 rounded-full ${
                    ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 5]
                  }`}
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 0
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 200,
                    y: Math.random() * -100 - 50,
                    scale: [0, 1, 0.5],
                    opacity: [1, 1, 0],
                    rotate: Math.random() * 360
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.4 + i * 0.03,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessAnimation;
