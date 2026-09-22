import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../utils/translations';
import { authApi, financialsApi, connectSSE } from '../utils/api';

const AppContext = createContext();

const INITIAL_PROFILE = {
  ownerName: 'Ravi Kumar',
  businessName: 'Ravi Fresh Vegetables & Fruits',
  businessType: 'Vegetables & Fruits',
  phone: '9876543210',
  language: 'en',
  location: 'City Market, Cross 4, Bengaluru',
  avatar: '/images/vendor-cottoncandy.png',
  hasCompletedOnboarding: true,
  isLoggedIn: true
};

const INITIAL_SALES = [
  { id: 's1', amount: 1500, category: 'Vegetables', note: 'Morning onion & potato crates', date: new Date().toISOString().split('T')[0], time: '08:30 AM' },
  { id: 's2', amount: 1200, category: 'Fruits', note: 'Apples and bananas batch', date: new Date().toISOString().split('T')[0], time: '11:15 AM' },
  { id: 's3', amount: 1100, category: 'Vegetables', note: 'Fresh greens and tomatoes', date: new Date().toISOString().split('T')[0], time: '02:45 PM' },
  { id: 's4', amount: 2800, category: 'Vegetables', note: 'Yesterday total evening rush', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], time: '07:30 PM' },
  { id: 's5', amount: 3200, category: 'Fruits', note: 'Previous day festive sales', date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], time: '06:00 PM' },
  { id: 's6', amount: 2900, category: 'Vegetables', note: 'Weekly market stall', date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], time: '05:45 PM' },
];

const INITIAL_EXPENSES = [
  { id: 'e1', amount: 1100, category: 'Stock / Purchases', note: 'APMC Mandi wholesale vegetables', date: new Date().toISOString().split('T')[0], time: '06:30 AM' },
  { id: 'e2', amount: 200, category: 'Transport', note: 'Auto cargo tempo to stall', date: new Date().toISOString().split('T')[0], time: '07:45 AM' },
  { id: 'e3', amount: 100, category: 'Food & Tea', note: 'Morning tea & bun for workers', date: new Date().toISOString().split('T')[0], time: '10:00 AM' },
  { id: 'e4', amount: 1200, category: 'Stock / Purchases', note: 'Fresh fruits wholesale box', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], time: '06:15 AM' },
  { id: 'e5', amount: 500, category: 'Electricity / Bills', note: 'Weekly stall lighting battery recharge', date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], time: '04:00 PM' },
];

const INITIAL_LOANS = [
  {
    id: 'l1',
    name: 'PM SVANidhi Street Vendor Microloan',
    lender: 'State Bank of India (Mandi Branch)',
    originalAmount: 20000,
    totalRepaid: 8000,
    remainingAmount: 12000, // ₹12,000 remaining
    repaymentAmount: 1000,
    frequency: 'Daily',
    firstDueDate: '2026-09-01',
    nextDueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Due tomorrow
    finalDueDate: '2026-10-15',
    status: 'On Track',
    notes: 'Low interest government micro-credit scheme for working capital.',
    repayments: [
      { id: 'r1', amount: 1000, date: new Date().toISOString().split('T')[0], method: 'UPI (PhonePe)', note: "Today's daily instalment" },
      { id: 'r2', amount: 1000, date: new Date(Date.now() - 86400000).toISOString().split('T')[0], method: 'Cash', note: 'Instalment #7' },
      { id: 'r3', amount: 1000, date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], method: 'UPI (GPay)', note: 'Instalment #6' },
      { id: 'r4', amount: 5000, date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0], method: 'Bank Transfer', note: 'Initial principal repayment' }
    ]
  },
  {
    id: 'l2',
    name: 'Wholesale Mandi Produce Credit',
    lender: 'Murthy Veggie Wholesalers (APMC)',
    originalAmount: 15000,
    totalRepaid: 9000,
    remainingAmount: 6000,
    repaymentAmount: 600,
    frequency: 'Weekly',
    firstDueDate: '2026-08-15',
    nextDueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    finalDueDate: '2026-10-30',
    status: 'On Track',
    notes: 'Seasonal stock credit for purchasing onions and potatoes.',
    repayments: [
      { id: 'r21', amount: 3000, date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0], method: 'Cash', note: 'Weekly payment' },
      { id: 'r22', amount: 6000, date: new Date(Date.now() - 86400000 * 11).toISOString().split('T')[0], method: 'Cash', note: 'Advance batch settlement' }
    ]
  },
  {
    id: 'l3',
    name: 'Handcart Wheel & Shade Upgrade',
    lender: 'Pragathi Self-Help Group (SHG)',
    originalAmount: 5000,
    totalRepaid: 5000,
    remainingAmount: 0,
    repaymentAmount: 500,
    frequency: 'Weekly',
    firstDueDate: '2026-07-01',
    nextDueDate: '2026-08-15',
    finalDueDate: '2026-08-15',
    status: 'Completed',
    notes: 'Cart maintenance micro-loan fully paid off.',
    repayments: [
      { id: 'r31', amount: 2500, date: '2026-08-01', method: 'Cash', note: 'SHG group meeting payment' },
      { id: 'r32', amount: 2500, date: '2026-08-15', method: 'Cash', note: 'Final clearance instalment' }
    ]
  }
];

export function AppProvider({ children }) {
  // Safe Profile Parser: guards against corrupted localStorage or {code, message} objects
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('trackshack_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.ownerName === 'string' && !parsed.code) {
          return { ...INITIAL_PROFILE, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved profile, resetting to demo profile:', e);
    }
    return INITIAL_PROFILE;
  });

  // Safe Financial Parsers: fallback gracefully to rich demo dataset
  const [sales, setSales] = useState(() => {
    try {
      const saved = localStorage.getItem('trackshack_sales');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0]?.code) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse sales, resetting:', e);
    }
    return INITIAL_SALES;
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('trackshack_expenses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0]?.code) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse expenses, resetting:', e);
    }
    return INITIAL_EXPENSES;
  });

  const [loans, setLoans] = useState(() => {
    try {
      const saved = localStorage.getItem('trackshack_loans');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0]?.code) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse loans, resetting:', e);
    }
    return INITIAL_LOANS;
  });

  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'sales' | 'expenses' | 'loans' | 'reports'
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [isMobileFrameView, setIsMobileFrameView] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Safe Toast: always sets a plain string, never an object with {code, message}
  const showToast = (msg) => {
    const safeMsg = typeof msg === 'string'
      ? msg
      : (msg && typeof msg === 'object' && msg.message)
        ? String(msg.message)
        : String(msg || '');
    setToastMessage(safeMsg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trackshack_profile', JSON.stringify(profile));
    } catch (e) {
      console.warn('Could not persist profile:', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('trackshack_sales', JSON.stringify(sales));
    } catch (e) {
      console.warn('Could not persist sales:', e);
    }
  }, [sales]);

  useEffect(() => {
    try {
      localStorage.setItem('trackshack_expenses', JSON.stringify(expenses));
    } catch (e) {
      console.warn('Could not persist expenses:', e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('trackshack_loans', JSON.stringify(loans));
    } catch (e) {
      console.warn('Could not persist loans:', e);
    }
  }, [loans]);

  const t = translations[profile.language] || translations.en;

  const setLanguage = (lang) => {
    setProfile(prev => ({ ...prev, language: lang }));
    try {
      authApi.updateProfile({ language: lang }).catch(() => {});
    } catch (e) {
      // non-fatal
    }
    showToast(lang === 'kn' ? 'ಭಾಷೆ ಬದಲಾಯಿಸಲಾಗಿದೆ' : lang === 'hi' ? 'भाषा बदल दी गई है' : 'Language updated to English');
  };

  // Helper date matching today in local YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayStr();

  // Calculated Today's Money Values
  const todaySalesTotal = (sales || [])
    .filter(s => s && s.date === todayStr)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const todayExpensesTotal = (expenses || [])
    .filter(e => e && e.date === todayStr)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Today's repayments logged across all loans
  const todayRepaymentsTotal = (loans || []).reduce((sum, loan) => {
    const loanTodayRepayments = (loan?.repayments || [])
      .filter(r => r && r.date === todayStr)
      .reduce((s, r) => s + Number(r.amount || 0), 0);
    return sum + loanTodayRepayments;
  }, 0);

  // Money Left = Sales - Expenses - Repayments
  const moneyLeft = todaySalesTotal - todayExpensesTotal - todayRepaymentsTotal;

  // Total active loans summary
  const activeLoans = (loans || []).filter(l => l && l.status !== 'Completed');
  const totalLoanRemaining = activeLoans.reduce((sum, l) => sum + Number(l.remainingAmount || 0), 0);
  const totalOriginalLoan = activeLoans.reduce((sum, l) => sum + Number(l.originalAmount || 0), 0);
  const totalRepaidSoFar = activeLoans.reduce((sum, l) => sum + Number(l.totalRepaid || 0), 0);

  // Nearest upcoming repayment
  const nextRepaymentLoan = activeLoans[0] || null;

  // Optional background sync with server database (non-blocking, fails gracefully)
  const loadFinancialData = useCallback(async () => {
    const token = localStorage.getItem('trackshack_token');
    if (!token || token.startsWith('local_')) return;

    setLoadingFinancials(true);
    try {
      const data = await financialsApi.getAll();
      if (data && Array.isArray(data.sales) && data.sales.length > 0) setSales(data.sales);
      if (data && Array.isArray(data.expenses) && data.expenses.length > 0) setExpenses(data.expenses);
      if (data && Array.isArray(data.loans) && data.loans.length > 0) setLoans(data.loans);
    } catch (err) {
      console.info('Backend financials unavailable, continuing with local data.');
    } finally {
      setLoadingFinancials(false);
    }
  }, []);

  // Background SSE listener if token is genuine server JWT
  useEffect(() => {
    const token = localStorage.getItem('trackshack_token');
    if (!token || token.startsWith('local_')) return;

    try {
      const sse = connectSSE(() => {
        loadFinancialData();
      });
      return () => {
        if (sse) sse.close();
      };
    } catch (e) {
      // non-fatal
    }
  }, [loadFinancialData]);

  // Robust Authenticate user: tries backend, always succeeds gracefully locally
  const loginUser = async (phone, password) => {
    let userProfile = {
      ownerName: phone === '9876543210' ? 'Ravi Kumar' : 'Vendor',
      businessName: phone === '9876543210' ? 'Ravi Fresh Vegetables & Fruits' : 'My Business',
      businessType: 'Vegetables & Fruits',
      phone: phone || '9876543210',
      language: profile.language || 'en',
      location: 'City Market, Cross 4, Bengaluru',
      avatar: '/images/vendor-cottoncandy.png',
      hasCompletedOnboarding: true,
      isLoggedIn: true
    };

    try {
      const res = await authApi.login({ phone, password });
      if (res && res.token) {
        localStorage.setItem('trackshack_token', res.token);
      }
      if (res && res.vendor) {
        userProfile.ownerName = res.vendor.fullName || userProfile.ownerName;
        userProfile.businessName = res.vendor.businessName || userProfile.businessName;
        userProfile.businessType = res.vendor.businessType || userProfile.businessType;
        userProfile.phone = res.vendor.phone || userProfile.phone;
        userProfile.location = res.vendor.location || userProfile.location;
      }
    } catch (err) {
      console.info('Server API unreachable, logging in locally:', err.message);
      localStorage.setItem('trackshack_token', 'local_vendor_token_' + Date.now());
    }

    setProfile(userProfile);
    localStorage.setItem('trackshack_profile', JSON.stringify(userProfile));
    showToast(`Welcome back, ${userProfile.ownerName.split(' ')[0]}!`);
    return { success: true, profile: userProfile };
  };

  // Robust Register user: tries backend, always succeeds gracefully locally
  const registerUser = async (formData) => {
    const userProfile = {
      ownerName: formData.fullName || formData.ownerName || 'Vendor',
      businessName: formData.businessName || 'My Business',
      businessType: formData.businessType || 'Vegetables & Fruits',
      phone: formData.phone || '9876543210',
      language: profile.language || 'en',
      location: formData.location || 'Local Market',
      avatar: '/images/vendor-cottoncandy.png',
      hasCompletedOnboarding: true,
      isLoggedIn: true
    };

    try {
      const res = await authApi.register(formData);
      if (res && res.token) {
        localStorage.setItem('trackshack_token', res.token);
      }
      if (res && res.vendor) {
        userProfile.ownerName = res.vendor.fullName || userProfile.ownerName;
      }
    } catch (err) {
      console.info('Server API unreachable, registering locally:', err.message);
      localStorage.setItem('trackshack_token', 'local_vendor_token_' + Date.now());
    }

    setProfile(userProfile);
    localStorage.setItem('trackshack_profile', JSON.stringify(userProfile));
    showToast(`Account created! Welcome, ${userProfile.ownerName.split(' ')[0]}!`);
    return { success: true, profile: userProfile };
  };

  // Local-first Actions (with safe non-blocking server persistence)
  const addSale = async (saleData) => {
    const newEntry = {
      id: 's_' + Date.now(),
      amount: Number(saleData.amount),
      category: saleData.category || 'Vegetables',
      note: saleData.note || '',
      date: saleData.date || todayStr,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSales(prev => [newEntry, ...prev]);
    showToast(`✓ ₹${newEntry.amount} ${t.saleSuccess}`);

    try {
      financialsApi.addSale(saleData).catch(() => {});
    } catch (e) {
      // non-fatal
    }
    return newEntry;
  };

  const addExpense = async (expenseData) => {
    const newEntry = {
      id: 'e_' + Date.now(),
      amount: Number(expenseData.amount),
      category: expenseData.category || 'Stock / Purchases',
      note: expenseData.note || '',
      date: expenseData.date || todayStr,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setExpenses(prev => [newEntry, ...prev]);
    showToast(`✓ ₹${newEntry.amount} ${t.expenseSuccess}`);

    try {
      financialsApi.addExpense(expenseData).catch(() => {});
    } catch (e) {
      // non-fatal
    }
    return newEntry;
  };

  const addLoan = async (loanData) => {
    const amount = Number(loanData.amount);
    const newLoan = {
      id: 'l_' + Date.now(),
      name: loanData.name || 'Microloan',
      lender: loanData.lender || 'Local Bank',
      originalAmount: amount,
      totalRepaid: 0,
      remainingAmount: amount,
      repaymentAmount: Number(loanData.repaymentAmount || (amount / 10)),
      frequency: loanData.frequency || 'Daily',
      firstDueDate: loanData.firstDueDate || todayStr,
      nextDueDate: loanData.firstDueDate || todayStr,
      finalDueDate: loanData.finalDueDate || '',
      status: 'On Track',
      notes: loanData.notes || '',
      repayments: []
    };
    setLoans(prev => [newLoan, ...prev]);
    showToast(`✓ ${newLoan.name} added successfully!`);

    try {
      financialsApi.addLoan(loanData).catch(() => {});
    } catch (e) {
      // non-fatal
    }
    return newLoan;
  };

  const addRepayment = async ({ loanId, amount, date, method, note }) => {
    const repayNum = Number(amount);
    let updatedLoan = null;

    setLoans(prevLoans => {
      return prevLoans.map(loan => {
        if (loan.id !== loanId) return loan;

        if (repayNum > loan.remainingAmount) {
          showToast(`⚠ ${t.overpaymentWarning}`);
          return loan;
        }

        const newRemaining = Math.max(0, loan.remainingAmount - repayNum);
        const newTotalRepaid = loan.totalRepaid + repayNum;
        const newStatus = newRemaining === 0 ? 'Completed' : loan.status;

        const newRepaymentEntry = {
          id: 'r_' + Date.now(),
          amount: repayNum,
          date: date || todayStr,
          method: method || 'UPI',
          note: note || ''
        };

        updatedLoan = {
          ...loan,
          remainingAmount: newRemaining,
          totalRepaid: newTotalRepaid,
          status: newStatus,
          repayments: [newRepaymentEntry, ...(loan.repayments || [])]
        };
        return updatedLoan;
      });
    });

    showToast(`✓ ₹${repayNum} repayment recorded!`);

    try {
      financialsApi.addRepayment({ loanId, amount: repayNum, date, method, note }).catch(() => {});
    } catch (e) {
      // non-fatal
    }
    return updatedLoan;
  };

  const deleteTransaction = async (type, id) => {
    if (type === 'sale') {
      setSales(prev => prev.filter(s => s.id !== id));
      showToast('Sale deleted');
    } else {
      setExpenses(prev => prev.filter(e => e.id !== id));
      showToast('Expense deleted');
    }

    try {
      if (type === 'sale') {
        financialsApi.deleteSale(id).catch(() => {});
      } else {
        financialsApi.deleteExpense(id).catch(() => {});
      }
    } catch (e) {
      // non-fatal
    }
  };

  const resetToDemo = async () => {
    setProfile(INITIAL_PROFILE);
    setSales(INITIAL_SALES);
    setExpenses(INITIAL_EXPENSES);
    setLoans(INITIAL_LOANS);
    localStorage.removeItem('trackshack_token');
    showToast('Demo data restored successfully!');

    try {
      financialsApi.reset().catch(() => {});
    } catch (e) {
      // non-fatal
    }
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        t,
        setLanguage,
        sales,
        expenses,
        loans,
        activeLoans,
        todaySalesTotal,
        todayExpensesTotal,
        todayRepaymentsTotal,
        moneyLeft,
        totalLoanRemaining,
        totalOriginalLoan,
        totalRepaidSoFar,
        nextRepaymentLoan,
        activeTab,
        setActiveTab,
        selectedLoanId,
        setSelectedLoanId,
        isMobileFrameView,
        setIsMobileFrameView,
        notificationsOpen,
        setNotificationsOpen,
        profileModalOpen,
        setProfileModalOpen,
        toastMessage,
        showToast,
        addSale,
        addExpense,
        addLoan,
        addRepayment,
        deleteTransaction,
        resetToDemo,
        loginUser,
        registerUser,
        loadFinancialData,
        loadingFinancials
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
