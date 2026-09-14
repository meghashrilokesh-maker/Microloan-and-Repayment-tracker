import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Landmark, 
  IndianRupee, 
  Mic, 
  MicOff, 
  Check, 
  AlertCircle, 
  Sparkles,
  Calendar,
  Layers,
  FileText,
  CreditCard,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function AddSaleModal({ isOpen, onClose }) {
  const { t, addSale } = useApp();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  // Voice recording simulation states
  const [isListening, setIsListening] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState(null); // { amount, category, spokenText }

  if (!isOpen) return null;

  const quickAmounts = [50, 100, 200, 500, 1000, 2000];

  const categories = [
    { id: 'Vegetables', label: t.catVegetables },
    { id: 'Fruits', label: t.catFruits },
    { id: 'Street Food', label: t.catStreetFood },
    { id: 'Grocery', label: t.catGrocery },
    { id: 'Clothing', label: t.catClothing },
    { id: 'Other', label: t.catOther },
  ];

  const handleVoiceSimulation = () => {
    setIsListening(true);
    // Simulate speech recognition parsing
    setTimeout(() => {
      setIsListening(false);
      setVoiceDraft({
        amount: 2000,
        category: 'Vegetables',
        spokenText: '"Today\'s sale is 2000 rupees for fresh vegetables"'
      });
    }, 1800);
  };

  const applyVoiceDraft = () => {
    if (voiceDraft) {
      setAmount(String(voiceDraft.amount));
      setCategory(voiceDraft.category);
      setNote('Recorded via voice assistant');
      setVoiceDraft(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    addSale({ amount: Number(amount), category, date, note });
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-soft-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900">{t.addSale}</h2>
              <p className="text-[11px] text-slate-500">Record incoming money from customers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Voice Entry Button Card */}
        <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleVoiceSimulation}
              disabled={isListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-soft transition active:scale-95 ${
                isListening ? 'bg-rose-500 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                {isListening ? t.listening : t.speakSale}
              </span>
              <span className="text-[10px] text-slate-500">
                {t.speakPrompt}
              </span>
            </div>
          </div>
        </div>

        {/* Voice confirmation dialog */}
        {voiceDraft && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl animate-in fade-in">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t.confirmVoiceTitle}</span>
            </div>
            <p className="text-xs text-slate-700 mt-1 italic">{voiceDraft.spokenText}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-200 text-xs">
              <span className="font-bold text-emerald-800">
                Detected: ₹{voiceDraft.amount} ({voiceDraft.category})
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setVoiceDraft(null)}
                  className="px-2 py-1 rounded-lg text-[11px] bg-slate-200 hover:bg-slate-300 font-medium"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={applyVoiceDraft}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Confirm & Fill
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.amount} (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-lg text-emerald-700">₹</span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                required
                autoFocus
              />
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setAmount(prev => String(Number(prev || 0) + q))}
                  className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 font-semibold text-slate-600 transition"
                >
                  +₹{q}
                </button>
              ))}
            </div>
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.category}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map((c) => {
                const isSelected = category === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-medium transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-soft font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.date}
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 absolute left-3.5 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.note}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Afternoon rush, UPI from Ramesh"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-pastel active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{t.saveSale}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddExpenseModal({ isOpen, onClose }) {
  const { t, addExpense } = useApp();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Stock / Purchases');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const quickAmounts = [20, 50, 100, 200, 500, 1000];

  const categories = [
    { id: 'Stock / Purchases', label: t.catStock },
    { id: 'Transport', label: t.catTransport },
    { id: 'Shop Rent', label: t.catRent },
    { id: 'Electricity / Bills', label: t.catElectricity },
    { id: 'Food & Tea', label: t.catFood },
    { id: 'Other', label: t.catOther },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    addExpense({ amount: Number(amount), category, date, note });
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-soft-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900">{t.addExpense}</h2>
              <p className="text-[11px] text-slate-500">Record money spent on stock, cart, or bills</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.amount} (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-lg text-rose-700">₹</span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold text-slate-900 focus:bg-white focus:border-rose-500 outline-none"
                required
                autoFocus
              />
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setAmount(prev => String(Number(prev || 0) + q))}
                  className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-800 font-semibold text-slate-600 transition"
                >
                  +₹{q}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.category}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {categories.map((c) => {
                const isSelected = category === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`py-2 px-1.5 text-center rounded-xl text-xs font-medium transition ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-soft font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.date}
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 absolute left-3.5 text-slate-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-rose-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.note}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Mandi diesel auto, ginger crate"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-rose-500 outline-none"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-soft active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{t.saveExpense}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddLoanModal({ isOpen, onClose }) {
  const { t, addLoan } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    lender: '',
    amount: '',
    repaymentAmount: '',
    frequency: 'Daily',
    firstDueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    finalDueDate: '',
    notes: ''
  });

  if (!isOpen) return null;

  const loanAmountNum = Number(formData.amount || 0);
  const repaymentAmountNum = Number(formData.repaymentAmount || (loanAmountNum ? Math.round(loanAmountNum / 20) : 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loanAmountNum || loanAmountNum <= 0) return;

    addLoan({
      name: formData.name || 'Vendor Microloan',
      lender: formData.lender || 'Local Lender',
      amount: loanAmountNum,
      repaymentAmount: repaymentAmountNum,
      frequency: formData.frequency,
      firstDueDate: formData.firstDueDate,
      finalDueDate: formData.finalDueDate,
      notes: formData.notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-soft-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900">{t.addLoan}</h2>
              <p className="text-[11px] text-slate-500">Add microcredit or wholesale supplier advance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Loan / Scheme Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. PM SVANidhi Loan, Mandi Credit"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.lender}
            </label>
            <input
              type="text"
              value={formData.lender}
              onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
              placeholder="e.g. SBI Bank, Murthy Wholesaler, SHG"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.originalLoan} (₹)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 font-bold text-slate-500">₹</span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. 20000"
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Repayment Amount (₹)
              </label>
              <input
                type="number"
                value={formData.repaymentAmount}
                onChange={(e) => setFormData({ ...formData, repaymentAmount: e.target.value })}
                placeholder="e.g. 1000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.repaymentFrequency}
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-500 outline-none"
              >
                <option value="Daily">{t.daily}</option>
                <option value="Weekly">{t.weekly}</option>
                <option value="Monthly">{t.monthly}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.firstDueDate}
              </label>
              <input
                type="date"
                value={formData.firstDueDate}
                onChange={(e) => setFormData({ ...formData, firstDueDate: e.target.value })}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.finalDueDate} (Optional)
              </label>
              <input
                type="date"
                value={formData.finalDueDate}
                onChange={(e) => setFormData({ ...formData, finalDueDate: e.target.value })}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.notes}
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. 7% subsidized interest rate"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Live Summary Card as required by item 7 */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wide">
              Live Summary
            </span>
            <div className="grid grid-cols-3 gap-2 mt-1.5 text-center">
              <div className="bg-white/80 p-2 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Loan amount</span>
                <span className="text-xs font-bold text-slate-900">₹{loanAmountNum.toLocaleString()}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Already repaid</span>
                <span className="text-xs font-bold text-emerald-700">₹0</span>
              </div>
              <div className="bg-white/80 p-2 rounded-xl">
                <span className="text-[10px] text-slate-500 block">Remaining</span>
                <span className="text-xs font-bold text-indigo-700">₹{loanAmountNum.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-soft active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Microloan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddRepaymentModal({ isOpen, onClose, defaultLoanId = null }) {
  const { t, loans, addRepayment, showToast } = useApp();
  const activeLoans = loans.filter(l => l.status !== 'Completed');

  const [selectedLoanId, setSelectedLoanId] = useState(() => defaultLoanId || (activeLoans[0]?.id || ''));
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('UPI');
  const [note, setNote] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen) return null;

  const currentLoan = loans.find(l => l.id === selectedLoanId) || activeLoans[0];
  const repayAmountNum = Number(amount || 0);
  const remainingAfterPayment = currentLoan ? Math.max(0, currentLoan.remainingAmount - repayAmountNum) : 0;
  const isOverpaying = currentLoan && repayAmountNum > currentLoan.remainingAmount;

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!repayAmountNum || repayAmountNum <= 0) return;
    if (isOverpaying) {
      showToast(`⚠ ${t.overpaymentWarning}`);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmedPayment = () => {
    addRepayment({
      loanId: currentLoan.id,
      amount: repayAmountNum,
      date,
      method,
      note
    });
    setShowConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-soft-lg">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-slate-900">{t.addRepayment}</h2>
              <p className="text-[11px] text-slate-500">Record loan instalment payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Confirmation State */}
        {showConfirm ? (
          <div className="py-4 space-y-4 text-center animate-in fade-in">
            <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Confirm Repayment of ₹{repayAmountNum.toLocaleString()}?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Towards: <strong>{currentLoan?.name}</strong> ({currentLoan?.lender})
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1 text-left border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Current Balance:</span>
                <span className="font-semibold">₹{currentLoan?.remainingAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Payment Amount:</span>
                <span>-₹{repayAmountNum.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1">
                <span>Remaining After:</span>
                <span>₹{remainingAfterPayment.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmedPayment}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-soft"
              >
                Confirm & Record
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePreSubmit} className="space-y-4 mt-4">
            {/* Loan selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Loan
              </label>
              <select
                value={selectedLoanId}
                onChange={(e) => setSelectedLoanId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-amber-500 outline-none"
              >
                {activeLoans.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} (Remaining: ₹{l.remainingAmount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Repayment Amount */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{t.amount} (₹)</span>
                {currentLoan && (
                  <span className="text-slate-500">
                    Instalment: ₹{currentLoan.repaymentAmount}
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-bold text-lg text-amber-700">₹</span>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={currentLoan ? String(currentLoan.repaymentAmount) : "0"}
                  className={`w-full pl-9 pr-4 py-3 bg-slate-50 border rounded-2xl text-xl font-bold text-slate-900 focus:bg-white outline-none ${
                    isOverpaying ? 'border-rose-500 focus:border-rose-600' : 'border-slate-200 focus:border-amber-500'
                  }`}
                  required
                  autoFocus
                />
              </div>

              {isOverpaying && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {t.overpaymentWarning}
                </p>
              )}
            </div>

            {/* Live calculation banner (Item 9 requirement) */}
            {currentLoan && (
              <div className="p-3 bg-pastel-mint rounded-2xl border border-emerald-200 text-xs">
                <span className="font-semibold text-emerald-900 block">
                  Loan remaining after this payment:
                </span>
                <span className="font-display font-extrabold text-base text-emerald-800">
                  ₹{remainingAfterPayment.toLocaleString()}
                </span>
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['UPI', 'Cash', 'Bank Transfer'].map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-medium transition ${
                      method === m
                        ? 'bg-amber-600 text-white font-bold shadow-soft'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.date}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-amber-500 outline-none"
                required
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.note}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. PhonePe receipt #9842"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-amber-500 outline-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isOverpaying}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-soft active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                <span>Review & Save Repayment</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
