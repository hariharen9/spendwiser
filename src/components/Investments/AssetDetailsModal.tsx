import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../Common/AnimationVariants';
import {
  X, TrendingUp, TrendingDown, Edit, Trash2, Plus, Minus,
  ArrowUpRight, ArrowDownRight, Calendar, DollarSign, Clock,
  ChevronRight, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import { Asset, InvestmentTransaction, AssetWithMetrics, ASSET_TYPE_CONFIG, PriceHistoryPoint } from '../../types/investments';
import AnimatedNumber from '../Common/AnimatedNumber';

interface AssetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  transactions: InvestmentTransaction[];
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
  onTrade: (type: 'BUY' | 'SELL' | 'DIVIDEND') => void;
}

const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({
  isOpen,
  onClose,
  asset,
  transactions,
  currency,
  onEdit,
  onDelete,
  onTrade,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);

  // Calculate metrics
  const metrics: AssetWithMetrics | null = useMemo(() => {
    if (!asset) return null;

    const currentValue = asset.quantity * asset.currentPrice;
    const investedValue = asset.quantity * asset.avgBuyPrice;
    const unrealizedPL = currentValue - investedValue;
    const unrealizedPLPercent = investedValue > 0 ? (unrealizedPL / investedValue) * 100 : 0;

    return {
      ...asset,
      currentValue,
      investedValue,
      unrealizedPL,
      unrealizedPLPercent,
    };
  }, [asset]);

  // Sort transactions by date (newest first)
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  // Calculate realized P&L from sell transactions
  const realizedPL = useMemo(() => {
    return transactions
      .filter(t => t.type === 'SELL')
      .reduce((sum, t) => sum + (t.totalAmount - t.quantity * (asset?.avgBuyPrice || 0)), 0);
  }, [transactions, asset]);

  // Dividends received
  const dividendsReceived = useMemo(() => {
    return transactions
      .filter(t => t.type === 'DIVIDEND' || t.type === 'INTEREST')
      .reduce((sum, t) => sum + t.totalAmount, 0);
  }, [transactions]);

  if (!asset || !metrics) return null;

  const isPositive = metrics.unrealizedPL >= 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl text-2xl ${
                    asset.type === 'CRYPTO' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    asset.type === 'STOCK' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    asset.type === 'GOLD' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    asset.type === 'FIXED_INCOME' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                    'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {ASSET_TYPE_CONFIG[asset.type].icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {asset.symbol || asset.name}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">{asset.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onEdit}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Current Value */}
              <div className="mt-6">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  <AnimatedNumber value={metrics.currentValue} currency={currency} decimals={2} />
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isPositive
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    {isPositive ? '+' : ''}{metrics.unrealizedPLPercent.toFixed(2)}%
                  </span>
                  <span className={`text-sm ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositive ? '+' : ''}{currency}{metrics.unrealizedPL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'transactions'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Transactions ({transactions.length})
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[400px] overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Quantity</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                          {asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Current Price</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                          {currency}{asset.currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Avg. Buy Price</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                          {currency}{asset.avgBuyPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Invested</p>
                        <p className="text-xl font-semibold text-gray-900 dark:text-white">
                          {currency}{metrics.investedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* P&L Breakdown */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Profit & Loss</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Unrealized P&L</span>
                          <span className={`font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isPositive ? '+' : ''}{currency}{metrics.unrealizedPL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Realized P&L</span>
                          <span className={`font-medium ${realizedPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {realizedPL >= 0 ? '+' : ''}{currency}{realizedPL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        {dividendsReceived > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Dividends/Interest</span>
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              +{currency}{dividendsReceived.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fixed Income specific info */}
                    {asset.type === 'FIXED_INCOME' && asset.interestRate && (
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                        <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Fixed Income Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-emerald-600 dark:text-emerald-400">Interest Rate</p>
                            <p className="font-semibold text-emerald-800 dark:text-emerald-200">{asset.interestRate}% p.a.</p>
                          </div>
                          {asset.maturityDate && (
                            <div>
                              <p className="text-emerald-600 dark:text-emerald-400">Maturity Date</p>
                              <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                                {new Date(asset.maturityDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Last Updated */}
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      Last updated: {new Date(asset.lastUpdated).toLocaleString()}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'transactions' && (
                  <motion.div
                    key="transactions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {sortedTransactions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No transactions recorded yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedTransactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                tx.type === 'BUY' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                tx.type === 'SELL' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                                'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                              }`}>
                                {tx.type === 'BUY' && <Plus className="w-4 h-4" />}
                                {tx.type === 'SELL' && <Minus className="w-4 h-4" />}
                                {(tx.type === 'DIVIDEND' || tx.type === 'INTEREST') && <DollarSign className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{tx.type}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(tx.date).toLocaleDateString()}
                                  {tx.quantity > 0 && ` • ${tx.quantity} @ ${currency}${tx.pricePerUnit}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                tx.type === 'BUY' ? 'text-red-600 dark:text-red-400' :
                                'text-emerald-600 dark:text-emerald-400'
                              }`}>
                                {tx.type === 'BUY' ? '-' : '+'}{currency}{tx.totalAmount.toLocaleString()}
                              </p>
                              {tx.fees > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Fee: {currency}{tx.fees}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => onTrade('BUY')}
                className="flex-1 py-3 px-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Buy
              </button>
              <button
                onClick={() => onTrade('SELL')}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Minus className="w-5 h-5" />
                Sell
              </button>
              <button
                onClick={() => onTrade('DIVIDEND')}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                Dividend
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssetDetailsModal;
