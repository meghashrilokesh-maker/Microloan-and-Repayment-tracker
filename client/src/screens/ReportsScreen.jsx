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
  Receipt,
  Users,
  Store,
  Search,
  Clock,
  ArrowDownLeft,
  ArrowUpLeft,
  Filter,
  CreditCard,
  Building2,
  ChevronRight
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

  // Active report section: 'sales' | 'expenses' | 'customers' | 'suppliers' | 'overview'
  const [activeSection, setActiveSection] = useState('sales');

  // Search query (Search item name, customer, supplier, or note)
  const [searchQuery, setSearchQuery] = useState('');

  // Time filter state: 'today' | 'week' | 'month' | 'last_month' | 'custom'
  const [filterPeriod, setFilterPeriod] = useState('month');
  
  // Custom date range inputs
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getDaysAgoStr = (days) => new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  const [customStart, setCustomStart] = useState(() => getDaysAgoStr(30));
  const [customEnd, setCustomEnd] = useState(() => getTodayStr());

  // Cloud transactions synced with Supabase (with rich metadata)
  const [cloudTxList, setCloudTxList] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importType, setImportType] = useState('upi'); // 'upi' | 'invoice' | 'cash'

  // Fetch full user records directly from Supabase to access metadata (party_type, entry_type, payment_mode, invoice_status)
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
  // Carefully tag party_type ('customer' | 'supplier') and entry_type for KhataBook separation
  const allTransactions = useMemo(() => {
    if (cloudTxList && cloudTxList.length > 0) {
      return cloudTxList.map(t => {
        // Safe party_type detection:
        // 1. Explicit party_type in metadata or top-level
        // 2. Backward compatibility: type === 'sale' -> customer, type === 'expense' -> supplier
        let partyType = t.metadata?.party_type || t.party_type;
        if (!partyType) {
          partyType = t.type === 'sale' ? 'customer' : 'supplier';
        }

        // Safe entry_type detection:
        // Customer:
        //   - 'given': Money given / credit extended to customer
        //   - 'received': Money received from customer
        //   - 'sale_collected': Regular sale paid and received
        // Supplier:
        //   - 'purchase_pending': Purchases / bills pending payment to supplier
        //   - 'paid': Money paid to supplier
        //   - 'purchase_paid': Regular purchase paid to supplier
        let entryType = t.metadata?.entry_type;
        const desc = (t.description || '').toLowerCase();
        const note = (t.note || '').toLowerCase();

        if (!entryType) {
          if (partyType === 'customer') {
            if (t.metadata?.invoice_status === 'unpaid' || desc.includes('credit') || desc.includes('pending') || desc.includes('gave') || desc.includes('owed')) {
              entryType = 'given';
            } else if (desc.includes('received') || desc.includes('got') || desc.includes('collected') || t.type === 'repayment') {
              entryType = 'received';
            } else {
              entryType = 'sale_collected';
            }
          } else {
            // supplier
            if (t.metadata?.invoice_status === 'unpaid' || desc.includes('credit') || desc.includes('bill unpaid') || desc.includes('owed to')) {
              entryType = 'purchase_pending';
            } else if (desc.includes('paid to') || desc.includes('payment made') || desc.includes('gave to supplier')) {
              entryType = 'paid';
            } else {
              entryType = 'purchase_paid';
            }
          }
        }

        return {
          id: t.id,
          type: t.type, // 'sale' | 'expense' | 'loan' | 'repayment'
          amount: Number(t.amount || 0),
          customer_name: t.customer_name || t.metadata?.party_name || (partyType === 'customer' ? 'Customer' : 'Supplier'),
          party_name: t.customer_name || t.metadata?.party_name || (partyType === 'customer' ? 'Customer' : 'Supplier'),
          party_type: partyType,
          entry_type: entryType,
          category: t.category || (partyType === 'customer' ? 'Sales' : 'Stock / Purchases'),
          date: t.date,
          time: t.time || '',
          description: t.description || '',
          payment_mode: t.metadata?.payment_mode || (t.description?.toLowerCase().includes('upi') ? 'UPI' : 'Cash'),
          source: t.metadata?.source || (t.description?.toLowerCase().includes('upi') ? 'UPI' : (t.description?.toLowerCase().includes('invoice') || t.description?.toLowerCase().includes('bill')) ? 'Invoice/Bill' : 'Cash'),
          invoice_status: t.metadata?.invoice_status || 'paid',
          invoice_number: t.metadata?.invoice_number || '',
          metadata: t.metadata || {}
        };
      });
    }

    // Fallback to local context state (for offline/demo vendor)
    const combined = [];
    (sales || []).forEach(s => {
      const isUpi = s.note?.toLowerCase().includes('upi') || s.payment_mode === 'UPI';
      const isInvoice = s.note?.toLowerCase().includes('invoice') || s.note?.toLowerCase().includes('bill');
      const partyType = s.party_type || s.metadata?.party_type || 'customer';
      const desc = (s.note || '').toLowerCase();
      let entryType = s.entry_type || s.metadata?.entry_type;
      if (!entryType) {
        if (s.invoice_status === 'unpaid' || desc.includes('credit') || desc.includes('pending')) entryType = 'given';
        else if (desc.includes('received')) entryType = 'received';
        else entryType = 'sale_collected';
      }

      combined.push({
        id: s.id,
        type: 'sale',
        amount: Number(s.amount || 0),
        customer_name: s.customer_name || s.customerName || 'Customer',
        party_name: s.customer_name || s.customerName || 'Customer',
        party_type: partyType,
        entry_type: entryType,
        category: s.category || 'Vegetables',
        date: s.date,
        time: s.time || '',
        description: s.note || '',
        payment_mode: isUpi ? 'UPI' : 'Cash',
        source: isUpi ? 'UPI' : isInvoice ? 'Invoice/Bill' : 'Cash',
        invoice_status: s.invoice_status || 'paid',
        metadata: s.metadata || {}
      });
    });

    (expenses || []).forEach(e => {
      const isUpi = e.note?.toLowerCase().includes('upi') || e.payment_mode === 'UPI';
      const isInvoice = e.note?.toLowerCase().includes('invoice') || e.note?.toLowerCase().includes('bill');
      const partyType = e.party_type || e.metadata?.party_type || 'supplier';
      const desc = (e.note || '').toLowerCase();
      let entryType = e.entry_type || e.metadata?.entry_type;
      if (!entryType) {
        if (e.invoice_status === 'unpaid' || desc.includes('bill unpaid')) entryType = 'purchase_pending';
        else if (desc.includes('paid to')) entryType = 'paid';
        else entryType = 'purchase_paid';
      }

      combined.push({
        id: e.id,
        type: 'expense',
        amount: Number(e.amount || 0),
        customer_name: e.customer_name || e.customerName || 'Supplier',
        party_name: e.customer_name || e.customerName || 'Supplier',
        party_type: partyType,
        entry_type: entryType,
        category: e.category || 'Stock / Purchases',
        date: e.date,
        time: e.time || '',
        description: e.note || '',
        payment_mode: isUpi ? 'UPI' : 'Cash',
        source: isUpi ? 'UPI' : isInvoice ? 'Invoice/Bill' : 'Cash',
        invoice_status: e.invoice_status || 'paid',
        metadata: e.metadata || {}
      });
    });

    return combined;
  }, [cloudTxList, sales, expenses]);

  // Section counts for top tab badges
  const totalSalesCount = useMemo(() => {
    return allTransactions.filter(t => t.type === 'sale').length;
  }, [allTransactions]);

  const totalExpenseCount = useMemo(() => {
    return allTransactions.filter(t => t.type === 'expense').length;
  }, [allTransactions]);

  const totalCustomerCount = useMemo(() => {
    return allTransactions.filter(t => t.party_type === 'customer').length;
  }, [allTransactions]);

  const totalSupplierCount = useMemo(() => {
    return allTransactions.filter(t => t.party_type === 'supplier').length;
  }, [allTransactions]);

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
        start: customStart || getDaysAgoStr(30), 
        end: customEnd || today, 
        label: `${customStart || 'Start'} to ${customEnd || 'End'}` 
      };
    }
    return { start: getDaysAgoStr(30), end: today, label: 'This Month' };
  }, [filterPeriod, customStart, customEnd]);

  // Filter transactions within selected period
  const dateFilteredTransactions = useMemo(() => {
    const { start, end } = dateRangeBounds;
    return allTransactions.filter(tx => {
      if (!tx.date) return false;
      return tx.date >= start && tx.date <= end;
    });
  }, [allTransactions, dateRangeBounds]);

  // Strict Section Isolation:
  // Sales only shows sales. Expenses only shows expenses.
  // Customers only shows customer party. Suppliers only shows supplier party.
  const sectionTransactions = useMemo(() => {
    if (activeSection === 'sales') {
      return dateFilteredTransactions.filter(tx => tx.type === 'sale');
    }
    if (activeSection === 'expenses') {
      return dateFilteredTransactions.filter(tx => tx.type === 'expense');
    }
    if (activeSection === 'customers') {
      return dateFilteredTransactions.filter(tx => tx.party_type === 'customer');
    }
    if (activeSection === 'suppliers') {
      return dateFilteredTransactions.filter(tx => tx.party_type === 'supplier');
    }
    return dateFilteredTransactions;
  }, [dateFilteredTransactions, activeSection]);

  // Search filter applied to the active section
  const displayedTransactions = useMemo(() => {
    if (!searchQuery.trim()) return sectionTransactions;
    const q = searchQuery.toLowerCase().trim();
    return sectionTransactions.filter(tx => {
      const name = (tx.party_name || tx.customer_name || '').toLowerCase();
      const desc = (tx.description || '').toLowerCase();
      const cat = (tx.category || '').toLowerCase();
      return name.includes(q) || desc.includes(q) || cat.includes(q);
    });
  }, [sectionTransactions, searchQuery]);

  // 1A. SALES SECTION CALCULATIONS (Strictly Sales Data Only)
  const salesMetrics = useMemo(() => {
    const txs = activeSection === 'sales' ? displayedTransactions : dateFilteredTransactions.filter(t => t.type === 'sale');

    let totalSales = 0;
    let cashSales = 0;
    let upiSales = 0;

    txs.forEach(t => {
      const amt = Number(t.amount || 0);
      totalSales += amt;
      const mode = (t.payment_mode || '').toUpperCase();
      if (mode === 'CASH' || t.source === 'Cash') {
        cashSales += amt;
      } else {
        upiSales += amt;
      }
    });

    const count = txs.length;
    const avgTicket = count > 0 ? Math.round(totalSales / count) : 0;

    return {
      total: totalSales,
      cash: cashSales,
      upi: upiSales,
      count,
      avgTicket
    };
  }, [activeSection, displayedTransactions, dateFilteredTransactions]);

  // 1B. EXPENSES SECTION CALCULATIONS (Strictly Expenses Data Only)
  const expenseMetrics = useMemo(() => {
    const txs = activeSection === 'expenses' ? displayedTransactions : dateFilteredTransactions.filter(t => t.type === 'expense');

    let totalExpenses = 0;
    let stockPurchases = 0;
    let operational = 0;
    const catMap = {};

    txs.forEach(t => {
      const amt = Number(t.amount || 0);
      totalExpenses += amt;
      const cat = (t.category || 'Stock / Purchases');
      catMap[cat] = (catMap[cat] || 0) + amt;

      const lowerCat = cat.toLowerCase();
      if (lowerCat.includes('stock') || lowerCat.includes('purchase') || lowerCat.includes('inventory') || lowerCat.includes('raw') || lowerCat.includes('mandi')) {
        stockPurchases += amt;
      } else {
        operational += amt;
      }
    });

    const count = txs.length;
    let topCategory = 'General Costs';
    let topCatAmt = 0;
    Object.entries(catMap).forEach(([cat, amt]) => {
      if (amt > topCatAmt) {
        topCatAmt = amt;
        topCategory = cat;
      }
    });

    return {
      total: totalExpenses,
      stockPurchases,
      operational,
      count,
      topCategory
    };
  }, [activeSection, displayedTransactions, dateFilteredTransactions]);

  // 1C. CUSTOMER SECTION CALCULATIONS
  // Customer gives clear KhataBook financial logic:
  // - Sales / Credit Given
  // - Money Received
  // - Customers Owe Me (Pending / Receivable = Sales - Received)
  const customerMetrics = useMemo(() => {
    const txs = activeSection === 'customers' ? displayedTransactions : dateFilteredTransactions.filter(t => t.party_type === 'customer');

    let totalSales = 0;
    let totalReceived = 0;

    txs.forEach(t => {
      const amt = Number(t.amount || 0);
      if (t.entry_type === 'given') {
        // Customer credit extended / unpaid bill
        totalSales += amt;
      } else if (t.entry_type === 'received') {
        // Customer payment received
        totalReceived += amt;
      } else if (t.entry_type === 'sale_collected') {
        // Instant completed sale: both sales and received
        totalSales += amt;
        totalReceived += amt;
      } else if (t.type === 'sale') {
        totalSales += amt;
        if (t.invoice_status === 'paid') {
          totalReceived += amt;
        }
      }
    });

    const pending = Math.max(0, totalSales - totalReceived);
    const uniqueParties = new Set(txs.map(t => t.party_name || t.customer_name).filter(Boolean)).size;

    return {
      sales: totalSales,
      received: totalReceived,
      pending,
      count: txs.length,
      uniqueParties
    };
  }, [activeSection, displayedTransactions, dateFilteredTransactions]);

  // 2. SUPPLIER SECTION CALCULATIONS
  // Supplier gives clear KhataBook financial logic:
  // - Purchases / Bills
  // - Money Paid to Supplier
  // - I Owe Suppliers (Pending / Payable = Purchases - Paid)
  const supplierMetrics = useMemo(() => {
    const txs = activeSection === 'suppliers' ? displayedTransactions : dateFilteredTransactions.filter(t => t.party_type === 'supplier');

    let totalPurchases = 0;
    let totalPaid = 0;

    txs.forEach(t => {
      const amt = Number(t.amount || 0);
      if (t.entry_type === 'purchase_pending') {
        // Purchase from supplier on credit / bill unpaid
        totalPurchases += amt;
      } else if (t.entry_type === 'paid') {
        // Money paid to supplier
        totalPaid += amt;
      } else if (t.entry_type === 'purchase_paid') {
        // Instant purchase paid directly
        totalPurchases += amt;
        totalPaid += amt;
      } else if (t.type === 'expense') {
        totalPurchases += amt;
        if (t.invoice_status === 'paid') {
          totalPaid += amt;
        }
      }
    });

    const payable = Math.max(0, totalPurchases - totalPaid);
    const uniqueParties = new Set(txs.map(t => t.party_name || t.customer_name).filter(Boolean)).size;

    return {
      purchases: totalPurchases,
      paid: totalPaid,
      pending: payable,
      count: txs.length,
      uniqueParties
    };
  }, [activeSection, displayedTransactions, dateFilteredTransactions]);

  // 3. OVERVIEW / OVERALL CALCULATIONS (Preserves all existing reports functionality)
  const overviewMetrics = useMemo(() => {
    const txs = dateFilteredTransactions;

    const totalSales = txs
      .filter(t => t.type === 'sale' && t.invoice_status !== 'unpaid')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpenses = txs
      .filter(t => t.type === 'expense' && t.invoice_status !== 'unpaid')
      .reduce((acc, t) => acc + t.amount, 0);

    const netSurplus = totalSales - totalExpenses;
    const isProfit = netSurplus >= 0;
    const profitAmount = isProfit ? netSurplus : 0;
    const lossAmount = !isProfit ? Math.abs(netSurplus) : 0;

    const unpaidSales = txs
      .filter(t => t.type === 'sale' && t.invoice_status === 'unpaid')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalOutstanding = unpaidSales + (totalLoanRemaining || 0);

    return {
      totalSales,
      totalExpenses,
      netSurplus,
      isProfit,
      profitAmount,
      lossAmount,
      totalOutstanding,
      count: txs.length
    };
  }, [dateFilteredTransactions, totalLoanRemaining]);

  // Payment Method Breakdown strictly based on active section
  const paymentBreakdown = useMemo(() => {
    let upi = 0;
    let upiCount = 0;
    let cash = 0;
    let cashCount = 0;
    let invoice = 0;
    let invoiceCount = 0;
    let other = 0;
    let otherCount = 0;

    displayedTransactions.forEach(t => {
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
  }, [displayedTransactions]);

  // Category Breakdown for the active section
  const categoryBreakdown = useMemo(() => {
    const map = {};
    displayedTransactions.forEach(t => {
      const defaultCat = 
        activeSection === 'sales' ? 'Vegetables' :
        activeSection === 'expenses' ? 'Stock / Purchases' :
        activeSection === 'customers' ? 'General Sales' :
        'General Costs';
      const cat = t.category || defaultCat;
      map[cat] = (map[cat] || 0) + t.amount;
    });

    const total = Object.values(map).reduce((a, b) => a + b, 0);

    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percent: total > 0 ? Math.round((amount / total) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [displayedTransactions, activeSection]);

  // Daily Trend Comparison adapted to the active section
  // - Customers: Daily Sales vs Daily Received
  // - Suppliers: Daily Purchases vs Daily Paid
  // - Overview: Daily Money In vs Daily Money Out
  const dailyComparisonData = useMemo(() => {
    const { start, end } = dateRangeBounds;
    const startDate = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T00:00:00');

    const dayList = [];
    const curr = new Date(startDate);

    while (curr <= endDate && dayList.length <= 31) {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, '0');
      const day = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][curr.getDay()];

      let bar1Val = 0; // Sales / Purchases / Money In
      let bar2Val = 0; // Received / Paid / Money Out

      const dayTxs = displayedTransactions.filter(t => t.date === dateStr);

      if (activeSection === 'sales') {
        dayTxs.forEach(t => {
          const mode = (t.payment_mode || '').toUpperCase();
          if (mode === 'CASH' || t.source === 'Cash') bar1Val += t.amount;
          else bar2Val += t.amount; // Digital / UPI
        });
      } else if (activeSection === 'expenses') {
        dayTxs.forEach(t => {
          const cat = (t.category || '').toLowerCase();
          if (cat.includes('stock') || cat.includes('purchase') || cat.includes('inventory') || cat.includes('raw') || cat.includes('mandi')) {
            bar1Val += t.amount;
          } else {
            bar2Val += t.amount;
          }
        });
      } else if (activeSection === 'customers') {
        dayTxs.forEach(t => {
          if (t.entry_type === 'given') bar1Val += t.amount;
          else if (t.entry_type === 'received') bar2Val += t.amount;
          else if (t.entry_type === 'sale_collected' || t.type === 'sale') {
            bar1Val += t.amount;
            if (t.invoice_status === 'paid') bar2Val += t.amount;
          }
        });
      } else if (activeSection === 'suppliers') {
        dayTxs.forEach(t => {
          if (t.entry_type === 'purchase_pending') bar1Val += t.amount;
          else if (t.entry_type === 'paid') bar2Val += t.amount;
          else if (t.entry_type === 'purchase_paid' || t.type === 'expense') {
            bar1Val += t.amount;
            if (t.invoice_status === 'paid') bar2Val += t.amount;
          }
        });
      } else {
        // Overview
        dayTxs.forEach(t => {
          if (t.type === 'sale' && t.invoice_status !== 'unpaid') bar1Val += t.amount;
          if (t.type === 'expense' && t.invoice_status !== 'unpaid') bar2Val += t.amount;
        });
      }

      dayList.push({
        dateStr,
        dayLabel: `${dayName} ${curr.getDate()}`,
        shortDay: `${curr.getDate()}/${curr.getMonth() + 1}`,
        bar1: bar1Val,
        bar2: bar2Val,
        net: bar1Val - bar2Val
      });

      curr.setDate(curr.getDate() + 1);
    }

    return dayList;
  }, [dateRangeBounds, displayedTransactions, activeSection]);

  const maxDailyVal = useMemo(() => {
    return Math.max(1, ...dailyComparisonData.map(d => Math.max(d.bar1, d.bar2)));
  }, [dailyComparisonData]);

  // Cashflow & loan health for overview
  const periodDays = Math.max(1, dailyComparisonData.length);
  const averageDailySurplus = Math.round(overviewMetrics.netSurplus / periodDays);
  const activeLoansList = (loans || []).filter(l => l && l.status !== 'Completed');
  const nextRepaymentInstalment = activeLoansList[0]?.repaymentAmount || 0;
  const isHealthyCashflow = activeLoansList.length === 0 ? true : (averageDailySurplus >= nextRepaymentInstalment * 0.8);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* 1. TOP HEADER BANNER (Preserved design, typography, layout & NaturalVendorImage) */}
      <div className="relative overflow-hidden bg-[#FAF4ED] rounded-3xl p-5 sm:p-6 lg:p-7 border border-[#EAE1D4] shadow-soft flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="absolute top-0 right-24 w-40 h-52 bg-[#F2DDD4]/60 rounded-b-full pointer-events-none -z-0" />
        <div className="absolute -bottom-8 right-4 w-36 h-36 bg-[#EAF0E9]/70 rounded-full pointer-events-none -z-0" />

        <div className="z-10 text-center sm:text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9EFE8] border border-[#D3DFD2] text-[11px] font-bold text-[#425541]">
            <Lock className="w-3 h-3 text-[#566E54]" />
            <span>Customer & Supplier Ledgers • User Isolated</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#2D2825] leading-tight">
            {t.reportsTitle || 'Business Analytics & Reports'}
          </h1>
          <p className="text-xs sm:text-sm text-[#7C746F] max-w-lg font-medium leading-relaxed">
            Separate financial activity for Customers and Suppliers. Track sales, purchases, and outstanding dues with complete clarity.
          </p>
        </div>

        {/* Action Controls & Illustration */}
        <div className="relative shrink-0 z-10 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#566E54] hover:bg-[#425541] text-white text-xs font-bold shadow-soft transition active:scale-95 touch-press"
          >
            <Upload className="w-4 h-4" />
            <span>Import / Add Record</span>
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

      {/* 2. CUSTOMER & SUPPLIER SECTION TABS + SEARCH & FILTERS TOOLBAR */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft space-y-4">
        {/* Top Row: Segmented Controls with Sales, Expenses, Customers, Suppliers & Overview */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#F3EDE3]">
          {/* Section Tabs with Live Counts */}
          <div className="inline-flex flex-wrap p-1.5 bg-[#FAF7F2] rounded-2xl border border-[#EBE3D7] self-start sm:self-auto gap-1">
            {/* Sales Tab */}
            <button
              id="tab-sales-report"
              onClick={() => setActiveSection('sales')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition touch-press ${
                activeSection === 'sales'
                  ? 'bg-[#566E54] text-white shadow-soft scale-102'
                  : 'text-[#7C746F] hover:text-[#2D2825] hover:bg-[#F3EDE3]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Sales</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeSection === 'sales' ? 'bg-white/25 text-white' : 'bg-[#EBE3D7] text-[#605955]'
              }`}>
                {totalSalesCount}
              </span>
            </button>

            {/* Expenses Tab */}
            <button
              id="tab-expenses-report"
              onClick={() => setActiveSection('expenses')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition touch-press ${
                activeSection === 'expenses'
                  ? 'bg-[#566E54] text-white shadow-soft scale-102'
                  : 'text-[#7C746F] hover:text-[#2D2825] hover:bg-[#F3EDE3]'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Expenses</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeSection === 'expenses' ? 'bg-white/25 text-white' : 'bg-[#EBE3D7] text-[#605955]'
              }`}>
                {totalExpenseCount}
              </span>
            </button>

            {/* Customers Tab */}
            <button
              id="tab-customers-report"
              onClick={() => setActiveSection('customers')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition touch-press ${
                activeSection === 'customers'
                  ? 'bg-[#566E54] text-white shadow-soft scale-102'
                  : 'text-[#7C746F] hover:text-[#2D2825] hover:bg-[#F3EDE3]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customers</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeSection === 'customers' ? 'bg-white/25 text-white' : 'bg-[#EBE3D7] text-[#605955]'
              }`}>
                {totalCustomerCount}
              </span>
            </button>

            {/* Suppliers Tab */}
            <button
              id="tab-suppliers-report"
              onClick={() => setActiveSection('suppliers')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition touch-press ${
                activeSection === 'suppliers'
                  ? 'bg-[#566E54] text-white shadow-soft scale-102'
                  : 'text-[#7C746F] hover:text-[#2D2825] hover:bg-[#F3EDE3]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Suppliers</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeSection === 'suppliers' ? 'bg-white/25 text-white' : 'bg-[#EBE3D7] text-[#605955]'
              }`}>
                {totalSupplierCount}
              </span>
            </button>

            {/* Overview / Combined Tab (Ensures all existing profit/loss reports remain intact) */}
            <button
              id="tab-overview-report"
              onClick={() => setActiveSection('overview')}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition touch-press ${
                activeSection === 'overview'
                  ? 'bg-[#566E54] text-white shadow-soft scale-102'
                  : 'text-[#7C746F] hover:text-[#2D2825] hover:bg-[#F3EDE3]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Overview</span>
            </button>
          </div>

          {/* Party Search Box (Searches Customer name or Supplier name) */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#7C746F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeSection === 'sales'
                  ? 'Search sale item, customer or note...'
                  : activeSection === 'expenses'
                  ? 'Search expense item, supplier or note...'
                  : activeSection === 'customers' 
                  ? 'Search customer name or note...' 
                  : activeSection === 'suppliers' 
                  ? 'Search supplier name or note...' 
                  : 'Search by party name or description...'
              }
              className="w-full pl-9 pr-8 py-2 rounded-2xl border border-[#EBE3D7] bg-[#FAF7F2] text-xs font-medium text-[#2D2825] outline-none focus:bg-white focus:border-[#566E54] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#7C746F] hover:text-[#2D2825] p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Time Filter Buttons & Date Bounds */}
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
              <span className="font-semibold text-[#605955]">Start:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#EBE3D7] bg-[#FAF7F2] font-medium text-[#2D2825] outline-none focus:border-[#566E54]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#605955]">End:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#EBE3D7] bg-[#FAF7F2] font-medium text-[#2D2825] outline-none focus:border-[#566E54]"
              />
            </div>
            <span className="text-[11px] text-[#7C746F]">
              Select custom date boundaries to filter ledger statement.
            </span>
          </div>
        )}
      </div>

      {/* 3. METRIC SUMMARY CARDS */}
      {/* 3A. SALES VIEW SUMMARY CARDS */}
      {activeSection === 'sales' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in">
          {/* Card 1: Total Sales Revenue */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#D3DFD2] shadow-soft bg-[#F5F8F5]/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#566E54]">Total Sales</span>
                <div className="w-7 h-7 rounded-full bg-[#E9EFE8] flex items-center justify-center text-[#566E54]">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
                ₹{salesMetrics.total.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">Total revenue collected from sales</p>
          </div>

          {/* Card 2: Cash Inflow */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#D3DFD2] shadow-soft bg-[#E9EFE8]/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#425541]">Cash Sales</span>
                <div className="w-7 h-7 rounded-full bg-[#D3DFD2] flex items-center justify-center text-[#425541]">
                  <Banknote className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#314030] mt-2 block">
                ₹{salesMetrics.cash.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#566E54] font-medium mt-1">Direct physical cash collected</p>
          </div>

          {/* Card 3: Digital / UPI Inflow */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E3DFEF] shadow-soft bg-[#F9F8FC]/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#554C78]">UPI & Digital</span>
                <div className="w-7 h-7 rounded-full bg-[#F2F0F8] flex items-center justify-center text-[#554C78]">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#3F3760] mt-2 block">
                ₹{salesMetrics.upi.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">QR & bank UPI settlements</p>
          </div>

          {/* Card 4: Sales Activity & Avg Ticket */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft bg-[#FAF7F2]/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#605955]">Sales Activity</span>
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#605955] border border-[#EBE3D7]">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
                {salesMetrics.count}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">
              Average ticket: ₹{salesMetrics.avgTicket.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* 3B. EXPENSES VIEW SUMMARY CARDS */}
      {activeSection === 'expenses' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in">
          {/* Card 1: Total Expenses */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F0D7CD] shadow-soft bg-[#FCF7F4]/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#BF745F]">Total Expenses</span>
                <div className="w-7 h-7 rounded-full bg-[#F8ECE6] flex items-center justify-center text-[#BF745F]">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
                ₹{expenseMetrics.total.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">Total business cost & outflow</p>
          </div>

          {/* Card 2: Stock & Inventory Purchases */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F0D7CD] shadow-soft bg-[#FAF7F2]/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#874937]">Stock Purchases</span>
                <div className="w-7 h-7 rounded-full bg-[#F8ECE6] flex items-center justify-center text-[#874937]">
                  <Store className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
                ₹{expenseMetrics.stockPurchases.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#874937] font-medium mt-1">Mandi stock, wholesale inventory</p>
          </div>

          {/* Card 3: Operational & Other Costs */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft bg-[#FAF7F2]/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#605955]">Running Costs</span>
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#605955] border border-[#EBE3D7]">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
                ₹{expenseMetrics.operational.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">Transport, rent, electricity, bills</p>
          </div>

          {/* Card 4: Expense Records Activity */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft bg-[#FAF7F2]/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#605955]">Expense Entries</span>
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#605955] border border-[#EBE3D7]">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
                {expenseMetrics.count}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">
              Top: {expenseMetrics.topCategory}
            </p>
          </div>
        </div>
      )}

      {/* 3C. CUSTOMER VIEW SUMMARY CARDS */}
      {activeSection === 'customers' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in">
          {/* Card 1: Sales / Credit Given */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#D3DFD2] shadow-soft bg-[#F5F8F5]/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#566E54]">Sales / Given</span>
                <div className="w-7 h-7 rounded-full bg-[#E9EFE8] flex items-center justify-center text-[#566E54]">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
                ₹{customerMetrics.sales.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">Total sales to customers</p>
          </div>

          {/* Card 2: Money Received from Customers */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#D3DFD2] shadow-soft bg-[#E9EFE8]/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#425541]">Received</span>
                <div className="w-7 h-7 rounded-full bg-[#D3DFD2] flex items-center justify-center text-[#425541]">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#314030] mt-2 block">
                ₹{customerMetrics.received.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#566E54] font-medium mt-1">Payments collected from customers</p>
          </div>

          {/* Card 3: Customers Owe Me (Pending / Receivable) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E3DFEF] shadow-soft bg-[#F9F8FC]/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#554C78]">Customers Owe Me</span>
                <div className="w-7 h-7 rounded-full bg-[#F2F0F8] flex items-center justify-center text-[#554C78]">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#3F3760] mt-2 block">
                ₹{customerMetrics.pending.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">
              {customerMetrics.pending > 0 ? 'Pending customer receivable' : 'All customer balances clear'}
            </p>
          </div>

          {/* Card 4: Customer Entries Activity */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft bg-[#FAF7F2]/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#605955]">Customer Activity</span>
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#605955] border border-[#EBE3D7]">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
                {customerMetrics.count}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">
              Across {customerMetrics.uniqueParties} {customerMetrics.uniqueParties === 1 ? 'customer' : 'customers'}
            </p>
          </div>
        </div>
      )}

      {/* 3B. SUPPLIER VIEW SUMMARY CARDS */}
      {activeSection === 'suppliers' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in">
          {/* Card 1: Purchases / Bills from Suppliers */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F0D7CD] shadow-soft bg-[#FCF7F4]/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#BF745F]">Purchases / Bills</span>
                <div className="w-7 h-7 rounded-full bg-[#F8ECE6] flex items-center justify-center text-[#BF745F]">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
                ₹{supplierMetrics.purchases.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">Goods & stock from suppliers</p>
          </div>

          {/* Card 2: Money Paid to Suppliers */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#D3DFD2] shadow-soft bg-[#F5F8F5]/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#566E54]">Money Paid</span>
                <div className="w-7 h-7 rounded-full bg-[#E9EFE8] flex items-center justify-center text-[#566E54]">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
                ₹{supplierMetrics.paid.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#566E54] font-medium mt-1">Disbursed to suppliers & vendors</p>
          </div>

          {/* Card 3: I Owe Suppliers (Pending / Payable) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F4DBDF] shadow-soft bg-[#FAEEF0]/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8A3846]">I Owe Suppliers</span>
                <div className="w-7 h-7 rounded-full bg-[#F8ECE6] flex items-center justify-center text-[#8A3846]">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#8A3846] mt-2 block">
                ₹{supplierMetrics.pending.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#8A3846] font-medium mt-1">
              {supplierMetrics.pending > 0 ? 'Supplier bills due for payment' : 'No supplier balances owed'}
            </p>
          </div>

          {/* Card 4: Supplier Entries Activity */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft bg-[#FAF7F2]/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#605955]">Supplier Activity</span>
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#605955] border border-[#EBE3D7]">
                  <Store className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
                {supplierMetrics.count}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">
              Across {supplierMetrics.uniqueParties} {supplierMetrics.uniqueParties === 1 ? 'supplier' : 'suppliers'}
            </p>
          </div>
        </div>
      )}

      {/* 3C. OVERVIEW VIEW SUMMARY CARDS (Combines sales, expenses, profit/loss, receivables) */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 animate-in fade-in">
          {/* Money In */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#D3DFD2] shadow-soft bg-[#F5F8F5]/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#566E54]">Money In</span>
                <div className="w-6 h-6 rounded-full bg-[#E9EFE8] flex items-center justify-center text-[#566E54]">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
                ₹{overviewMetrics.totalSales.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">Total revenue collected</p>
          </div>

          {/* Money Out */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#F0D7CD] shadow-soft bg-[#FCF7F4]/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#BF745F]">Money Out</span>
                <div className="w-6 h-6 rounded-full bg-[#F8ECE6] flex items-center justify-center text-[#BF745F]">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
                ₹{overviewMetrics.totalExpenses.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">Stock, rent & supplies</p>
          </div>

          {/* Profit */}
          <div className={`bg-white rounded-3xl p-4 sm:p-5 border shadow-soft flex flex-col justify-between ${
            overviewMetrics.isProfit ? 'border-[#D3DFD2] bg-[#E9EFE8]/50' : 'border-[#EBE3D7] opacity-60'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#425541]">Profit</span>
                <div className="w-6 h-6 rounded-full bg-[#E9EFE8] flex items-center justify-center text-[#425541]">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#314030] mt-2 block">
                ₹{overviewMetrics.profitAmount.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#566E54] font-medium mt-1">Money left after expenses</p>
          </div>

          {/* Loss */}
          <div className={`bg-white rounded-3xl p-4 sm:p-5 border shadow-soft flex flex-col justify-between ${
            !overviewMetrics.isProfit ? 'border-[#F4DBDF] bg-[#FAEEF0]' : 'border-[#EBE3D7] opacity-60'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#8A3846]">Loss</span>
                <div className="w-6 h-6 rounded-full bg-[#F8ECE6] flex items-center justify-center text-[#8A3846]">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#8A3846] mt-2 block">
                ₹{overviewMetrics.lossAmount.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#8A3846] font-medium mt-1">
              {!overviewMetrics.isProfit ? 'Expenses exceed sales' : 'No net deficit'}
            </p>
          </div>

          {/* Pending Receivables */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E3DFEF] shadow-soft bg-[#F9F8FC]/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#554C78]">Pending Dues</span>
                <div className="w-6 h-6 rounded-full bg-[#F2F0F8] flex items-center justify-center text-[#554C78]">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#3F3760] mt-2 block">
                ₹{overviewMetrics.totalOutstanding.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">Customer dues & loan obligations</p>
          </div>

          {/* Total Transactions */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EBE3D7] shadow-soft bg-[#FAF7F2]/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#605955]">Activity</span>
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#605955] border border-[#EBE3D7]">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#2D2825] mt-2 block">
                {overviewMetrics.count}
              </span>
            </div>
            <p className="text-[10px] text-[#7C746F] font-medium mt-1">Total business records</p>
          </div>
        </div>
      )}

      {/* 4. ZERO DATA EMPTY STATE (Tailored to active section without fake data) */}
      {displayedTransactions.length === 0 && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EBE3D7] shadow-soft text-center space-y-4 animate-in fade-in">
          <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#EBE3D7] flex items-center justify-center mx-auto text-[#7C746F]">
            {activeSection === 'sales' ? (
              <TrendingUp className="w-7 h-7 text-[#566E54]" />
            ) : activeSection === 'expenses' ? (
              <TrendingDown className="w-7 h-7 text-[#BF745F]" />
            ) : activeSection === 'customers' ? (
              <Users className="w-7 h-7 text-[#566E54]" />
            ) : activeSection === 'suppliers' ? (
              <Store className="w-7 h-7 text-[#BF745F]" />
            ) : (
              <BarChart3 className="w-7 h-7 text-[#566E54]" />
            )}
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-serif font-bold text-xl text-[#2D2825]">
              {searchQuery ? (
                `No matching ${activeSection} records`
              ) : activeSection === 'sales' ? (
                'No sales recorded in this period'
              ) : activeSection === 'expenses' ? (
                'No expenses recorded in this period'
              ) : activeSection === 'customers' ? (
                'No customer transactions yet'
              ) : activeSection === 'suppliers' ? (
                'No supplier transactions yet'
              ) : (
                'No business transactions in this period'
              )}
            </h3>
            <p className="text-xs text-[#7C746F] leading-relaxed">
              {searchQuery
                ? `No transactions found matching "${searchQuery}". Clear your search or adjust the date filter.`
                : activeSection === 'sales'
                ? 'Record your daily cash and UPI sales to populate your sales analytics.'
                : activeSection === 'expenses'
                ? 'Record your stock purchases, rent, transport, or utility expenses to track spending.'
                : activeSection === 'customers'
                ? 'Record customer sales, credit given, or payments received to build your customer ledger.'
                : activeSection === 'suppliers'
                ? 'Record supplier purchases, bills, or vendor payments to maintain supplier ledgers.'
                : 'Add transactions or import a bank statement to generate your business reports.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setImportType(activeSection === 'expenses' || activeSection === 'suppliers' ? 'invoice' : 'upi');
                setImportModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#566E54] hover:bg-[#425541] text-white text-xs font-bold shadow-soft transition active:scale-95 touch-press"
            >
              <Plus className="w-4 h-4" />
              <span>
                {activeSection === 'sales' ? 'Add Sale Record' : activeSection === 'expenses' ? 'Add Expense Record' : activeSection === 'customers' ? 'Add Customer Record' : activeSection === 'suppliers' ? 'Add Supplier Bill / Payment' : 'Import / Add Transaction'}
              </span>
            </button>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#F3EDE3] border border-[#EBE3D7] text-[#2D2825] text-xs font-bold transition active:scale-95 touch-press"
              >
                <span>Clear Search</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. VISUAL ANALYTICS SECTION (Displays when transactions exist in active section) */}
      {displayedTransactions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Daily Comparison Visualizer */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-7 border border-[#EBE3D7] shadow-soft space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-serif font-bold text-lg text-[#2D2825] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#566E54]" />
                  <span>
                    {activeSection === 'sales'
                      ? 'Daily Sales Revenue & Inflow'
                      : activeSection === 'expenses'
                      ? 'Daily Expense Outflow'
                      : activeSection === 'customers'
                      ? 'Daily Customer Sales vs Received'
                      : activeSection === 'suppliers'
                      ? 'Daily Supplier Purchases vs Paid'
                      : 'Daily Money In vs Money Out'}
                  </span>
                </h2>
                <p className="text-xs text-[#7C746F] font-medium mt-0.5">
                  {activeSection === 'sales'
                    ? 'Daily sales collections comparing Cash vs UPI digital payments'
                    : activeSection === 'expenses'
                    ? 'Daily expenses comparing stock purchases vs running operational costs'
                    : activeSection === 'customers'
                    ? 'Daily sales & credit extended vs money collected from customers'
                    : activeSection === 'suppliers'
                    ? 'Daily stock purchases & bills vs payments made to suppliers'
                    : 'Daily visual inflow (Sales) vs outflow (Expenses) across this period'}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#566E54]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6B8569]" />
                  {activeSection === 'sales' ? 'Cash Sales' : activeSection === 'expenses' ? 'Stock / Purchases' : activeSection === 'customers' ? 'Sales / Given' : activeSection === 'suppliers' ? 'Purchases' : 'Money In'}
                </span>
                <span className="flex items-center gap-1.5 text-[#BF745F]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D39C8C]" />
                  {activeSection === 'sales' ? 'UPI Digital' : activeSection === 'expenses' ? 'Other Costs' : activeSection === 'customers' ? 'Received' : activeSection === 'suppliers' ? 'Paid' : 'Money Out'}
                </span>
              </div>
            </div>

            {/* Interactive Daily Bar Visualizer */}
            <div className="pt-4 pb-2">
              <div className="h-56 sm:h-64 flex items-end justify-between gap-1.5 sm:gap-2.5 border-b border-[#EBE3D7] px-2 overflow-x-auto">
                {dailyComparisonData.map((item, idx) => {
                  const bar1Height = (item.bar1 / maxDailyVal) * 100;
                  const bar2Height = (item.bar2 / maxDailyVal) * 100;

                  return (
                    <div key={idx} className="flex-1 min-w-[28px] max-w-[48px] flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        {/* Bar 1: Sales / Purchases / Inflow */}
                        <div
                          className="w-1/2 bg-[#6B8569] hover:bg-[#566E54] rounded-t-full transition-all duration-300 relative shadow-soft"
                          style={{ height: `${Math.max(4, bar1Height)}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 bg-[#2D2825] text-white text-[10px] px-2.5 py-1 rounded-xl whitespace-nowrap z-20 shadow-soft-lg">
                            <span className="block font-bold">
                              {activeSection === 'sales' ? 'Cash' : activeSection === 'expenses' ? 'Stock' : activeSection === 'customers' ? 'Sales' : activeSection === 'suppliers' ? 'Purchases' : 'In'}: ₹{item.bar1}
                            </span>
                            <span className="block text-[8px] text-[#8EAA8C]">{item.dateStr}</span>
                          </div>
                        </div>

                        {/* Bar 2: Received / Paid / Outflow / UPI */}
                        <div
                          className="w-1/2 bg-[#E4BDB0] hover:bg-[#D39C8C] rounded-t-full transition-all duration-300 relative shadow-soft"
                          style={{ height: `${Math.max(4, bar2Height)}%` }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 bg-[#2D2825] text-white text-[10px] px-2.5 py-1 rounded-xl whitespace-nowrap z-20 shadow-soft-lg">
                            <span className="block font-bold">
                              {activeSection === 'sales' ? 'UPI' : activeSection === 'expenses' ? 'Other' : activeSection === 'customers' ? 'Received' : activeSection === 'suppliers' ? 'Paid' : 'Out'}: ₹{item.bar2}
                            </span>
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

            {/* Section Distribution / Settlement Progress Bar */}
            <div className="pt-3 border-t border-[#F3EDE3] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#2D2825]">
                  {activeSection === 'sales'
                    ? 'Cash vs Digital Sales Ratio'
                    : activeSection === 'expenses'
                    ? 'Stock vs Operations Ratio'
                    : activeSection === 'customers'
                    ? 'Customer Collection Rate'
                    : activeSection === 'suppliers'
                    ? 'Supplier Settlement Rate'
                    : 'Operating Efficiency'}
                </span>
                <span className="font-bold text-[#566E54]">
                  {activeSection === 'sales'
                    ? `${salesMetrics.total > 0 ? Math.round((salesMetrics.cash / salesMetrics.total) * 100) : 100}% Cash Inflow`
                    : activeSection === 'expenses'
                    ? `${expenseMetrics.total > 0 ? Math.round((expenseMetrics.stockPurchases / expenseMetrics.total) * 100) : 100}% Inventory`
                    : activeSection === 'customers'
                    ? `${customerMetrics.sales > 0 ? Math.round((customerMetrics.received / customerMetrics.sales) * 100) : 100}% Collected`
                    : activeSection === 'suppliers'
                    ? `${supplierMetrics.purchases > 0 ? Math.round((supplierMetrics.paid / supplierMetrics.purchases) * 100) : 100}% Settled`
                    : `${overviewMetrics.totalSales > 0 ? Math.round(((overviewMetrics.totalSales - overviewMetrics.totalExpenses) / overviewMetrics.totalSales) * 100) : 0}% Retained`}
                </span>
              </div>
              <div className="w-full h-3 bg-[#FAF7F2] border border-[#EBE3D7] rounded-full overflow-hidden flex">
                <div 
                  className="bg-[#6B8569] h-full transition-all duration-500" 
                  style={{
                    width: activeSection === 'sales'
                      ? `${salesMetrics.total > 0 ? (salesMetrics.cash / salesMetrics.total) * 100 : 50}%`
                      : activeSection === 'expenses'
                      ? `${expenseMetrics.total > 0 ? (expenseMetrics.stockPurchases / expenseMetrics.total) * 100 : 50}%`
                      : activeSection === 'customers'
                      ? `${customerMetrics.sales > 0 ? Math.min(100, (customerMetrics.received / customerMetrics.sales) * 100) : 100}%`
                      : activeSection === 'suppliers'
                      ? `${supplierMetrics.purchases > 0 ? Math.min(100, (supplierMetrics.paid / supplierMetrics.purchases) * 100) : 100}%`
                      : `${overviewMetrics.totalSales + overviewMetrics.totalExpenses > 0 ? (overviewMetrics.totalSales / (overviewMetrics.totalSales + overviewMetrics.totalExpenses)) * 100 : 50}%`
                  }}
                />
                <div 
                  className="bg-[#D39C8C] h-full transition-all duration-500" 
                  style={{
                    width: activeSection === 'sales'
                      ? `${salesMetrics.total > 0 ? (salesMetrics.upi / salesMetrics.total) * 100 : 50}%`
                      : activeSection === 'expenses'
                      ? `${expenseMetrics.total > 0 ? (expenseMetrics.operational / expenseMetrics.total) * 100 : 50}%`
                      : activeSection === 'customers'
                      ? `${customerMetrics.sales > 0 ? Math.max(0, 100 - (customerMetrics.received / customerMetrics.sales) * 100) : 0}%`
                      : activeSection === 'suppliers'
                      ? `${supplierMetrics.purchases > 0 ? Math.max(0, 100 - (supplierMetrics.paid / supplierMetrics.purchases) * 100) : 0}%`
                      : `${overviewMetrics.totalSales + overviewMetrics.totalExpenses > 0 ? (overviewMetrics.totalExpenses / (overviewMetrics.totalSales + overviewMetrics.totalExpenses)) * 100 : 50}%`
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#7C746F]">
                <span>
                  {activeSection === 'sales' ? `Cash (₹${salesMetrics.cash.toLocaleString()})` : activeSection === 'expenses' ? `Stock (₹${expenseMetrics.stockPurchases.toLocaleString()})` : activeSection === 'customers' ? `Received (₹${customerMetrics.received.toLocaleString()})` : activeSection === 'suppliers' ? `Paid (₹${supplierMetrics.paid.toLocaleString()})` : 'Sales Share'}
                </span>
                <span>
                  {activeSection === 'sales' ? `Digital UPI (₹${salesMetrics.upi.toLocaleString()})` : activeSection === 'expenses' ? `Operations (₹${expenseMetrics.operational.toLocaleString()})` : activeSection === 'customers' ? `Pending Owed (₹${customerMetrics.pending.toLocaleString()})` : activeSection === 'suppliers' ? `Pending Payable (₹${supplierMetrics.pending.toLocaleString()})` : 'Expense Share'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Payment Modes & Spending Categories */}
          <div className="lg:col-span-5 space-y-6">
            {/* Payment Method Breakdown Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#554C78]" />
                  <h2 className="font-serif font-bold text-base text-[#2D2825]">
                    {activeSection === 'customers' ? 'Customer Payment Modes' : activeSection === 'suppliers' ? 'Supplier Payment Modes' : 'Payment Method Breakdown'}
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
                      <span className="text-[10px] text-[#7C746F]">{paymentBreakdown.upiCount} records</span>
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
                      <span className="text-xs font-bold text-[#2D2825] block">Cash Transactions</span>
                      <span className="text-[10px] text-[#7C746F]">{paymentBreakdown.cashCount} records</span>
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

            {/* Category Distribution Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-bold text-base text-[#2D2825]">
                  {activeSection === 'customers' ? 'Sales Categories' : activeSection === 'suppliers' ? 'Purchase Categories' : 'Spending Categories'}
                </h2>
                <span className="text-xs font-semibold text-[#7C746F]">
                  Distribution
                </span>
              </div>

              {categoryBreakdown.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {categoryBreakdown.slice(0, 4).map((c, i) => (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#2D2825]">{c.name}</span>
                        <span className="font-bold text-[#566E54]">₹{c.amount.toLocaleString()} ({c.percent}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-full overflow-hidden">
                        <div 
                          className="bg-[#566E54] h-full rounded-full transition-all duration-300"
                          style={{ width: `${c.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#9A938E] text-center py-4">
                  No records in this period.
                </p>
              )}
            </div>

            {/* Cashflow & Health Guide */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EBE3D7] shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#6B8569]" />
                  <h2 className="font-serif font-bold text-base text-[#2D2825]">
                    {t.repaymentHealthTitle || 'Cash-Flow & Ledger Health'}
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
                      {isHealthyCashflow ? 'Ledger balances well supported' : 'Tight operating cashflow'}
                    </p>
                    <p className="text-[11px] opacity-90 mt-1">
                      {activeSection === 'customers'
                        ? `Customers owe ₹${customerMetrics.pending.toLocaleString()}. Prompt collection will accelerate your working capital.`
                        : activeSection === 'suppliers'
                        ? `Pending dues owed to suppliers: ₹${supplierMetrics.pending.toLocaleString()}.`
                        : `Average daily operating surplus is ₹${averageDailySurplus.toLocaleString()}.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. PARTY LEDGER ENTRIES LIST (Detailed Transactions with Customer / Supplier Separation) */}
      {displayedTransactions.length > 0 && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#EBE3D7] shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-serif font-bold text-lg text-[#2D2825] flex items-center gap-2">
                {activeSection === 'sales' ? (
                  <TrendingUp className="w-5 h-5 text-[#566E54]" />
                ) : activeSection === 'expenses' ? (
                  <TrendingDown className="w-5 h-5 text-[#BF745F]" />
                ) : activeSection === 'customers' ? (
                  <Users className="w-5 h-5 text-[#566E54]" />
                ) : activeSection === 'suppliers' ? (
                  <Store className="w-5 h-5 text-[#BF745F]" />
                ) : (
                  <Receipt className="w-5 h-5 text-[#554C78]" />
                )}
                <span>
                  {activeSection === 'sales'
                    ? 'Sales Ledger Transactions'
                    : activeSection === 'expenses'
                    ? 'Expense Ledger Transactions'
                    : activeSection === 'customers' 
                    ? 'Customer Ledger Transactions' 
                    : activeSection === 'suppliers' 
                    ? 'Supplier Ledger Transactions' 
                    : 'All Business Transactions'}
                </span>
              </h2>
              <p className="text-xs text-[#7C746F] font-medium mt-0.5">
                Showing {displayedTransactions.length} {activeSection === 'sales' ? 'sale' : activeSection === 'expenses' ? 'expense' : activeSection === 'customers' ? 'customer' : activeSection === 'suppliers' ? 'supplier' : ''} entries for {dateRangeBounds.label}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#7C746F] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#EBE3D7]">
                Total: ₹{displayedTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Ledger Table / List */}
          <div className="divide-y divide-[#F3EDE3] border-t border-[#F3EDE3]">
            {displayedTransactions.map((tx) => {
              const isCust = tx.party_type === 'customer';
              const isReceivedOrPaid = tx.entry_type === 'received' || tx.entry_type === 'paid';
              const isCreditOrUnpaid = tx.entry_type === 'given' || tx.entry_type === 'purchase_pending' || tx.invoice_status === 'unpaid';

              return (
                <div 
                  key={tx.id} 
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2]/50 px-2 rounded-2xl transition"
                >
                  {/* Left: Party info & details */}
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      isCust 
                        ? 'bg-[#E9EFE8] text-[#566E54] border border-[#D3DFD2]' 
                        : 'bg-[#FCF7F4] text-[#BF745F] border border-[#F0D7CD]'
                    }`}>
                      {isCust ? <Users className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#2D2825]">
                          {tx.party_name || tx.customer_name || (isCust ? 'Customer' : 'Supplier')}
                        </span>

                        {/* Party Type Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isCust 
                            ? 'bg-[#E9EFE8] text-[#425541] border-[#D3DFD2]' 
                            : 'bg-[#FCF7F4] text-[#874937] border-[#F0D7CD]'
                        }`}>
                          {isCust ? 'Customer' : 'Supplier'}
                        </span>

                        {/* Status Badge */}
                        {isCreditOrUnpaid && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAEEF0] text-[#8A3846] border border-[#F4DBDF]">
                            Pending / Owed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#7C746F] flex-wrap">
                        <span>{tx.date}</span>
                        {tx.time && <span>• {tx.time}</span>}
                        {tx.category && <span>• {tx.category}</span>}
                        {tx.description && <span>• {tx.description}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment mode & Amount */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                    <span className={`font-serif font-bold text-sm sm:text-base ${
                      isCust 
                        ? (tx.entry_type === 'received' ? 'text-[#566E54]' : 'text-[#2D2825]')
                        : (tx.entry_type === 'paid' ? 'text-[#566E54]' : 'text-[#BF745F]')
                    }`}>
                      {isCust 
                        ? (tx.entry_type === 'received' ? '+₹' : '₹') + tx.amount.toLocaleString()
                        : (tx.entry_type === 'paid' ? '-₹' : '₹') + tx.amount.toLocaleString()}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[10px] text-[#7C746F] font-medium bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#EBE3D7] mt-0.5">
                      {tx.payment_mode === 'UPI' ? (
                        <Smartphone className="w-3 h-3 text-[#554C78]" />
                      ) : tx.source?.includes('Invoice') ? (
                        <FileText className="w-3 h-3 text-[#BF745F]" />
                      ) : (
                        <Banknote className="w-3 h-3 text-[#566E54]" />
                      )}
                      <span>{tx.payment_mode || 'Cash'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. IMPORT STATEMENT / INVOICE MODAL (With explicit Customer vs Supplier selection) */}
      <ImportStatementModal 
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        activeTab={importType}
        setActiveTab={setImportType}
        defaultPartyType={activeSection === 'suppliers' ? 'supplier' : 'customer'}
        profile={profile}
        onSuccess={() => {
          fetchCloudRecords();
          if (profile.id) loadTransactions(profile.id);
        }}
      />
    </div>
  );
}

// Supporting Modal for Statement Import & Invoice/Cash Logging
// Supports explicit Customer vs Supplier categorization
function ImportStatementModal({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab, 
  defaultPartyType = 'customer',
  profile, 
  onSuccess 
}) {
  const [statementText, setStatementText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Selected party type for entries: 'customer' | 'supplier'
  const [partyType, setPartyType] = useState(defaultPartyType);

  // Sync default party type when opened from active section
  useEffect(() => {
    setPartyType(defaultPartyType);
  }, [defaultPartyType, isOpen]);

  // Invoice form states
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    type: defaultPartyType === 'supplier' ? 'expense' : 'sale',
    entryRole: 'given', // 'given' (credit) | 'received' (collected) | 'purchase_pending' | 'paid'
    counterparty: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'paid', // 'paid' | 'unpaid'
    paymentMode: 'UPI'
  });

  // Cash quick entry states
  const [cashForm, setCashForm] = useState({
    partyType: defaultPartyType,
    type: defaultPartyType === 'supplier' ? 'expense' : 'sale',
    amount: '',
    counterparty: '',
    category: defaultPartyType === 'supplier' ? 'Stock / Purchases' : 'Vegetables',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  if (!isOpen) return null;

  // Sample UPI CSV Format for testing KhataBook customer & supplier separation
  const loadSampleUpi = () => {
    const today = new Date().toISOString().split('T')[0];
    const yest = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const sample = 
`Date,Type,Description,Amount,PartyType,PartyName
${today},Received,UPI payment from Meena Sharma,1200,customer,Meena Sharma
${today},Received,UPI from Ravi Stores,2500,customer,Ravi Stores
${yest},Paid,UPI to APMC Wholesaler Mandi,1800,supplier,APMC Wholesaler
${yest},Paid,UPI to Farmer Ramesh Supply,850,supplier,Ramesh Farmer`;
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
          
          // Detect or default party type
          let rowPartyType = partyType;
          if (line.toLowerCase().includes('supplier') || line.toLowerCase().includes('vendor') || line.toLowerCase().includes('wholesaler')) {
            rowPartyType = 'supplier';
          } else if (line.toLowerCase().includes('customer')) {
            rowPartyType = 'customer';
          } else {
            rowPartyType = isDebit ? 'supplier' : 'customer';
          }

          const counterparty = parts.find(p => p !== dateCandidate && p !== rawAmount && !['customer', 'supplier'].includes(p.toLowerCase())) || (rowPartyType === 'customer' ? 'Customer Party' : 'Supplier Party');

          if (numAmount > 0) {
            rows.push({
              id: 'imp_' + i + '_' + Date.now(),
              date: dateCandidate.length === 10 ? dateCandidate : new Date().toISOString().split('T')[0],
              type: rowPartyType === 'customer' ? 'sale' : 'expense',
              party_type: rowPartyType,
              entry_type: rowPartyType === 'customer' ? (isDebit ? 'given' : 'received') : (isDebit ? 'paid' : 'purchase_pending'),
              customer_name: counterparty,
              amount: numAmount,
              category: rowPartyType === 'supplier' ? 'Stock / Purchases' : 'Vegetables',
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

  // Commit verified transactions to Supabase public.transactions with explicit party_type
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
          description: `Imported UPI statement (${r.party_type}): ${r.customer_name}`,
          metadata: {
            source: 'UPI',
            payment_mode: 'UPI',
            party_type: r.party_type,
            entry_type: r.entry_type,
            imported_at: new Date().toISOString()
          }
        }));

        const { error } = await supabase.from('transactions').insert(records);
        if (error) throw error;
      }

      setSuccessMsg(`✓ Successfully verified and imported ${parsedRows.length} transactions into ledgers!`);
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

  // Submit Invoice / Bill with party_type
  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.amount || Number(invoiceForm.amount) <= 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const isRealUser = profile.id && profile.id !== 'demo-vendor-ravi';
      const cleanAmt = Number(invoiceForm.amount);
      const isCust = partyType === 'customer';

      // Entry type logic
      let entryType = 'sale_collected';
      if (isCust) {
        entryType = invoiceForm.status === 'unpaid' ? 'given' : 'received';
      } else {
        entryType = invoiceForm.status === 'unpaid' ? 'purchase_pending' : 'paid';
      }

      if (isRealUser && supabase) {
        const { error } = await supabase.from('transactions').insert({
          user_id: profile.id,
          type: isCust ? 'sale' : 'expense',
          amount: cleanAmt,
          category: isCust ? 'Customer Invoice' : 'Supplier Bill',
          customer_name: invoiceForm.counterparty || (isCust ? 'Customer Party' : 'Supplier Party'),
          date: invoiceForm.date,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: `${isCust ? 'Customer' : 'Supplier'} Bill #${invoiceForm.invoiceNumber || 'NA'} (${invoiceForm.status})`,
          metadata: {
            source: 'Invoice/Bill',
            invoice_number: invoiceForm.invoiceNumber,
            invoice_status: invoiceForm.status,
            payment_mode: invoiceForm.paymentMode,
            party_type: partyType,
            entry_type: entryType
          }
        });
        if (error) throw error;
      }

      setSuccessMsg(`✓ ${isCust ? 'Customer' : 'Supplier'} record added to reports!`);
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
      const isCust = partyType === 'customer';

      if (isRealUser && supabase) {
        const { error } = await supabase.from('transactions').insert({
          user_id: profile.id,
          type: isCust ? 'sale' : 'expense',
          amount: cleanAmt,
          category: cashForm.category,
          customer_name: cashForm.counterparty || (isCust ? 'Cash Customer' : 'Cash Supplier'),
          date: cashForm.date,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: cashForm.notes || `Cash ${isCust ? 'customer sale' : 'supplier payment'}`,
          metadata: {
            source: 'Cash',
            payment_mode: 'CASH',
            party_type: partyType,
            entry_type: isCust ? 'sale_collected' : 'paid'
          }
        });
        if (error) throw error;
      }

      setSuccessMsg(`✓ Cash record saved to ${isCust ? 'Customer' : 'Supplier'} ledger!`);
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
                Record Entry / Import Statement
              </h2>
              <p className="text-[11px] text-[#7C746F]">
                Choose Customer or Supplier to keep balances segregated
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

        {/* PARTY TYPE SELECTOR (Customer vs Supplier) */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#48433F] block">
            Select Ledger Party Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#FAF7F2] rounded-2xl border border-[#EBE3D7]">
            <button
              type="button"
              onClick={() => setPartyType('customer')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                partyType === 'customer'
                  ? 'bg-[#566E54] text-white shadow-soft'
                  : 'text-[#7C746F] hover:text-[#2D2825]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setPartyType('supplier')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
                partyType === 'supplier'
                  ? 'bg-[#566E54] text-white shadow-soft'
                  : 'text-[#7C746F] hover:text-[#2D2825]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Supplier</span>
            </button>
          </div>
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
              placeholder="Date,Type,Description,Amount,PartyType,PartyName&#10;2026-09-27,Received,UPI payment from Meena,1200,customer,Meena&#10;2026-09-27,Paid,UPI to APMC Wholesaler,1800,supplier,APMC"
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
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#2D2825]">{r.customer_name}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                            r.party_type === 'customer' ? 'bg-[#E9EFE8] text-[#566E54] border-[#D3DFD2]' : 'bg-[#FCF7F4] text-[#BF745F] border-[#F0D7CD]'
                          }`}>
                            {r.party_type}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#7C746F]">{r.date} • {r.category}</span>
                      </div>
                      <span className={`font-serif font-bold ${r.party_type === 'customer' ? 'text-[#566E54]' : 'text-[#BF745F]'}`}>
                        {r.party_type === 'customer' ? '+' : '-'}₹{r.amount}
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
                  {isProcessing ? 'Importing...' : 'Confirm & Save to Ledgers'}
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
                  placeholder={partyType === 'customer' ? 'e.g. INV-104' : 'e.g. BILL-820'}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#554C78] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Payment Status
                </label>
                <select
                  value={invoiceForm.status}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white focus:border-[#554C78] outline-none"
                >
                  <option value="paid">Paid (Collected / Settled)</option>
                  <option value="unpaid">
                    {partyType === 'customer' ? 'Unpaid (Customer Owes Me)' : 'Unpaid (I Owe Supplier)'}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#48433F] mb-1">
                {partyType === 'customer' ? 'Customer Name' : 'Supplier Name'}
              </label>
              <input
                type="text"
                value={invoiceForm.counterparty}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, counterparty: e.target.value })}
                placeholder={partyType === 'customer' ? 'e.g. Meena Sharma, Daily Counter' : 'e.g. APMC Mandi, Wholesale Seeds'}
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

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full mt-2 py-3 rounded-full bg-[#554C78] hover:bg-[#3F3760] text-white text-xs font-bold shadow-soft transition active:scale-98"
            >
              {isProcessing ? 'Saving...' : `Record ${partyType === 'customer' ? 'Customer' : 'Supplier'} Bill`}
            </button>
          </form>
        )}

        {/* TAB 3: CASH QUICK ENTRY */}
        {activeTab === 'cash' && (
          <form onSubmit={handleSaveCash} className="space-y-3 pt-1 animate-in fade-in">
            <div className="grid grid-cols-2 gap-2">
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

            <div>
              <label className="block text-xs font-semibold text-[#48433F] mb-1">
                {partyType === 'customer' ? 'Customer Name' : 'Supplier Name'}
              </label>
              <input
                type="text"
                value={cashForm.counterparty}
                onChange={(e) => setCashForm({ ...cashForm, counterparty: e.target.value })}
                placeholder={partyType === 'customer' ? 'e.g. Ramesh, Daily counter sales' : 'e.g. Mandi Wholesaler'}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#48433F] mb-1">
                Category
              </label>
              <input
                type="text"
                value={cashForm.category}
                onChange={(e) => setCashForm({ ...cashForm, category: e.target.value })}
                placeholder={partyType === 'customer' ? 'Vegetables, Fruits, etc.' : 'Stock, Fertilisers, Transport'}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-xs font-medium focus:bg-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full mt-2 py-3 rounded-full bg-[#566E54] hover:bg-[#425541] text-white text-xs font-bold shadow-soft transition active:scale-98"
            >
              {isProcessing ? 'Saving...' : `Record Cash for ${partyType === 'customer' ? 'Customer' : 'Supplier'}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
