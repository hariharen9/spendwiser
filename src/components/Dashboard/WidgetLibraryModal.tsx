import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  X, 
  Eye, 
  EyeOff, 
  Search, 
  Grid, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Wallet, 
  Target, 
  Calendar,
  Brain,
  Award,
  CreditCard,
  DollarSign,
  Clock,
  Activity,
  GripVertical
} from 'lucide-react';
import { modalVariants, fadeInVariants, buttonHoverVariants } from '../Common/AnimationVariants';

interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'Analytics' | 'Financial' | 'Tracking' | 'Insights';
  color: string;
}

interface WidgetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleWidgets: string[];
  hiddenWidgets: string[];
  onToggleWidget: (widgetId: string) => void;
  onReorderWidgets: (reorderedIds: string[]) => void;
}

// Sortable Widget Item Component
interface SortableWidgetItemProps {
  widget: WidgetConfig;
  isVisible: boolean;
  onToggle: (widgetId: string) => void;
}

const SortableWidgetItem: React.FC<SortableWidgetItemProps> = ({ widget, isVisible, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#1A1A1A] transition-all hover:scale-[1.02] ${
        isDragging ? 'opacity-50 z-50' : ''
      } ${
        !isVisible ? 'border-dashed opacity-75' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Drag Handle */}
          {isVisible && (
            <div
              {...attributes}
              {...listeners}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-grab active:cursor-grabbing mt-1"
            >
              <GripVertical size={16} />
            </div>
          )}
          
          <div className={`p-2 rounded-lg ${widget.color} text-white ${!isVisible ? 'opacity-60' : ''}`}>
            {widget.icon}
          </div>
          
          <div className="flex-1">
            <h4 className={`font-medium ${
              isVisible ? 'text-gray-900 dark:text-[#F5F5F5]' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {widget.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">
              {widget.description}
            </p>
            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
              isVisible 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {widget.category}
            </span>
          </div>
        </div>
        
        <motion.button
          onClick={() => onToggle(widget.id)}
          className={`p-2 rounded-lg transition-colors ${
            isVisible
              ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
              : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
          variants={buttonHoverVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
        </motion.button>
      </div>
    </div>
  );
};

const WIDGET_CONFIGS: WidgetConfig[] = [
  {
    id: 'SpendingChart',
    name: 'Spending Chart',
    description: 'Interactive pie/bar charts showing category-wise spending breakdown',
    icon: <PieChart size={20} />,
    category: 'Analytics',
    color: 'bg-blue-500'
  },
  {
    id: 'RecentTransactions',
    name: 'Recent Transactions',
    description: 'Latest transaction history with quick access to details',
    icon: <Clock size={20} />,
    category: 'Tracking',
    color: 'bg-green-500'
  },
  {
    id: 'IncomeVsExpenseChart',
    name: 'Income vs Expenses',
    description: 'Monthly comparison of income against expenses',
    icon: <BarChart3 size={20} />,
    category: 'Analytics',
    color: 'bg-purple-500'
  },
  {
    id: 'TopSpendingCategories',
    name: 'Top Categories',
    description: 'Your highest spending categories ranked by amount',
    icon: <TrendingUp size={20} />,
    category: 'Analytics',
    color: 'bg-orange-500'
  },
  {
    id: 'BudgetSummary',
    name: 'Budget Summary',
    description: 'Overview of all budget categories with progress tracking',
    icon: <Target size={20} />,
    category: 'Financial',
    color: 'bg-red-500'
  },
  {
    id: 'AccountBalances',
    name: 'Account Balances',
    description: 'All your account balances in one place',
    icon: <Wallet size={20} />,
    category: 'Financial',
    color: 'bg-indigo-500'
  },
  {
    id: 'DaysOfBuffer',
    name: 'Days of Buffer',
    description: 'Financial runway calculation based on current spending',
    icon: <Calendar size={20} />,
    category: 'Insights',
    color: 'bg-teal-500'
  },
  {
    id: 'FutureBalanceProjection',
    name: 'Balance Projection',
    description: 'Predictive balance forecasting for upcoming months',
    icon: <Activity size={20} />,
    category: 'Insights',
    color: 'bg-cyan-500'
  },
  {
    id: 'CashFlowForecast',
    name: 'Cash Flow Forecast',
    description: 'Future cash flow predictions and trends',
    icon: <TrendingUp size={20} />,
    category: 'Insights',
    color: 'bg-emerald-500'
  },
  {
    id: 'LifestyleCreepIndicator',
    name: 'Lifestyle Creep',
    description: 'Monitor gradual increases in spending patterns',
    icon: <Activity size={20} />,
    category: 'Insights',
    color: 'bg-yellow-500'
  },
  {
    id: 'InsightsEngine',
    name: 'AI Insights',
    description: 'Personalized financial recommendations and alerts',
    icon: <Brain size={20} />,
    category: 'Insights',
    color: 'bg-pink-500'
  },
  {
    id: 'SubscriptionTracker',
    name: 'Subscriptions',
    description: 'Track and manage recurring payments and subscriptions',
    icon: <CreditCard size={20} />,
    category: 'Tracking',
    color: 'bg-violet-500'
  },
  {
    id: 'Achievements',
    name: 'Achievements',
    description: 'Financial milestones and gamified progress tracking',
    icon: <Award size={20} />,
    category: 'Tracking',
    color: 'bg-amber-500'
  },
  {
    id: 'TotalBudgetWidget',
    name: 'Monthly Budget',
    description: 'Overall monthly budget tracking and progress',
    icon: <DollarSign size={20} />,
    category: 'Financial',
    color: 'bg-rose-500'
  }
];

const WidgetLibraryModal: React.FC<WidgetLibraryModalProps> = ({
  isOpen,
  onClose,
  visibleWidgets,
  hiddenWidgets,
  onToggleWidget,
  onReorderWidgets
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const categories = ['All', 'Analytics', 'Financial', 'Tracking', 'Insights'];

  const filteredWidgets = WIDGET_CONFIGS.filter(widget => {
    const matchesSearch = widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         widget.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || widget.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort visible widgets according to the current order
  const visibleFilteredWidgets = visibleWidgets
    .map(id => WIDGET_CONFIGS.find(w => w.id === id))
    .filter((widget): widget is WidgetConfig => {
      return widget !== undefined && filteredWidgets.some(fw => fw.id === widget.id);
    });

  const hiddenFilteredWidgets = filteredWidgets.filter(widget => 
    hiddenWidgets.includes(widget.id)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = visibleWidgets.indexOf(active.id as string);
    const newIndex = visibleWidgets.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedIds = arrayMove(visibleWidgets, oldIndex, newIndex);
      onReorderWidgets(reorderedIds);
    }
  };

  const activeWidget = activeId ? WIDGET_CONFIGS.find(w => w.id === activeId) : null;

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
            className="bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-5xl max-h-[90vh] shadow-2xl"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                  Widget Library
                </h2>
                <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">
                  Manage your dashboard widgets - show, hide, and organize them as you like
                </p>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* Search and Filter */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search widgets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[#F5F5F5] placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visible Widgets */}
                <div>
                  <motion.h3 
                    className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4 flex items-center gap-2"
                    variants={fadeInVariants}
                  >
                    <Eye size={20} className="text-green-500" />
                    Visible Widgets ({visibleFilteredWidgets.length})
                  </motion.h3>
                  
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={visibleFilteredWidgets.map(w => w.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {visibleFilteredWidgets.map((widget) => (
                          <SortableWidgetItem
                            key={widget.id}
                            widget={widget}
                            isVisible={true}
                            onToggle={onToggleWidget}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    
                    <DragOverlay>
                      {activeWidget ? (
                        <div className="p-4 border border-blue-400 rounded-lg bg-white dark:bg-[#1A1A1A] shadow-2xl opacity-90 transform scale-105">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${activeWidget.color} text-white`}>
                              {activeWidget.icon}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-[#F5F5F5]">
                                {activeWidget.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-[#888888]">
                                {activeWidget.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                  
                  {visibleFilteredWidgets.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-[#888888]">
                      No visible widgets match your criteria
                    </div>
                  )}
                </div>

                {/* Hidden Widgets */}
                <div>
                  <motion.h3 
                    className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4 flex items-center gap-2"
                    variants={fadeInVariants}
                  >
                    <EyeOff size={20} className="text-gray-500" />
                    Hidden Widgets ({hiddenFilteredWidgets.length})
                  </motion.h3>
                  <div className="space-y-3">
                    {hiddenFilteredWidgets.map((widget) => (
                      <SortableWidgetItem
                        key={widget.id}
                        widget={widget}
                        isVisible={false}
                        onToggle={onToggleWidget}
                      />
                    ))}
                    {hiddenFilteredWidgets.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-[#888888]">
                        All widgets are currently visible
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1A1A] rounded-b-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>💡 <strong>Tips:</strong></p>
                <p>• Drag the grip handle to reorder visible widgets</p>
                <p>• Click the eye icon to show/hide widgets</p>
                <p>• Use search and filters to find specific widgets</p>
                <p>• Widget order in dashboard matches the order here</p>
              </div>
              <motion.button
                onClick={onClose}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WidgetLibraryModal;