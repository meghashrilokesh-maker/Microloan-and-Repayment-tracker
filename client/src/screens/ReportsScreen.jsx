import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Upload,
  FileText,
  Smartphone,
  Banknote,
  Plus,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  Lock,
  Check,
  Wallet,
  Receipt
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NaturalVendorImage from '../components/NaturalVendorImage';
import { supabase } from '../utils/supabaseClient';

export default function ReportsScreen() {
  const { 
    t, 
    profile,
    loans, 
    sales, 
    expenses, 
    totalLoanRemaining, 
    totalOriginalLoan, 
    totalRepaidSoFar,
    addSale,
    addExpense,
    loadTransactions
  } = useApp();

  // Time filter state: 'today' | 'week' | 'month' | 'last_month' | 'custom'
  const [filterPeriod, setFilterPeriod] = useState('week');
  
  // Custom date range inputs
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getDaysAgoStr = (days) => new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  const [customStart, setCustomStart] = useState(() => getDaysAgoStr(7));
  const [customEnd, setCustomEnd] = useState(() => getTodayStr());

  // Cloud transactions synced with Supabase (with rich metadata)
  const [cloudTxList, setCloudTxList] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState('upi'); // 'upi' | 'invoice' | 'cash'

  // Fetch full user records directly from Supabase to access metadata (source, payment_mode, invoice_status)
  const fetchCloudRecords = useCallback(async () => {
    if (!supabase || !profile.id || profile.id === 'demo-vendor-ravi') {
      return;
    }
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.id)
        .order('date', { ascending: false });

      if (!error && data) {
        setCloudTxList(data);
      }
    } catch (e) {
      console.warn('Could not load rich cloud transactions for reports:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [profile.id]);

  useEffect(() => {
    fetchCloudRecords();
  }, [fetchCloudRecords]);

  // Combine data sources: Supabase rich records preferred, fallback gracefully to context state
  const allTransactions = useMemo(() => {
    if (cloudTxList && cloudTxList.length > 0) {
      return cloudTxList.map(t => ({
        id: t.id,
        type: t.type, // 'sale' | 'expense' | 'loan' | 'repayment'
        amount: Number(t.amount || 0),
        customer_name: t.customer_name || '',
        category: t.category || 'General',
        date: t.date,
        time: t.time || '',
        description: t.description || '',
        payment_mode: t.metadata?.payment_mode || (t.description?.toLowerCase().includes('upi') ? 'UPI' : 'Cash'),
        source: t.metadata?.source || (t.description?.toLowerCase().includes('upi') ? 'UPI' : (t.description?.toLowerCase().includes('invoice') || t.description?.toLowerCase().includes('bill')) ? 'Invoice/Bill' : 'Cash'),
        invoice_status: t.metadata?.invoice_status || 'paid',
        invoice_number: t.metadata?.invoice_number || '',
        metadata: t.metadata || {}
      }));
    }

    // Fallback to local/demo state
    const combined = [];
    (sales || []).forEach(s => {
      const isUpi = s.note?.toLowerCase().includes('upi') || s.payment_mode === 'UPI';
      const isInvoice = s.note?.toLowerCase().includes('invoice') || s.note?.toLowerCase().includes('bill');
      combined.push({
        id: s.id,
        type: 'sale',
        amount: Number(s.amount || 0),
        customer_name: s.customer_name || s.customerName || '',
        category: s.category || 'Vegetables',
        date: s.date,
        time: s.time || '',
        description: s.note || '',
        payment_mode: isUpi ? 'UPI' : 'Cash',
        source: isUpi ? 'UPI' : isInvoice ? 'Invoice/Bill' : 'Cash',
        invoice_status: 'paid',
        metadata: {}
      });
    });

    (expenses || []).forEach(e => {
      const isUpi = e.note?.toLowerCase().includes('upi') || e.payment_mode === 'UPI';
      const isInvoice = e.note?.toLowerCase().includes('invoice') || e.note?.toLowerCase().includes('bill');
      combined.push({
        id: e.id,
        type: 'expense',
        amount: Number(e.amount || 0),
        customer_name: e.customer_name || e.customerName || '',
        category: e.category || 'Stock / Purchases',
        date: e.date,
        time: e.time || '',
        description: e.note || '',
        payment_mode: isUpi ? 'UPI' : 'Cash',
        source: isUpi ? 'UPI' : isInvoice ? 'Invoice/Bill' : 'Cash',
        invoice_status: 'paid',
        metadata: {}
      });
    });

    return combined;
  }, [cloudTxList, sales, expenses]);

  // Date range filter calculation
  const dateRangeBounds = useMemo(() => {
    const now = new Date();
    const today = getTodayStr();

    if (filterPeriod === 'today') {
      return { start: today, end: today, label: 'Today' };
    }
    if (filterPeriod === 'week') {
      return { start: getDaysAgoStr(6), end: today, label: 'Last 7 Days' };
    }
    if (filterPeriod === 'month') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const start = `${year}-${month}-01`;
      return { start, end: today, label: 'This Month' };
    }
    if (filterPeriod === 'last_month') {
      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const year = prevMonthDate.getFullYear();
      const month = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
      const start = `${year}-${month}-01`;
      const lastDay = new Date(year, prevMonthDate.getMonth() + 1, 0).getDate();
      const end = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
      return { start, end, label: 'Last Month' };
    }
    if (filterPeriod === 'custom') {
      return { 
        start: customStart || getDaysAgoStr(7), 
        end: customEnd || today, 
        label: `${customStart || 'Start'} to ${customEnd || 'End'}` 
      };
    }
    return { start: getDaysAgoStr(6), end: today, label: 'Last 7 Days' };
  }, [filterPeriod, customStart, customEnd]);

  // Filter transactions within selected period
  const filteredTransactions = useMemo(() => {
    const { start, end } = dateRangeBounds;
    return allTransactions.filter(tx => {
      if (!tx.date) return false;
      return tx.date >= start && tx.date <= end;
    });
  }, [allTransactions, dateRangeBounds]);

  // Financial Metrics Calculations
  // Money In: confirmed paid sales
  const moneyInTransactions = useMemo(() => {
    return filteredTransactions.filter(t => t.type === 'sale' && t.invoice_status !== 'unpaid');
  }, [filteredTransactions]);

  const totalSales = useMemo(() => {
    return moneyInTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [moneyInTransactions]);

  // Money Out: confirmed business expenses
  const moneyOutTransactions = useMemo(() => {
    return filteredTransactions.filter(t => t.type === 'expense' && t.invoice_status !== 'unpaid');
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return moneyOutTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [moneyOutTransactions]);

  // Profit & Loss
  const netSurplus = totalSales - totalExpenses;
  const isProfit = netSurplus >= 0;
  const profitAmount = isProfit ? netSurplus : 0;
  const lossAmount = !isProfit ? Math.abs(netSurplus) : 0;

  // Outstanding / Receivables (unpaid invoices + active remaining loan obligations)
  const unpaidSalesInvoices = useMemo(() => {
    return filteredTransactions.filter(t => t.type === 'sale' && t.invoice_status === 'unpaid');
  }, [filteredTransactions]);

  const unpaidCustomerAmount = useMemo(() => {
    return unpaidSalesInvoices.reduce((acc, t) => acc + t.amount, 0);
  }, [unpaidSalesInvoices]);

  const totalOutstanding = unpaidCustomerAmount + (totalLoanRemaining || 0);

  // Total Transaction count
  const transactionCount = filteredTransactions.length;

  // Payment Method Breakdown: UPI vs Cash vs Invoice/Bill vs Other
  const paymentBreakdown = useMemo(() => {
    let upi = 0;
    let upiCount = 0;
    let cash = 0;
    let cashCount = 0;
    let invoice = 0;
    let invoiceCount = 0;
    let other = 0;
    let otherCount = 0;

    filteredTransactions.forEach(t => {
      const mode = (t.payment_mode || '').toUpperCase();
      const src = (t.source || '').toUpperCase();

      if (mode === 'UPI' || src === 'UPI') {
        upi += t.amount;
        upiCount++;
      } else if (src === 'INVOICE/BILL' || src === 'INVOICE') {
        invoice += t.amount;
        invoiceCount++;
      } else if (mode === 'CASH' || src === 'CASH') {
        cash += t.amount;
        cashCount++;
      } else {
        other += t.amount;
        otherCount++;
      }
    });

    const totalMoney = upi + cash + invoice + other;
    return {
      upi,
      upiCount,
      upiPercent: totalMoney > 0 ? Math.round((upi / totalMoney) * 100) : 0,
      cash,
      cashCount,
      cashPercent: totalMoney > 0 ? Math.round((cash / totalMoney) * 100) : 0,
      invoice,
      invoiceCount,
      invoicePercent: totalMoney > 0 ? Math.round((invoice / totalMoney) * 100) : 0,
      other,
      otherCount,
      otherPercent: totalMoney > 0 ? Math.round((other / totalMoney) * 100) : 0,
      totalMoney
    };
  }, [filteredTransactions]);

  // Expense Category Breakdown
  const expenseCategories = useMemo(() => {
    const map = {};
    moneyOutTransactions.forEach(t => {
      const cat = t.category || 'General Costs';
      map[cat] = (map[cat] || 0) + t.amount;
    });

    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [moneyOutTransactions, totalExpenses]);

  // Daily Trend Comparison (Daily Money In vs Money Out)
  const dailyComparisonData = useMemo(() => {
    const { start, end } = dateRangeBounds;
    const startDate = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T00:00:00');

    // Create dates array
    const dayList = [];
    const curr = new Date(startDate);

    // Limit day bars to reasonable display (max 31 days)
    while (curr <= endDate && dayList.length <= 31) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, '0');
      const day = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][curr.getDay()];

      const dayMoneyIn = moneyInTransactions
        .filter(t => t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      const dayMoneyOut = moneyOutTransactions
        .filter(t => t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      dayList.push({
        dateStr,
        dayLabel: `${dayName} ${curr.getDate()}`,
        shortDay: `${curr.getDate()}/${curr.getMonth() + 1}`,
        moneyIn: dayMoneyIn,
        moneyOut: dayMoneyOut,
        net: dayMoneyIn - dayMoneyOut
      });

      curr.setDate(curr.getDate() + 1);
    }

    return dayList;
  }, [dateRangeBounds, moneyInTransactions, moneyOutTransactions]);

  const maxDailyVal = useMemo(() => {
    return Math.max(1, ...dailyComparisonData.map(d => Math.max(d.moneyIn, d.moneyOut)));
  }, [dailyComparisonData]);

  // Affordability & Repayment Health Calculations
  const periodDays = Math.max(1, dailyComparisonData.length);
  const averageDailySurplus = Math.round(netSurplus / periodDays);
  const activeLoansList = (loans || []).filter(l => l && l.status !== 'Completed');
  const nextRepaymentInstalment = activeLoansList[0]?.repaymentAmount || 0;
  const isHealthyCashflow = activeLoansList.length === 0 ? true : (averageDailySurplus >= nextRepaymentInstalment * 0.8);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* 1. TOP HEADER BANNER */}
      <div className="relative overflow-hidden bg-[#FAF4ED] rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#EAE1D4] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="absolute top-0 right-24 w-40 h-52 bg-[#F2DDD4]/60 rounded-b-full pointer-events-none -z-0" />
        <div className="absolute -bottom-8 right-4 w-36 h-36 bg-[#EAF0E9]/70 rounded-full pointer-events-none -z-0" />

        <div className="z-10 text-center sm:text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9EFE8] border border-[#D3DFD2] text-[11px] font-bold text-[#425541]">
            <Lock className="w-3 h-3 text-[#566E54]" />
            <span>Real Financial Activity • User Isolated</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#2D2825] leading-tight">
            {t.reportsTitle || 'Business Analytics & Reports'}
          </h1>
          <p className="text-xs sm:text-sm text-[#7C746F] max-w-lg font-medium leading-relaxed">
            Real cash-flow, sales, expenses, and payment breakdown calculated from your authenticated business records.
          </p>
        </div>

        {/* Action Controls & Illustration */}
        <div className="relative shrink-0 z-10 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#566E54] hover:bg-[#425541] text-white text-xs font-bold shadow-soft transition active:scale-95 touch-press"
          >
            <Upload className="w-4 h-4" />
            <span>Import Statement / Invoice</span>
          </button>

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

      {/* 2. TIME FILTER TOOLBAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF7F2] p-1.5 rounded-2xl border border-[#EBE3D7]">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'custom', label: 'Custom Range' }
            ].map((p) => {
              const isActive = filterPeriod === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setFilterPeriod(p.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition touch-press ${
                    isActive 
                      ? 'bg-[#566E54] text-white shadow-soft scale-102' 
                      : 'text-[#7C746F] hover:text-[#2D2825] hover:bg-[#F3EDE3]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#7C746F] font-semibold w-full md:w-auto justify-between md:justify-end">
            <span className="flex items-center gap-1.5 bg-[#FAF7F2] px-3 py-1.5 rounded-full border border-[#EBE3D7]">
              <Calendar className="w-3.5 h-3.5 text-[#566E54]" />
              <span>{dateRangeBounds.label}</span>
            </span>

            <button
              onClick={fetchCloudRecords}
              disabled={isRefreshing}
              title="Refresh report data"
              className="p-2 rounded-full bg-[#FAF7F2] hover:bg-[#F3EDE3] border border-[#EBE3D7] text-[#605955] transition touch-press"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#566E54]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Custom Date Pickers */}
        {filterPeriod === 'custom' && (
          <div className="pt-2 border-t border-[#F3EDE3] flex flex-wrap items-center gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#605955]">From:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#EBE3D7] bg-[#FAF7F2] font-medium text-[#2D2825] outline-none focus:border-[#566E54]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#605955]">To:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#EBE3D7] bg-[#FAF7F2] font-medium text-[#2D2825] outline-none focus:border-[#566E54]"
              />
            </div>
            <span className="text-[11px] text-[#7C746F]">
              Select start & end date to generate custom business statement.
            </span>
          </div>
        )}
      </div>

      {/* 3. CORE METRIC SUMMARY CARDS (Easy to understand with non-technical vendor terms) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Money In (Sales) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#D3DFD2] shadow-soft bg-[#F5F8F5]/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#566E54]">Money In</span>
              <div className="w-6 h-6 rounded-full bg-[#E9EFE8] flex items-center justify-center text-[#566E54]">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
              ₹{totalSales.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-[#7C746F] font-medium mt-1">Total revenue collected</p>
        </div>

        {/* Money Out (Expenses) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F0D7CD] shadow-soft bg-[#FCF7F4]/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#BF745F]">Money Out</span>
              <div className="w-6 h-6 rounded-full bg-[#F8ECE6] flex items-center justify-center text-[#BF745F]">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
              ₹{totalExpenses.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-[#7C746F] font-medium mt-1">Stock, rent & supplies</p>
        </div>

        {/* Profit (Money Left) */}
        <div className={`bg-white rounded-3xl p-4 sm:p-5 border shadow-soft flex flex-col justify-between ${
          isProfit ? 'border-[#D3DFD2] bg-[#E9EFE8]/50' : 'border-[#EBE3D7] opacity-60'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#425541]">Profit</span>
              <div className="w-6 h-6 rounded-full bg-[#E9EFE8] flex items-center justify-center text-[#425541]">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="font-serif font-bold text-xl sm:text-2xl text-[#314030] mt-2 block">
              ₹{profitAmount.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-[#566E54] font-medium mt-1">Money left after expenses</p>
        </div>

        {/* Loss (When Outflow > Inflow) */}
        <div className={`bg-white rounded-3xl p-4 sm:p-5 border shadow-soft flex flex-col justify-between ${
          !isProfit ? 'border-[#F4DBDF] bg-[#FAEEF0]' : 'border-[#EBE3D7] opacity-60'
        }`}>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8A3846]">Loss</span>
              <div className="w-6 h-6 rounded-full bg-[#F8ECE6] flex items-center justify-center text-[#8A3846]">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="font-serif font-bold text-xl sm:text-2xl text-[#8A3846] mt-2 block">
              ₹{lossAmount.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-[#8A3846] font-medium mt-1">
            {!isProfit ? 'Expenses exceed sales' : 'No net deficit'}
          </p>
        </div>

        {/* Outstanding / Receivables */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E3DFEF] shadow-soft bg-[#F9F8FC]/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#554C78]">Pending</span>
              <div className="w-6 h-6 rounded-full bg-[#F2F0F8] flex items-center justify-center text-[#554C78]">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="font-serif font-bold text-xl sm:text-2xl text-[#3F3760] mt-2 block">
              ₹{totalOutstanding.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-[#7C746F] font-medium mt-1">Pending dues & receivables</p>
        </div>

        {/* Transaction Count */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft bg-[#FAF7F2]/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#605955]">Activity</span>
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#605955] border border-[#EBE3D7]">
                <Receipt className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
              {transactionCount}
            </span>
          </div>
          <p className="text-[10px] text-[#7C746F] font-medium mt-1">Logged business entries</p>
        </div>
      </div>

      {/* 4. ZERO DATA EMPTY STATE */}
      {transactionCount === 0 && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EBE3D7] shadow-soft text-center space-y-4 animate-in fade-in">
          <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#EBE3D7] flex items-center justify-center mx-auto text-[#7C746F]">
            <BarChart3 className="w-7 h-7 text-[#566E54]" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-serif font-bold text-xl text-[#2D2825]">
              No business activity yet
            </h3>
            <p className="text-xs text-[#7C746F] leading-relaxed">
              Add your first transaction or import a UPI/bank statement to see your visual business report.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setImportType('upi');
                setImportModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#566E54] hover:bg-[#425541] text-white text-xs font-bold shadow-soft transition active:scale-95 touch-press"
            >
              <Smartphone className="w-4 h-4" />
              <span>Import UPI Statement</span>
            </button>
            <button
              onClick={() => {
                setImportType('invoice');
                setImportModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#F3EDE3] border border-[#EBE3D7] text-[#2D2825] text-xs font-bold transition active:scale-95 touch-press"
            >
              <FileText className="w-4 h-4 text-[#554C78]" />
              <span>Record Bill / Invoice</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. VISUAL ANALYTICS SECTION (Displays only when data exists) */}
      {transactionCount > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Daily Money In vs Money Out Bar Chart */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border border-[#EBE3D7] shadow-soft space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#2D2825] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#566E54]" />
                  <span>Daily Money In vs Money Out</span>
                </h2>
                <p className="text-xs text-[#7C746F] font-medium mt-0.5">
                  Daily visual inflow (Sales) vs outflow (Expenses) across this period
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#566E54]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6B8569]" /> Money In
                </span>
                <span className="flex items-center gap-1.5 text-[#BF745F]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D39C8C]" /> Money Out
                </span>
              </div>
            </div>

            {/* Interactive Daily Bar Visualizer */}
            <div className="pt-4 pb-2">
              <div className="h-56 sm:h-64 flex items-end justify-between gap-1.5 sm:gap-2.5 border-b border-[#EBE3D7] px-2 overflow-x-auto">
                {dailyComparisonData.map((item, idx) => {
                  const salesHeight = (item.moneyIn / maxDailyVal) * 100;
                  const expHeight = (item.moneyOut / maxDailyVal) * 100;

                  return (
                    <div key={idx} className="flex-1 min-w-[28px] max-w-[48px] flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        {/* Money In Bar */}
                        <div
                          className="w-1/2 bg-[#6B8569] hover:bg-[#566E54] rounded-t-full transition-all duration-300 relative shadow-soft"
                          style={{ height: `${Math.max(4, salesHeight)}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 bg-[#2D2825] text-white text-[10px] px-2.5 py-1 rounded-xl whitespace-nowrap z-20 shadow-soft-lg">
                            <span className="block font-bold">In: ₹{item.moneyIn}</span>
                            <span className="block text-[8px] text-[#8EAA8C]">{item.dateStr}</span>
                          </div>
                        </div>

                        {/* Money Out Bar */}
                        <div
                          className="w-1/2 bg-[#E4BDB0] hover:bg-[#D39C8C] rounded-t-full transition-all duration-300 relative shadow-soft"
                          style={{ height: `${Math.max(4, expHeight)}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 bg-[#2D2825] text-white text-[10px] px-2.5 py-1 rounded-xl whitespace-nowrap z-20 shadow-soft-lg">
                            <span className="block font-bold">Out: ₹{item.moneyOut}</span>
                            <span className="block text-[8px] text-[#D39C8C]">{item.dateStr}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] text-[#7C746F] font-medium truncate w-full text-center">
                        {item.shortDay}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sales vs Expenses Proportional Bar */}
            <div className="pt-3 border-t border-[#F3EDE3] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#2D2825]">Operating Efficiency</span>
                <span className="font-bold text-[#566E54]">
                  {totalSales > 0 ? `${Math.round(((totalSales - totalExpenses) / totalSales) * 100)}% Retained` : '0%'}
                </span>
              </div>
              <div className="w-full h-3 bg-[#FAF7F2] border border-[#EBE3D7] rounded-full overflow-hidden flex">
                <div 
                  className="bg-[#6B8569] h-full transition-all duration-500" 
                  style={{ width: `${totalSales + totalExpenses > 0 ? (totalSales / (totalSales + totalExpenses)) * 100 : 50}%` }}
                  title={`Sales: ₹${totalSales}`}
                />
                <div 
                  className="bg-[#D39C8C] h-full transition-all duration-500" 
                  style={{ width: `${totalSales + totalExpenses > 0 ? (totalExpenses / (totalSales + totalExpenses)) * 100 : 50}%` }}
                  title={`Expenses: ₹${totalExpenses}`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#7C746F]">
                <span>Sales Share ({totalSales + totalExpenses > 0 ? Math.round((totalSales / (totalSales + totalExpenses)) * 100) : 0}%)</span>
                <span>Expense Share ({totalSales + totalExpenses > 0 ? Math.round((totalExpenses / (totalSales + totalExpenses)) * 100) : 0}%)</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Payment Method Distribution & Categories */}
          <div className="lg:col-span-5 space-y-6">
            {/* Payment Method Breakdown Card (UPI vs Cash vs Invoices) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#554C78]" />
                  <h2 className="font-serif font-bold text-base text-[#2D2825]">
                    Payment Method Breakdown
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-[#7C746F] bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#EBE3D7]">
                  {paymentBreakdown.totalMoney > 0 ? `₹${paymentBreakdown.totalMoney.toLocaleString()}` : '₹0'}
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {/* UPI Mode */}
                <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EBE3D7] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F2F0F8] border border-[#E3DFEF] flex items-center justify-center text-[#554C78]">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#2D2825] block">UPI Payments</span>
                      <span className="text-[10px] text-[#7C746F]">{paymentBreakdown.upiCount} transactions</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-sm text-[#554C78] block">
                      ₹{paymentBreakdown.upi.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-semibold text-[#7C746F]">
                      {paymentBreakdown.upiPercent}%
                    </span>
                  </div>
                </div>

                {/* Cash Mode */}
                <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EBE3D7] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#E9EFE8] border border-[#D3DFD2] flex items-center justify-center text-[#566E54]">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#2D2825] block">Cash Payments</span>
                      <span className="text-[10px] text-[#7C746F]">{paymentBreakdown.cashCount} transactions</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-sm text-[#566E54] block">
                      ₹{paymentBreakdown.cash.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-semibold text-[#7C746F]">
                      {paymentBreakdown.cashPercent}%
                    </span>
                  </div>
                </div>

                {/* Invoices/Bills */}
                {paymentBreakdown.invoiceCount > 0 && (
                  <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EBE3D7] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#F8ECE6] border border-[#F0D7CD] flex items-center justify-center text-[#BF745F]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#2D2825] block">Invoices & Bills</span>
                        <span className="text-[10px] text-[#7C746F]">{paymentBreakdown.invoiceCount} invoices</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-serif font-bold text-sm text-[#BF745F] block">
                        ₹{paymentBreakdown.invoice.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-semibold text-[#7C746F]">
                        {paymentBreakdown.invoicePercent}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Expense Categories Distribution */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-bold text-base text-[#2D2825]">
                  Expense Spending Categories
                </h2>
                <span className="text-xs font-semibold text-[#7C746F]">
                  Where money is spent
                </span>
              </div>

              {expenseCategories.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {expenseCategories.map((c, i) => (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#2D2825]">{c.name}</span>
                        <span className="font-bold text-[#BF745F]">₹{c.amount.toLocaleString()} ({c.percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-full overflow-hidden">
                        <div 
                          className="bg-[#BF745F] h-full rounded-full transition-all duration-300"
                          style={{ width: `${c.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#9A938E] text-center py-4">
                  No business expenses recorded in this period.
                </p>
              )}
            </div>

            {/* Loan Payoff Health & Cashflow Guide */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#6B8569]" />
                  <h2 className="font-serif font-bold text-base text-[#2D2825]">
                    {t.repaymentHealthTitle || 'Cash-Flow & Loan Health'}
                  </h2>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  isHealthyCashflow 
                    ? 'bg-[#E9EFE8] text-[#425541] border-[#D3DFD2]' 
                    : 'bg-[#FCF7F4] text-[#874937] border-[#F0D7CD]'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isHealthyCashflow ? 'bg-[#6B8569]' : 'bg-[#BF745F]'}`} />
                  <span>{isHealthyCashflow ? 'Healthy' : 'Caution'}</span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                isHealthyCashflow 
                  ? 'bg-[#E9EFE8]/70 border-[#D3DFD2] text-[#314030]' 
                  : 'bg-[#FCF7F4] border-[#F0D7CD] text-[#673627]'
              }`}>
                <div className="flex items-start gap-2.5">
                  {isHealthyCashflow ? (
                    <CheckCircle2 className="w-4 h-4 text-[#6B8569] shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#BF745F] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">
                      {isHealthyCashflow ? 'Surplus covers upcoming obligations' : 'Tight operating cashflow'}
                    </p>
                    <p className="text-[11px] opacity-90 mt-1">
                      Your average daily surplus is <strong>₹{averageDailySurplus.toLocaleString()}</strong>.
                      {nextRepaymentInstalment > 0 && ` Next instalment is ₹${nextRepaymentInstalment.toLocaleString()}.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. IMPORT STATEMENT / INVOICE MODAL */}
      <ImportStatementModal 
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        activeTab={importType}
        setActiveTab={setImportType}
        profile={profile}
        onSuccess={() => {
          fetchCloudRecords();
          if (profile.id) loadTransactions(profile.id);
        }}
      />
    </div>
  );
}

// Supporting Modal for Statement Import & Invoice Logging
function ImportStatementModal({ isOpen, onClose, activeTab, setActiveTab, profile, onSuccess }) {
  const [statementText, setStatementText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Invoice form states
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    type: 'sale', // 'sale' | 'expense'
    counterparty: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'paid', // 'paid' | 'unpaid'
    paymentMode: 'UPI'
  });

  // Cash quick entry states
  const [cashForm, setCashForm] = useState({
    type: 'sale',
    amount: '',
    counterparty: '',
    category: 'Vegetables',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  if (!isOpen) return null;

  // Sample UPI CSV Format for easy testing without manual typing
  const loadSampleUpi = () => {
    const today = new Date().toISOString().split('T')[0];
    const yest = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const sample = 
`Date,Type,Description,Amount,Category
${today},Received,UPI from Ravi Stores,2500,Vegetables
${today},Received,UPI payment from Meena Sharma,1200,Fruits
${yest},Paid,UPI to APMC Wholesaler Mandi,1800,Stock / Purchases
${yest},Received,UPI from Ramesh Kirana,850,Grocery`;
    setStatementText(sample);
    parseStatement(sample);
  };

  // Legitimate parser for CSV / statement text
  const parseStatement = (textToParse) => {
    setErrorMsg(null);
    const content = textToParse || statementText;
    if (!content.trim()) {
      setErrorMsg('Please paste or enter your statement text first.');
      return;
    }

    try {
      const lines = content.trim().split('\n').filter(l => l.trim().length > 0);
      const rows = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Skip header line if detected
        if (i === 0 && line.toLowerCase().includes('date') && line.toLowerCase().includes('amount')) {
          continue;
        }

        const parts = line.includes(',') 
          ? line.split(',').map(p => p.trim())
          : line.split('\t').map(p => p.trim());

        if (parts.length >= 2) {
          const dateCandidate = parts[0];
          const rawAmount = parts.find(p => !isNaN(Number(p.replace(/[₹$,]/g, ''))));
          const numAmount = rawAmount ? Math.abs(Number(rawAmount.replace(/[₹$,]/g, ''))) : 0;
          const isDebit = line.toLowerCase().includes('paid') || line.toLowerCase().includes('debit') || line.toLowerCase().includes('dr') || line.includes('-');
          const counterparty = parts.find(p => p !== dateCandidate && p !== rawAmount) || 'UPI Counterparty';

          if (numAmount > 0) {
            rows.push({
              id: 'imp_' + i + '_' + Date.now(),
              date: dateCandidate.length === 10 ? dateCandidate : new Date().toISOString().split('T')[0],
              type: isDebit ? 'expense' : 'sale',
              customer_name: counterparty,
              amount: numAmount,
              category: isDebit ? 'Stock / Purchases' : 'Vegetables',
              source: 'UPI',
              payment_mode: 'UPI'
            });
          }
        }
      }

      if (rows.length === 0) {
        setErrorMsg('Could not detect valid transactions. Check formatting or use the sample format.');
      } else {
        setParsedRows(rows);
      }
    } catch (e) {
      setErrorMsg('Failed to parse statement: ' + e.message);
    }
  };

  // Commit verified transactions to Supabase public.transactions
  const handleSaveImportedUpi = async () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const isRealUser = profile.id && profile.id !== 'demo-vendor-ravi';

      if (isRealUser && supabase) {
        const records = parsedRows.map(r => ({
          user_id: profile.id,
          type: r.type,
          amount: r.amount,
          category: r.category,
          customer_name: r.customer_name,
          date: r.date,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: `Imported UPI statement: ${r.customer_name}`,
          metadata: {
            source: 'UPI',
            payment_mode: 'UPI',
            imported_at: new Date().toISOString()
          }
        }));

        const { error } = await supabase.from('transactions').insert(records);
        if (error) throw error;
      }

      setSuccessMsg(`✓ Successfully verified and imported ${parsedRows.length} UPI transactions!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (e) {
      setErrorMsg('Failed to save statement to database: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Invoice / Bill
  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.amount || Number(invoiceForm.amount) <= 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const isRealUser = profile.id && profile.id !== 'demo-vendor-ravi';
      const cleanAmt = Number(invoiceForm.amount);

      if (isRealUser && supabase) {
        const { error } = await supabase.from('transactions').insert({
          user_id: profile.id,
          type: invoiceForm.type,
          amount: cleanAmt,
          category: invoiceForm.type === 'sale' ? 'Invoice Revenue' : 'Invoice Bill',
          customer_name: invoiceForm.counterparty || 'Invoice Party',
          date: invoiceForm.date,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: `Bill/Invoice #${invoiceForm.invoiceNumber || 'NA'} (${invoiceForm.status})`,
          metadata: {
            source: 'Invoice/Bill',
            invoice_number: invoiceForm.invoiceNumber,
            invoice_status: invoiceForm.status,
            payment_mode: invoiceForm.paymentMode
          }
        });
        if (error) throw error;
      }

      setSuccessMsg('✓ Invoice / Bill recorded and added to reports!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg('Error saving invoice: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Cash Quick Record
  const handleSaveCash = async (e) => {
    e.preventDefault();
    if (!cashForm.amount || Number(cashForm.amount) <= 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const isRealUser = profile.id && profile.id !== 'demo-vendor-ravi';
      const cleanAmt = Number(cashForm.amount);

      if (isRealUser && supabase) {
        const { error } = await supabase.from('transactions').insert({
          user_id: profile.id,
          type: cashForm.type,
          amount: cleanAmt,
          category: cashForm.category,
          customer_name: cashForm.counterparty || null,
          date: cashForm.date,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: cashForm.notes || 'Cash transaction',
          metadata: {
            source: 'Cash',
            payment_mode: 'CASH'
          }
        });
        if (error) throw error;
      }

      setSuccessMsg('✓ Cash transaction recorded!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg('Error saving cash record: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2825]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-soft-lg border border-[#EBE3D7] space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F3EDE3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E9EFE8] text-[#566E54] border border-[#D3DFD2] flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#2D2825]">
                Import Statement / Log Record
              </h2>
              <p className="text-[11px] text-[#7C746F]">
                Verified records populate your business analytics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#7C746F] hover:bg-[#F3EDE3] border border-[#EBE3D7] flex items-center justify-center text-xs font-bold transition touch-press"
          >
            ✕
          </button>
        </div>

        {/* Security Reassurance Guarantee */}
        <div className="p-3 bg-[#E9EFE8]/70 border border-[#D3DFD2] rounded-2xl flex items-center gap-2.5 text-xs text-[#314030]">
          <Lock className="w-4 h-4 text-[#566E54] shrink-0" />
          <p className="text-[11px] leading-tight">
            <strong>Security Guarantee:</strong> TrackShack never asks for your UPI PIN, OTP, or net banking password.
          </p>
        </div>

        {/* Source Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF7F2] rounded-2xl border border-[#EBE3D7] text-xs font-bold">
          <button
            onClick={() => setActiveTab('upi')}
            className={`py-2 px-2 text-center rounded-xl transition ${
              activeTab === 'upi' ? 'bg-[#566E54] text-white shadow-soft' : 'text-[#7C746F] hover:text-[#2D2825]'
            }`}
          >
            UPI Statement
          </button>
          <button
            onClick={() => setActiveTab('invoice')}
            className={`py-2 px-2 text-center rounded-xl transition ${
              activeTab === 'invoice' ? 'bg-[#566E54] text-white shadow-soft' : 'text-[#7C746F] hover:text-[#2D2825]'
            }`}
          >
            Bill / Invoice
          </button>
          <button
            onClick={() => setActiveTab('cash')}
            className={`py-2 px-2 text-center rounded-xl transition ${
              activeTab === 'cash' ? 'bg-[#566E54] text-white shadow-soft' : 'text-[#7C746F] hover:text-[#2D2825]'
            }`}
          >
            Cash Entry
          </button>
        </div>

        {/* Error or Success Notice */}
        {errorMsg && (
          <div className="p-3 bg-[#FCF7F4] border border-[#F0D7CD] rounded-2xl text-xs text-[#874937] font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-[#E9EFE8] border border-[#D3DFD2] rounded-2xl text-xs text-[#425541] font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: UPI STATEMENT IMPORT */}
        {activeTab === 'upi' && (
          <div className="space-y-4 pt-1 animate-in fade-in">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#48433F]">
                Paste PhonePe / GPay / Paytm CSV or Text
              </label>
              <button
                type="button"
                onClick={loadSampleUpi}
                className="text-[11px] font-bold text-[#566E54] hover:underline"
              >
                + Try Sample CSV
              </button>
            </div>

            <textarea
              rows={4}
              value={statementText}
              onChange={(e) => setStatementText(e.target.value)}
              placeholder="Date,Type,Description,Amount,Category&#10;2026-09-27,Received,UPI from Ravi Stores,2500,Vegetables&#10;2026-09-27,Paid,UPI to Mandi Wholesaler,1800,Stock"
              className="w-full p-3 rounded-2xl border border-[#EBE3D7] bg-[#FAF7F2] text-xs font-mono text-[#2D2825] outline-none focus:bg-white focus:border-[#566E54]"
            />

            <button
              type="button"
              onClick={() => parseStatement(statementText)}
              className="w-full py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F3EDE3] border border-[#EBE3D7] text-xs font-bold text-[#2D2825] transition"
            >
              Parse Statement Lines
            </button>

            {/* Parsed Confirmation List */}
            {parsedRows.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#F3EDE3]">
                <span className="text-xs font-bold text-[#2D2825] block">
                  Verify Detected Transactions ({parsedRows.length})
                </span>
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {parsedRows.map((r, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE3D7] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#2D2825] block">{r.customer_name}</span>
                        <span className="text-[10px] text-[#7C746F]">{r.date} • {r.category}</span>
                      </div>
                      <span className={`font-serif font-bold ${r.type === 'sale' ? 'text-[#566E54]' : 'text-[#BF745F]'}`}>
                        {r.type === 'sale' ? '+' : '-'}₹{r.amount}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSaveImportedUpi}
                  className="w-full py-3 rounded-full bg-[#566E54] hover:bg-[#425541] text-white text-xs font-bold shadow-soft transition active:scale-98"
                >
                  {isProcessing ? 'Importing...' : 'Confirm & Save Verified UPI Records'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVOICE / BILL RECORDING */}
        {activeTab === 'invoice' && (
          <form onSubmit={handleSaveInvoice} className="space-y-3 pt-1 animate-in fade-in">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Invoice / Bill #
                </label>
                <input
                  type="text"
                  value={invoiceForm.invoiceNumber}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                  placeholder="e.g. INV-104"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#554C78] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Classification
                </label>
                <select
                  value={invoiceForm.type}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#554C78] outline-none"
                >
                  <option value="sale">Sales Invoice (Revenue)</option>
                  <option value="expense">Vendor Bill (Expense)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#48433F] mb-1">
                Customer / Vendor Name
              </label>
              <input
                type="text"
                value={invoiceForm.counterparty}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, counterparty: e.target.value })}
                placeholder="e.g. Ravi Stores, APMC Wholesaler"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#554C78] outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={invoiceForm.amount}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                  placeholder="2500"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-serif font-bold text-[#2D2825] focus:bg-white focus:border-[#554C78] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceForm.date}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#554C78] outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Payment Status
                </label>
                <select
                  value={invoiceForm.status}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#554C78] outline-none"
                >
                  <option value="paid">Paid (Collected/Paid)</option>
                  <option value="unpaid">Unpaid (Pending Receivable)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Payment Method
                </label>
                <select
                  value={invoiceForm.paymentMode}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentMode: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#554C78] outline-none"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full mt-2 py-3 rounded-full bg-[#554C78] hover:bg-[#3F3760] text-white text-xs font-bold shadow-soft transition active:scale-98"
            >
              {isProcessing ? 'Saving...' : 'Record Invoice into Analytics'}
            </button>
          </form>
        )}

        {/* TAB 3: CASH QUICK ENTRY */}
        {activeTab === 'cash' && (
          <form onSubmit={handleSaveCash} className="space-y-3 pt-1 animate-in fade-in">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Type
                </label>
                <select
                  value={cashForm.type}
                  onChange={(e) => setCashForm({ ...cashForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white outline-none"
                >
                  <option value="sale">Cash Sale (Money In)</option>
                  <option value="expense">Cash Expense (Money Out)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={cashForm.amount}
                  onChange={(e) => setCashForm({ ...cashForm, amount: e.target.value })}
                  placeholder="500"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-serif font-bold text-[#2D2825] focus:bg-white outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#48433F] mb-1">
                Customer / Vendor (Optional)
              </label>
              <input
                type="text"
                value={cashForm.counterparty}
                onChange={(e) => setCashForm({ ...cashForm, counterparty: e.target.value })}
                placeholder="e.g. Ramesh, Daily counter sales"
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={cashForm.category}
                  onChange={(e) => setCashForm({ ...cashForm, category: e.target.value })}
                  placeholder="Vegetables, Rent, etc."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={cashForm.date}
                  onChange={(e) => setCashForm({ ...cashForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full mt-2 py-3 rounded-full bg-[#566E54] hover:bg-[#425541] text-white text-xs font-bold shadow-soft transition active:scale-98"
            >
              {isProcessing ? 'Saving...' : 'Record Cash Transaction'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
