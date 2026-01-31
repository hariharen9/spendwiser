import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../Common/AnimationVariants';
import {
  X, Plus, Minus, DollarSign, Calendar, ArrowUpRight,
  ArrowDownRight, Calculator, Info, AlertTriangle
} from 'lucide-react';
import { Asset, InvestmentTransaction, InvestmentTransactionType, ASSET_TYPE_CONFIG } from '../../types/investments';
import { Account } from '../../types/types';
import CurrencyInput from '../Common/CurrencyInput';
import AccountDropdown from '../Common/AccountDropdown';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<InvestmentTransaction, 'id'>, updateAsset: { quantity: number; avgBuyPrice: number }) => void;
  asset: Asset | null;
  tradeType: 'BUY' | 'SELL' | 'DIVIDEND';
  accounts: Account[];
  currency?: string;
}

const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  asset,
  tradeType,
  accounts,
  currency = '₹',
}) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [pricePerUnit, setPricePerUnit] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [fees, setFees] = useState<number>(0);
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [calcMode, setCalcMode] = useState<'quantity' | 'total'>('quantity');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && asset) {
      setQuantity(0);
      setPricePerUnit(asset.currentPrice || asset.avgBuyPrice || 0);
      setTotalAmount(0);
      setFees(0);
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setSelectedAccountId(accounts[0]?.id || '');
      setCalcMode('quantity');
    }
  }, [isOpen, asset, accounts]);

  // Calculate total from quantity and price
  useEffect(() => {
    if (calcMode === 'quantity' && quantity > 0 && pricePerUnit > 0) {
      setTotalAmount(quantity * pricePerUnit + (tradeType === 'BUY' ? fees : -fees));
    }
  }, [quantity, pricePerUnit, fees, calcMode, tradeType]);

  // Calculate quantity from total and price
  useEffect(() => {
    if (calcMode === 'total' && totalAmount > 0 && pricePerUnit > 0) {
      const effectiveTotal = tradeType === 'BUY' ? totalAmount - fees : totalAmount + fees;
      setQuantity(effectiveTotal / pricePerUnit);
    }
  }, [totalAmount, pricePerUnit, fees, calcMode, tradeType]);

  // Calculate new average buy price for BUY transactions
  const newAvgBuyPrice = useMemo(() => {
    if (!asset || tradeType !== 'BUY' || quantity <= 0) return asset?.avgBuyPrice || 0;

    const currentValue = asset.quantity * asset.avgBuyPrice;
    const newValue = quantity * pricePerUnit;
    const newTotalQuantity = asset.quantity + quantity;

    return newTotalQuantity > 0 ? (currentValue + newValue) / newTotalQuantity : 0;
  }, [asset, tradeType, quantity, pricePerUnit]);

  // Validate sell quantity
  const sellQuantityValid = tradeType !== 'SELL' || (asset && quantity <= asset.quantity);

  // Calculate realized P&L for SELL
  const realizedPL = useMemo(() => {
    if (!asset || tradeType !== 'SELL' || quantity <= 0) return 0;
    return (pricePerUnit - asset.avgBuyPrice) * quantity - fees;
  }, [asset, tradeType, quantity, pricePerUnit, fees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!asset) return;

    const transaction: Omit<InvestmentTransaction, 'id'> = {
      assetId: asset.id,
      type: tradeType as InvestmentTransactionType,
      date,
      quantity: tradeType === 'DIVIDEND' ? 0 : quantity,
      pricePerUnit: tradeType === 'DIVIDEND' ? 0 : pricePerUnit,
      totalAmount: tradeType === 'DIVIDEND' ? totalAmount : Math.abs(totalAmount),
      fees,
      notes: notes || undefined,
    };

    // Calculate asset updates
    let newQuantity = asset.quantity;
    let newAvgPrice = asset.avgBuyPrice;

    if (tradeType === 'BUY') {
      newQuantity = asset.quantity + quantity;
      newAvgPrice = newAvgBuyPrice;
    } else if (tradeType === 'SELL') {
      newQuantity = asset.quantity - quantity;
      // Average price stays the same for sells
    }
    // Dividend doesn't change quantity or price

    onSave(transaction, { quantity: newQuantity, avgBuyPrice: newAvgPrice });
    onClose();
  };

  if (!asset) return null;

  const typeConfig = {
    BUY: {
      title: 'Buy',
      color: 'emerald',
      icon: Plus,
      description: `Add more ${asset.symbol || asset.name} to your portfolio`,
    },
    SELL: {
      title: 'Sell',
      color: 'red',
      icon: Minus,
      description: `Sell ${asset.symbol || asset.name} from your portfolio`,
    },
    DIVIDEND: {
      title: 'Record Dividend',
      color: 'blue',
      icon: DollarSign,
      description: `Record dividend income from ${asset.symbol || asset.name}`,
    },
  };

  const config = typeConfig[tradeType];
  const Icon = config.icon;

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
            className="bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-6 border-b border-gray-200 dark:border-gray-700 bg-${config.color}-50 dark:bg-${config.color}-900/20`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-${config.color}-100 dark:bg-${config.color}-900/30 text-${config.color}-600 dark:text-${config.color}-400`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {config.title} {asset.symbol || asset.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{config.description}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Holdings */}
              <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Current Holdings</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })} units
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">Avg. Buy Price</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currency}{asset.avgBuyPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Date
                  </span>
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#1A1A1A] dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>

              {/* Quantity and Price (not for dividends) */}
              {tradeType !== 'DIVIDEND' && (
                <>
                  {/* Calc Mode Toggle */}
                  <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setCalcMode('quantity')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        calcMode === 'quantity'
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Enter Quantity
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcMode('total')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        calcMode === 'total'
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      Enter Total
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        value={quantity || ''}
                        onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          !sellQuantityValid
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200'
                        } dark:bg-[#1A1A1A] dark:text-white focus:ring focus:ring-opacity-50`}
                        placeholder="0"
                        step="any"
                        min="0"
                        max={tradeType === 'SELL' ? asset.quantity : undefined}
                        disabled={calcMode === 'total'}
                        required
                      />
                      {!sellQuantityValid && (
                        <p className="mt-1 text-xs text-red-500 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Exceeds available quantity
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="pricePerUnit" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Price per Unit
                      </label>
                      <CurrencyInput
                        id="pricePerUnit"
                        value={pricePerUnit || ''}
                        onChange={(value) => setPricePerUnit(parseFloat(value) || 0)}
                        currency={currency}
                        className="w-full"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Total Amount */}
              <div>
                <label htmlFor="totalAmount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {tradeType === 'DIVIDEND' ? 'Dividend Amount' : 'Total Amount'}
                </label>
                <CurrencyInput
                  id="totalAmount"
                  value={totalAmount || ''}
                  onChange={(value) => setTotalAmount(parseFloat(value) || 0)}
                  currency={currency}
                  className="w-full"
                  placeholder="0"
                  disabled={tradeType !== 'DIVIDEND' && calcMode === 'quantity'}
                  required
                />
              </div>

              {/* Fees (not for dividends) */}
              {tradeType !== 'DIVIDEND' && (
                <div>
                  <label htmlFor="fees" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Fees & Charges
                  </label>
                  <CurrencyInput
                    id="fees"
                    value={fees || ''}
                    onChange={(value) => setFees(parseFloat(value) || 0)}
                    currency={currency}
                    className="w-full"
                    placeholder="0"
                  />
                </div>
              )}

              {/* Account Selection (for tracking which account money comes from/goes to) */}
              {accounts.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {tradeType === 'BUY' ? 'Pay From' : 'Receive To'}
                  </label>
                  <AccountDropdown
                    accounts={accounts}
                    selectedAccountId={selectedAccountId}
                    onSelectAccount={setSelectedAccountId}
                    currency={currency}
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#1A1A1A] dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="Add a note..."
                />
              </div>

              {/* Summary/Preview */}
              {tradeType === 'BUY' && quantity > 0 && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-2">
                    <Calculator className="w-4 h-4" />
                    <span className="font-semibold">After Purchase</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-emerald-600 dark:text-emerald-400">New Quantity</p>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                        {(asset.quantity + quantity).toLocaleString(undefined, { maximumFractionDigits: 8 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-600 dark:text-emerald-400">New Avg. Price</p>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                        {currency}{newAvgBuyPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {tradeType === 'SELL' && quantity > 0 && sellQuantityValid && (
                <div className={`p-4 border rounded-xl ${
                  realizedPL >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className={`flex items-center gap-2 mb-2 ${
                    realizedPL >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
                  }`}>
                    {realizedPL >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span className="font-semibold">Realized {realizedPL >= 0 ? 'Profit' : 'Loss'}</span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    realizedPL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {realizedPL >= 0 ? '+' : ''}{currency}{realizedPL.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Remaining: {(asset.quantity - quantity).toLocaleString(undefined, { maximumFractionDigits: 8 })} units
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!sellQuantityValid || (tradeType !== 'DIVIDEND' && quantity <= 0)}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    tradeType === 'BUY'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : tradeType === 'SELL'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {config.title}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TradeModal;
