import React, { useState } from 'react';
import { Transaction, Account } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInVariants, staggerContainer, slideInRightVariants } from '../../components/Common/AnimationVariants';
import { Edit, Trash2, MessageSquare, Receipt, MapPin, Tag, Calendar, CreditCard, Repeat, ArrowRight, X, Clock } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onSaveTransaction: (transaction: Omit<Transaction, 'id'>, id: string) => void;
  onDeleteTransaction: (id: string) => void;
  currency: string;
  categories: string[];
  accounts: Account[];
  selectedTransactions: string[];
  setSelectedTransactions: React.Dispatch<React.SetStateAction<string[]>>;
}

const ReceiptPanel: React.FC<{
  transaction: Transaction | null;
  onClose: () => void;
  currency: string;
  accountName?: string;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ transaction, onClose, currency, accountName, onEdit, onDelete }) => {
  if (!transaction) return null;

  return (
    <motion.div 
      className="fixed inset-y-0 right-0 w-full md:w-96 bg-gray-100 dark:bg-black z-50 shadow-2xl flex flex-col"
      variants={slideInRightVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="p-4 flex justify-between items-center bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Receipt size={18} />
          Digital Receipt
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="bg-white text-gray-900 shadow-xl rounded-sm overflow-hidden relative mb-6">
          {/* Serrated Edge Top */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gray-800 opacity-5" style={{ backgroundImage: 'linear-gradient(45deg, transparent 75%, white 75%), linear-gradient(-45deg, transparent 75%, white 75%)', backgroundSize: '10px 10px' }}></div>
          
          <div className="p-8 text-center border-b border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-gray-400">
              {transaction.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-black mb-1">{transaction.name}</h2>
            <p className="text-sm text-gray-500 font-mono uppercase tracking-widest">{new Date(transaction.date).toLocaleDateString()}</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Amount</span>
              <span className={`text-3xl font-black ${transaction.type === 'expense' ? 'text-gray-900' : 'text-green-600'}`}>
                {transaction.type === 'expense' ? '-' : '+'}{currency}{Math.abs(transaction.amount).toLocaleString()}
              </span>
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm">
                <Tag size={16} className="text-gray-400" />
                <span className="font-medium">{transaction.category}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CreditCard size={16} className="text-gray-400" />
                <span className="font-medium">{accountName || 'Cash / Unknown Account'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-gray-400" />
                <span className="font-medium">{new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {transaction.isRecurring && (
                <div className="flex items-center gap-3 text-sm text-blue-600">
                  <Repeat size={16} />
                  <span className="font-bold">Recurring Payment</span>
                </div>
              )}
            </div>

            {transaction.comments && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm italic text-gray-600">
                "{transaction.comments}"
              </div>
            )}
          </div>

          {/* Barcode Mockup */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col items-center gap-2">
            <div className="h-8 w-4/5 bg-gray-800 opacity-20" style={{ maskImage: 'repeating-linear-gradient(90deg, black, black 2px, transparent 2px, transparent 4px)' }}></div>
            <p className="text-[10px] font-mono text-gray-400">{transaction.id.toUpperCase()}</p>
          </div>

          {/* Serrated Edge Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-white" style={{ background: 'linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)', backgroundSize: '10px 10px', backgroundPosition: '0 10px' }}></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onEdit}
            className="flex items-center justify-center gap-2 p-4 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Edit size={18} />
            Edit
          </button>
          <button 
            onClick={onDelete}
            className="flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl font-bold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const TransactionRow: React.FC<{
  transaction: Transaction;
  currency: string;
  account?: Account;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}> = ({ transaction, currency, account, isSelected, onSelect, onClick }) => {
  return (
    <motion.div 
      layout
      variants={fadeInVariants}
      whileHover={{ scale: 1.005, backgroundColor: "rgba(0,0,0,0.02)" }}
      className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
        isSelected 
          ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' 
          : 'bg-white dark:bg-[#1A1A1A] border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
      }`}
      onClick={onClick}
    >
      {/* Checkbox (Visible on hover or selected) */}
      <div 
        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}>
          {isSelected && <ArrowRight size={12} className="text-white rotate-45" />}
        </div>
      </div>

      {/* Category Icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${isSelected ? 'opacity-0' : 'opacity-100 group-hover:opacity-0'} bg-gray-100 dark:bg-gray-800`}>
        {transaction.category.charAt(0)}
      </div>

      <div className="flex-1 min-w-0 ml-2 group-hover:ml-8 transition-all duration-200">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-gray-900 dark:text-white truncate">{transaction.name}</h4>
          {transaction.isRecurring && (
            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[10px] font-bold rounded uppercase">
              Recurring
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          <span className="font-medium">{transaction.category}</span>
          {account && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CreditCard size={10} />
                {account.name}
              </span>
            </>
          )}
          {transaction.comments && (
            <>
              <span>•</span>
              <MessageSquare size={10} />
            </>
          )}
        </div>
      </div>

      <div className="text-right">
        <span className={`block font-bold text-lg ${transaction.type === 'income' ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
          {transaction.type === 'income' ? '+' : ''}{currency}{Math.abs(transaction.amount).toLocaleString()}
        </span>
        <span className="text-xs text-gray-400 font-medium">
          {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};

const SmartTransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  currency,
  accounts,
  selectedTransactions,
  setSelectedTransactions
}) => {
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  // Sort dates (newest first)
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const handleSelect = (id: string) => {
    setSelectedTransactions(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {sortedDates.map((date, index) => (
          <motion.div 
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
            </div>
            
            <div className="space-y-3">
              {groupedTransactions[date].map(t => (
                <TransactionRow 
                  key={t.id}
                  transaction={t}
                  currency={currency}
                  account={accounts.find(a => a.id === t.accountId)}
                  isSelected={selectedTransactions.includes(t.id)}
                  onSelect={() => handleSelect(t.id)}
                  onClick={() => setViewingTransaction(t)}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {viewingTransaction && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingTransaction(null)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <ReceiptPanel 
              transaction={viewingTransaction}
              onClose={() => setViewingTransaction(null)}
              currency={currency}
              accountName={accounts.find(a => a.id === viewingTransaction.accountId)?.name}
              onEdit={() => {
                setViewingTransaction(null);
                onEditTransaction(viewingTransaction);
              }}
              onDelete={() => {
                if (window.confirm("Are you sure you want to delete this transaction?")) {
                  onDeleteTransaction(viewingTransaction.id);
                  setViewingTransaction(null);
                }
              }}
            />
          </>
        )}
      </AnimatePresence>

      {transactions.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p>No transactions found for this period.</p>
        </div>
      )}
    </div>
  );
};

export default SmartTransactionTable;