import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { modalVariants } from '../Common/AnimationVariants';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
  isLoading: boolean;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setFeedbackText('');
      setHoverRating(0);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, feedbackText);
    } else {
      // Optionally show a toast or error message if no rating is given
      console.log('Please provide a star rating.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Close modal when clicking outside
        >
          <motion.div
            className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">We Value Your Feedback!</h2>
              <button
                onClick={onClose}
                className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-gray-700 dark:text-gray-300 text-center">How would you rate your experience with SpendWiser?</p>
              
              <div className="flex justify-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 cursor-pointer transition-colors
                      ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>

              <textarea
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Tell us what you think... (optional)"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              ></textarea>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors rounded-lg"
                  disabled={isLoading}
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-[#007BFF] text-white rounded-lg font-medium hover:bg-[#0056b3] transition-colors disabled:opacity-50"
                  disabled={isLoading || rating === 0}
                >
                  {isLoading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;