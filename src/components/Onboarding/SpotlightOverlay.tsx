import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpotlightOverlayProps {
  isVisible: boolean;
  targetSelector?: string;
  onClose?: () => void;
  children?: React.ReactNode;
}

const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({
  isVisible,
  targetSelector,
  onClose,
  children
}) => {
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (isVisible && targetSelector) {
      const element = document.querySelector(targetSelector) as HTMLElement;
      if (element) {
        setTargetElement(element);
        const rect = element.getBoundingClientRect();
        const padding = 20;
        
        setSpotlightStyle({
          position: 'fixed',
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
          borderRadius: '12px',
          pointerEvents: 'none',
          zIndex: 60,
        });
      }
    }
  }, [isVisible, targetSelector]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Dark overlay with spotlight cutout */}
        <div 
          className="absolute inset-0 bg-black/70"
          onClick={onClose}
          style={{
            maskImage: targetElement ? `radial-gradient(ellipse at ${spotlightStyle.left}px ${spotlightStyle.top}px, transparent ${Math.max(spotlightStyle.width as number, spotlightStyle.height as number) / 2}px, black ${Math.max(spotlightStyle.width as number, spotlightStyle.height as number) / 2 + 50}px)` : undefined,
            WebkitMaskImage: targetElement ? `radial-gradient(ellipse at ${spotlightStyle.left}px ${spotlightStyle.top}px, transparent ${Math.max(spotlightStyle.width as number, spotlightStyle.height as number) / 2}px, black ${Math.max(spotlightStyle.width as number, spotlightStyle.height as number) / 2 + 50}px)` : undefined,
          }}
        />
        
        {/* Spotlight highlight */}
        {targetElement && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={spotlightStyle}
            className="border-2 border-blue-400 shadow-lg shadow-blue-400/50"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(59, 130, 246, 0.7)',
                  '0 0 0 10px rgba(59, 130, 246, 0)',
                  '0 0 0 0 rgba(59, 130, 246, 0)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="w-full h-full rounded-lg"
            />
          </motion.div>
        )}
        
        {/* Content overlay */}
        {children && (
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto">
              {children}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SpotlightOverlay;