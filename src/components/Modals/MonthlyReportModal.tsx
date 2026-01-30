import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart,
  CreditCard,
  Landmark,
  Lightbulb,
  ChevronDown,
  BarChart3,
  List,
  Layers,
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { modalVariants, fadeInVariants, staggerContainer } from '../Common/AnimationVariants';
import { Transaction, Account, Budget, Loan } from '../../types/types';
import {
  filterTransactionsByMonth,
  calculateSummary,
  calculateCategoryBreakdown,
  calculateCreditCardSpending,
  calculateLoanPayments,
  calculateBudgetPerformance,
  generateInsights,
  generateMonthOptions,
  formatCurrency,
  getCategoryColor,
  groupTransactionsByDate,
  groupTransactionsByCategory,
} from '../../lib/monthlyReport';
import { TimezoneManager } from '../../lib/timezone';
import jsPDF from 'jspdf';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  loans: Loan[];
  currency: string;
  userCategories: string[];
  darkMode: boolean;
}

const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  accounts,
  budgets,
  loans,
  currency,
  darkMode,
}) => {
  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [transactionViewMode, setTransactionViewMode] = useState<'date' | 'category' | 'summary'>('date');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Filter transactions for the selected month
  const monthlyTransactions = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  // Calculate all report data
  const summary = useMemo(() => calculateSummary(monthlyTransactions), [monthlyTransactions]);
  const expenseBreakdown = useMemo(
    () => calculateCategoryBreakdown(monthlyTransactions, 'expense'),
    [monthlyTransactions]
  );
  const incomeBreakdown = useMemo(
    () => calculateCategoryBreakdown(monthlyTransactions, 'income'),
    [monthlyTransactions]
  );
  const creditCardSpending = useMemo(
    () => calculateCreditCardSpending(monthlyTransactions, accounts),
    [monthlyTransactions, accounts]
  );
  const loanPayments = useMemo(
    () => calculateLoanPayments(monthlyTransactions, loans),
    [monthlyTransactions, loans]
  );
  const budgetPerformance = useMemo(
    () => calculateBudgetPerformance(monthlyTransactions, budgets),
    [monthlyTransactions, budgets]
  );
  const insights = useMemo(
    () => generateInsights(monthlyTransactions, selectedMonth),
    [monthlyTransactions, selectedMonth]
  );

  // Grouped transactions
  const transactionsByDate = useMemo(
    () => groupTransactionsByDate(monthlyTransactions),
    [monthlyTransactions]
  );
  const transactionsByCategory = useMemo(
    () => groupTransactionsByCategory(monthlyTransactions),
    [monthlyTransactions]
  );

  // Top 5 expense categories for charts
  const topCategories = expenseBreakdown.slice(0, 5);
  const bottomCategories = expenseBreakdown.slice(-5).reverse();

  // Pie chart data
  const pieChartData = expenseBreakdown.slice(0, 8).map((cat, index) => ({
    name: cat.category,
    value: cat.amount,
    color: getCategoryColor(index),
  }));

  // Get selected month label
  const selectedMonthLabel = monthOptions.find(opt => opt.value === selectedMonth)?.label || '';

  // Helper function to format currency for PDF (without symbol for alignment)
  const formatPDFCurrency = (amount: number): string => {
    return Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Handle PDF generation - Professional Bank Statement Style
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // Colors
      const primaryColor: [number, number, number] = [0, 123, 255]; // Blue
      const textDark: [number, number, number] = [33, 37, 41];
      const textMuted: [number, number, number] = [108, 117, 125];
      const successColor: [number, number, number] = [40, 167, 69];
      const dangerColor: [number, number, number] = [220, 53, 69];
      const borderColor: [number, number, number] = [222, 226, 230];

      // Helper to add new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPos + requiredHeight > pageHeight - 20) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Helper to draw a horizontal line
      const drawLine = (y: number, color: [number, number, number] = borderColor) => {
        pdf.setDrawColor(...color);
        pdf.setLineWidth(0.3);
        pdf.line(margin, y, pageWidth - margin, y);
      };

      // ==================== HEADER ====================
      // Header background
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, pageWidth, 35, 'F');

      // Logo/Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SpendWiser', margin, 18);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Monthly Financial Statement', margin, 26);

      // Statement Period (right aligned)
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(selectedMonthLabel, pageWidth - margin, 18, { align: 'right' });

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const generatedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      pdf.text(`Generated: ${generatedDate}`, pageWidth - margin, 26, { align: 'right' });

      yPos = 45;

      // ==================== ACCOUNT SUMMARY ====================
      pdf.setFillColor(248, 249, 250);
      pdf.rect(margin, yPos, contentWidth, 35, 'F');
      pdf.setDrawColor(...borderColor);
      pdf.rect(margin, yPos, contentWidth, 35, 'S');

      pdf.setTextColor(...textDark);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ACCOUNT SUMMARY', margin + 5, yPos + 8);

      // Summary boxes
      const boxWidth = contentWidth / 3;

      // Income
      pdf.setFontSize(9);
      pdf.setTextColor(...textMuted);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Total Income', margin + 5, yPos + 18);
      pdf.setFontSize(14);
      pdf.setTextColor(...successColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${currency}${formatPDFCurrency(summary.totalIncome)}`, margin + 5, yPos + 28);

      // Expenses
      pdf.setFontSize(9);
      pdf.setTextColor(...textMuted);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Total Expenses', margin + boxWidth + 5, yPos + 18);
      pdf.setFontSize(14);
      pdf.setTextColor(...dangerColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${currency}${formatPDFCurrency(summary.totalExpenses)}`, margin + boxWidth + 5, yPos + 28);

      // Net Savings
      pdf.setFontSize(9);
      pdf.setTextColor(...textMuted);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Net Savings', margin + (boxWidth * 2) + 5, yPos + 18);
      pdf.setFontSize(14);
      pdf.setTextColor(...(summary.netSavings >= 0 ? successColor : dangerColor));
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${summary.netSavings >= 0 ? '' : '-'}${currency}${formatPDFCurrency(summary.netSavings)}`, margin + (boxWidth * 2) + 5, yPos + 28);

      yPos += 45;

      // ==================== SPENDING BY CATEGORY ====================
      checkPageBreak(60);

      pdf.setTextColor(...textDark);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SPENDING BY CATEGORY', margin, yPos);
      yPos += 8;

      drawLine(yPos);
      yPos += 5;

      // Table header
      pdf.setFillColor(248, 249, 250);
      pdf.rect(margin, yPos, contentWidth, 7, 'F');

      pdf.setFontSize(8);
      pdf.setTextColor(...textMuted);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CATEGORY', margin + 3, yPos + 5);
      pdf.text('TRANSACTIONS', margin + 80, yPos + 5);
      pdf.text('AMOUNT', pageWidth - margin - 3, yPos + 5, { align: 'right' });
      pdf.text('%', pageWidth - margin - 30, yPos + 5, { align: 'right' });

      yPos += 10;

      // Category rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      const categoriesToShow = expenseBreakdown.slice(0, 10);
      categoriesToShow.forEach((cat, index) => {
        checkPageBreak(8);

        if (index % 2 === 1) {
          pdf.setFillColor(252, 252, 252);
          pdf.rect(margin, yPos - 3, contentWidth, 7, 'F');
        }

        pdf.setTextColor(...textDark);
        pdf.text(cat.category.substring(0, 25), margin + 3, yPos + 2);
        pdf.setTextColor(...textMuted);
        pdf.text(cat.count.toString(), margin + 80, yPos + 2);
        pdf.text(`${cat.percentage.toFixed(1)}%`, pageWidth - margin - 30, yPos + 2, { align: 'right' });
        pdf.setTextColor(...dangerColor);
        pdf.text(`${currency}${formatPDFCurrency(cat.amount)}`, pageWidth - margin - 3, yPos + 2, { align: 'right' });

        yPos += 7;
      });

      if (expenseBreakdown.length > 10) {
        pdf.setTextColor(...textMuted);
        pdf.setFontSize(8);
        pdf.text(`... and ${expenseBreakdown.length - 10} more categories`, margin + 3, yPos + 2);
        yPos += 7;
      }

      drawLine(yPos);
      yPos += 10;

      // ==================== TRANSACTION HISTORY ====================
      checkPageBreak(50);

      pdf.setTextColor(...textDark);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TRANSACTION HISTORY', margin, yPos);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...textMuted);
      pdf.text(`(${monthlyTransactions.length} transactions)`, margin + 55, yPos);
      yPos += 8;

      drawLine(yPos);
      yPos += 5;

      // Table header
      pdf.setFillColor(248, 249, 250);
      pdf.rect(margin, yPos, contentWidth, 7, 'F');

      pdf.setFontSize(8);
      pdf.setTextColor(...textMuted);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DATE', margin + 3, yPos + 5);
      pdf.text('DESCRIPTION', margin + 28, yPos + 5);
      pdf.text('CATEGORY', margin + 95, yPos + 5);
      pdf.text('AMOUNT', pageWidth - margin - 3, yPos + 5, { align: 'right' });

      yPos += 10;

      // Sort transactions by date (newest first)
      const sortedTransactions = [...monthlyTransactions].sort((a, b) => {
        return TimezoneManager.compareDates(b.date, a.date);
      });

      // Transaction rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);

      let runningBalance = 0;
      sortedTransactions.forEach((txn, index) => {
        checkPageBreak(7);

        if (index % 2 === 1) {
          pdf.setFillColor(252, 252, 252);
          pdf.rect(margin, yPos - 3, contentWidth, 6, 'F');
        }

        const txnDate = new Date(TimezoneManager.normalizeDate(txn.date));
        const dateStr = txnDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

        pdf.setTextColor(...textMuted);
        pdf.text(dateStr, margin + 3, yPos + 1);

        pdf.setTextColor(...textDark);
        const truncatedName = txn.name.length > 30 ? txn.name.substring(0, 27) + '...' : txn.name;
        pdf.text(truncatedName, margin + 28, yPos + 1);

        pdf.setTextColor(...textMuted);
        const truncatedCategory = txn.category.length > 15 ? txn.category.substring(0, 12) + '...' : txn.category;
        pdf.text(truncatedCategory, margin + 95, yPos + 1);

        const amount = Math.abs(txn.amount);
        const amountStr = `${txn.type === 'income' ? '+' : '-'}${currency}${formatPDFCurrency(amount)}`;
        pdf.setTextColor(...(txn.type === 'income' ? successColor : dangerColor));
        pdf.text(amountStr, pageWidth - margin - 3, yPos + 1, { align: 'right' });

        runningBalance += txn.type === 'income' ? amount : -amount;
        yPos += 6;
      });

      drawLine(yPos);
      yPos += 5;

      // Transaction totals
      pdf.setFillColor(248, 249, 250);
      pdf.rect(margin, yPos, contentWidth, 14, 'F');

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...textDark);
      pdf.text('PERIOD TOTALS', margin + 3, yPos + 5);

      pdf.setTextColor(...successColor);
      pdf.text(`Income: ${currency}${formatPDFCurrency(summary.totalIncome)}`, margin + 60, yPos + 5);

      pdf.setTextColor(...dangerColor);
      pdf.text(`Expenses: ${currency}${formatPDFCurrency(summary.totalExpenses)}`, margin + 60, yPos + 11);

      pdf.setTextColor(...(summary.netSavings >= 0 ? successColor : dangerColor));
      pdf.text(`Net: ${summary.netSavings >= 0 ? '+' : ''}${currency}${formatPDFCurrency(summary.netSavings)}`, pageWidth - margin - 3, yPos + 8, { align: 'right' });

      yPos += 20;

      // ==================== CREDIT CARD SUMMARY (if any) ====================
      const cardsWithSpending = creditCardSpending.filter(c => c.spending > 0);
      if (cardsWithSpending.length > 0) {
        checkPageBreak(40);

        pdf.setTextColor(...textDark);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CREDIT CARD SUMMARY', margin, yPos);
        yPos += 8;

        drawLine(yPos);
        yPos += 5;

        pdf.setFillColor(248, 249, 250);
        pdf.rect(margin, yPos, contentWidth, 7, 'F');

        pdf.setFontSize(8);
        pdf.setTextColor(...textMuted);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CARD', margin + 3, yPos + 5);
        pdf.text('TRANSACTIONS', margin + 70, yPos + 5);
        pdf.text('UTILIZATION', margin + 100, yPos + 5);
        pdf.text('SPENT', pageWidth - margin - 3, yPos + 5, { align: 'right' });

        yPos += 10;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);

        cardsWithSpending.forEach((card, index) => {
          checkPageBreak(7);

          if (index % 2 === 1) {
            pdf.setFillColor(252, 252, 252);
            pdf.rect(margin, yPos - 3, contentWidth, 7, 'F');
          }

          pdf.setTextColor(...textDark);
          const cardDisplay = card.last4Digits ? `${card.cardName} ****${card.last4Digits}` : card.cardName;
          pdf.text(cardDisplay.substring(0, 30), margin + 3, yPos + 2);

          pdf.setTextColor(...textMuted);
          pdf.text(card.transactionCount.toString(), margin + 70, yPos + 2);
          pdf.text(card.limit > 0 ? `${card.utilization.toFixed(1)}%` : 'N/A', margin + 100, yPos + 2);

          pdf.setTextColor(...dangerColor);
          pdf.text(`${currency}${formatPDFCurrency(card.spending)}`, pageWidth - margin - 3, yPos + 2, { align: 'right' });

          yPos += 7;
        });

        drawLine(yPos);
        yPos += 10;
      }

      // ==================== BUDGET PERFORMANCE (if any) ====================
      if (budgetPerformance.length > 0) {
        checkPageBreak(40);

        pdf.setTextColor(...textDark);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('BUDGET PERFORMANCE', margin, yPos);
        yPos += 8;

        drawLine(yPos);
        yPos += 5;

        pdf.setFillColor(248, 249, 250);
        pdf.rect(margin, yPos, contentWidth, 7, 'F');

        pdf.setFontSize(8);
        pdf.setTextColor(...textMuted);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CATEGORY', margin + 3, yPos + 5);
        pdf.text('BUDGET', margin + 70, yPos + 5);
        pdf.text('SPENT', margin + 100, yPos + 5);
        pdf.text('STATUS', pageWidth - margin - 3, yPos + 5, { align: 'right' });

        yPos += 10;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);

        budgetPerformance.forEach((budget, index) => {
          checkPageBreak(7);

          if (index % 2 === 1) {
            pdf.setFillColor(252, 252, 252);
            pdf.rect(margin, yPos - 3, contentWidth, 7, 'F');
          }

          pdf.setTextColor(...textDark);
          pdf.text(budget.category.substring(0, 25), margin + 3, yPos + 2);

          pdf.setTextColor(...textMuted);
          pdf.text(`${currency}${formatPDFCurrency(budget.limit)}`, margin + 70, yPos + 2);
          pdf.text(`${currency}${formatPDFCurrency(budget.spent)}`, margin + 100, yPos + 2);

          const statusColor = budget.status === 'over' ? dangerColor : budget.status === 'near' ? [255, 193, 7] as [number, number, number] : successColor;
          const statusText = budget.status === 'over' ? 'OVER BUDGET' : budget.status === 'near' ? 'NEAR LIMIT' : 'ON TRACK';
          pdf.setTextColor(...statusColor);
          pdf.text(statusText, pageWidth - margin - 3, yPos + 2, { align: 'right' });

          yPos += 7;
        });

        drawLine(yPos);
        yPos += 10;
      }

      // ==================== INSIGHTS ====================
      checkPageBreak(45);

      pdf.setTextColor(...textDark);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MONTHLY INSIGHTS', margin, yPos);
      yPos += 8;

      drawLine(yPos);
      yPos += 8;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');

      const insightItems: [string, string][] = [];

      if (insights.highestSpendingDay) {
        const dateStr = new Date(insights.highestSpendingDay.date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        });
        insightItems.push(['Highest Spending Day', `${dateStr} (${currency}${formatPDFCurrency(insights.highestSpendingDay.amount)})`]);
      }

      if (insights.mostUsedCategory) {
        insightItems.push(['Most Frequent Category', `${insights.mostUsedCategory.category} (${insights.mostUsedCategory.count} transactions)`]);
      }

      if (insights.largestExpense) {
        insightItems.push(['Largest Expense', `${insights.largestExpense.name} (${currency}${formatPDFCurrency(insights.largestExpense.amount)})`]);
      }

      insightItems.push(['Average Daily Spending', `${currency}${formatPDFCurrency(insights.averageDailySpending)}`]);
      insightItems.push(['Average Transaction', `${currency}${formatPDFCurrency(insights.averageTransaction)}`]);
      insightItems.push(['Savings Rate', `${summary.savingsRate.toFixed(1)}%`]);

      insightItems.forEach(([label, value]) => {
        checkPageBreak(7);
        pdf.setTextColor(...textMuted);
        pdf.text(label + ':', margin + 3, yPos);
        pdf.setTextColor(...textDark);
        pdf.text(value, margin + 60, yPos);
        yPos += 6;
      });

      // ==================== FOOTER ====================
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Footer line
        pdf.setDrawColor(...borderColor);
        pdf.setLineWidth(0.3);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

        // Footer text
        pdf.setFontSize(8);
        pdf.setTextColor(...textMuted);
        pdf.setFont('helvetica', 'normal');
        pdf.text('This statement is for informational purposes only.', margin, pageHeight - 10);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });

        pdf.setFontSize(7);
        pdf.text('Generated by SpendWiser | www.spendwiser.app', pageWidth / 2, pageHeight - 6, { align: 'center' });
      }

      // Set document metadata
      pdf.setProperties({
        title: `SpendWiser Statement - ${selectedMonthLabel}`,
        author: 'SpendWiser',
        subject: 'Monthly Financial Statement',
        keywords: 'finance, budget, expenses, income, statement',
        creator: 'SpendWiser Financial App',
      });

      // Save PDF
      const [year, month] = selectedMonth.split('-');
      const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleString('default', { month: 'short' });
      pdf.save(`SpendWiser_Statement_${monthName}_${year}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-6xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242424] sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                    Monthly Report
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                    Comprehensive financial summary
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Month Selector */}
                <div className="relative">
                  <motion.button
                    onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
                      {selectedMonthLabel}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 sm:hidden">
                      {selectedMonthLabel.split(' ')[0].slice(0, 3)}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </motion.button>

                  <AnimatePresence>
                    {isMonthDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#242424] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-60 overflow-y-auto"
                        data-lenis-prevent
                      >
                        {monthOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSelectedMonth(option.value);
                              setIsMonthDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              selectedMonth === option.value
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Download PDF Button */}
                <motion.button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGeneratingPDF ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium hidden sm:inline">
                    {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                  </span>
                </motion.button>

                {/* Close Button */}
                <motion.button
                  onClick={onClose}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-[#1A1A1A]"
              data-lenis-prevent
            >
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                {/* Summary Cards */}
                <motion.div variants={fadeInVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Income Card */}
                  <div className="bg-white dark:bg-[#242424] rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {summary.incomeCount} transactions
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Income</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(summary.totalIncome, currency)}
                    </p>
                  </div>

                  {/* Expenses Card */}
                  <div className="bg-white dark:bg-[#242424] rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {summary.expenseCount} transactions
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(summary.totalExpenses, currency)}
                    </p>
                  </div>

                  {/* Net Savings Card */}
                  <div className="bg-white dark:bg-[#242424] rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <PiggyBank className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        summary.savingsRate >= 20
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : summary.savingsRate >= 0
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {summary.savingsRate.toFixed(1)}% saved
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Net Savings</p>
                    <p className={`text-2xl font-bold ${
                      summary.netSavings >= 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {summary.netSavings >= 0 ? '' : '-'}
                      {formatCurrency(summary.netSavings, currency)}
                    </p>
                  </div>
                </motion.div>

                {/* Category Breakdown */}
                <motion.div
                  variants={fadeInVariants}
                  className="bg-white dark:bg-[#242424] rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <PieChart className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">
                      Expense Breakdown
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <div className="h-64">
                      {pieChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => formatCurrency(value, currency)}
                              contentStyle={{
                                backgroundColor: darkMode ? '#242424' : '#FFFFFF',
                                border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                                borderRadius: '8px',
                              }}
                              labelStyle={{ color: darkMode ? '#F5F5F5' : '#111827' }}
                              itemStyle={{ color: darkMode ? '#F5F5F5' : '#111827' }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                          No expense data for this month
                        </div>
                      )}
                    </div>

                    {/* Category List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto" data-lenis-prevent>
                      {expenseBreakdown.map((cat, index) => (
                        <div
                          key={cat.category}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getCategoryColor(index) }}
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-[#F5F5F5]">
                                {cat.category}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {cat.count} transaction{cat.count !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5]">
                              {formatCurrency(cat.amount, currency)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {cat.percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                      {expenseBreakdown.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                          No expenses recorded
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Top & Bottom Categories */}
                <motion.div
                  variants={fadeInVariants}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                  {/* Top 5 Spending Categories */}
                  <div className="bg-white dark:bg-[#242424] rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">
                      Top Spending Categories
                    </h3>
                    <div className="h-48">
                      {topCategories.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topCategories.map((cat, i) => ({
                              name: cat.category.length > 10 ? cat.category.slice(0, 10) + '...' : cat.category,
                              amount: cat.amount,
                              fill: getCategoryColor(i),
                            }))}
                            layout="vertical"
                            margin={{ left: 0, right: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                            <XAxis type="number" hide />
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={80}
                              tick={{ fontSize: 12, fill: darkMode ? '#9CA3AF' : '#6B7280' }}
                            />
                            <Tooltip
                              formatter={(value: number) => formatCurrency(value, currency)}
                              contentStyle={{
                                backgroundColor: darkMode ? '#242424' : '#FFFFFF',
                                border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                                borderRadius: '8px',
                              }}
                              labelStyle={{ color: darkMode ? '#F5F5F5' : '#111827' }}
                              itemStyle={{ color: darkMode ? '#F5F5F5' : '#111827' }}
                            />
                            <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                              {topCategories.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={getCategoryColor(index)} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                          No data available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom 5 Spending Categories */}
                  <div className="bg-white dark:bg-[#242424] rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">
                      Lowest Spending Categories
                    </h3>
                    <div className="h-48">
                      {bottomCategories.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={bottomCategories.map((cat, i) => ({
                              name: cat.category.length > 10 ? cat.category.slice(0, 10) + '...' : cat.category,
                              amount: cat.amount,
                              fill: getCategoryColor(i + 5),
                            }))}
                            layout="vertical"
                            margin={{ left: 0, right: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                            <XAxis type="number" hide />
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={80}
                              tick={{ fontSize: 12, fill: darkMode ? '#9CA3AF' : '#6B7280' }}
                            />
                            <Tooltip
                              formatter={(value: number) => formatCurrency(value, currency)}
                              contentStyle={{
                                backgroundColor: darkMode ? '#242424' : '#FFFFFF',
                                border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                                borderRadius: '8px',
                              }}
                              labelStyle={{ color: darkMode ? '#F5F5F5' : '#111827' }}
                              itemStyle={{ color: darkMode ? '#F5F5F5' : '#111827' }}
                            />
                            <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                              {bottomCategories.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={getCategoryColor(index + 5)} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                          No data available
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Transactions List */}
                <motion.div
                  variants={fadeInVariants}
                  className="bg-white dark:bg-[#242424] rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <List className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">
                        All Transactions
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({monthlyTransactions.length})
                      </span>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 sm:p-1 rounded-lg">
                      <button
                        onClick={() => setTransactionViewMode('date')}
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                          transactionViewMode === 'date'
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <span className="hidden sm:inline">By </span>Date
                      </button>
                      <button
                        onClick={() => setTransactionViewMode('category')}
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                          transactionViewMode === 'category'
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <span className="hidden sm:inline">By </span>Category
                      </button>
                      <button
                        onClick={() => setTransactionViewMode('summary')}
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                          transactionViewMode === 'summary'
                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        Summary
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-4" data-lenis-prevent>
                    {transactionViewMode === 'date' ? (
                      Array.from(transactionsByDate.entries()).map(([date, txns]) => (
                        <div key={date}>
                          <div className="sticky top-0 bg-white dark:bg-[#242424] py-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              {new Date(date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {txns.map((txn) => (
                              <div
                                key={txn.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-[#F5F5F5]">
                                    {txn.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {txn.category}
                                  </p>
                                </div>
                                <p
                                  className={`text-sm font-semibold ${
                                    txn.type === 'income'
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}
                                >
                                  {txn.type === 'income' ? '+' : '-'}
                                  {formatCurrency(txn.amount, currency)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : transactionViewMode === 'category' ? (
                      Array.from(transactionsByCategory.entries()).map(([category, txns]) => {
                        const total = txns.reduce((sum, t) => sum + Math.abs(t.amount), 0);
                        return (
                          <div key={category}>
                            <div className="sticky top-0 bg-white dark:bg-[#242424] py-2 flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {category}
                              </p>
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {formatCurrency(total, currency)}
                              </p>
                            </div>
                            <div className="space-y-2">
                              {txns.map((txn) => (
                                <div
                                  key={txn.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-[#F5F5F5]">
                                      {txn.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {new Date(TimezoneManager.normalizeDate(txn.date)).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </p>
                                  </div>
                                  <p
                                    className={`text-sm font-semibold ${
                                      txn.type === 'income'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`}
                                  >
                                    {txn.type === 'income' ? '+' : '-'}
                                    {formatCurrency(txn.amount, currency)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      /* Summary View - Category-wise totals table */
                      <div className="space-y-3">
                        {/* Expenses Summary */}
                        <div>
                          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5]">
                              Expenses by Category
                            </h4>
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">
                              {formatCurrency(summary.totalExpenses, currency)}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            {expenseBreakdown.map((cat, index) => (
                              <div
                                key={cat.category}
                                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getCategoryColor(index) }}
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-[#F5F5F5]">
                                      {cat.category}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {cat.count} transaction{cat.count !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                    {formatCurrency(cat.amount, currency)}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {cat.percentage.toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            ))}
                            {expenseBreakdown.length === 0 && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 py-2 text-center">
                                No expenses this month
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 dark:border-gray-700 my-4" />

                        {/* Income Summary */}
                        <div>
                          <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5]">
                              Income by Category
                            </h4>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(summary.totalIncome, currency)}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            {incomeBreakdown.map((cat, index) => (
                              <div
                                key={cat.category}
                                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getCategoryColor(index + 6) }}
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-[#F5F5F5]">
                                      {cat.category}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {cat.count} transaction{cat.count !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    {formatCurrency(cat.amount, currency)}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {cat.percentage.toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            ))}
                            {incomeBreakdown.length === 0 && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 py-2 text-center">
                                No income this month
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Net Summary */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                          <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5]">
                              Net Balance
                            </span>
                            <span className={`text-lg font-bold ${
                              summary.netSavings >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {summary.netSavings >= 0 ? '+' : ''}{formatCurrency(summary.netSavings, currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {monthlyTransactions.length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No transactions for this month
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Credit Card Spending */}
                {creditCardSpending.length > 0 && (
                  <motion.div
                    variants={fadeInVariants}
                    className="bg-white dark:bg-[#242424] rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <CreditCard className="h-5 w-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">
                        Credit Card Spending
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {creditCardSpending.map((card) => (
                        <div
                          key={card.cardId}
                          className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">
                                {card.cardName}
                              </p>
                              {card.last4Digits && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  **** {card.last4Digits}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 dark:text-[#F5F5F5]">
                                {formatCurrency(card.spending, currency)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {card.transactionCount} transactions
                              </p>
                            </div>
                          </div>
                          {card.limit > 0 && (
                            <div>
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                <span>Utilization</span>
                                <span>{card.utilization.toFixed(1)}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    card.utilization >= 80
                                      ? 'bg-red-500'
                                      : card.utilization >= 50
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(card.utilization, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Loan Payments */}
                {loanPayments.some(lp => lp.paymentsMade > 0) && (
                  <motion.div
                    variants={fadeInVariants}
                    className="bg-white dark:bg-[#242424] rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <Landmark className="h-5 w-5 text-orange-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">
                        Loan Payments
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                            <th className="pb-2 font-medium">Loan</th>
                            <th className="pb-2 font-medium text-right">EMI</th>
                            <th className="pb-2 font-medium text-right">Payments</th>
                            <th className="pb-2 font-medium text-right">Total Paid</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {loanPayments
                            .filter(lp => lp.paymentsMade > 0)
                            .map((loan) => (
                              <tr key={loan.loanId} className="border-b border-gray-100 dark:border-gray-800">
                                <td className="py-3 text-gray-900 dark:text-[#F5F5F5]">{loan.loanName}</td>
                                <td className="py-3 text-right text-gray-600 dark:text-gray-300">
                                  {formatCurrency(loan.emi, currency)}
                                </td>
                                <td className="py-3 text-right text-gray-600 dark:text-gray-300">
                                  {loan.paymentsMade}
                                </td>
                                <td className="py-3 text-right font-semibold text-gray-900 dark:text-[#F5F5F5]">
                                  {formatCurrency(loan.totalPaid, currency)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* Budget Performance */}
                {budgetPerformance.length > 0 && (
                  <motion.div
                    variants={fadeInVariants}
                    className="bg-white dark:bg-[#242424] rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <div className="flex items-center space-x-2 mb-4">
                      <Layers className="h-5 w-5 text-indigo-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">
                        Budget Performance
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {budgetPerformance.map((budget) => (
                        <div key={budget.category}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-[#F5F5F5]">
                              {budget.category}
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              budget.status === 'over'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : budget.status === 'near'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}>
                              {budget.status === 'over' ? 'Over budget' : budget.status === 'near' ? 'Near limit' : 'On track'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>{formatCurrency(budget.spent, currency)} of {formatCurrency(budget.limit, currency)}</span>
                            <span>{budget.percentage.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                budget.status === 'over'
                                  ? 'bg-red-500'
                                  : budget.status === 'near'
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Insights */}
                <motion.div
                  variants={fadeInVariants}
                  className="bg-white dark:bg-[#242424] rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">
                      Insights
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Highest Spending Day */}
                    {insights.highestSpendingDay && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Highest Spending Day</p>
                        <p className="font-semibold text-gray-900 dark:text-[#F5F5F5]">
                          {new Date(insights.highestSpendingDay.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {formatCurrency(insights.highestSpendingDay.amount, currency)}
                        </p>
                      </div>
                    )}

                    {/* Most Used Category */}
                    {insights.mostUsedCategory && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Most Used Category</p>
                        <p className="font-semibold text-gray-900 dark:text-[#F5F5F5]">
                          {insights.mostUsedCategory.category}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {insights.mostUsedCategory.count} transactions
                        </p>
                      </div>
                    )}

                    {/* Largest Expense */}
                    {insights.largestExpense && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Largest Expense</p>
                        <p className="font-semibold text-gray-900 dark:text-[#F5F5F5] truncate">
                          {insights.largestExpense.name}
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {formatCurrency(insights.largestExpense.amount, currency)}
                        </p>
                      </div>
                    )}

                    {/* Average Daily Spending */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Average Daily Spending</p>
                      <p className="font-semibold text-gray-900 dark:text-[#F5F5F5]">
                        {formatCurrency(insights.averageDailySpending, currency)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        per day
                      </p>
                    </div>

                    {/* Average Transaction */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Average Transaction</p>
                      <p className="font-semibold text-gray-900 dark:text-[#F5F5F5]">
                        {formatCurrency(insights.averageTransaction, currency)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        per expense
                      </p>
                    </div>

                    {/* Weekday vs Weekend */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Weekday vs Weekend</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Weekdays</p>
                          <p className="font-semibold text-gray-900 dark:text-[#F5F5F5]">
                            {formatCurrency(insights.weekdayVsWeekend.weekdaySpending, currency)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Weekends</p>
                          <p className="font-semibold text-gray-900 dark:text-[#F5F5F5]">
                            {formatCurrency(insights.weekdayVsWeekend.weekendSpending, currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MonthlyReportModal;
