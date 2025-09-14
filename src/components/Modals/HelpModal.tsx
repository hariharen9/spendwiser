import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../components/Common/AnimationVariants';
import { X, HelpCircle } from 'lucide-react';

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
  loans: {
    title: 'Mastering Your Loans: Pay Less, Pay Faster',
    content: (
      <div className="space-y-4">
        <p>Welcome to your personal loan command center! This section helps you track your loans and provides powerful strategies to pay them off faster, saving you a significant amount in interest.</p>
        <h4 className="font-semibold text-gray-900 dark:text-white">Understanding Your Loan Details:</h4>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Loan Amount:</strong> The initial principal borrowed.</li>
          <li><strong>Interest Rate:</strong> The annual interest rate on your loan.</li>
          <li><strong>Tenure:</strong> The original duration of your loan in years.</li>
          <li><strong>EMI:</strong> Your Equated Monthly Installment, the fixed amount you pay each month.</li>
          <li><strong>Start Date:</strong> The date your loan commenced.</li>
        </ul>
        <h4 className="font-semibold text-gray-900 dark:text-white">Accelerate Your Repayment with Smart Strategies:</h4>
        <p>Our simulator allows you to see the impact of two powerful prepayment strategies:</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>Pay 1 Extra EMI Every Year:</strong> By making just one additional EMI payment annually towards your principal, you can significantly reduce your loan tenure and total interest paid. This extra payment directly reduces your principal, meaning less interest accrues over time.</li>
          <li><strong>Increase Your EMI by a Fixed Percentage Annually:</strong> As your income grows, consider increasing your monthly EMI by a small percentage (e.g., 7.5%) each year. This consistent increase accelerates principal reduction, drastically cutting down your loan tenure and overall interest burden.</li>
          <li><strong>Combine Both Approaches:</strong> For maximum impact, apply both strategies simultaneously. This aggressive approach can help you become debt-free in a fraction of the original time.</li>
        </ul>
        <h4 className="font-semibold text-gray-900 dark:text-white">How the Simulator Works:</h4>
        <p>Simply select a loan, then toggle the "Pay 1 Extra EMI Every Year" checkbox and/or enter a percentage for "Annual EMI Increase." The simulator will instantly show you:</p>
        <ul className="list-disc list-inside space-y-2">
          <li><strong>New Plan End Date:</strong> Your projected loan end date with the applied strategies.</li>
          <li><strong>New Plan Total Interest:</strong> The total interest you'll pay under the new plan.</li>
          <li><strong>Interest Saved:</strong> The significant amount of interest you'll save compared to your original plan.</li>
          <li><strong>Debt-Free Earlier:</strong> How many years and months sooner you'll be free from debt!</li>
        </ul>

      </div>
    ),
    quote: "The best way to get out of debt is to stop digging.",
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
            className="bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5] flex items-center">
                <HelpCircle className="mr-2 h-6 w-6 text-blue-500" />
                {title}
              </h2>
              <button 
                onClick={onClose} 
                className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 text-gray-700 dark:text-gray-300 overflow-y-auto flex-grow">
              {content}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 text-center flex-shrink-0">
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