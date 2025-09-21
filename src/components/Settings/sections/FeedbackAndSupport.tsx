
import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Star, MessageSquare } from 'lucide-react';
import { fadeInVariants, buttonHoverVariants } from '../../Common/AnimationVariants';

interface FeedbackAndSupportProps {
  onOpenFeedbackModal: () => void;
}

const FeedbackAndSupport: React.FC<FeedbackAndSupportProps> = ({ onOpenFeedbackModal }) => {
  const GITHUB_REPO_URL = 'https://github.com/hariharen9/Spendwiser';
  const starControls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) {
      starControls.start({
        rotate: 360,
        scale: 1.2,
        transition: {
          duration: 0.5,
          type: "spring",
          stiffness: 300
        }
      });
    } else {
      starControls.start({
        rotate: 0,
        scale: 1,
        transition: {
          duration: 0.3,
          type: "spring",
          stiffness: 300
        }
      });
    }
  }, [isHovered, starControls]);

  return (
    <motion.div 
      variants={fadeInVariants} 
      className="bg-white dark:bg-[#242424] backdrop-blur-lg border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-lg text-gray-800 dark:text-white"
    >
      <h3 className="text-lg font-bold mb-2">Enjoying SpendWiser?</h3>
      <p className="mb-4 opacity-80 text-sm">
        Your feedback and support help us make the app better for everyone.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={onOpenFeedbackModal}
          className="flex-1 bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:shadow-blue-500/50"
        >
          <MessageSquare size={16} />
          <span className="text-sm">Give Feedback</span>
        </button>
        <motion.a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 px-3 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center gap-2 shadow-2xl shadow-yellow-500/70"
          variants={buttonHoverVariants} // Apply button hover variants
          whileHover="hover"
          whileTap="tap"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div // Wrap Star in a motion.div for more control
            animate={starControls}
          >
            <Star size={16} />
          </motion.div>
          <span className="text-sm">Star on GitHub</span>
        </motion.a>
      </div>
    </motion.div>
  );
};

export default FeedbackAndSupport;
