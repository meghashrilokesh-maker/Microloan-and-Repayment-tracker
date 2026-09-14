import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Landmark, 
  CreditCard, 
  Plus, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Calendar,
  Wallet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  AddSaleModal, 
  AddExpenseModal, 
  AddLoanModal, 
  AddRepaymentModal 
} from '../components/TransactionModals';

export default function DashboardScreen() {
  const { 
    t, 
    profile, 
    todaySalesTotal, 
    todayExpensesTotal, 
    todayRepaymentsTotal, 
    moneyLeft,
    totalLoanRemaining,
    nextRepaymentLoan,
    sales,
    expenses,
    setActiveTab,
    setSelectedLoanId
  } = useApp();

  // Modal controls
  const [saleOpen, setSaleOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [repayOpen, setRepayOpen] = useState(false);

  // Time based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetingMorning;
    if (hour < 17) return t.greetingAfternoon;
    return t.greetingEvening;
  };

  // Recent transactions combined (sales & expenses)
  const recentCombined = [
    ...sales.slice(0, 3).map(s => ({ ...s, txType: 'sale' })),
    ...expenses.slice(0, 3).map(e => ({ ...e, txType: 'expense' }))
  ].sort((a, b) => new Date(b.date + ' ' + (b.time || '00:00')) - new Date(a.date + ' ' + (a.time || '00:00')))
  .slice(0, 4);

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* 1. Top Greeting & Vendor Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-white to-amber-50 rounded-3xl p-4 sm:p-5 border border-emerald-100/80 shadow-soft flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              {profile.businessType || 'Local Vendor'}
            </span>
          </div>
          <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 leading-tight">
            {getGreeting()}, {profile.ownerName.split(' ')[0]}! 👋
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            {profile.businessName}
          </p>
        </div>

        {/* Natural Vendor picture blending seamlessly into the hero card */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white/60 p-1 shrink-0 flex items-center justify-center border border-white shadow-soft">
          <img 
            src="/images/vendor-flowers.jpg" 
            alt="Vendor Flower Basket" 
            className="w-full h-full object-contain vendor-photo-blend"
          />
        </div>
      </div>

      {/* 2. UX RULE #21: Visual Financial Flow Ribbon */}
      <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-soft">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <span>Flow of Money Today</span>
          <span className="text-[10px] text-emerald-600 font-semibold">• Simple & Clear</span>
        </div>
        <div className="flex items-center justify-between gap-1 overflow-x-auto text-center text-xs">
          <div className="flex-1 bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
            <span className="text-[10px] text-emerald-800 block font-medium">{t.flowSales}</span>
            <span className="font-bold text-emerald-700 text-xs">₹{todaySalesTotal}</span>
          </div>
          <span className="text-slate-300 font-bold text-xs">−</span>
          <div className="flex-1 bg-rose-50/70 p-2 rounded-xl border border-rose-100">
            <span className="text-[10px] text-rose-800 block font-medium">{t.flowExpenses}</span>
            <span className="font-bold text-rose-700 text-xs">₹{todayExpensesTotal}</span>
          </div>
          <span className="text-slate-300 font-bold text-xs">−</span>
          <div className="flex-1 bg-amber-50/70 p-2 rounded-xl border border-amber-100">
            <span className="text-[10px] text-amber-800 block font-medium">{t.flowRepayment}</span>
            <span className="font-bold text-amber-700 text-xs">₹{todayRepaymentsTotal}</span>
          </div>
          <span className="text-slate-300 font-bold text-xs">=</span>
          <div className="flex-1 bg-emerald-600 text-white p-2 rounded-xl shadow-soft">
            <span className="text-[10px] text-emerald-100 block font-bold">{t.flowMoneyLeft}</span>
            <span className="font-extrabold text-xs">₹{moneyLeft}</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN CARD: "Today's Money" (Heart of the application) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-soft-lg relative overflow-hidden">
        {/* Subtle pastel corner aura */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-100/50 via-teal-50/20 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <span>{t.todaysMoney}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Daily earnings, costs, and cash in hand
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* 3 Breakdown Columns: Sales, Expenses, Repayment */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          {/* Sales */}
          <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 text-center">
            <span className="text-[11px] font-semibold text-emerald-800 block">
              {t.todaysSales}
            </span>
            <span className="font-display font-bold text-base sm:text-lg text-emerald-700 mt-0.5 block">
              ₹{todaySalesTotal.toLocaleString()}
            </span>
          </div>

          {/* Expenses */}
          <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-100 text-center">
            <span className="text-[11px] font-semibold text-rose-800 block">
              {t.todaysExpenses}
            </span>
            <span className="font-display font-bold text-base sm:text-lg text-rose-700 mt-0.5 block">
              ₹{todayExpensesTotal.toLocaleString()}
            </span>
          </div>

          {/* Repayment */}
          <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100 text-center">
            <span className="text-[11px] font-semibold text-amber-800 block">
              {t.todaysRepayment}
            </span>
            <span className="font-display font-bold text-base sm:text-lg text-amber-700 mt-0.5 block">
              ₹{todayRepaymentsTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* PROMINENT "Money Left" Banner (Specified as visually prominent) */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 sm:p-5 shadow-pastel flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200 block">
              {t.moneyLeft} (Cash In Hand)
            </span>
            <div className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight mt-0.5">
              ₹{moneyLeft.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-100 mt-1">
              {t.moneyLeftSubtitle}
            </p>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-bold text-white border border-white/30">
              Safe to Take Home
            </span>
          </div>
        </div>
      </div>

      {/* 4. QUICK ACTION BUTTONS */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-soft">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          {t.quickActions}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* + Add Sale */}
          <button
            onClick={() => setSaleOpen(true)}
            className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/70 font-semibold text-xs transition touch-press"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-soft">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-left">{t.addSale}</span>
          </button>

          {/* + Add Expense */}
          <button
            onClick={() => setExpenseOpen(true)}
            className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 hover:bg-rose-100/80 text-rose-900 border border-rose-200/70 font-semibold text-xs transition touch-press"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-soft">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-left">{t.addExpense}</span>
          </button>

          {/* + Add Repayment */}
          <button
            onClick={() => setRepayOpen(true)}
            className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/70 font-semibold text-xs transition touch-press"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-soft">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-left">{t.addRepayment}</span>
          </button>

          {/* + Add Loan */}
          <button
            onClick={() => setLoanOpen(true)}
            className="flex items-center gap-2 p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 text-indigo-900 border border-indigo-200/70 font-semibold text-xs transition touch-press"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-soft">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-left">{t.addLoan}</span>
          </button>
        </div>
      </div>

      {/* 5. LOAN SUMMARY CARD */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-3.5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md">
              Microloan Health
            </span>
            <h2 className="font-display font-bold text-base text-slate-900 mt-1">
              {t.loanSummaryTitle}
            </h2>
            <div className="font-display font-extrabold text-2xl text-indigo-900 mt-0.5">
              ₹{totalLoanRemaining.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.onTrack}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Overall Repayment</span>
            <span>
              {nextRepaymentLoan ? Math.round((nextRepaymentLoan.totalRepaid / nextRepaymentLoan.originalAmount) * 100) : 0}% Paid
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{
                width: `${nextRepaymentLoan ? Math.min(100, Math.round((nextRepaymentLoan.totalRepaid / nextRepaymentLoan.originalAmount) * 100)) : 0}%`
              }}
            />
          </div>
        </div>

        {/* Next Repayment Pill Alert */}
        {nextRepaymentLoan && (
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {t.nextRepayment}: ₹{nextRepaymentLoan.repaymentAmount}
                </span>
                <span className="text-[10px] text-amber-800 font-semibold">
                  Due Tomorrow ({nextRepaymentLoan.name})
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedLoanId(nextRepaymentLoan.id);
                setActiveTab('loans');
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-soft transition"
            >
              Pay Now
            </button>
          </div>
        )}

        {/* Footer Link */}
        <button
          onClick={() => setActiveTab('loans')}
          className="w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 pt-1"
        >
          <span>{t.viewAllLoans}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. RECENT TRANSACTIONS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-slate-900">
            {t.recentTransactions}
          </h2>
          <button
            onClick={() => setActiveTab('sales')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            {t.viewAll}
          </button>
        </div>

        {recentCombined.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentCombined.map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                    tx.txType === 'sale' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {tx.txType === 'sale' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {tx.category}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {tx.time || tx.date} • {tx.note || (tx.txType === 'sale' ? 'Customer Sale' : 'Store Cost')}
                    </span>
                  </div>
                </div>

                <span className={`font-display font-bold text-sm ${
                  tx.txType === 'sale' ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {tx.txType === 'sale' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3 text-center">
            {t.noTransactionsYet}
          </p>
        )}
      </div>

      {/* Modals */}
      <AddSaleModal isOpen={saleOpen} onClose={() => setSaleOpen(false)} />
      <AddExpenseModal isOpen={expenseOpen} onClose={() => setExpenseOpen(false)} />
      <AddLoanModal isOpen={loanOpen} onClose={() => setLoanOpen(false)} />
      <AddRepaymentModal isOpen={repayOpen} onClose={() => setRepayOpen(false)} />
    </div>
  );
}
