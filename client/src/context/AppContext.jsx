import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../utils/translations';
import { authApi, financialsApi, connectSSE } from '../utils/api';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
const AppContext = createContext();

const EMPTY_PROFILE = {
  id: '',
  ownerName: '',
  fullName: '',
  businessName: '',
  businessType: '',
  phone: '',
  language: 'en',
  location: '',
  avatar: '/images/vendor-cottoncandy.png',
  userType: 'vendor', // 'vendor' | 'customer'
  productsServices: '',
  interests: [],
  hasCompletedOnboarding: false,
  isLoggedIn: false,
  isDemo: false
};

const DEMO_PROFILE = {
  id: 'demo-vendor-ravi',
  ownerName: 'Ravi Kumar',
  fullName: 'Ravi Kumar',
  businessName: 'Ravi Fresh Vegetables & Fruits',
  businessType: 'Vegetables & Fruits',
  phone: '9876543210',
  language: 'en',
  location: 'City Market, Cross 4, Bengaluru',
  avatar: '/images/vendor-cottoncandy.png',
  userType: 'vendor',
  productsServices: 'Potatoes, onions, tomatoes, and seasonal fresh greens',
  interests: [],
  hasCompletedOnboarding: true,
  isLoggedIn: true,
  isDemo: true
};

const INITIAL_PROFILE = DEMO_PROFILE;

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
        if (parsed && typeof parsed.ownerName === 'string' && !parsed.code && parsed.isLoggedIn && parsed.id) {
          return { ...EMPTY_PROFILE, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved profile:', e);
    }
    return EMPTY_PROFILE;
  });

  // Safe Financial Parsers: real users start with empty records, demo user uses rich sample data
  const [sales, setSales] = useState(() => {
    try {
      const savedProfile = localStorage.getItem('trackshack_profile');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p?.isDemo && p?.id === 'demo-vendor-ravi') {
          const saved = localStorage.getItem('trackshack_sales');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0]?.code) {
              return parsed;
            }
          }
          return INITIAL_SALES;
        }
        if (p?.id && p.id !== 'demo-vendor-ravi') {
          const userSaved = localStorage.getItem(`trackshack_sales_${p.id}`);
          return userSaved ? JSON.parse(userSaved) : [];
        }
      }
    } catch (e) {
      console.warn('Failed to parse sales:', e);
    }
    return [];
  });

  const [expenses, setExpenses] = useState(() => {
    try {
      const savedProfile = localStorage.getItem('trackshack_profile');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p?.isDemo && p?.id === 'demo-vendor-ravi') {
          const saved = localStorage.getItem('trackshack_expenses');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0]?.code) {
              return parsed;
            }
          }
          return INITIAL_EXPENSES;
        }
        if (p?.id && p.id !== 'demo-vendor-ravi') {
          const userSaved = localStorage.getItem(`trackshack_expenses_${p.id}`);
          return userSaved ? JSON.parse(userSaved) : [];
        }
      }
    } catch (e) {
      console.warn('Failed to parse expenses:', e);
    }
    return [];
  });

  const [loans, setLoans] = useState(() => {
    try {
      const savedProfile = localStorage.getItem('trackshack_profile');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p?.isDemo && p?.id === 'demo-vendor-ravi') {
          const saved = localStorage.getItem('trackshack_loans');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0]?.code) {
              return parsed;
            }
          }
          return INITIAL_LOANS;
        }
        if (p?.id && p.id !== 'demo-vendor-ravi') {
          const userSaved = localStorage.getItem(`trackshack_loans_${p.id}`);
          return userSaved ? JSON.parse(userSaved) : [];
        }
      }
    } catch (e) {
      console.warn('Failed to parse loans:', e);
    }
    return [];
  });

  const [loadingFinancials, setLoadingFinancials] = useState(false);
  const [financialsError, setFinancialsError] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'sales' | 'expenses' | 'loans' | 'reports'
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [isMobileFrameView, setIsMobileFrameView] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchLoans = async () => {
    const [loansRes, repaymentsRes] = await Promise.all([
      supabase.from('loans').select('*').order('created_at', { ascending: false }),
      supabase.from('repayments').select('*').order('payment_date', { ascending: false })
    ]);

    if (loansRes.error) {
      console.error('Error fetching loans from Supabase:', loansRes.error);
      return;
    }

    if (repaymentsRes.error) {
      console.error('Error fetching repayments from Supabase:', repaymentsRes.error);
    }

    const allRepayments = repaymentsRes.data || [];

    const formattedLoans = (loansRes.data || []).map(loan => {
      const loanRepayments = allRepayments
        .filter(r => r.loan_id === loan.id)
        .map(r => ({
          id: r.id,
          amount: Number(r.amount || 0),
          date: r.payment_date || (r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
          method: r.payment_method || 'UPI',
          note: r.note || r.notes || ''
        }));

      const totalRepaid = loanRepayments.reduce((sum, r) => sum + r.amount, 0);
      const originalAmount = Number(loan.loan_amount || 0);
      const remainingAmount = Math.max(0, originalAmount - totalRepaid);
      const status = remainingAmount === 0 ? 'Completed' : (loan.status || 'On Track');

      return {
        id: loan.id,
        name: loan.loan_name,
        lender: loan.lender,
        originalAmount,
        totalRepaid,
        remainingAmount,
        repaymentAmount: Number(loan.repayment_amount || 0),
        frequency: loan.repayment_frequency,
        firstDueDate: loan.first_due_date,
        nextDueDate: loan.next_due_date,
        finalDueDate: loan.final_due_date || '',
        status,
        notes: loan.notes || '',
        repayments: loanRepayments
      };
    });

    setLoans(formattedLoans);
    console.log('Loans loaded from Supabase with repayments:', formattedLoans);
  };

  useEffect(() => {
    if (profile.id && profile.id !== 'demo-vendor-ravi') {
      fetchLoans();
    }
  }, [profile.id]);

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

  // Sync to localStorage strictly when logged in
  useEffect(() => {
    try {
      if (profile.isLoggedIn && profile.id) {
        localStorage.setItem('trackshack_profile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('trackshack_profile');
      }
    } catch (e) {
      console.warn('Could not persist profile:', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      if (profile.id && profile.id !== 'demo-vendor-ravi') {
        localStorage.setItem(`trackshack_sales_${profile.id}`, JSON.stringify(sales));
      } else {
        localStorage.setItem('trackshack_sales', JSON.stringify(sales));
      }
    } catch (e) {
      console.warn('Could not persist sales:', e);
    }
  }, [sales, profile.id]);

  useEffect(() => {
    try {
      if (profile.id && profile.id !== 'demo-vendor-ravi') {
        localStorage.setItem(`trackshack_expenses_${profile.id}`, JSON.stringify(expenses));
      } else {
        localStorage.setItem('trackshack_expenses', JSON.stringify(expenses));
      }
    } catch (e) {
      console.warn('Could not persist expenses:', e);
    }
  }, [expenses, profile.id]);

  useEffect(() => {
    try {
      if (profile.id && profile.id !== 'demo-vendor-ravi') {
        localStorage.setItem(`trackshack_loans_${profile.id}`, JSON.stringify(loans));
      } else {
        localStorage.setItem('trackshack_loans', JSON.stringify(loans));
      }
    } catch (e) {
      console.warn('Could not persist loans:', e);
    }
  }, [loans, profile.id]);

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

  // Persistent Supabase transaction loader for authenticated users
  const loadTransactions = useCallback(async (userId) => {
    if (!userId || userId === 'demo-vendor-ravi') return;
    if (!supabase) return;

    setLoadingFinancials(true);
    setFinancialsError(null);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          console.info('Supabase transactions table not yet initialized.');
          setFinancialsError('Transactions table pending initialization in Supabase.');
        } else {
          console.warn('Supabase fetch transactions error:', error.message);
          setFinancialsError('Could not load transactions from cloud database.');
        }
        return;
      }

      const txList = data || [];
      const fetchedSales = txList
        .filter(t => t.type === 'sale')
        .map(t => ({
          id: t.id,
          amount: Number(t.amount),
          category: t.category || 'Vegetables',
          customer_name: t.customer_name || '',
          customerName: t.customer_name || '',
          note: t.description || '',
          date: t.date,
          time: t.time || ''
        }));

      const fetchedExpenses = txList
        .filter(t => t.type === 'expense')
        .map(t => ({
          id: t.id,
          amount: Number(t.amount),
          category: t.category || 'Stock / Purchases',
          customer_name: t.customer_name || '',
          customerName: t.customer_name || '',
          note: t.description || '',
          date: t.date,
          time: t.time || ''
        }));

      const fetchedLoans = txList
        .filter(t => t.type === 'loan')
        .map(t => {
          const meta = t.metadata || {};
          return {
            id: t.id,
            name: meta.name || t.category || 'Microloan',
            lender: t.customer_name || meta.lender || 'Local Lender',
            customer_name: t.customer_name || meta.lender || 'Local Lender',
            customerName: t.customer_name || meta.lender || 'Local Lender',
            originalAmount: Number(meta.original_amount || t.amount),
            totalRepaid: Number(meta.total_repaid || 0),
            remainingAmount: Number(meta.remaining_amount !== undefined ? meta.remaining_amount : t.amount),
            repaymentAmount: Number(meta.repayment_amount || Math.round(Number(t.amount) / 10)),
            frequency: meta.frequency || 'Daily',
            firstDueDate: meta.first_due_date || t.date,
            nextDueDate: meta.next_due_date || t.date,
            finalDueDate: meta.final_due_date || '',
            status: meta.status || 'On Track',
            notes: t.description || meta.notes || '',
            repayments: Array.isArray(meta.repayments) ? meta.repayments : []
          };
        });

      setSales(fetchedSales);
      setExpenses(fetchedExpenses);
      setLoans(fetchedLoans);
    } catch (err) {
      console.warn('Error loading user transactions from Supabase:', err);
      setFinancialsError('Failed to load transactions.');
    } finally {
      setLoadingFinancials(false);
    }
  }, []);

  // Helper to load and normalize user profile strictly from Supabase Auth & public.profiles
  const loadUserProfile = async (user) => {
    if (!user || !user.id) return null;
    const meta = user.user_metadata || {};
    const emailPrefix = user.email ? user.email.split('@')[0] : 'User';

    let profileData = {
      id: user.id,
      ownerName: meta.full_name || meta.fullName || meta.ownerName || emailPrefix,
      fullName: meta.full_name || meta.fullName || meta.ownerName || emailPrefix,
      userType: meta.user_type || meta.userType || 'vendor',
      businessName: meta.business_name || meta.businessName || (meta.user_type === 'customer' ? 'Customer Profile' : 'My Business'),
      businessType: meta.business_type || meta.businessType || (meta.user_type === 'customer' ? 'Customer' : 'Vegetables & Fruits'),
      productsServices: meta.products_services || meta.productsServices || '',
      phone: meta.phone || '',
      language: meta.language || 'en',
      location: meta.location || 'Local Market Area',
      interests: Array.isArray(meta.interests) ? meta.interests : [],
      avatar: '/images/vendor-cottoncandy.png',
      hasCompletedOnboarding: meta.has_completed_onboarding !== false,
      isLoggedIn: true,
      isDemo: false
    };

    // Query exact row from public.profiles where id = user.id
    if (supabase) {
      try {
        const { data: dbProfile, error: dbErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (dbProfile && !dbErr) {
          profileData = {
            ...profileData,
            ownerName: dbProfile.full_name || profileData.ownerName,
            fullName: dbProfile.full_name || profileData.fullName,
            userType: dbProfile.user_type || profileData.userType,
            businessName: dbProfile.business_name || profileData.businessName,
            businessType: dbProfile.business_type || profileData.businessType,
            productsServices: dbProfile.products_services || profileData.productsServices,
            phone: dbProfile.phone || profileData.phone,
            language: dbProfile.language || profileData.language,
            location: dbProfile.location || profileData.location,
            interests: Array.isArray(dbProfile.interests) ? dbProfile.interests : profileData.interests,
            hasCompletedOnboarding: dbProfile.has_completed_onboarding !== false
          };
        } else if (!dbProfile && !dbErr) {
          // If profile row doesn't exist yet in public.profiles, create it now for this user ID
          try {
            await supabase.from('profiles').upsert({
              id: user.id,
              full_name: profileData.fullName,
              user_type: profileData.userType,
              phone: profileData.phone,
              business_name: profileData.userType === 'vendor' ? profileData.businessName : null,
              business_type: profileData.userType === 'vendor' ? profileData.businessType : null,
              products_services: profileData.userType === 'vendor' ? profileData.productsServices : null,
              location: profileData.location,
              language: profileData.language,
              interests: profileData.interests,
              has_completed_onboarding: true,
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });
          } catch (createErr) {
            console.warn('Could not auto-create missing profile row in public.profiles:', createErr.message);
          }
        }
      } catch (err) {
        console.warn('Error reading public.profiles in Supabase:', err.message);
      }
    }

    setProfile(profileData);
    localStorage.setItem('trackshack_profile', JSON.stringify(profileData));

    // Load real transactions strictly belonging to this authenticated user
    await loadTransactions(user.id);

    return profileData;
  };

  // Supabase Auth session listener and initial check
  useEffect(() => {
    if (!supabase) return;

    // Check active session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadUserProfile(session.user);
        if (session.access_token) {
          localStorage.setItem('trackshack_token', session.access_token);
        }
      } else {
        // No active session in Supabase
        const saved = localStorage.getItem('trackshack_profile');
        if (saved) {
          try {
            const p = JSON.parse(saved);
            if (p?.isDemo && p?.id === 'demo-vendor-ravi') {
              return; // Keep demo if explicitly active
            }
          } catch (e) {}
        }
        localStorage.removeItem('trackshack_token');
        localStorage.removeItem('trackshack_profile');
        setProfile(EMPTY_PROFILE);
      }
    }).catch(err => {
      console.warn('Supabase getSession error:', err);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        await loadUserProfile(session.user);
        if (session.access_token) {
          localStorage.setItem('trackshack_token', session.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('trackshack_token');
        localStorage.removeItem('trackshack_profile');
        setSales([]);
        setExpenses([]);
        setLoans([]);
        setProfile(EMPTY_PROFILE);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Authenticate user with Supabase Auth as the single source of truth
  const loginUser = async (identifier, password) => {
    if (!identifier || !password) {
      throw new Error('Please enter both your email/phone and password.');
    }

    const cleanIdent = identifier.trim();
    const isExplicitDemo = cleanIdent === '9876543210' || cleanIdent === 'ravi@trackshack.demo';

    // 1. Explicit Demo Mode Login
    if (isExplicitDemo && (!supabase || password === 'vendor123')) {
      const demoUser = { ...DEMO_PROFILE };
      setProfile(demoUser);
      localStorage.setItem('trackshack_profile', JSON.stringify(demoUser));
      setSales(INITIAL_SALES);
      setExpenses(INITIAL_EXPENSES);
      setLoans(INITIAL_LOANS);
      showToast('Welcome to Demo Mode, Ravi!');
      return { success: true, profile: demoUser };
    }

    // 2. Real Supabase Authentication
    if (!supabase) {
      throw new Error('Authentication service is currently unavailable. Please check your connection or contact support.');
    }

    const isEmail = cleanIdent.includes('@');
    let authRes;

    if (isEmail) {
      authRes = await supabase.auth.signInWithPassword({
        email: cleanIdent,
        password
      });
    } else {
      const cleanPhone = cleanIdent.replace(/\D/g, '');
      const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;

      // Try phone auth first
      authRes = await supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password
      });

      // If phone provider fails or is not enabled, try email-mapped alias
      if (authRes.error) {
        authRes = await supabase.auth.signInWithPassword({
          email: `vendor_${cleanPhone}@trackshack.local`,
          password
        });
      }
    }

    if (authRes.error) {
      console.error('Supabase signInWithPassword error:', authRes.error.message);
      throw new Error(authRes.error.message || 'Invalid login credentials.');
    }

    if (!authRes.data?.session?.user) {
      throw new Error('Login succeeded but no active session was returned. Please verify your email.');
    }

    const session = authRes.data.session;
    if (session.access_token) {
      localStorage.setItem('trackshack_token', session.access_token);
    }

    const resolvedProfile = await loadUserProfile(session.user);
    showToast(`Welcome back, ${(resolvedProfile?.fullName || 'User').split(' ')[0]}!`);
    return { success: true, profile: resolvedProfile };
  };

  // Register user with Supabase Auth as the single source of truth
  // NOTE: Password is NEVER saved in metadata, public.profiles, localStorage or state!
  const registerUser = async (formData) => {
    if (!formData.password || (!formData.email && !formData.phone)) {
      throw new Error('Email or mobile number and password are required.');
    }

    if (!supabase) {
      throw new Error('Authentication service is currently unavailable. Please check your connection or contact support.');
    }

    const userType = formData.userType || 'vendor';
    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    const userEmail = (formData.email || (cleanPhone ? `vendor_${cleanPhone}@trackshack.local` : '')).trim();

    if (!userEmail) {
      throw new Error('A valid email address is required.');
    }

    const userMetadata = {
      full_name: formData.fullName?.trim() || '',
      fullName: formData.fullName?.trim() || '',
      user_type: userType,
      userType: userType,
      phone: cleanPhone,
      business_name: userType === 'vendor' ? (formData.businessName?.trim() || 'My Business') : 'Customer Profile',
      businessName: userType === 'vendor' ? (formData.businessName?.trim() || 'My Business') : 'Customer Profile',
      business_type: userType === 'vendor' ? (formData.businessType || 'Vegetables & Fruits') : 'Customer',
      businessType: userType === 'vendor' ? (formData.businessType || 'Vegetables & Fruits') : 'Customer',
      products_services: userType === 'vendor' ? (formData.productsServices?.trim() || '') : '',
      productsServices: userType === 'vendor' ? (formData.productsServices?.trim() || '') : '',
      location: formData.location?.trim() || 'Local Market Area',
      language: formData.language || 'en',
      interests: Array.isArray(formData.interests) ? formData.interests : [],
      has_completed_onboarding: true
    };

    const { data, error } = await supabase.auth.signUp({
      email: userEmail,
      password: formData.password,
      options: { data: userMetadata }
    });

    if (error) {
      console.error('Supabase signUp error:', error.message);
      throw new Error(error.message || 'Registration failed.');
    }

    if (!data?.user) {
      throw new Error('Registration failed: no user returned by Supabase.');
    }

    const authUserId = data.user.id;

    // CASE A: User session returned immediately (Auto-confirmed / confirmation disabled)
    if (data.session) {
      if (data.session.access_token) {
        localStorage.setItem('trackshack_token', data.session.access_token);
      }

      // Upsert profile row into public.profiles
      try {
        await supabase.from('profiles').upsert({
          id: authUserId,
          full_name: userMetadata.full_name,
          user_type: userMetadata.user_type,
          phone: userMetadata.phone,
          business_name: userMetadata.user_type === 'vendor' ? userMetadata.business_name : null,
          business_type: userMetadata.user_type === 'vendor' ? userMetadata.business_type : null,
          products_services: userMetadata.user_type === 'vendor' ? userMetadata.products_services : null,
          location: userMetadata.location,
          language: userMetadata.language,
          interests: userMetadata.interests,
          has_completed_onboarding: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      } catch (dbErr) {
        console.warn('public.profiles upsert warning:', dbErr.message);
      }

      const activeProfile = {
        id: authUserId,
        ownerName: userMetadata.full_name,
        fullName: userMetadata.full_name,
        userType: userMetadata.user_type,
        businessName: userMetadata.business_name,
        businessType: userMetadata.business_type,
        productsServices: userMetadata.products_services,
        phone: userMetadata.phone,
        language: userMetadata.language,
        location: userMetadata.location,
        interests: userMetadata.interests,
        avatar: '/images/vendor-cottoncandy.png',
        hasCompletedOnboarding: true,
        isLoggedIn: true,
        isDemo: false
      };

      setProfile(activeProfile);
      localStorage.setItem('trackshack_profile', JSON.stringify(activeProfile));
      // Fresh user starts with 0 transactions
      setSales([]);
      setExpenses([]);
      setLoans([]);

      showToast(`Account created! Welcome, ${activeProfile.fullName.split(' ')[0]}!`);
      return { success: true, profile: activeProfile, confirmationRequired: false };
    }

    // CASE B: Email confirmation required (data.session is null)
    return {
      success: true,
      user: data.user,
      confirmationRequired: true,
      message: 'Account created! Please check your email to confirm your account before logging in.'
    };
  };

  const logoutUser = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase signOut warning:', err);
    }
    localStorage.removeItem('trackshack_token');
    localStorage.removeItem('trackshack_profile');

    // Clean active transactions from memory
    setSales([]);
    setExpenses([]);
    setLoans([]);
    setFinancialsError(null);

    setProfile(EMPTY_PROFILE);

    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch (e) {}

    showToast('Logged out successfully');
  };

  const updateProfile = async (updates) => {
    if (!profile.id) return;
    const isRealUser = profile.id !== 'demo-vendor-ravi';
    const updated = { ...profile, ...updates };
    setProfile(updated);

    if (isRealUser && supabase) {
      try {
        const dbUpdates = {
          updated_at: new Date().toISOString()
        };
        if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
        if (updates.ownerName !== undefined) dbUpdates.full_name = updates.ownerName;
        if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName;
        if (updates.businessType !== undefined) dbUpdates.business_type = updates.businessType;
        if (updates.productsServices !== undefined) dbUpdates.products_services = updates.productsServices;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.location !== undefined) dbUpdates.location = updates.location;
        if (updates.language !== undefined) dbUpdates.language = updates.language;
        if (updates.interests !== undefined) dbUpdates.interests = updates.interests;

        await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', profile.id);

        await supabase.auth.updateUser({
          data: {
            full_name: updated.fullName,
            business_name: updated.businessName,
            business_type: updated.businessType,
            products_services: updated.productsServices,
            phone: updated.phone,
            location: updated.location,
            language: updated.language
          }
        });
      } catch (err) {
        console.warn('Supabase updateProfile error:', err.message);
      }
    }

    try {
      localStorage.setItem('trackshack_profile', JSON.stringify(updated));
    } catch (e) {}
  };

  // Local-first Actions with direct Supabase cloud persistence
  const addSale = async (saleData) => {
    const isRealUser = profile.id && profile.id !== 'demo-vendor-ravi';
    const cleanAmount = Number(saleData.amount);
    const dateStr = saleData.date || todayStr;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const custName = saleData.customerName || saleData.customer_name || '';

    let newEntry = {
      id: 's_' + Date.now(),
      amount: cleanAmount,
      category: saleData.category || 'Vegetables',
      customer_name: custName,
      customerName: custName,
      note: saleData.note || '',
      date: dateStr,
      time: timeStr
    };

    if (isRealUser && supabase) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: profile.id,
            type: 'sale',
            amount: cleanAmount,
            category: saleData.category || 'Vegetables',
            customer_name: custName || null,
            date: dateStr,
            time: timeStr,
            description: saleData.note || null,
            metadata: { payment_mode: saleData.paymentMode || 'CASH' }
          })
          .select()
          .single();

        if (!error && data) {
          newEntry = {
            id: data.id,
            amount: Number(data.amount),
            category: data.category || 'Vegetables',
            customer_name: data.customer_name || '',
            customerName: data.customer_name || '',
            note: data.description || '',
            date: data.date,
            time: data.time || timeStr
          };
        } else if (error) {
          console.warn('Supabase insert sale warning:', error.message);
        }
      } catch (sbErr) {
        console.warn('Supabase insert sale exception:', sbErr);
      }
    }

    setSales(prev => [newEntry, ...prev]);
    showToast(`✓ ₹${newEntry.amount} ${t.saleSuccess}`);

    try {
      financialsApi.addSale(saleData).catch(() => {});
    } catch (e) {}

    return newEntry;
  };

  const addExpense = async (expenseData) => {
    const isRealUser = profile.id && profile.id !== 'demo-vendor-ravi';
    const cleanAmount = Number(expenseData.amount);
    const dateStr = expenseData.date || todayStr;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const custName = expenseData.customerName || expenseData.customer_name || '';

    let newEntry = {
      id: 'e_' + Date.now(),
      amount: cleanAmount,
      category: expenseData.category || 'Stock / Purchases',
      customer_name: custName,
      customerName: custName,
      note: expenseData.note || '',
      date: dateStr,
      time: timeStr
    };

    if (isRealUser && supabase) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: profile.id,
            type: 'expense',
            amount: cleanAmount,
            category: expenseData.category || 'Stock / Purchases',
            customer_name: custName || null,
            date: dateStr,
            time: timeStr,
            description: expenseData.note || null,
            metadata: { payment_mode: expenseData.paymentMode || 'CASH' }
          })
          .select()
          .single();

        if (!error && data) {
          newEntry = {
            id: data.id,
            amount: Number(data.amount),
            category: data.category || 'Stock / Purchases',
            customer_name: data.customer_name || '',
            customerName: data.customer_name || '',
            note: data.description || '',
            date: data.date,
            time: data.time || timeStr
          };
        } else if (error) {
          console.warn('Supabase insert expense warning:', error.message);
        }
      } catch (sbErr) {
        console.warn('Supabase insert expense exception:', sbErr);
      }
    }

    setExpenses(prev => [newEntry, ...prev]);
    showToast(`✓ ₹${newEntry.amount} ${t.expenseSuccess}`);

    try {
      financialsApi.addExpense(expenseData).catch(() => {});
    } catch (e) {}

    return newEntry;
  };

  const addLoan = async (loanData) => {
    const isRealUser = profile.id && profile.id !== 'demo-vendor-ravi';
    const amount = Number(loanData.amount || loanData.originalAmount);
    const dateStr = loanData.firstDueDate || todayStr;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const lenderName = loanData.lender || loanData.customerName || loanData.customer_name || 'Local Bank';

    const newLoanRecord = {
      loan_name: loanData.name || 'Microloan',
      lender: lenderName,
      loan_amount: amount,
      interest_rate: Number(loanData.interestRate || 0),
      repayment_amount: Number(loanData.repaymentAmount || (amount / 10)),
      repayment_frequency: loanData.frequency || 'Daily',
      loan_date: todayStr,
      first_due_date: loanData.firstDueDate || todayStr,
      next_due_date: loanData.firstDueDate || todayStr,
      final_due_date: loanData.finalDueDate || null,
      status: 'On Track',
      notes: loanData.notes || ''
    };

    let generatedId = 'l_' + Date.now();

    if (supabase) {
      const { data, error } = await supabase
        .from('loans')
        .insert([newLoanRecord])
        .select()
        .single();

      if (error) {
        console.error('Error adding loan:', error);
        showToast('⚠ Failed to add loan');
        return;
      }

      if (data && data.id) {
        generatedId = data.id;
      }

      if (isRealUser) {
        try {
          await supabase
            .from('transactions')
            .insert({
              user_id: profile.id,
              type: 'loan',
              amount: amount,
              category: loanData.name || 'Microloan',
              customer_name: lenderName,
              date: dateStr,
              time: timeStr,
              description: loanData.notes || null,
              metadata: {
                loan_id: generatedId,
                name: newLoanRecord.loan_name,
                lender: lenderName,
                original_amount: amount,
                total_repaid: 0,
                remaining_amount: amount,
                repayment_amount: newLoanRecord.repayment_amount,
                frequency: newLoanRecord.repayment_frequency,
                first_due_date: newLoanRecord.first_due_date,
                next_due_date: newLoanRecord.next_due_date,
                final_due_date: newLoanRecord.final_due_date || '',
                status: 'On Track',
                repayments: []
              }
            });
        } catch (sbErr) {
          console.warn('Supabase insert loan transaction warning:', sbErr);
        }
      }
    }

    const formattedLoan = {
      id: generatedId,
      name: newLoanRecord.loan_name,
      lender: newLoanRecord.lender,
      customer_name: lenderName,
      customerName: lenderName,
      originalAmount: amount,
      totalRepaid: 0,
      remainingAmount: amount,
      repaymentAmount: newLoanRecord.repayment_amount,
      frequency: newLoanRecord.repayment_frequency,
      firstDueDate: newLoanRecord.first_due_date,
      nextDueDate: newLoanRecord.next_due_date,
      finalDueDate: newLoanRecord.final_due_date || '',
      status: newLoanRecord.status,
      notes: newLoanRecord.notes,
      date: dateStr,
      time: timeStr,
      repayments: []
    };

    setLoans(prev => [formattedLoan, ...prev]);
    showToast(`✓ ${formattedLoan.name} added successfully!`);

    try {
      financialsApi.addLoan(loanData).catch(() => {});
    } catch (e) {
      // non-fatal
    }

    return formattedLoan;
  };

  const addRepayment = async ({ loanId, amount, date, method, note }) => {
    const repayNum = Number(amount);

    const targetLoan = (loans || []).find(l => l.id === loanId);
    if (targetLoan && repayNum > targetLoan.remainingAmount) {
      showToast(`⚠ ${t.overpaymentWarning}`);
      return;
    }

    const { data, error } = await supabase
      .from('repayments')
      .insert([{
        loan_id: loanId,
        amount: repayNum,
        payment_date: date || todayStr,
        payment_method: method || 'UPI'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding repayment to Supabase:', error);
      showToast('⚠ Failed to record repayment');
      return;
    }

    const newRepaymentEntry = {
      id: data.id,
      amount: repayNum,
      date: date || todayStr,
      method: method || 'UPI',
      note: note || ''
    };

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
    } catch (e) {}

    return updatedLoan;
  };

  const deleteTransaction = async (type, id) => {
    const isRealUser = profile.id && profile.id !== 'demo-vendor-ravi';
    if (type === 'sale') {
      setSales(prev => prev.filter(s => s.id !== id));
      showToast('Sale deleted');
    } else {
      setExpenses(prev => prev.filter(e => e.id !== id));
      showToast('Expense deleted');
    }

    if (isRealUser && supabase && id && !String(id).startsWith('s_') && !String(id).startsWith('e_')) {
      try {
        await supabase.from('transactions').delete().eq('id', id).eq('user_id', profile.id);
      } catch (err) {
        console.warn('Supabase delete transaction error:', err);
      }
    }

    try {
      if (type === 'sale') {
        financialsApi.deleteSale(id).catch(() => {});
      } else {
        financialsApi.deleteExpense(id).catch(() => {});
      }
    } catch (e) {}
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
        logoutUser,
        updateProfile,
        loadFinancialData,
        loadTransactions,
        loadingFinancials,
        financialsError,
        supabase,
        isSupabaseConfigured
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
