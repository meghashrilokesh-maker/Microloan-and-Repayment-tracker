import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../utils/translations';
import { authApi, financialsApi, connectSSE, getErrorMessage } from '../utils/api';

const AppContext = createContext();

const DEFAULT_PROFILE = {
  ownerName: 'Ravi Kumar',
  businessName: 'Ravi Fresh Vegetables & Fruits',
  businessType: 'Vegetables & Fruits',
  phone: '9876543210',
  language: 'en',
  location: 'City Market, Cross 4, Bengaluru',
  avatar: '/images/vendor-cottoncandy.png',
  hasCompletedOnboarding: true,
  isLoggedIn: false
};

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('trackshack_profile');
    const token = localStorage.getItem('trackshack_token');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, isLoggedIn: !!token };
    }
    return { ...DEFAULT_PROFILE, isLoggedIn: !!token };
  });

  // Financial records: zero initial values; loaded strictly from DB
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loadingFinancials, setLoadingFinancials] = useState(false);

  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'sales' | 'expenses' | 'loans' | 'reports'
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [isMobileFrameView, setIsMobileFrameView] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Sync profile metadata to localStorage
  useEffect(() => {
    localStorage.setItem('trackshack_profile', JSON.stringify(profile));
  }, [profile]);

  const t = translations[profile.language] || translations.en;

  const setLanguage = (lang) => {
    setProfile(prev => ({ ...prev, language: lang }));
    const token = localStorage.getItem('trackshack_token');
    if (token) {
      authApi.updateProfile({ language: lang }).catch(() => {});
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

  // Calculated Today's Money Values strictly from database records
  const todaySalesTotal = sales
    .filter(s => s.date === todayStr)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const todayExpensesTotal = expenses
    .filter(e => e.date === todayStr)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Today's repayments logged across all loans
  const todayRepaymentsTotal = loans.reduce((sum, loan) => {
    const loanTodayRepayments = (loan.repayments || [])
      .filter(r => r.date === todayStr)
      .reduce((s, r) => s + Number(r.amount || 0), 0);
    return sum + loanTodayRepayments;
  }, 0);

  // Money Left = Sales - Expenses - Repayments
  const moneyLeft = todaySalesTotal - todayExpensesTotal - todayRepaymentsTotal;

  // Total active loans summary
  const activeLoans = loans.filter(l => l.status !== 'Completed');
  const totalLoanRemaining = activeLoans.reduce((sum, l) => sum + Number(l.remainingAmount || 0), 0);
  const totalOriginalLoan = activeLoans.reduce((sum, l) => sum + Number(l.originalAmount || 0), 0);
  const totalRepaidSoFar = activeLoans.reduce((sum, l) => sum + Number(l.totalRepaid || 0), 0);

  // Nearest upcoming repayment
  const nextRepaymentLoan = activeLoans[0] || null;

  // Load all user financial data from server database
  const loadFinancialData = useCallback(async () => {
    const token = localStorage.getItem('trackshack_token');
    if (!token) return;

    setLoadingFinancials(true);
    try {
      const data = await financialsApi.getAll();
      setSales(data.sales || []);
      setExpenses(data.expenses || []);
      setLoans(data.loans || []);
    } catch (err) {
      console.error('Failed to load database financials:', err);
    } finally {
      setLoadingFinancials(false);
    }
  }, []);

  // Fetch current user & database financials on load / auth state change
  useEffect(() => {
    const token = localStorage.getItem('trackshack_token');
    if (!token) {
      setSales([]);
      setExpenses([]);
      setLoans([]);
      return;
    }

    // Refresh user profile from database
    authApi.getMe()
      .then((res) => {
        if (res && res.vendor) {
          setProfile(prev => ({
            ...prev,
            ownerName: res.vendor.fullName || prev.ownerName,
            businessName: res.vendor.businessName || prev.businessName,
            businessType: res.vendor.businessType || prev.businessType,
            phone: res.vendor.phone || prev.phone,
            language: res.vendor.preferredLanguage || prev.language,
            location: res.vendor.location || prev.location,
            isLoggedIn: true
          }));
        }
      })
      .catch((err) => {
        console.warn('Auth token expired or invalid:', err);
      });

    loadFinancialData();

    // Setup live real-time SSE listener
    const sse = connectSSE((_event) => {
      // On any live event (sale/expense/loan/repayment created or deleted)
      loadFinancialData();
    });


    return () => {
      if (sse) sse.close();
    };
  }, [profile.isLoggedIn, loadFinancialData]);

  // Authenticate user
  const loginUser = async (phone, password) => {
    try {
      const res = await authApi.login({ phone, password });
      localStorage.setItem('trackshack_token', res.token);
      const userProfile = {
        ownerName: res.vendor.fullName || 'Vendor',
        businessName: res.vendor.businessName || 'My Business',
        businessType: res.vendor.businessType || 'General Store',
        phone: res.vendor.phone,
        language: res.vendor.preferredLanguage || 'en',
        location: res.vendor.location || '',
        avatar: '/images/vendor-cottoncandy.png',
        hasCompletedOnboarding: true,
        isLoggedIn: true
      };
      setProfile(userProfile);
      localStorage.setItem('trackshack_profile', JSON.stringify(userProfile));
      await loadFinancialData();
      showToast(`Welcome back, ${userProfile.ownerName.split(' ')[0]}!`);
      return res;
    } catch (err) {
      const msg = getErrorMessage(err, 'Login failed');
      showToast(`⚠ ${msg}`);
      throw err;
    }
  };

  // Register new vendor
  const registerUser = async (formData) => {
    try {
      const res = await authApi.register(formData);
      localStorage.setItem('trackshack_token', res.token);
      const userProfile = {
        ownerName: res.vendor.fullName || formData.fullName || 'Vendor',
        businessName: res.vendor.businessName || formData.businessName || 'My Business',
        businessType: res.vendor.businessType || formData.businessType || 'General Store',
        phone: res.vendor.phone,
        language: res.vendor.preferredLanguage || 'en',
        location: res.vendor.location || '',
        avatar: '/images/vendor-cottoncandy.png',
        hasCompletedOnboarding: true,
        isLoggedIn: true
      };
      setProfile(userProfile);
      localStorage.setItem('trackshack_profile', JSON.stringify(userProfile));
      setSales([]);
      setExpenses([]);
      setLoans([]);
      showToast(`Account created! Welcome, ${userProfile.ownerName.split(' ')[0]}!`);
      return res;
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to create account');
      showToast(`⚠ ${msg}`);
      throw err;
    }
  };

  // Database actions
  const addSale = async (saleData) => {
    try {
      const res = await financialsApi.addSale(saleData);
      setSales(prev => [res.sale, ...prev.filter(s => s.id !== res.sale.id)]);
      showToast(`✓ ₹${res.sale.amount} ${t.saleSuccess}`);
      return res.sale;
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to save sale');
      showToast(`⚠ ${msg}`);
      throw err;
    }
  };

  const addExpense = async (expenseData) => {
    try {
      const res = await financialsApi.addExpense(expenseData);
      setExpenses(prev => [res.expense, ...prev.filter(e => e.id !== res.expense.id)]);
      showToast(`✓ ₹${res.expense.amount} ${t.expenseSuccess}`);
      return res.expense;
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to save expense');
      showToast(`⚠ ${msg}`);
      throw err;
    }
  };

  const addLoan = async (loanData) => {
    try {
      const res = await financialsApi.addLoan(loanData);
      setLoans(prev => [res.loan, ...prev.filter(l => l.id !== res.loan.id)]);
      showToast(`✓ ${res.loan.name} added successfully!`);
      return res.loan;
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to save loan');
      showToast(`⚠ ${msg}`);
      throw err;
    }
  };

  const addRepayment = async (repayData) => {
    try {
      const res = await financialsApi.addRepayment(repayData);
      setLoans(prev => prev.map(l => (l.id === res.loan.id ? res.loan : l)));
      showToast(`✓ ₹${repayData.amount} repayment recorded!`);
      return res.loan;
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to record repayment');
      showToast(`⚠ ${msg}`);
      throw err;
    }
  };

  const deleteTransaction = async (type, id) => {
    try {
      if (type === 'sale') {
        await financialsApi.deleteSale(id);
        setSales(prev => prev.filter(s => s.id !== id));
        showToast('Sale deleted');
      } else {
        await financialsApi.deleteExpense(id);
        setExpenses(prev => prev.filter(e => e.id !== id));
        showToast('Expense deleted');
      }
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to delete transaction');
      showToast(`⚠ ${msg}`);
      throw err;
    }
  };

  const resetToDemo = async () => {
    try {
      await financialsApi.reset();
      setSales([]);
      setExpenses([]);
      setLoans([]);
      showToast('All financial records reset to ₹0 successfully!');
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to reset records');
      showToast(`⚠ ${msg}`);
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
