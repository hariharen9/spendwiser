import React, { useState, useMemo } from 'react';
import { 
  CreditCard as CreditCardIcon, Plus, X, Edit, Trash2, 
  TrendingUp, TrendingDown, DollarSign, Calendar, PieChart as PieChartIcon,
  Activity, ArrowRight, CheckCircle, AlertCircle, Layers
} from 'lucide-react';
import { Account, Transaction } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants, cardHoverVariants } from '../Common/AnimationVariants';
import AnimatedDropdown from '../Common/AnimatedDropdown';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface CreditCardsPageProps {
  accounts: Account[];
  transactions: Transaction[];
  onAddAccount?: (accountData: Omit<Account, 'id'>) => void;
  onEditAccount?: (accountData: Account) => void;
  onDeleteAccount?: (id: string) => void;
  currency: string;
  onSaveTransaction?: (transaction: Omit<Transaction, 'id'>) => void;
}

// --- Helper Components ---

const NetworkIcon: React.FC<{ network?: string, className?: string }> = ({ network, className = "w-10 h-6" }) => {
  // Simple SVG or Icon replacements for networks
  switch (network?.toLowerCase()) {
    case 'visa':
      return (
        <svg viewBox="0 0 32 10" className={className} fill="currentColor">
           <path d="M12.3 0L9.1 9.9H6.8L9.9 0h2.4zm5.8 0l-2.2 9.9H13L15.2 0h2.9zm5.9 0c.9 0 1.6.4 1.6.4l-.6 1.4s-.5-.3-1-.3c-.6 0-1 .3-1 .6 0 .4.4.6.6.7.7.3 1.3.7 1.3 1.5 0 1.2-1.3 1.7-2.3 1.7-1 0-1.8-.4-1.8-.4l.6-1.5s.7.4 1.1.4c.5 0 .8-.2.8-.5 0-.4-.4-.5-.6-.6-.7-.3-1.3-.7-1.3-1.6 0-1.2 1.3-1.8 2.3-1.8h.3zm6.5 0L29.3 9.9h-2.1l-.8-4.4c-.1-.4-.3-.6-.7-.8L23 2.8l.2-.7h4.4c.6 0 1.1.4 1.2 1l.9 4.3 1.4-7.4h2.4z"/>
        </svg>
      );
    case 'mastercard':
      return (
        <svg viewBox="0 0 24 18" className={className} fill="none">
          <circle cx="7" cy="9" r="7" fill="#EB001B"/>
          <circle cx="17" cy="9" r="7" fill="#F79E1B" fillOpacity="0.8"/>
        </svg>
      );
    case 'amex':
      return <div className={`${className} bg-blue-500 rounded flex items-center justify-center text-[8px] font-bold tracking-tighter`}>AMEX</div>;
    case 'discover':
      return <div className={`${className} bg-orange-500 rounded flex items-center justify-center text-[8px] font-bold tracking-tighter`}>DISCOVER</div>;
    default:
      return <CreditCardIcon className={className} />;
  }
};

const CreditCardVisual: React.FC<{ 
  card: Account; 
  balance: number; 
  currency: string; 
  onEdit: () => void;
  onDelete: () => void;
}> = ({ card, balance, currency, onEdit, onDelete }) => {
  // Generate a consistent gradient based on card ID or name if no theme selected
  const getGradient = (id: string, theme?: string) => {
    if (theme) return theme;
    
    const gradients = [
      'from-slate-900 via-slate-800 to-slate-900', // Black/Dark
      'from-blue-900 via-blue-800 to-blue-900',     // Blue
      'from-emerald-900 via-emerald-800 to-emerald-900', // Green
      'from-purple-900 via-purple-800 to-purple-900', // Purple
      'from-rose-900 via-rose-800 to-rose-900',     // Red
      'from-yellow-700 via-yellow-600 to-yellow-700', // Gold-ish
      'from-gray-400 via-gray-300 to-gray-400',     // Platinum/Silver
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
  };

  const limit = card.limit || 0;
  const utilization = limit > 0 ? (balance > 0 ? balance : 0) / limit * 100 : 0;
  const available = limit - balance;

  return (
    <div className={`relative w-full aspect-[1.586/1] rounded-2xl p-6 text-white shadow-xl overflow-hidden bg-gradient-to-br ${getGradient(card.id, card.theme)} transition-all hover:scale-[1.01] duration-300`}>
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      {/* Shine effect */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <NetworkIcon network={card.network} className="w-12 h-8 opacity-90" />
            {!card.network && <span className="font-mono text-sm opacity-60 tracking-widest">CREDIT</span>}
          </div>
          <div className="flex space-x-2">
             <button onClick={onEdit} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-200 rounded-full backdrop-blur-sm transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-2">
             <div className="w-12 h-8 bg-yellow-400/80 rounded-md flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 border border-yellow-600/50 rounded-md"></div>
                <div className="w-full h-[1px] bg-yellow-600/30 absolute top-1/2"></div>
                <div className="h-full w-[1px] bg-yellow-600/30 absolute left-1/2"></div>
             </div>
             <Activity className="w-6 h-6 rotate-90 opacity-50" />
          </div>
          <h3 className="text-2xl font-bold tracking-wider drop-shadow-md truncate">{card.name}</h3>
          <p className="font-mono text-lg opacity-80 tracking-widest">
            •••• •••• •••• {card.last4Digits || card.id.slice(-4).toUpperCase()}
          </p>
          {(card.paymentDueDate || card.statementDate) && (
             <p className="text-[10px] opacity-70 mt-1">
               {card.statementDate && `Statement: ${card.statementDate}th`}
               {card.statementDate && card.paymentDueDate && ' • '}
               {card.paymentDueDate && `Due: ${card.paymentDueDate}th`}
             </p>
          )}
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Outstanding Balance</p>
              <p className="text-xl font-bold">{currency}{Math.abs(balance).toLocaleString()}</p>
            </div>
            <div className="text-right">
               <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Available</p>
               <p className={`text-lg font-bold ${available < 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                 {currency}{available.toLocaleString()}
               </p>
            </div>
          </div>
          
          {/* Progress Bar within Card */}
          <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                utilization > 90 ? 'bg-red-500' : utilization > 50 ? 'bg-yellow-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SpendingTrendChart: React.FC<{ transactions: Transaction[]; currency: string; range: number }> = ({ transactions, currency, range }) => {
  const data = useMemo(() => {
    const months = Array.from({ length: range }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (range - 1 - i));
      return {
        month: d.toLocaleString('default', { month: 'short' }),
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        amount: 0
      };
    });

    transactions.forEach(t => {
      if (t.type === 'expense') {
        const tDate = t.date.slice(0, 7); // YYYY-MM
        const monthData = months.find(m => m.key === tDate);
        if (monthData) {
          monthData.amount += Math.abs(t.amount);
        }
      }
    });

    return months;
  }, [transactions, range]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
          <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(val) => `${val/1000}k`} />
          <RechartsTooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white dark:bg-[#1A1A1A] p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {currency}{Number(payload[0].value).toLocaleString()}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const CategoryBreakdownChart: React.FC<{ transactions: Transaction[]; currency: string }> = ({ transactions, currency }) => {
  const data = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
      }
    });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [transactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (data.length === 0) {
    return (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            No spending data yet
        </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0];
                return (
                  <div className="bg-white dark:bg-[#1A1A1A] p-3 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {currency}{Number(data.value).toLocaleString()}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Main Page Component ---

interface CardFormData {
  name: string;
  limit: string;
  last4Digits: string;
  network: string;
  statementDate: string;
  paymentDueDate: string;
  theme: string;
}

const CreditCardsPage: React.FC<CreditCardsPageProps> = ({ 
  accounts, 
  transactions, 
  onAddAccount, 
  onEditAccount, 
  onDeleteAccount, 
  currency,
  onSaveTransaction
}) => {
  const creditCards = useMemo(() => accounts.filter(a => a.type === 'Credit Card'), [accounts]);
  
  const [selectedCardId, setSelectedCardId] = useState(creditCards[0]?.id || '');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Account | null>(null);
  
  // New Modals
  const [showPayBillModal, setShowPayBillModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  
  // Forms
  const [cardForm, setCardForm] = useState<CardFormData>({ 
    name: '', limit: '', last4Digits: '', network: 'visa', statementDate: '', paymentDueDate: '', theme: '' 
  });
  const [paymentForm, setPaymentForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0] });
  const [reconcileForm, setReconcileForm] = useState({ actualBalance: '' });
  const [spendingRange, setSpendingRange] = useState(6);

  const isAllCardsSelected = selectedCardId === 'all';

  const selectedCard = useMemo(() => {
    if (isAllCardsSelected) return null;
    return creditCards.find(card => card.id === selectedCardId) || creditCards[0];
  }, [creditCards, selectedCardId, isAllCardsSelected]);

  // Ensure selected ID is valid if cards change
  useMemo(() => {
    if (creditCards.length > 0 && !isAllCardsSelected && (!selectedCard || selectedCard.id !== selectedCardId)) {
        if(selectedCard) setSelectedCardId(selectedCard.id);
        else setSelectedCardId(creditCards[0].id);
    }
  }, [selectedCard, selectedCardId, creditCards, isAllCardsSelected]);

  const cardTransactions = useMemo(() => {
    if (isAllCardsSelected) {
        return transactions.filter(t => creditCards.some(c => c.id === t.accountId)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return selectedCard ? transactions.filter(t => t.accountId === selectedCard.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
  }, [transactions, selectedCard, isAllCardsSelected, creditCards]);
  
  const currentBalance = useMemo(() => {
    const net = cardTransactions.reduce((sum, t) => sum + t.amount, 0);
    return -net;
  }, [cardTransactions]);

  const aggregateStats = useMemo(() => {
      if (!isAllCardsSelected) return null;
      const totalLimit = creditCards.reduce((sum, card) => sum + (card.limit || 0), 0);
      const totalDebt = currentBalance; // Already calculated from all card transactions
      const utilization = totalLimit > 0 ? (totalDebt / totalLimit) * 100 : 0;
      const available = totalLimit - totalDebt;
      return { totalLimit, totalDebt, utilization, available };
  }, [isAllCardsSelected, creditCards, currentBalance]);

  const handleAddCard = () => {
    if (cardForm.name && cardForm.limit && onAddAccount) {
      onAddAccount({
        name: cardForm.name,
        type: 'Credit Card',
        balance: 0,
        limit: parseFloat(cardForm.limit),
        last4Digits: cardForm.last4Digits,
        network: cardForm.network as any,
        statementDate: parseInt(cardForm.statementDate),
        paymentDueDate: parseInt(cardForm.paymentDueDate),
        theme: cardForm.theme
      });
      setShowAddCardModal(false);
      resetCardForm();
    }
  };

  const handleEditCard = () => {
    if (editingCard && cardForm.name && cardForm.limit && onEditAccount) {
      onEditAccount({
        ...editingCard,
        name: cardForm.name,
        limit: parseFloat(cardForm.limit),
        last4Digits: cardForm.last4Digits,
        network: cardForm.network as any,
        statementDate: parseInt(cardForm.statementDate),
        paymentDueDate: parseInt(cardForm.paymentDueDate),
        theme: cardForm.theme
      });
      setShowEditCardModal(false);
      setEditingCard(null);
      resetCardForm();
    }
  };

  const resetCardForm = () => {
    setCardForm({ name: '', limit: '', last4Digits: '', network: 'visa', statementDate: '', paymentDueDate: '', theme: '' });
  };

  const openEditModal = (card: Account) => {
    setEditingCard(card);
    setCardForm({ 
      name: card.name, 
      limit: card.limit?.toString() || '',
      last4Digits: card.last4Digits || '',
      network: card.network || 'visa',
      statementDate: card.statementDate?.toString() || '',
      paymentDueDate: card.paymentDueDate?.toString() || '',
      theme: card.theme || ''
    });
    setShowEditCardModal(true);
  };

  const handlePayBill = () => {
    if (!onSaveTransaction || !selectedCard) return;
    const amount = parseFloat(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) return;

    onSaveTransaction({
      name: 'Credit Card Payment',
      amount: amount, 
      date: paymentForm.date,
      category: 'Payment',
      type: 'income',
      accountId: selectedCard.id,
      comments: 'Manual Payment Entry'
    });
    
    setShowPayBillModal(false);
    setPaymentForm({ amount: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleReconcile = () => {
    if (!onSaveTransaction || !selectedCard) return;
    const actual = parseFloat(reconcileForm.actualBalance);
    if (isNaN(actual)) return;
    
    const adjustment = -(actual - currentBalance);
    
    if (Math.abs(adjustment) < 0.01) {
      setShowReconcileModal(false);
      return; 
    }

    onSaveTransaction({
      name: 'Balance Reconciliation',
      amount: adjustment,
      date: new Date().toISOString().split('T')[0],
      category: 'Adjustment',
      type: adjustment > 0 ? 'income' : 'expense',
      accountId: selectedCard.id,
      comments: `Manual reconciliation to match balance of ${currency}${actual}`
    });

    setShowReconcileModal(false);
    setReconcileForm({ actualBalance: '' });
  };

  // --- Render ---

  if (creditCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-full">
          <CreditCardIcon className="w-16 h-16 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No Credit Cards Added</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            Start tracking your credit utilization and rewards by adding your first credit card.
          </p>
        </div>
        <button
          onClick={() => setShowAddCardModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Your First Card
        </button>
        {/* Modal for empty state */}
        <AnimatePresence>
            {showAddCardModal && (
                <Modal 
                    title="Add Credit Card" 
                    onClose={() => setShowAddCardModal(false)}
                    onSubmit={handleAddCard}
                    actionLabel="Add Card"
                >
                    <CardFormFields form={cardForm} setForm={setCardForm} />
                </Modal>
            )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header / Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Credit Cards</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage debt, track utilization, and analyze spending.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
             <div className="w-full sm:w-64">
                <AnimatedDropdown 
                    options={[
                        { value: 'all', label: 'All Credit Cards' }, 
                        ...creditCards.map(c => ({ value: c.id, label: c.name }))
                    ]}
                    selectedValue={selectedCardId}
                    onChange={setSelectedCardId}
                />
             </div>
             <button 
                onClick={() => { resetCardForm(); setShowAddCardModal(true); }}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
             >
                <Plus className="w-5 h-5" />
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Card Visual & Actions */}
        <div className="lg:col-span-5 space-y-6">
            <motion.div layout>
                {isAllCardsSelected && aggregateStats ? (
                    <div className="relative w-full aspect-[1.586/1] rounded-2xl p-6 text-white shadow-xl overflow-hidden bg-gradient-to-br from-slate-800 to-black border border-slate-700">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-2">
                                    <Layers className="w-8 h-8 opacity-80" />
                                    <span className="font-mono text-sm opacity-60 tracking-widest">SUMMARY</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold tracking-wider drop-shadow-md">All Cards</h3>
                                <p className="font-mono text-lg opacity-80 tracking-widest">{creditCards.length} Cards Linked</p>
                            </div>
                            <div className="flex flex-col space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Total Debt</p>
                                        <p className="text-xl font-bold">{currency}{Math.abs(aggregateStats.totalDebt).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs uppercase tracking-wider opacity-60 mb-1">Total Available</p>
                                        <p className="text-lg font-bold text-emerald-300">{currency}{aggregateStats.available.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${
                                            aggregateStats.utilization > 50 ? 'bg-yellow-400' : 'bg-emerald-400'
                                        }`}
                                        style={{ width: `${Math.min(aggregateStats.utilization, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : selectedCard && (
                    <CreditCardVisual 
                        card={selectedCard} 
                        balance={currentBalance} 
                        currency={currency}
                        onEdit={() => openEditModal(selectedCard)}
                        onDelete={() => setShowDeleteConfirm(selectedCard.id)}
                    />
                )}
            </motion.div>

            {!isAllCardsSelected && (
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setShowPayBillModal(true)}
                        className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all group text-gray-900 dark:text-gray-100"
                    >
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-2 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium text-sm">Pay Bill</span>
                    </button>
                    <button 
                        onClick={() => { setReconcileForm({actualBalance: ''}); setShowReconcileModal(true); }}
                        className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all group text-gray-900 dark:text-gray-100"
                    >
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-2 group-hover:scale-110 transition-transform">
                            <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="font-medium text-sm">Reconcile</span>
                    </button>
                </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {isAllCardsSelected ? 'Aggregate Stats' : 'At a Glance'}
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Utilization</span>
                        <span className={`font-medium ${
                            (isAllCardsSelected ? aggregateStats?.utilization || 0 : (currentBalance / (selectedCard?.limit || 1))) > 0.3 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                            {Math.round(isAllCardsSelected ? aggregateStats?.utilization || 0 : (selectedCard?.limit ? (currentBalance / selectedCard.limit) * 100 : 0))}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((isAllCardsSelected ? aggregateStats?.utilization || 0 : ((currentBalance / (selectedCard?.limit || 1)) * 100)), 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-gray-500 dark:text-gray-400">Transactions (30d)</span>
                        <span className="font-medium text-gray-900 dark:text-white">{cardTransactions.length}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Analytics */}
        <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg flex items-center text-gray-900 dark:text-white">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                        {isAllCardsSelected ? 'Combined Spending Trend' : 'Spending Trend'}
                    </h3>
                    <select 
                        value={spendingRange}
                        onChange={(e) => setSpendingRange(parseInt(e.target.value))}
                        className="bg-gray-100 dark:bg-[#1A1A1A] text-gray-900 dark:text-white text-xs p-1 rounded border-none outline-none cursor-pointer"
                    >
                        <option value={1}>Last Month</option>
                        <option value={3}>Last 3 Months</option>
                        <option value={6}>Last 6 Months</option>
                        <option value={12}>Last Year</option>
                    </select>
                </div>
                <SpendingTrendChart transactions={cardTransactions} currency={currency} range={spendingRange} />
            </div>

            <div className="bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg flex items-center text-gray-900 dark:text-white">
                        <PieChartIcon className="w-5 h-5 mr-2 text-purple-500" />
                        Where you spend
                    </h3>
                </div>
                <div className="flex flex-col sm:flex-row items-center">
                    <div className="w-full sm:w-1/2">
                        <CategoryBreakdownChart transactions={cardTransactions} currency={currency} />
                    </div>
                    <div className="w-full sm:w-1/2 mt-4 sm:mt-0 pl-0 sm:pl-8 space-y-3">
                         {/* Top 3 Categories List */}
                         {Object.entries(cardTransactions.reduce((acc, t) => {
                             if(t.type === 'expense') acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
                             return acc;
                         }, {} as Record<string, number>))
                         .sort((a,b) => b[1] - a[1])
                         .slice(0, 3)
                         .map(([cat, val], i) => (
                             <div key={i} className="flex justify-between items-center text-sm text-gray-900 dark:text-white">
                                 <span className="flex items-center text-gray-700 dark:text-gray-300">
                                     <div className={`w-2 h-2 rounded-full mr-2 ${['bg-blue-500','bg-green-500','bg-orange-500'][i] || 'bg-gray-500'}`}></div>
                                     {cat}
                                 </span>
                                 <span className="font-medium">{currency}{val.toLocaleString()}</span>
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Card Portfolio (Detailed list of all cards in Summary View) */}
      {isAllCardsSelected && (
          <div className="bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-white flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-blue-500" />
                  Card Portfolio
              </h3>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100 dark:border-gray-800">
                              <th className="pb-3 font-semibold">Card Name</th>
                              <th className="pb-3 font-semibold">Outstanding</th>
                              <th className="pb-3 font-semibold">Limit</th>
                              <th className="pb-3 font-semibold">Utilization</th>
                              <th className="pb-3 font-semibold text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                          {creditCards.map(card => {
                              // Calculate individual card balance
                              const cardBalance = -transactions
                                  .filter(t => t.accountId === card.id)
                                  .reduce((sum, t) => sum + t.amount, 0);
                              const util = card.limit ? (cardBalance / card.limit) * 100 : 0;
                              
                              return (
                                  <tr key={card.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1A1A1A]/50 transition-colors">
                                      <td className="py-4">
                                          <div className="flex items-center">
                                              <div className={`w-2 h-8 rounded-full mr-3 bg-gradient-to-b ${card.theme || 'from-blue-500 to-blue-700'}`}></div>
                                              <div>
                                                  <p className="font-medium text-gray-900 dark:text-white">{card.name}</p>
                                                  <p className="text-xs text-gray-500">•••• {card.last4Digits || 'XXXX'}</p>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="py-4 font-semibold text-gray-900 dark:text-white">
                                          {currency}{cardBalance.toLocaleString()}
                                      </td>
                                      <td className="py-4 text-gray-500 dark:text-gray-400">
                                          {currency}{(card.limit || 0).toLocaleString()}
                                      </td>
                                      <td className="py-4">
                                          <div className="flex items-center space-x-2">
                                              <div className="flex-1 h-1.5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                  <div 
                                                      className={`h-full ${util > 80 ? 'bg-red-500' : util > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                      style={{ width: `${Math.min(util, 100)}%` }}
                                                  ></div>
                                              </div>
                                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{Math.round(util)}%</span>
                                          </div>
                                      </td>
                                      <td className="py-4 text-right">
                                          <button 
                                              onClick={() => setSelectedCardId(card.id)}
                                              className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                                          >
                                              View Details
                                          </button>
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* Transaction History */}
      <div className="bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{isAllCardsSelected ? 'All Card Transactions' : 'Recent Activity'}</h3>
        <div className="space-y-2">
            {cardTransactions.slice(0, isAllCardsSelected ? 20 : 5).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                            {t.type === 'income' ? <ArrowRight className="w-4 h-4 rotate-180" /> : <ArrowRight className="w-4 h-4" />}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{t.name}</p>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                {isAllCardsSelected && (
                                    <span className="mr-2 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                        {creditCards.find(c => c.id === t.accountId)?.name}
                                    </span>
                                )}
                                <span>{t.date} • {t.category}</span>
                            </div>
                        </div>
                    </div>
                    <span className={`font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
                        {t.type === 'income' ? '+' : ''}{currency}{Math.abs(t.amount).toLocaleString()}
                    </span>
                </div>
            ))}
            {cardTransactions.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-4">No transactions found</div>
            )}
        </div>
      </div>

      {/* --- Modals --- */}
      <AnimatePresence>
        {(showAddCardModal || showEditCardModal) && (
             <Modal
                title={showEditCardModal ? "Edit Card" : "Add Credit Card"}
                onClose={() => { setShowAddCardModal(false); setShowEditCardModal(false); }}
                onSubmit={showEditCardModal ? handleEditCard : handleAddCard}
                actionLabel={showEditCardModal ? "Save Changes" : "Add Card"}
             >
                 <CardFormFields form={cardForm} setForm={setCardForm} />
             </Modal>
        )}
        
        {/* Pay Bill & Reconcile Modals... (Same as before) */}
        {showPayBillModal && (
            <Modal
                title="Record Payment"
                onClose={() => setShowPayBillModal(false)}
                onSubmit={handlePayBill}
                actionLabel="Record Payment"
            >
                <div className="space-y-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm rounded-lg flex items-start">
                        <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                        This will record an income transaction on this card to reduce your balance.
                    </div>
                    <div>
                         <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Payment Amount</label>
                         <div className="relative">
                             <span className="absolute left-3 top-2.5 text-gray-500">{currency}</span>
                             <input 
                                 className="w-full pl-8 p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                 type="number"
                                 value={paymentForm.amount} 
                                 onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                                 placeholder="0.00"
                             />
                         </div>
                     </div>
                     <div>
                         <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date</label>
                         <input 
                             className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                             type="date"
                             value={paymentForm.date} 
                             onChange={e => setPaymentForm({...paymentForm, date: e.target.value})}
                         />
                     </div>
                </div>
            </Modal>
        )}

        {showReconcileModal && (
            <Modal
                title="Reconcile Balance"
                onClose={() => setShowReconcileModal(false)}
                onSubmit={handleReconcile}
                actionLabel="Update Balance"
            >
                <div className="space-y-4">
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">System Calculated Balance</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{currency}{Math.abs(currentBalance).toLocaleString()}</p>
                    </div>
                    <div>
                         <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Actual Bank Balance (What you owe)</label>
                         <div className="relative">
                             <span className="absolute left-3 top-2.5 text-gray-500">{currency}</span>
                             <input 
                                 className="w-full pl-8 p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                 type="number"
                                 value={reconcileForm.actualBalance} 
                                 onChange={e => setReconcileForm({...reconcileForm, actualBalance: e.target.value})}
                                 placeholder="e.g. 1250.00"
                             />
                         </div>
                    </div>
                </div>
            </Modal>
        )}

        {showDeleteConfirm && (
             <Modal
                title="Delete Card?"
                onClose={() => setShowDeleteConfirm(null)}
                onSubmit={() => {
                    if(onDeleteAccount && showDeleteConfirm) onDeleteAccount(showDeleteConfirm);
                    setShowDeleteConfirm(null);
                }}
                actionLabel="Delete Forever"
            >
                <p className="text-gray-600 dark:text-gray-300">
                    Are you sure? This will delete the account but keep the transactions.
                </p>
            </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-components for cleaner code ---

const CardFormFields: React.FC<{ form: CardFormData, setForm: React.Dispatch<React.SetStateAction<CardFormData>> }> = ({ form, setForm }) => {
  const themes = [
    { name: 'Dark', value: 'from-slate-900 via-slate-800 to-slate-900' },
    { name: 'Blue', value: 'from-blue-900 via-blue-800 to-blue-900' },
    { name: 'Green', value: 'from-emerald-900 via-emerald-800 to-emerald-900' },
    { name: 'Purple', value: 'from-purple-900 via-purple-800 to-purple-900' },
    { name: 'Red', value: 'from-rose-900 via-rose-800 to-rose-900' },
    { name: 'Gold', value: 'from-yellow-700 via-yellow-600 to-yellow-700' },
    { name: 'Platinum', value: 'from-gray-400 via-gray-300 to-gray-400' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Card Name</label>
            <input 
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="e.g. Chase Sapphire"
            />
        </div>
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Credit Limit</label>
            <input 
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                type="number"
                value={form.limit} 
                onChange={e => setForm({...form, limit: e.target.value})}
                placeholder="5000"
            />
        </div>
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Last 4 Digits</label>
            <input 
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.last4Digits} 
                maxLength={4}
                onChange={e => setForm({...form, last4Digits: e.target.value})}
                placeholder="1234"
            />
        </div>
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Network</label>
            <select
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.network}
                onChange={e => setForm({...form, network: e.target.value})}
            >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">Amex</option>
                <option value="discover">Discover</option>
                <option value="other">Other</option>
            </select>
        </div>
        <div>
             <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Color Theme</label>
             <select
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.theme}
                onChange={e => setForm({...form, theme: e.target.value})}
             >
                <option value="">Auto-generate</option>
                {themes.map(t => <option key={t.value} value={t.value}>{t.name}</option>)}
             </select>
        </div>
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Statement Day</label>
            <input 
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                type="number" min="1" max="31"
                value={form.statementDate} 
                onChange={e => setForm({...form, statementDate: e.target.value})}
                placeholder="e.g. 15"
            />
        </div>
        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Payment Due Day</label>
            <input 
                className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                type="number" min="1" max="31"
                value={form.paymentDueDate} 
                onChange={e => setForm({...form, paymentDueDate: e.target.value})}
                placeholder="e.g. 5"
            />
        </div>
      </div>
    </div>
  );
};

const Modal: React.FC<{
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    actionLabel: string;
    children: React.ReactNode;
}> = ({ title, onClose, onSubmit, actionLabel, children }) => (
    <motion.div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
    >
        <motion.div 
            className="bg-white dark:bg-[#242424] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700"
            variants={modalVariants}
            initial="initial" animate="animate" exit="exit"
            onClick={e => e.stopPropagation()}
        >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>
            <div className="p-6">
                {children}
            </div>
            <div className="p-6 pt-0 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    Cancel
                </button>
                <button onClick={onSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                    {actionLabel}
                </button>
            </div>
        </motion.div>
    </motion.div>
);

export default CreditCardsPage;