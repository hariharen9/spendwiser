import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Landmark, Trash2, Calendar, DollarSign, Wallet, TrendingDown,
  PieChart as PieChartIcon, Clock, Settings, FileText, Download, Printer, Edit2, CheckCircle2, ChevronDown
} from 'lucide-react';
import { useLoanFunds } from '../../hooks/useLoanFunds';
import { LoanFund, LoanFundExpense } from '../../types/types';
import AnimatedNumber from '../Common/AnimatedNumber';
import CurrencyInput from '../Common/CurrencyInput';
import ConfirmationDialog from '../BillSplitting/ConfirmationDialog';

interface LoanFundsTabProps {
  currency: string;
}

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-xl rounded-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const CATEGORIES = [
  { id: 'utilities', label: 'Utilities', icon: '💡', color: '#8b5cf6' },
  { id: 'labour', label: 'Labour/Service', icon: '🔧', color: '#f97316' },
  { id: 'materials', label: 'Materials', icon: '🧱', color: '#78716c' },
  { id: 'rent', label: 'Rent', icon: '🏠', color: '#22d3a5' },
  { id: 'education', label: 'Education', icon: '📚', color: '#0ea5e9' },
  { id: 'emi', label: 'EMI / Repayment', icon: '🏦', color: '#64748b' },
  { id: 'travel', label: 'Travel', icon: '✈️', color: '#06b6d4' },
  { id: 'other', label: 'Other', icon: '📌', color: '#94a3b8' },
];

const METHODS = ['Cash', 'UPI', 'Card', 'Net Banking', 'Cheque', 'Other'];

const LoanFundsTab: React.FC<LoanFundsTabProps> = ({ currency }) => {
  const { loanFunds, loading, addLoanFund, updateLoanFund, deleteLoanFund, addExpenseToFund, updateExpenseInFund, deleteExpenseFromFund } = useLoanFunds();
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);
  
  // New Fund State
  const [showAddFundModal, setShowAddFundModal] = useState(false);
  const [newFundName, setNewFundName] = useState('');
  const [newFundAmount, setNewFundAmount] = useState(0);
  const [newFundPurpose, setNewFundPurpose] = useState('');
  const [newFundDate, setNewFundDate] = useState(new Date().toISOString().split('T')[0]);
  const [newFundDue, setNewFundDue] = useState('');
  const [newFundLender, setNewFundLender] = useState('');
  const [newFundRate, setNewFundRate] = useState<number | ''>('');
  const [newFundNotes, setNewFundNotes] = useState('');

  // Edit Fund Settings State
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Add Expense State
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseCat, setExpenseCat] = useState(CATEGORIES[CATEGORIES.length - 1].id);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseMethod, setExpenseMethod] = useState(METHODS[0]);
  const [expenseTags, setExpenseTags] = useState('');
  const [expenseNote, setExpenseNote] = useState('');

  // Edit Expense State
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);

  useEffect(() => {
    if (loanFunds.length > 0 && !selectedFundId) {
      setSelectedFundId(loanFunds[0].id);
    } else if (loanFunds.length === 0) {
      setSelectedFundId(null);
    }
  }, [loanFunds, selectedFundId]);

  const selectedFund = useMemo(() => loanFunds.find(f => f.id === selectedFundId) || null, [loanFunds, selectedFundId]);

  const fundStats = useMemo(() => {
    if (!selectedFund) return { spent: 0, remaining: 0, percentageSpent: 0 };
    const spent = (selectedFund.expenses || []).reduce((acc, curr) => acc + curr.amount, 0);
    const remaining = Math.max(0, selectedFund.amount - spent);
    const percentageSpent = Math.min(100, (spent / (selectedFund.amount || 1)) * 100);
    return { spent, remaining, percentageSpent };
  }, [selectedFund]);

  const openNewFundModal = () => {
    setNewFundName(''); setNewFundAmount(0); setNewFundPurpose('');
    setNewFundDate(new Date().toISOString().split('T')[0]); setNewFundDue('');
    setNewFundLender(''); setNewFundRate(''); setNewFundNotes('');
    setShowAddFundModal(true);
  };

  const openSettingsModal = () => {
    if (!selectedFund) return;
    setNewFundName(selectedFund.name);
    setNewFundAmount(selectedFund.amount);
    setNewFundPurpose(selectedFund.purpose || '');
    setNewFundDate(selectedFund.startDate ? selectedFund.startDate.split('T')[0] : '');
    setNewFundDue(selectedFund.dueDate || '');
    setNewFundLender(selectedFund.lender || '');
    setNewFundRate(selectedFund.interestRate ?? '');
    setNewFundNotes(selectedFund.notes || '');
    setShowSettingsModal(true);
  };

  const openAddExpenseModal = () => {
    setExpenseDesc(''); setExpenseAmount(0); setExpenseCat(CATEGORIES[CATEGORIES.length - 1].id);
    setExpenseDate(new Date().toISOString().split('T')[0]); setExpenseMethod(METHODS[0]);
    setExpenseTags(''); setExpenseNote('');
    setShowAddExpenseModal(true);
  };

  const openEditExpenseModal = (exp: LoanFundExpense) => {
    setEditExpenseId(exp.id);
    setExpenseDesc(exp.desc);
    setExpenseAmount(exp.amount);
    setExpenseCat(exp.cat);
    setExpenseDate(exp.date ? exp.date.split('T')[0] : '');
    setExpenseMethod(exp.method || METHODS[0]);
    setExpenseTags((exp.tags || []).join(', '));
    setExpenseNote(exp.note || '');
  };

  const handleAddFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFundName || newFundAmount <= 0) { alert(`Invalid input`); return; }
    try {
      const newId = await addLoanFund({
        name: newFundName,
        amount: newFundAmount,
        purpose: newFundPurpose,
        startDate: newFundDate || new Date().toISOString(),
        dueDate: newFundDue,
        lender: newFundLender,
        interestRate: newFundRate === '' ? undefined : Number(newFundRate),
        notes: newFundNotes,
      });
      setShowAddFundModal(false);
      setSelectedFundId(newId);
    } catch (err: any) { alert(`Error creating fund: ${err.message}`); }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFundId || !newFundName || newFundAmount <= 0) return;
    try {
      await updateLoanFund(selectedFundId, {
        name: newFundName, amount: newFundAmount, purpose: newFundPurpose,
        startDate: newFundDate, dueDate: newFundDue, lender: newFundLender,
        interestRate: newFundRate === '' ? undefined : Number(newFundRate), notes: newFundNotes
      });
      setShowSettingsModal(false);
    } catch (err: any) { alert(`Error saving settings: ${err.message}`); }
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFundId || !expenseDesc || expenseAmount <= 0) { alert(`Invalid input`); return; }
    try {
      const expenseData = {
        desc: expenseDesc, amount: expenseAmount, cat: expenseCat, date: expenseDate,
        method: expenseMethod, tags: expenseTags.split(',').map(t => t.trim()).filter(Boolean), note: expenseNote
      };
      if (editExpenseId) {
        await updateExpenseInFund(selectedFundId, editExpenseId, expenseData);
        setEditExpenseId(null);
      } else {
        await addExpenseToFund(selectedFundId, expenseData);
        setShowAddExpenseModal(false);
      }
    } catch (err: any) { alert(`Error logging expense: ${err.message}`); }
  };

  const handleDeleteFund = async () => {
    if (!deleteConfirmId) return;
    await deleteLoanFund(deleteConfirmId);
    setDeleteConfirmId(null);
    setSelectedFundId(loanFunds[0]?.id || null);
  };

  // Export functions
  const exportCSV = () => {
    if (!selectedFund) return;
    const header = ['Date', 'Description', 'Category', 'Method', 'Amount', 'Tags', 'Notes'];
    const rows = (selectedFund.expenses || []).map(e => [
      e.date, `"${e.desc.replace(/"/g, '""')}"`, e.cat, e.method || '', 
      e.amount, `"${(e.tags || []).join(', ')}"`, `"${(e.note || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${selectedFund.name.replace(/[^a-z0-9]/gi, '_')}_expenses.csv`;
    a.click();
  };

  const exportJSON = () => {
    if (!selectedFund) return;
    const blob = new Blob([JSON.stringify(selectedFund, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${selectedFund.name.replace(/[^a-z0-9]/gi, '_')}_backup.json`;
    a.click();
  };

  const printReport = () => {
    if (!selectedFund) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>${selectedFund.name} Report</title>
      <style>
        body{font-family:sans-serif;padding:32px;color:#111;}h1{margin-bottom:4px;}p{color:#666;margin:0 0 20px;}
        table{width:100%;border-collapse:collapse;margin-top:16px;}th{text-align:left;padding:8px 10px;background:#f5f5f5;font-size:12px;}
        td{padding:8px 10px;border-bottom:1px solid #eee;font-size:13px;}.sum{margin-top:20px;display:flex;gap:30px;}
        .sum div{background:#f9f9f9;padding:14px 18px;border-radius:8px;border:1px solid #e5e5e5;}
        .sum .label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;}
        .sum .val{font-size:20px;font-weight:700;margin-top:4px;}
      </style></head><body>
      <h1>${selectedFund.name}</h1>
      <p>${selectedFund.purpose || ''} · Generated on ${new Date().toLocaleDateString()}</p>
      <div class="sum">
        <div><div class="label">Total Loan</div><div class="val">${currency}${selectedFund.amount.toLocaleString()}</div></div>
        <div><div class="label">Total Spent</div><div class="val">${currency}${fundStats.spent.toLocaleString()}</div></div>
        <div><div class="label">Remaining</div><div class="val">${currency}${fundStats.remaining.toLocaleString()}</div></div>
      </div>
      <table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Method</th><th>Amount</th></tr></thead>
      <tbody>${[...(selectedFund.expenses||[])].sort((a,b)=>new Date(a.date).getTime()-new Date(b.date).getTime()).map(e=>{
        const c = CATEGORIES.find(cat=>cat.id===e.cat);
        return `<tr><td>${new Date(e.date).toLocaleDateString()}</td><td>${e.desc}</td><td>${c?.label||'Other'}</td><td>${e.method||'—'}</td><td>-${currency}${e.amount.toLocaleString()}</td></tr>`
      }).join('')}</tbody></table></body></html>
    `);
    win.document.close();
    win.print();
  };

  const getBarColor = (p: number) => {
    if (p >= 90) return 'bg-red-500';
    if (p >= 75) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Sidebar: Funds List */}
      <div className="lg:col-span-4 space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Your Loan Funds</h3>
          <button onClick={openNewFundModal} className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center">
            <Plus className="w-4 h-4 mr-1" /> Add
          </button>
        </div>
        
        {loanFunds.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
            No funds tracked yet. Create one to start!
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory lg:flex-col lg:overflow-visible space-x-4 lg:space-x-0 lg:space-y-3 pb-6 lg:pb-0 no-scrollbar">
            {loanFunds.map(fund => {
              const isSelected = selectedFundId === fund.id;
              const spent = (fund.expenses || []).reduce((acc, curr) => acc + curr.amount, 0);
              const percentage = Math.min(100, (spent / (fund.amount || 1)) * 100);
              const barColor = getBarColor(percentage);
              
              return (
                <motion.div 
                  key={fund.id}
                  layoutId={`fund-${fund.id}`}
                  onClick={() => setSelectedFundId(fund.id)}
                  className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 border flex-shrink-0 w-[85vw] sm:w-[60vw] lg:w-full snap-center ${
                    isSelected 
                    ? 'bg-white dark:bg-gray-800 border-blue-500/50 ring-2 ring-blue-500/20 shadow-lg' 
                    : 'bg-white/40 dark:bg-gray-800/40 border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{fund.name}</h4>
                        <p className="text-xs text-gray-500">{currency}{fund.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-500 uppercase font-semibold mb-1">
                      <span>{Math.round(percentage)}% Spent</span>
                      <span>{currency}{Math.max(0, fund.amount - spent).toLocaleString()} Left</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div className={`${barColor} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="lg:col-span-8 space-y-6">
        <AnimatePresence mode="wait">
          {selectedFund && (
            <motion.div 
              key={selectedFund.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Main Status Card */}
              <GlassCard className="p-6 md:p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{selectedFund.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Total Fund Size: <span className="font-semibold text-gray-700 dark:text-gray-300">{currency}{selectedFund.amount.toLocaleString()}</span></p>
                    {(selectedFund.lender || selectedFund.interestRate) && (
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2 space-x-2">
                        {selectedFund.lender && <span className="flex items-center"><Landmark className="w-3 h-3 mr-1"/> {selectedFund.lender}</span>}
                        {selectedFund.lender && selectedFund.interestRate && <span>•</span>}
                        {selectedFund.interestRate && <span className="flex items-center"><TrendingDown className="w-3 h-3 mr-1"/> {selectedFund.interestRate}% p.a.</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 relative">
                    <button onClick={openAddExpenseModal} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow flex items-center transition-colors">
                      <Plus className="w-4 h-4 mr-1" /> Expense
                    </button>
                    <div className="relative">
                      <button onClick={() => setShowActionsDropdown(!showActionsDropdown)} className="p-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center">
                        <Settings className="w-5 h-5" /> <ChevronDown className="w-3 h-3 ml-1" />
                      </button>
                      {showActionsDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 py-1 overflow-hidden">
                          <button onClick={() => { setShowActionsDropdown(false); openSettingsModal(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"><Edit2 className="w-4 h-4 mr-2"/> Settings</button>
                          <button onClick={() => { setShowActionsDropdown(false); printReport(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"><Printer className="w-4 h-4 mr-2"/> Print Report</button>
                          <button onClick={() => { setShowActionsDropdown(false); exportCSV(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"><FileText className="w-4 h-4 mr-2"/> Export CSV</button>
                          <button onClick={() => { setShowActionsDropdown(false); exportJSON(); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"><Download className="w-4 h-4 mr-2"/> Export JSON</button>
                          <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                          <button onClick={() => { setShowActionsDropdown(false); setDeleteConfirmId(selectedFund.id); }} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"><Trash2 className="w-4 h-4 mr-2"/> Delete Fund</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Loan Amount</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      <AnimatedNumber value={selectedFund.amount} currency={currency} decimals={0} />
                    </p>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      <AnimatedNumber value={fundStats.spent} currency={currency} decimals={0} />
                    </p>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide mb-1">Remaining Balance</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      <AnimatedNumber value={fundStats.remaining} currency={currency} decimals={0} />
                    </p>
                  </div>
                </div>
              </GlassCard>

              {/* Timeline */}
              <GlassCard className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Expense Timeline</h3>
                </div>

                {(selectedFund.expenses || []).length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No expenses logged yet. Add one to see it on the timeline!</div>
                ) : (
                  <div className="space-y-4">
                    {selectedFund.expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(exp => {
                      const category = CATEGORIES.find(c => c.id === exp.cat) || CATEGORIES[CATEGORIES.length - 1];
                      return (
                        <div key={exp.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                            {category.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold text-gray-900 dark:text-white truncate pr-4">{exp.desc}</h4>
                              <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">-{currency}{exp.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2 flex-wrap">
                              <span>{category.label}</span>
                              <span>•</span>
                              <span>{new Date(exp.date).toLocaleDateString()}</span>
                              {exp.method && <><span>•</span><span>{exp.method}</span></>}
                            </div>
                            {(exp.tags && exp.tags.length > 0) && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {exp.tags.map(t => <span key={t} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">{t}</span>)}
                              </div>
                            )}
                            {exp.note && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{exp.note}</p>}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center transition-all">
                            <button onClick={() => openEditExpenseModal(exp)} className="p-2 text-gray-400 hover:text-blue-500 transition-all"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deleteExpenseFromFund(selectedFund.id, exp.id)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fund Modals (Create & Edit) */}
      {(showAddFundModal || showSettingsModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg my-auto">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{showSettingsModal ? '⚙️ Loan Settings' : 'New Loan Fund'}</h3>
              <button onClick={() => { setShowAddFundModal(false); setShowSettingsModal(false); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={showSettingsModal ? handleSaveSettings : handleAddFund} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Fund Name *</label>
                <input type="text" value={newFundName} onChange={e => setNewFundName(e.target.value)} required placeholder="e.g. Home Renovation" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Total Amount *</label>
                  <CurrencyInput value={newFundAmount || ''} onChange={val => setNewFundAmount(Number(val))} currency={currency} className="w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Interest Rate % (opt)</label>
                  <input type="number" step="0.1" value={newFundRate} onChange={e => setNewFundRate(e.target.value)} placeholder="9.5" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Purpose / Description</label>
                <input type="text" value={newFundPurpose} onChange={e => setNewFundPurpose(e.target.value)} placeholder="e.g. Kitchen renovation & painting" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Loan Date</label>
                  <input type="date" value={newFundDate} onChange={e => setNewFundDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Due Date</label>
                  <input type="date" value={newFundDue} onChange={e => setNewFundDue(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Lender (optional)</label>
                <input type="text" value={newFundLender} onChange={e => setNewFundLender(e.target.value)} placeholder="e.g. HDFC Bank / Uncle Ravi" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</label>
                <textarea value={newFundNotes} onChange={e => setNewFundNotes(e.target.value)} placeholder="Any extra context about this loan..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white min-h-[80px]"></textarea>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all mt-6">
                {showSettingsModal ? 'Save Changes' : 'Create Fund Tracker'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Expense Modals (Add & Edit) */}
      {(showAddExpenseModal || editExpenseId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg my-auto">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editExpenseId ? '✏️ Edit Expense' : '➕ Log Expense'}</h3>
                {!editExpenseId && <p className="text-xs text-gray-500 mt-1">Adding to {selectedFund?.name}</p>}
              </div>
              <button onClick={() => { setShowAddExpenseModal(false); setEditExpenseId(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSaveExpense} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description *</label>
                <input type="text" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} required placeholder="e.g. Plumber labour charges" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Amount *</label>
                  <CurrencyInput value={expenseAmount || ''} onChange={val => setExpenseAmount(Number(val))} currency={currency} className="w-full" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Date *</label>
                  <input type="date" value={expenseDate} onChange={e => setExpenseDate(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id} 
                      type="button" 
                      onClick={() => setExpenseCat(cat.id)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${expenseCat === cat.id ? 'ring-2 ring-blue-500 shadow-md' : 'hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'}`}
                      style={expenseCat === cat.id ? { backgroundColor: `${cat.color}20`, color: cat.color, borderColor: 'transparent' } : {}}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Method</label>
                  <select value={expenseMethod} onChange={e => setExpenseMethod(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white">
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tags</label>
                  <input type="text" value={expenseTags} onChange={e => setExpenseTags(e.target.value)} placeholder="labour, urgent..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Note / Receipt ref</label>
                <textarea value={expenseNote} onChange={e => setExpenseNote(e.target.value)} placeholder="Bill no., vendor name..." className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white min-h-[60px]"></textarea>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all mt-6">
                {editExpenseId ? 'Save Changes' : 'Log Expense →'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {deleteConfirmId && (
        <ConfirmationDialog
          isOpen={true}
          title="Delete Loan Fund"
          message="Are you sure you want to delete this entire loan fund and all its expenses? This action cannot be undone."
          onConfirm={handleDeleteFund}
          onCancel={() => setDeleteConfirmId(null)}
          confirmText="Delete"
        />
      )}
    </div>
  );
};

export default LoanFundsTab;
