import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  BarChart3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NaturalVendorImage from '../components/NaturalVendorImage';

export default function ReportsScreen() {
  const { 
    t, 
    loans, 
    totalLoanRemaining, 
    totalOriginalLoan,
    totalRepaidSoFar,
    todaySalesTotal,
    todayExpensesTotal
  } = useApp();

  const [filterPeriod, setFilterPeriod] = useState('Week'); // 'Week' | 'Month'

  // Weekly data for clean visual charts
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
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Top Banner with 2D Indian Vendor illustration */}
      <div className="relative overflow-hidden bg-[#FAF4ED] rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#EAE1D4] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 right-24 w-40 h-52 bg-[#F2DDD4]/60 rounded-b-full pointer-events-none -z-0" />
        <div className="absolute -bottom-8 right-4 w-36 h-36 bg-[#EAF0E9]/70 rounded-full pointer-events-none -z-0" />

        <div className="z-10 text-center sm:text-left space-y-1.5">
          <span className="text-[10px] font-bold tracking-wider text-[#605955] uppercase bg-[#F3EDE3] px-2.5 py-0.5 rounded-full border border-[#DACBB8]">
            Finances at a Glance
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#2D2825]">
            {t.reportsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#7C746F] font-medium">
            Clear visual trends and cash flow insights designed for street vendors
          </p>
        </div>

        <div className="relative shrink-0 z-10">
          <NaturalVendorImage 
            type="farmer"
            size="md"
            backdrop="arch"
            backdropColor="sand"
            showBotanical={true}
            alt="Business Insights"
          />
        </div>
      </div>

      {/* 2. Filter Tabs & Date Scope */}
      <div className="flex items-center justify-between">
        <div className="flex bg-white p-1 rounded-full border border-[#EBE3D7] shadow-soft text-xs font-semibold">
          {['Week', 'Month'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPeriod(p)}
              className={`px-4 py-2 rounded-full transition-all duration-200 touch-press ${
                filterPeriod === p
                  ? 'bg-[#566E54] text-white shadow-soft font-bold'
                  : 'text-[#7C746F] hover:text-[#2D2825]'
              }`}
            >
              {p === 'Week' ? t.filterWeek : t.filterMonth}
            </button>
          ))}
        </div>
        <span className="text-xs font-medium text-[#7C746F] hidden sm:block">
          Last 7 Days Operating Activity
        </span>
      </div>

      {/* 3. Three Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#D3DFD2] shadow-soft text-center bg-[#F5F8F5]/60">
          <span className="text-xs font-semibold text-[#7C746F] block">Total Sales</span>
          <span className="font-serif font-bold text-xl sm:text-2xl text-[#566E54] mt-1 block">
            ₹{totalPeriodSales.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#8EAA8C] font-semibold mt-0.5 block">Recorded revenue</span>
        </div>
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F0D7CD] shadow-soft text-center bg-[#FCF7F4]/60">
          <span className="text-xs font-semibold text-[#7C746F] block">Total Expenses</span>
          <span className="font-serif font-bold text-xl sm:text-2xl text-[#BF745F] mt-1 block">
            ₹{totalPeriodExpenses.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#D39C8C] font-semibold mt-0.5 block">Stock & operational costs</span>
        </div>
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E3DFEF] shadow-soft text-center bg-[#F9F8FC]/60">
          <span className="text-xs font-semibold text-[#7C746F] block">{t.netMoney} (Surplus)</span>
          <span className="font-serif font-bold text-xl sm:text-2xl text-[#554C78] mt-1 block">
            ₹{netSavings.toLocaleString()}
          </span>
          <span className="text-[10px] text-[#A8A0C7] font-semibold mt-0.5 block">Cash retained</span>
        </div>
      </div>

      {/* 4. RESPONSIVE REPORTS GRID: Trend Chart (7 cols) + Health & Progress (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Visual Chart: Sales vs Expenses Trend */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border border-[#EBE3D7] shadow-soft space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#2D2825] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#566E54]" />
                <span>{t.salesVsExpenses}</span>
              </h2>
              <p className="text-xs text-[#7C746F] font-medium mt-0.5">
                Daily comparison of sales inflow vs expense outflow
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#566E54]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6B8569]" /> Sales Inflow
              </span>
              <span className="flex items-center gap-1.5 text-[#BF745F]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D39C8C]" /> Expense Outflow
              </span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="pt-4 pb-2">
            <div className="h-52 sm:h-60 flex items-end justify-between gap-2 sm:gap-4 border-b border-[#EBE3D7] px-2">
              {weeklyDays.map((item, idx) => {
                const salesHeight = (item.sales / maxVal) * 100;
                const expHeight = (item.expenses / maxVal) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                      {/* Sales Bar */}
                      <div
                        className="w-1/2 max-w-[18px] bg-[#6B8569] hover:bg-[#566E54] rounded-t-full transition-all duration-300 relative shadow-soft"
                        style={{ height: `${salesHeight}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2D2825] text-white text-[9px] px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap z-10 shadow-soft">
                          ₹{item.sales}
                        </span>
                      </div>
                      {/* Expense Bar */}
                      <div
                        className="w-1/2 max-w-[18px] bg-[#E4BDB0] hover:bg-[#D39C8C] rounded-t-full transition-all duration-300 relative shadow-soft"
                        style={{ height: `${expHeight}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-[#2D2825] text-white text-[9px] px-2 py-0.5 rounded-full pointer-events-none whitespace-nowrap z-10 shadow-soft">
                          ₹{item.expenses}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#7C746F] font-medium truncate w-full text-center">
                      {item.day.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Repayment Health & Affordability Guidance */}
        <div className="lg:col-span-5 space-y-6">
          {/* Repayment Health & Affordability Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#6B8569]" />
                <h2 className="font-serif font-bold text-base text-[#2D2825]">
                  {t.repaymentHealthTitle}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9EFE8] text-[#425541] border border-[#D3DFD2] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#6B8569]" />
                <span>{t.onTrack}</span>
              </div>
            </div>

            {/* Status Pills */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-2xl bg-[#E9EFE8] border border-[#D3DFD2] font-semibold text-[#425541]">
                🟢 {t.onTrack}
              </div>
              <div className="p-2.5 rounded-2xl bg-[#FCF7F4] border border-[#F0D7CD] font-semibold text-[#874937]">
                🟡 {t.dueSoon}
              </div>
              <div className="p-2.5 rounded-2xl bg-[#FAEEF0] border border-[#F4DBDF] font-semibold text-[#8A3846]">
                🔴 {t.overdue}
              </div>
            </div>

            {/* Affordability Advice Card */}
            <div className={`p-4 rounded-2xl border ${
              isManageable 
                ? 'bg-[#E9EFE8]/70 border-[#D3DFD2] text-[#314030]' 
                : 'bg-[#FCF7F4] border-[#F0D7CD] text-[#673627]'
            }`}>
              <div className="flex items-start gap-2.5">
                {isManageable ? (
                  <CheckCircle2 className="w-5 h-5 text-[#6B8569] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[#BF745F] shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs font-bold leading-relaxed">
                    {isManageable ? t.affordabilityGood : t.affordabilityWarning}
                  </p>
                  <p className="text-[11px] opacity-90 mt-1 leading-relaxed">
                    Your average daily surplus is <strong>₹{averageDailySurplus.toLocaleString()}</strong>, compared to your next scheduled instalment of <strong>₹{nextRepaymentAmount.toLocaleString()}</strong>.
                  </p>
                  <p className="text-[10px] text-[#7C746F] mt-2 italic flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    Cash-flow planning guide based on your logged transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loan Repayment Progress Overview */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-base text-[#2D2825]">
                {t.loanPayoffProgress}
              </h2>
              <span className="text-xs font-bold text-[#554C78] bg-[#F2F0F8] px-2.5 py-0.5 rounded-full">
                {Math.round((totalRepaidSoFar / (totalOriginalLoan || 1)) * 100)}% Repaid
              </span>
            </div>

            <div className="w-full h-3 bg-[#FAF7F2] border border-[#EBE3D7] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#877EB0] to-[#6B8569] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((totalRepaidSoFar / (totalOriginalLoan || 1)) * 100))}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EBE3D7]">
                <span className="text-[10px] text-[#7C746F] block">Total Repaid So Far</span>
                <span className="font-serif font-bold text-[#566E54] text-sm mt-0.5 block">
                  ₹{totalRepaidSoFar.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EBE3D7]">
                <span className="text-[10px] text-[#7C746F] block">Remaining Balance</span>
                <span className="font-serif font-bold text-[#3F3760] text-sm mt-0.5 block">
                  ₹{totalLoanRemaining.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
