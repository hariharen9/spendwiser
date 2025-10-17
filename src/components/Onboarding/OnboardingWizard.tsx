import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Target, 
  TrendingUp, 
  PieChart,
  CreditCard,
  Calendar,
  CheckCircle,
  Rocket,
  DollarSign,
  Receipt,
  BarChart3,
  Zap,
  Star,
  Landmark,
  Calculator
} from 'lucide-react';
import GamifiedProgress from './GamifiedProgress';
import SpotlightOverlay from './SpotlightOverlay';
import confetti from 'canvas-confetti';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  hasLoadedMockData?: boolean;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
  spotlight?: {
    selector: string;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose, onComplete, hasLoadedMockData = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset modal state when it opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsCompleting(false);
      setShowSpotlight(false);
    }
  }, [isOpen]);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to SpendWiser! 🎉',
      description: 'Your personal Financial Co-pilot is ready for takeoff',
      icon: Rocket,
      content: (
        <div className="text-center space-y-6">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
            {hasLoadedMockData 
              ? "We've loaded sample data to help you explore. Let's take a quick tour!"
              : "Let's explore the key features that will help you manage your finances better."
            }
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {[
              { icon: DollarSign, label: 'Track', color: 'text-green-500' },
              { icon: BarChart3, label: 'Analyze', color: 'text-blue-500' },
              { icon: Target, label: 'Achieve', color: 'text-purple-500' }
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center space-y-2">
                <div className={`w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Your Financial Command Center',
      description: 'Everything you need at a glance',
      icon: PieChart,
      content: (
        <div className="space-y-4 md:space-y-6 px-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 md:p-6 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Dashboard Highlights</h4>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <PieChart className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </motion.div>
            </div>
            
            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">Real-time Insights</h5>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Live financial metrics</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">Smart Analytics</h5>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Spending patterns & trends</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <Sparkles className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              💡 Pro Tip: All widgets are drag-and-droppable! Customize your perfect layout.
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Your dashboard adapts to your needs - move widgets around, hide what you don't need, and create the perfect financial overview.
            </p>
          </motion.div>
        </div>
      )
    },
    {
      id: 'transactions',
      title: 'Smart Transaction Tracking',
      description: 'Every penny, perfectly organized',
      icon: Receipt,
      content: (
        <div className="space-y-4 md:space-y-6 px-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 md:p-6 rounded-xl border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              >
                <Receipt className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </motion.div>
              <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Intelligent Features</h4>
            </div>
            
            <div className="grid gap-3">
              {[
                { icon: CheckCircle, text: 'Auto-categorization with smart suggestions', delay: 0.4 },
                { icon: CheckCircle, text: 'Recurring transactions (bills, subscriptions)', delay: 0.6 },
                { icon: CheckCircle, text: 'Advanced filtering & search capabilities', delay: 0.8 },
                { icon: CheckCircle, text: 'CSV import/export for bulk operations', delay: 1.0 }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: item.delay }}
                  className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
                >
                  <item.icon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-900 dark:text-white">Quick Add</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Use the floating action button (FAB) to quickly add transactions from anywhere in the app!
            </p>
          </motion.div>
        </div>
      )
    },
    {
      id: 'budgets',
      title: 'Intelligent Budgeting',
      description: 'Stay on track with smart spending limits',
      icon: Target,
      content: (
        <div className="space-y-4 md:space-y-6 px-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 p-4 md:p-6 rounded-xl border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                <h4 className="font-semibold text-base md:text-lg text-gray-900 dark:text-white">Budget Progress</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Food & Dining</span>
                    <span className="text-gray-900 dark:text-white font-semibold">₹2,250 / ₹6,000</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 md:h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '37.5%' }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="bg-green-500 h-2.5 md:h-3 rounded-full relative overflow-hidden"
                    >
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    </motion.div>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">37.5% used • On track!</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Shopping</span>
                    <span className="text-gray-900 dark:text-white font-semibold">₹3,500 / ₹7,000</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 md:h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '50%' }}
                      transition={{ delay: 0.7, duration: 1 }}
                      className="bg-yellow-500 h-2.5 md:h-3 rounded-full relative overflow-hidden"
                    >
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    </motion.div>
                  </div>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">50% used • Watch spending</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              <span className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">Smart Alerts</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
              Get notified when you're approaching budget limits and receive personalized spending insights!
            </p>
          </motion.div>
        </div>
      )
    },
    {
      id: 'goals',
      title: 'Financial Goals & Dreams',
      description: 'Turn your aspirations into achievements',
      icon: Target,
      content: (
        <div className="space-y-4 md:space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 md:p-6 rounded-xl"
          >
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-3xl md:text-4xl">✈️</span>
              <div>
                <h4 className="font-semibold text-base md:text-lg text-gray-900 dark:text-white">Vacation to Japan</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Target: ₹3,00,000</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '25%' }}
                transition={{ delay: 0.5, duration: 1.5 }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">₹75,000 saved • 25% complete</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">Track Progress</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
              Set savings goals, track your progress, and celebrate milestones as you work towards your dreams!
            </p>
          </motion.div>
        </div>
      )
    },
    {
      id: 'loans',
      title: 'EMI & Loan Management',
      description: 'Master your debt and plan your payoff strategy',
      icon: Landmark,
      content: (
        <div className="space-y-4 md:space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 md:p-6 rounded-xl border border-orange-200 dark:border-orange-800"
          >
            <div className="flex items-center space-x-3 mb-4">
              <motion.div
                animate={{ 
                  rotate: [0, -5, 5, 0],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center"
              >
                <Landmark className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h4 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Smart Loan Tracking</h4>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Manage all your EMIs in one place</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Home Loan</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">8% • 20 years</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>EMI: ₹25,097/month</span>
                  <span>Principal: ₹30,00,000</span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">Car Loan</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">9.5% • 7 years</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span>EMI: ₹13,003/month</span>
                  <span>Principal: ₹8,00,000</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">EMI Calculator</span>
            </div>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
              Use our interactive loan simulator to calculate prepayments, compare scenarios, and see how much interest you can save!
            </p>
          </motion.div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'You\'re All Set! 🚀',
      description: 'Ready to take control of your finances',
      icon: CheckCircle,
      content: (
        <div className="text-center space-y-4 md:space-y-6 px-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              Welcome to your financial journey!
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              You can clear the sample data anytime from Settings and start fresh with your own transactions.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium">
              💡 Pro Tip: Start by adding your first real transaction to begin your financial tracking journey!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 gap-3 max-w-md mx-auto"
          >
            {[
              { emoji: '📊', label: 'Dashboard', color: 'from-blue-400 to-blue-600' },
              { emoji: '💳', label: 'Transactions', color: 'from-purple-400 to-purple-600' },
              { emoji: '🎯', label: 'Budgets', color: 'from-green-400 to-green-600' },
              { emoji: '🏦', label: 'EMIs', color: 'from-orange-400 to-orange-600' }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                className={`p-3 rounded-lg bg-gradient-to-br ${item.color} text-white text-center`}
              >
                <div className="text-2xl mb-1">{item.emoji}</div>
                <div className="text-xs font-medium">{item.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    // Trigger confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#007BFF', '#28A745', '#FFC107', '#DC3545', '#6F42C1']
    });
    
    // Add a small delay for the completion animation
    setTimeout(() => {
      onComplete();
      onClose();
    }, 1500);
  };

  const handleSkip = () => {
    setCurrentStep(0);
    setIsCompleting(false);
    onClose();
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  const stepTitles = ['Welcome', 'Dashboard', 'Transactions', 'Budgets', 'Goals', 'EMIs', 'Complete'];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm z-50 p-2 md:p-4 overflow-y-auto"
        onClick={(e) => e.target === e.currentTarget && handleSkip()}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl my-auto mx-auto border border-gray-200 dark:border-gray-700 flex flex-col max-h-[calc(100vh-1rem)] md:max-h-[calc(100vh-2rem)]"
          ref={modalRef}
        >
          {/* Simplified Header */}
          <div className="relative p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <motion.button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
              aria-label="Skip onboarding"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
            
            {/* Simple Progress Bar */}
            <div className="mb-6 pr-12">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                />
              </div>
            </div>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </div>

          {/* Simplified Content Area */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <div className="p-6 min-h-[250px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  {steps[currentStep].content}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Simplified Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {/* Simple Step Dots */}
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-blue-500 w-6'
                        : index < currentStep
                        ? 'bg-blue-300 dark:bg-blue-700 w-2'
                        : 'bg-gray-300 dark:bg-gray-600 w-2'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={isCompleting}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                  currentStep === steps.length - 1
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <span>
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                </span>
                {isCompleting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingWizard;