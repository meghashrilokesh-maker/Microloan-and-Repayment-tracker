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
    ...sales.slice(0, 4).map(s => ({ ...s, txType: 'sale' })),
    ...expenses.slice(0, 4).map(e => ({ ...e, txType: 'expense' }))
  ].sort((a, b) => new Date(b.date + ' ' + (b.time || '00:00')) - new Date(a.date + ' ' + (a.time || '00:00')))
  .slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. TOP GREETING & VENDOR HERO BANNER */}
      <div className="relative overflow-hidden bg-[#FAF3EA] rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#EAE1D4] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Soft pastel background arch motif */}
        <div className="absolute top-0 right-24 w-40 h-52 bg-[#EAF0E9] rounded-b-full opacity-60 pointer-events-none -z-0" />
        <div className="absolute -bottom-8 right-4 w-36 h-36 bg-[#F9EDE7] rounded-full opacity-50 pointer-events-none -z-0" />

        <div className="space-y-2 z-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6B8569] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#566E54] bg-[#E9EFE8] px-2.5 py-0.5 rounded-full border border-[#D3DFD2]">
              {profile.businessType || 'Local Vendor'}
            </span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#2D2825] leading-tight">
            {getGreeting()}, {profile.ownerName.split(' ')[0]}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#7C746F] font-medium">
            {profile.businessName} • {profile.location || 'Daily Shop Overview'}
          </p>
        </div>

        {/* Seamless 2D Indian Vendor Illustration */}
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

      {/* 2. RESPONSIVE DASHBOARD GRID: Left Main Content (8 cols) & Right Sidebar (4 cols) on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Financial Flow Ribbon, Main Today's Money Card, Quick Actions */}
        <div className="lg:col-span-8 space-y-6">
          {/* Visual Financial Flow Ribbon */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft">
            <div className="text-[10px] font-bold text-[#8E8681] uppercase tracking-wider mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#6B8569]" />
                <span>Flow of Money Today</span>
              </div>
              <span className="text-[10px] text-[#566E54] font-semibold bg-[#E9EFE8] px-2.5 py-0.5 rounded-full border border-[#D3DFD2]">
                Balanced & Real-Time
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 overflow-x-auto text-center text-xs">
              <div className="flex-1 min-w-[75px] bg-[#E9EFE8]/80 p-3 rounded-2xl border border-[#D3DFD2]">
                <span className="text-[10px] text-[#425541] block font-medium">{t.flowSales}</span>
                <span className="font-serif font-bold text-[#314030] text-sm sm:text-base mt-0.5 block">₹{todaySalesTotal}</span>
              </div>
              <span className="text-[#C3B099] font-bold text-sm">−</span>
              <div className="flex-1 min-w-[75px] bg-[#F8ECE6]/80 p-3 rounded-2xl border border-[#F0D7CD]">
                <span className="text-[10px] text-[#874937] block font-medium">{t.flowExpenses}</span>
                <span className="font-serif font-bold text-[#673627] text-sm sm:text-base mt-0.5 block">₹{todayExpensesTotal}</span>
              </div>
              <span className="text-[#C3B099] font-bold text-sm">−</span>
              <div className="flex-1 min-w-[75px] bg-[#F2F0F8]/80 p-3 rounded-2xl border border-[#E3DFEF]">
                <span className="text-[10px] text-[#554C78] block font-medium">{t.flowRepayment}</span>
                <span className="font-serif font-bold text-[#3F3760] text-sm sm:text-base mt-0.5 block">₹{todayRepaymentsTotal}</span>
              </div>
              <span className="text-[#C3B099] font-bold text-sm">=</span>
              <div className="flex-1 min-w-[85px] bg-[#6B8569] text-white p-3 rounded-2xl shadow-pastel">
                <span className="text-[10px] text-[#E9EFE8] block font-semibold">{t.flowMoneyLeft}</span>
                <span className="font-serif font-bold text-sm sm:text-base mt-0.5 block">₹{moneyLeft}</span>
              </div>
            </div>
          </div>

          {/* MAIN CARD: "Today's Money" */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EBE3D7] shadow-soft relative overflow-hidden">
            {/* Pastel background aura */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#E9EFE8]/70 via-[#FAF7F2]/40 to-transparent rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between mb-5 relative z-10">
              <div>
                <h2 className="font-serif font-bold text-xl text-[#2D2825] flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#6B8569]" />
                  <span>{t.todaysMoney}</span>
                </h2>
                <p className="text-xs text-[#7C746F] font-medium mt-0.5">
                  Daily earnings, operational costs, and actual cash in hand
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FAF7F2] text-[#605955] border border-[#EBE3D7]">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' })}
              </span>
            </div>

            {/* 3 Breakdown Columns */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-5 relative z-10">
              {/* Sales */}
              <div 
                onClick={() => setActiveTab('sales')}
                className="bg-[#E9EFE8]/70 hover:bg-[#E9EFE8] p-3.5 sm:p-4 rounded-2xl border border-[#D3DFD2] text-center transition cursor-pointer group"
              >
                <span className="text-[11px] font-semibold text-[#425541] block group-hover:underline">
                  {t.todaysSales}
                </span>
                <span className="font-serif font-bold text-base sm:text-xl text-[#314030] mt-1 block">
                  ₹{todaySalesTotal.toLocaleString()}
                </span>
              </div>

              {/* Expenses */}
              <div 
                onClick={() => setActiveTab('expenses')}
                className="bg-[#F8ECE6]/70 hover:bg-[#F8ECE6] p-3.5 sm:p-4 rounded-2xl border border-[#F0D7CD] text-center transition cursor-pointer group"
              >
                <span className="text-[11px] font-semibold text-[#874937] block group-hover:underline">
                  {t.todaysExpenses}
                </span>
                <span className="font-serif font-bold text-base sm:text-xl text-[#673627] mt-1 block">
                  ₹{todayExpensesTotal.toLocaleString()}
                </span>
              </div>

              {/* Repayment */}
              <div 
                onClick={() => setActiveTab('loans')}
                className="bg-[#F2F0F8]/70 hover:bg-[#F2F0F8] p-3.5 sm:p-4 rounded-2xl border border-[#E3DFEF] text-center transition cursor-pointer group"
              >
                <span className="text-[11px] font-semibold text-[#554C78] block group-hover:underline">
                  {t.todaysRepayment}
                </span>
                <span className="font-serif font-bold text-base sm:text-xl text-[#3F3760] mt-1 block">
                  ₹{todayRepaymentsTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* PROMINENT "Money Left" Banner */}
            <div className="bg-gradient-to-r from-[#6B8569] via-[#5D775B] to-[#4F674D] text-white rounded-2xl p-5 sm:p-6 shadow-pastel flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#D3DFD2] block">
                  {t.moneyLeft} (Cash In Hand)
                </span>
                <div className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight mt-1">
                  ₹{moneyLeft.toLocaleString()}
                </div>
                <p className="text-xs text-[#E9EFE8] mt-1.5 opacity-90">
                  {t.moneyLeftSubtitle}
                </p>
              </div>

              <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2 shrink-0">
                <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur text-xs font-bold text-white border border-white/30">
                  ✓ Safe to Take Home
                </span>
                <span className="text-[11px] text-[#D3DFD2] hidden sm:block">
                  After all today's costs & dues
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft">
            <h2 className="text-xs font-bold text-[#8E8681] uppercase tracking-wider mb-3.5">
              {t.quickActions}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* + Add Sale */}
              <button
                onClick={() => setSaleOpen(true)}
                className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-[#E9EFE8] hover:bg-[#DDE7DC] text-[#314030] border border-[#D3DFD2] font-semibold text-xs transition touch-press"
              >
                <div className="w-8 h-8 rounded-xl bg-[#6B8569] text-white flex items-center justify-center shrink-0 shadow-soft">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-left font-bold">{t.addSale}</span>
              </button>

              {/* + Add Expense */}
              <button
                onClick={() => setExpenseOpen(true)}
                className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-[#F8ECE6] hover:bg-[#F2DFD6] text-[#673627] border border-[#F0D7CD] font-semibold text-xs transition touch-press"
              >
                <div className="w-8 h-8 rounded-xl bg-[#BF745F] text-white flex items-center justify-center shrink-0 shadow-soft">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-left font-bold">{t.addExpense}</span>
              </button>

              {/* + Add Repayment */}
              <button
                onClick={() => setRepayOpen(true)}
                className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-[#F2F0F8] hover:bg-[#E7E2F2] text-[#3F3760] border border-[#E3DFEF] font-semibold text-xs transition touch-press"
              >
                <div className="w-8 h-8 rounded-xl bg-[#877EB0] text-white flex items-center justify-center shrink-0 shadow-soft">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-left font-bold">{t.addRepayment}</span>
              </button>

              {/* + Add Loan */}
              <button
                onClick={() => setLoanOpen(true)}
                className="flex items-center gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-[#F3EDE3] hover:bg-[#EAE0D2] text-[#48433F] border border-[#DACBB8] font-semibold text-xs transition touch-press"
              >
                <div className="w-8 h-8 rounded-xl bg-[#605955] text-white flex items-center justify-center shrink-0 shadow-soft">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-left font-bold">{t.addLoan}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Loan Summary Health Card & Recent Transactions Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* LOAN SUMMARY CARD */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#554C78] uppercase tracking-wider bg-[#F2F0F8] px-2.5 py-0.5 rounded-full border border-[#E3DFEF]">
                  Microloan Health
                </span>
                <h2 className="font-serif font-bold text-base text-[#2D2825] mt-1.5">
                  {t.loanSummaryTitle}
                </h2>
                <div className="font-serif font-bold text-2xl sm:text-3xl text-[#2D2825] mt-0.5">
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
              <div className="flex justify-between text-xs font-semibold text-[#7C746F] mb-1.5">
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
              <div className="bg-[#FCF7F4] border border-[#F0D7CD] rounded-2xl p-3.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
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
                  className="px-3.5 py-1.5 rounded-full bg-[#BF745F] hover:bg-[#A65E4A] text-white font-bold text-xs shadow-pastel-terracotta transition touch-press shrink-0"
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

          {/* RECENT TRANSACTIONS CARD */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft space-y-3.5">
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
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        tx.txType === 'sale' ? 'bg-[#E9EFE8] text-[#425541]' : 'bg-[#F8ECE6] text-[#874937]'
                      }`}>
                        {tx.txType === 'sale' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="font-semibold text-[#2D2825] block truncate max-w-[130px] sm:max-w-[160px]">
                          {tx.category}
                        </span>
                        <span className="text-[10px] text-[#7C746F]">
                          {tx.time || tx.date} • {tx.note || (tx.txType === 'sale' ? 'Sale' : 'Cost')}
                        </span>
                      </div>
                    </div>

                    <span className={`font-serif font-bold text-sm shrink-0 ${
                      tx.txType === 'sale' ? 'text-[#566E54]' : 'text-[#BF745F]'
                    }`}>
                      {tx.txType === 'sale' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#9A938E] py-4 text-center">
                {t.noTransactionsYet}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddSaleModal isOpen={saleOpen} onClose={() => setSaleOpen(false)} />
      <AddExpenseModal isOpen={expenseOpen} onClose={() => setExpenseOpen(false)} />
      <AddLoanModal isOpen={loanOpen} onClose={() => setLoanOpen(false)} />
      <AddRepaymentModal isOpen={repayOpen} onClose={() => setRepayOpen(false)} />
    </div>
  );
}
