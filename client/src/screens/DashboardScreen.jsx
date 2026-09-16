import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Wallet 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NaturalVendorImage from '../components/NaturalVendorImage';
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
      <div className="relative overflow-hidden bg-[#FAF3EA] rounded-3xl p-5 border border-[#EAE1D4] shadow-soft flex items-center justify-between gap-3">
        {/* Soft pastel background arch motif (like Digital Designer reference) */}
        <div className="absolute top-0 right-12 w-32 h-44 bg-[#EAF0E9] rounded-b-full opacity-60 pointer-events-none -z-0" />
        <div className="absolute -bottom-6 right-2 w-28 h-28 bg-[#F9EDE7] rounded-full opacity-50 pointer-events-none -z-0" />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6B8569] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#566E54] bg-[#E9EFE8] px-2 py-0.5 rounded-full border border-[#D3DFD2]">
              {profile.businessType || 'Local Vendor'}
            </span>
          </div>
          <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] leading-tight">
            {getGreeting()}, {profile.ownerName.split(' ')[0]}! 👋
          </h1>
          <p className="text-xs text-[#7C746F] font-medium">
            {profile.businessName}
          </p>
        </div>

        {/* Seamless 2D Indian Vendor Illustration (Flower Seller woman) */}
        <div className="relative shrink-0 z-10">
          <NaturalVendorImage 
            type="flowers"
            size="md"
            backdrop="arch"
            backdropColor="sage"
            showBotanical={true}
            alt="Flower Vendor"
          />
        </div>
      </div>

      {/* 2. Visual Financial Flow Ribbon */}
      <div className="bg-white rounded-3xl p-3.5 border border-[#EBE3D7] shadow-soft">
        <div className="text-[10px] font-bold text-[#8E8681] uppercase tracking-wider mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6B8569]" />
            <span>Flow of Money Today</span>
          </div>
          <span className="text-[10px] text-[#566E54] font-semibold bg-[#E9EFE8] px-2 py-0.5 rounded-full">
            Clear & Balanced
          </span>
        </div>
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto text-center text-xs">
          <div className="flex-1 bg-[#E9EFE8]/80 p-2.5 rounded-2xl border border-[#D3DFD2]">
            <span className="text-[10px] text-[#425541] block font-medium">{t.flowSales}</span>
            <span className="font-bold text-[#314030] text-xs">₹{todaySalesTotal}</span>
          </div>
          <span className="text-[#C3B099] font-bold text-xs">−</span>
          <div className="flex-1 bg-[#F8ECE6]/80 p-2.5 rounded-2xl border border-[#F0D7CD]">
            <span className="text-[10px] text-[#874937] block font-medium">{t.flowExpenses}</span>
            <span className="font-bold text-[#673627] text-xs">₹{todayExpensesTotal}</span>
          </div>
          <span className="text-[#C3B099] font-bold text-xs">−</span>
          <div className="flex-1 bg-[#F2F0F8]/80 p-2.5 rounded-2xl border border-[#E3DFEF]">
            <span className="text-[10px] text-[#554C78] block font-medium">{t.flowRepayment}</span>
            <span className="font-bold text-[#3F3760] text-xs">₹{todayRepaymentsTotal}</span>
          </div>
          <span className="text-[#C3B099] font-bold text-xs">=</span>
          <div className="flex-1 bg-[#6B8569] text-white p-2.5 rounded-2xl shadow-pastel">
            <span className="text-[10px] text-[#E9EFE8] block font-semibold">{t.flowMoneyLeft}</span>
            <span className="font-bold text-xs">₹{moneyLeft}</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN CARD: "Today's Money" */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft-md relative overflow-hidden">
        {/* Soft pastel corner organic aura */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#E9EFE8]/70 via-[#FAF7F2]/40 to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div>
            <h2 className="font-serif font-bold text-lg text-[#2D2825] flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#6B8569]" />
              <span>{t.todaysMoney}</span>
            </h2>
            <p className="text-xs text-[#7C746F] font-medium">
              Daily earnings, operational costs, and cash in hand
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF7F2] text-[#605955] border border-[#EBE3D7]">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* 3 Breakdown Columns: Sales, Expenses, Repayment */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 relative z-10">
          {/* Sales */}
          <div className="bg-[#E9EFE8]/70 p-3 rounded-2xl border border-[#D3DFD2] text-center transition hover:bg-[#E9EFE8]">
            <span className="text-[11px] font-semibold text-[#425541] block">
              {t.todaysSales}
            </span>
            <span className="font-display font-bold text-base sm:text-lg text-[#314030] mt-0.5 block">
              ₹{todaySalesTotal.toLocaleString()}
            </span>
          </div>

          {/* Expenses */}
          <div className="bg-[#F8ECE6]/70 p-3 rounded-2xl border border-[#F0D7CD] text-center transition hover:bg-[#F8ECE6]">
            <span className="text-[11px] font-semibold text-[#874937] block">
              {t.todaysExpenses}
            </span>
            <span className="font-display font-bold text-base sm:text-lg text-[#673627] mt-0.5 block">
              ₹{todayExpensesTotal.toLocaleString()}
            </span>
          </div>

          {/* Repayment */}
          <div className="bg-[#F2F0F8]/70 p-3 rounded-2xl border border-[#E3DFEF] text-center transition hover:bg-[#F2F0F8]">
            <span className="text-[11px] font-semibold text-[#554C78] block">
              {t.todaysRepayment}
            </span>
            <span className="font-display font-bold text-base sm:text-lg text-[#3F3760] mt-0.5 block">
              ₹{todayRepaymentsTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* PROMINENT "Money Left" Banner */}
        <div className="bg-gradient-to-r from-[#6B8569] via-[#5D775B] to-[#4F674D] text-white rounded-2xl p-4 sm:p-5 shadow-pastel flex items-center justify-between gap-3 relative z-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D3DFD2] block">
              {t.moneyLeft} (Cash In Hand)
            </span>
            <div className="font-serif font-bold text-3xl sm:text-4xl tracking-tight mt-0.5">
              ₹{moneyLeft.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#E9EFE8] mt-1">
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
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft">
        <h2 className="text-xs font-bold text-[#8E8681] uppercase tracking-wider mb-3">
          {t.quickActions}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* + Add Sale */}
          <button
            onClick={() => setSaleOpen(true)}
            className="flex items-center gap-2 p-3 rounded-2xl bg-[#E9EFE8] hover:bg-[#DDE7DC] text-[#314030] border border-[#D3DFD2] font-semibold text-xs transition touch-press"
          >
            <div className="w-8 h-8 rounded-xl bg-[#6B8569] text-white flex items-center justify-center shrink-0 shadow-soft">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-left">{t.addSale}</span>
          </button>

          {/* + Add Expense */}
          <button
            onClick={() => setExpenseOpen(true)}
            className="flex items-center gap-2 p-3 rounded-2xl bg-[#F8ECE6] hover:bg-[#F2DFD6] text-[#673627] border border-[#F0D7CD] font-semibold text-xs transition touch-press"
          >
            <div className="w-8 h-8 rounded-xl bg-[#BF745F] text-white flex items-center justify-center shrink-0 shadow-soft">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-left">{t.addExpense}</span>
          </button>

          {/* + Add Repayment */}
          <button
            onClick={() => setRepayOpen(true)}
            className="flex items-center gap-2 p-3 rounded-2xl bg-[#F2F0F8] hover:bg-[#E7E2F2] text-[#3F3760] border border-[#E3DFEF] font-semibold text-xs transition touch-press"
          >
            <div className="w-8 h-8 rounded-xl bg-[#877EB0] text-white flex items-center justify-center shrink-0 shadow-soft">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-left">{t.addRepayment}</span>
          </button>

          {/* + Add Loan */}
          <button
            onClick={() => setLoanOpen(true)}
            className="flex items-center gap-2 p-3 rounded-2xl bg-[#F3EDE3] hover:bg-[#EAE0D2] text-[#48433F] border border-[#DACBB8] font-semibold text-xs transition touch-press"
          >
            <div className="w-8 h-8 rounded-xl bg-[#605955] text-white flex items-center justify-center shrink-0 shadow-soft">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-left">{t.addLoan}</span>
          </button>
        </div>
      </div>

      {/* 5. LOAN SUMMARY CARD */}
      <div className="bg-white rounded-3xl p-5 border border-[#EBE3D7] shadow-soft space-y-3.5">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#554C78] uppercase tracking-wider bg-[#F2F0F8] px-2.5 py-0.5 rounded-full border border-[#E3DFEF]">
              Microloan Health
            </span>
            <h2 className="font-serif font-bold text-base text-[#2D2825] mt-1">
              {t.loanSummaryTitle}
            </h2>
            <div className="font-display font-bold text-2xl text-[#2D2825] mt-0.5">
              ₹{totalLoanRemaining.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9EFE8] text-[#425541] border border-[#D3DFD2] text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#6B8569]" />
            <span>{t.onTrack}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-[#7C746F] mb-1">
            <span>Overall Repayment</span>
            <span>
              {nextRepaymentLoan ? Math.round((nextRepaymentLoan.totalRepaid / nextRepaymentLoan.originalAmount) * 100) : 0}% Paid
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6B8569] to-[#8EAA8C] rounded-full transition-all duration-500"
              style={{
                width: `${nextRepaymentLoan ? Math.min(100, Math.round((nextRepaymentLoan.totalRepaid / nextRepaymentLoan.originalAmount) * 100)) : 0}%`
              }}
            />
          </div>
        </div>

        {/* Next Repayment Pill Alert */}
        {nextRepaymentLoan && (
          <div className="bg-[#FCF7F4] border border-[#F0D7CD] rounded-2xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#BF745F] shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#2D2825] block">
                  {t.nextRepayment}: ₹{nextRepaymentLoan.repaymentAmount}
                </span>
                <span className="text-[10px] text-[#874937] font-semibold">
                  Due Tomorrow ({nextRepaymentLoan.name})
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedLoanId(nextRepaymentLoan.id);
                setActiveTab('loans');
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#BF745F] hover:bg-[#A65E4A] text-white font-bold text-xs shadow-pastel-terracotta transition touch-press"
            >
              Pay Now
            </button>
          </div>
        )}

        {/* Footer Link */}
        <button
          onClick={() => setActiveTab('loans')}
          className="w-full text-center text-xs font-bold text-[#566E54] hover:text-[#314030] flex items-center justify-center gap-1 pt-1 transition"
        >
          <span>{t.viewAllLoans}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. RECENT TRANSACTIONS */}
      <div className="bg-white rounded-3xl p-5 border border-[#EBE3D7] shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-base text-[#2D2825]">
            {t.recentTransactions}
          </h2>
          <button
            onClick={() => setActiveTab('sales')}
            className="text-xs font-bold text-[#566E54] hover:underline"
          >
            {t.viewAll}
          </button>
        </div>

        {recentCombined.length > 0 ? (
          <div className="divide-y divide-[#F3EDE3]">
            {recentCombined.map((tx) => (
              <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                    tx.txType === 'sale' ? 'bg-[#E9EFE8] text-[#425541]' : 'bg-[#F8ECE6] text-[#874937]'
                  }`}>
                    {tx.txType === 'sale' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-semibold text-[#2D2825] block">
                      {tx.category}
                    </span>
                    <span className="text-[10px] text-[#7C746F]">
                      {tx.time || tx.date} • {tx.note || (tx.txType === 'sale' ? 'Customer Sale' : 'Store Cost')}
                    </span>
                  </div>
                </div>

                <span className={`font-display font-bold text-sm ${
                  tx.txType === 'sale' ? 'text-[#566E54]' : 'text-[#BF745F]'
                }`}>
                  {tx.txType === 'sale' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#9A938E] py-3 text-center">
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
