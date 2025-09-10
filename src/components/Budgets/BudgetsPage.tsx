import React from 'react';
import { Target, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import { Budget } from '../../types/types';

interface BudgetsPageProps {
  budgets: Budget[];
  onEditBudget: (budget: Budget) => void;
  onAddBudget: () => void;
  onDeleteBudget: (id: string) => void;
}

const BudgetsPage: React.FC<BudgetsPageProps> = ({ budgets, onEditBudget, onAddBudget, onDeleteBudget }) => {
  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-[#007BFF] rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-[#888888]">Total Budgeted</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                ₹{budgets.reduce((sum, b) => sum + b.limit, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-[#00C9A7] rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-[#888888]">Total Spent</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                ₹{budgets.reduce((sum, b) => sum + b.spent, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">Budget Categories</h3>
          <button 
            onClick={onAddBudget}
            className="flex items-center space-x-2 bg-[#00C9A7] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#00B8A0] transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Budget</span>
          </button>
        </div>
        <div className="space-y-6">
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.limit) * 100;
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80;

            return (
              <div key={budget.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-[#F5F5F5]">{budget.category}</h4>
                    <p className="text-sm text-gray-500 dark:text-[#888888]">
                      ₹{budget.spent} of ₹{budget.limit} spent
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        isOverBudget
                          ? 'text-[#DC3545]'
                          : isNearLimit
                          ? 'text-[#FFC107]'
                          : 'text-[#28A745]'
                      }`}>
                        {Math.round(percentage)}%
                      </span>
                      <p className="text-sm text-gray-500 dark:text-[#888888]">
                        ₹{budget.limit - budget.spent} remaining
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                       <button onClick={() => onEditBudget(budget)} className="p-2 text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] rounded-lg transition-all duration-200">
                          <Edit className="h-4 w-4" />
                       </button>
                       <button onClick={() => onDeleteBudget(budget.id)} className="p-2 text-gray-500 dark:text-[#888888] hover:text-red-500 dark:hover:text-[#DC3545] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] rounded-lg transition-all duration-200">
                          <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-[#1A1A1A] rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isOverBudget
                        ? 'bg-[#DC3545]'
                        : isNearLimit
                        ? 'bg-gradient-to-r from-[#FFC107] to-[#DC3545]'
                        : 'bg-gradient-to-r from-[#00C9A7] to-[#007BFF]'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>

                {isOverBudget && (
                  <p className="text-xs text-[#DC3545] font-medium">
                    Over budget by ₹{budget.spent - budget.limit}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetsPage;
