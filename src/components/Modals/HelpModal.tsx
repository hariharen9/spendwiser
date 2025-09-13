import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../components/Common/AnimationVariants';
import { X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: string;
}

const helpContent: { [key: string]: { title: string; content: React.ReactNode; quote: string } } = {
  transactions: {
    title: 'Case File: The Missing Money',
    content: (
      <div className="space-y-4">
        <p>Welcome, Detective! Your mission, should you choose to accept it, is to figure out where all your money has vanished. This page is your investigation board.</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>The Search Bar:</strong> Your trusty magnifying glass. Use it to hunt down specific transactions.</li>
          <li><strong>Filters:</strong> Interrogate your data. Filter by income, expense, category, or date to narrow down the suspects.</li>
          <li><strong>Sorting (Mobile):</strong> On mobile, you can sort your evidence by date, amount, or category to spot patterns.</li>
          <li><strong>Add/Edit/Delete:</strong> Plant evidence, alter testimonies, or make a transaction disappear entirely. With great power comes great responsibility.</li>
        </ul>
      </div>
    ),
    quote: "Trying to understand my transactions is like trying to solve a Rubik's Cube in the dark. But hey, at least the colors are pretty.",
  },
  'credit-cards': {
    title: 'Taming the Plastic Beasts',
    content: (
      <div className="space-y-4">
        <p>Here in the wild safari of your wallet, you can track the most ferocious of beasts: the Credit Card. Handle with care.</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Add a New Card:</strong> Introduce a new beast to the enclosure. Give it a name and a spending limit (a cage, if you will).</li>
          <li><strong>Track Spending:</strong> Watch in awe (or horror) as the total spend for each card climbs.</li>
          <li><strong>Edit/Delete:</strong> Made a mistake? Or perhaps a beast has been tamed (paid off)? You can edit its details or release it back into the wild.</li>
        </ul>
      </div>
    ),
    quote: "My credit card has a higher travel history than I do. I'm not sure whether to be proud or concerned.",
  },
  budgets: {
    title: 'The Financial Diet Plan',
    content: (
      <div className="space-y-4">
        <p>Think of this as your financial diet. It's not about starving your wallet, but about making healthier choices. And yes, you can have a cheat day.</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Total Monthly Budget:</strong> Set your overall calorie limit for the month. Don't worry, we'll remind you when you're close to the edge.</li>
          <li><strong>Category Budgets:</strong> Assign a spending diet to each category. How much are you allowed to spend on 'Eating Out' this month?</li>
          <li><strong>Progress Bars:</strong> Visually track your diet's progress. Green is good, red means you might need to hit the financial gym.</li>
        </ul>
      </div>
    ),
    quote: "A budget is a mathematical confirmation of your suspicions.",
  },
  goals: {
    title: 'Your Treasure Map',
    content: (
      <div className="space-y-4">
        <p>X marks the spot! This is your treasure map to riches, or at least to that new thing you really want. Let the adventure begin!</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Create a New Goal:</strong> What treasure are you hunting? A new laptop? A trip to the Bahamas? Give it a name, a target amount, and an emoji.</li>
          <li><strong>Track Your Progress:</strong> Watch your treasure chest fill up as you get closer to your goal.</li>
          <li><strong>Add Funds:</strong> Found some spare change? Add it to your treasure chest. Every little bit counts!</li>
        </ul>
      </div>
    ),
    quote: "I have a goal to be a millionaire. Not because I want the money, but because I want to see the look on my bank's face.",
  },
};

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, page }) => {
  const { title, content, quote } = helpContent[page] || { title: 'Help', content: 'No help available for this page.', quote: "I built this whole app and still have no idea where my money goes. But at least now I can watch it disappear in style." };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-lg"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">{title}</h2>
              <button onClick={onClose} className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5]">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 text-gray-700 dark:text-gray-300">
              {content}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm italic text-gray-500 dark:text-gray-400">"{quote}"</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">- Hariharen</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HelpModal;