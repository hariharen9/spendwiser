import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Star, MessageSquare, Heart } from 'lucide-react';
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
        transition: { duration: 0.5, type: "spring", stiffness: 300 }
      });
    } else {
      starControls.start({
        rotate: 0,
        scale: 1,
        transition: { duration: 0.3, type: "spring", stiffness: 300 }
      });
    }
  }, [isHovered, starControls]);

  return (
    <motion.div 
      variants={fadeInVariants} 
      initial="initial"
      animate="animate"
      className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Heart size={120} />
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Heart className="text-pink-400 fill-current" size={24} />
          <span>Loving SpendWiser?</span>
        </h3>
        <p className="mb-6 text-blue-100 font-medium max-w-sm">
          Your support fuels our development. Star us on GitHub or send us your thoughts!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onOpenFeedbackModal}
            className="flex-1 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold py-3 px-4 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} />
            <span>Send Feedback</span>
          </button>
          
          <motion.a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white text-blue-600 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div animate={starControls}>
              <Star size={18} className="fill-current" />
            </motion.div>
            <span>Star Project</span>
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

export default FeedbackAndSupport;
