import React, { useState } from 'react';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Landmark, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ReportsScreen() {
  const { 
    t, 
    sales, 
    expenses, 
    loans, 
    totalLoanRemaining, 
    totalOriginalLoan,
    totalRepaidSoFar,
    todaySalesTotal,
    todayExpensesTotal,
    todayRepaymentsTotal,
    moneyLeft
  } = useApp();

  const [filterPeriod, setFilterPeriod] = useState('Week'); // 'Week' | 'Month'

  // Weekly data mockup for clean visual charts
  const weeklyDays = [
    { day: 'Mon', sales: 2800, expenses: 1100 },
    { day: 'Tue', sales: 3200, expenses: 1400 },
    { day: 'Wed', sales: 2900, expenses: 900 },
    { day: 'Thu', sales: 3400, expenses: 1300 },
    { day: 'Fri', sales: 3100, expenses: 1200 },
    { day: 'Sat', sales: 4200, expenses: 1800 },
    { day: 'Sun (Today)', sales: todaySalesTotal || 3800, expenses: todayExpensesTotal || 1400 },
  ];

  const maxVal = Math.max(...weeklyDays.map(d => Math.max(d.sales, d.expenses)));

  const totalPeriodSales = weeklyDays.reduce((a, b) => a + b.sales, 0);
  const totalPeriodExpenses = weeklyDays.reduce((a, b) => a + b.expenses, 0);
  const netSavings = totalPeriodSales - totalPeriodExpenses;

  // Affordability calculation
  const averageDailySurplus = Math.round((netSavings / 7));
  const nextRepaymentAmount = loans.find(l => l.status !== 'Completed')?.repaymentAmount || 1000;
  const isManageable = averageDailySurplus >= nextRepaymentAmount * 0.8;

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-emerald-50 rounded-3xl p-4 sm:p-5 border border-amber-100 shadow-soft flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase bg-amber-100/70 px-2 py-0.5 rounded-md">
            Finances at a Glance
          </span>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-slate-900 mt-1">
            {t.reportsTitle}
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Simple visual trends without complicated accounting
          </p>
        </div>
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white/70 p-1 shrink-0 flex items-center justify-center border border-amber-100">
          <img 
            src="/images/vendor-business.jpg" 
            alt="Reports" 
            className="w-full h-full object-contain vendor-photo-blend"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs font-semibold">
          {['Week', 'Month'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPeriod(p)}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                filterPeriod === p
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p === 'Week' ? t.filterWeek : t.filterMonth}
            </button>
          ))}
        </div>
        <span className="text-[11px] font-medium text-slate-500">
          Last 7 Days Activity
        </span>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl p-3 border border-emerald-100 shadow-soft text-center">
          <span className="text-[10px] font-semibold text-slate-500 block">Total Sales</span>
          <span className="font-display font-bold text-sm sm:text-base text-emerald-700">
            ₹{totalPeriodSales.toLocaleString()}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-rose-100 shadow-soft text-center">
          <span className="text-[10px] font-semibold text-slate-500 block">Total Expenses</span>
          <span className="font-display font-bold text-sm sm:text-base text-rose-700">
            ₹{totalPeriodExpenses.toLocaleString()}
          </span>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-indigo-100 shadow-soft text-center">
          <span className="text-[10px] font-semibold text-slate-500 block">{t.netMoney}</span>
          <span className="font-display font-extrabold text-sm sm:text-base text-indigo-900">
            ₹{netSavings.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Visual Chart: Sales vs Expenses Trend */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-slate-900">
            {t.salesVsExpenses} (Trend)
          </h2>
          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Sales
            </span>
            <span className="flex items-center gap-1 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Expenses
            </span>
          </div>
        </div>

        {/* Bar Chart Representation */}
        <div className="pt-2 pb-1">
          <div className="h-44 flex items-end justify-between gap-1.5 sm:gap-3 border-b border-slate-200 px-1">
            {weeklyDays.map((item, idx) => {
              const salesHeight = (item.sales / maxVal) * 100;
              const expHeight = (item.expenses / maxVal) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Sales Bar */}
                    <div
                      className="w-1/2 max-w-[16px] bg-emerald-400 group-hover:bg-emerald-500 rounded-t-md transition-all duration-300 relative"
                      style={{ height: `${salesHeight}%` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 rounded pointer-events-none whitespace-nowrap z-10">
                        ₹{item.sales}
                      </span>
                    </div>
                    {/* Expense Bar */}
                    <div
                      className="w-1/2 max-w-[16px] bg-rose-300 group-hover:bg-rose-400 rounded-t-md transition-all duration-300 relative"
                      style={{ height: `${expHeight}%` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 rounded pointer-events-none whitespace-nowrap z-10">
                        ₹{item.expenses}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium truncate w-full text-center">
                    {item.day.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Repayment Health & Affordability Card as requested by item 15 */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="font-display font-bold text-base text-slate-900">
              {t.repaymentHealthTitle}
            </h2>
          </div>
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{t.onTrack}</span>
          </div>
        </div>

        {/* Status Pills */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 font-semibold text-emerald-800">
            🟢 {t.onTrack}
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 font-semibold text-amber-800">
            🟡 {t.dueSoon}
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 font-semibold text-slate-500">
            🔴 {t.overdue}
          </div>
        </div>

        {/* Affordability Advice Card */}
        <div className={`p-4 rounded-2xl border ${
          isManageable 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50/80 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-start gap-2.5">
            {isManageable ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-bold leading-relaxed">
                {isManageable ? t.affordabilityGood : t.affordabilityWarning}
              </p>
              <p className="text-[11px] opacity-80 mt-1">
                Your average daily surplus is <strong>₹{averageDailySurplus.toLocaleString()}</strong>, compared to your next scheduled instalment of <strong>₹{nextRepaymentAmount.toLocaleString()}</strong>.
              </p>
              <p className="text-[10px] text-slate-400 mt-1 italic flex items-center gap-1">
                <Info className="w-3 h-3" />
                This is a cash-flow guide for your daily planning, not a formal credit rating.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Repayment Progress Overview */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-slate-900">
            {t.loanPayoffProgress}
          </h2>
          <span className="text-xs font-bold text-indigo-700">
            {Math.round((totalRepaidSoFar / (totalOriginalLoan || 1)) * 100)}% Repaid
          </span>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
            style={{ width: `${Math.min(100, Math.round((totalRepaidSoFar / (totalOriginalLoan || 1)) * 100))}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 block">Total Repaid Across Loans</span>
            <span className="font-bold text-emerald-700 text-sm">₹{totalRepaidSoFar.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 block">Remaining Balance</span>
            <span className="font-bold text-indigo-900 text-sm">₹{totalLoanRemaining.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
