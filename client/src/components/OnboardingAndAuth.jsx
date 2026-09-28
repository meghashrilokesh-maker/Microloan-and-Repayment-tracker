import React, { useState } from 'react';
import { 
  ArrowRight, 
  Lock, 
  Store, 
  ShieldCheck, 
  User, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  Landmark,
  ArrowLeft,
  Mail,
  ShoppingBag,
  MapPin,
  Globe,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Navigation as NavigationIcon,
  Tag,
  Briefcase
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NaturalVendorImage from './NaturalVendorImage';
import HomeBackgroundArt from './HomeBackgroundArt';
import { authApi } from '../utils/api';

/**
 * LandingScreen - Replaces the 3-step carousel with a single comprehensive landing page.
 * Follows the user's handwritten reference sketch:
 * - TrackShack branding at top
 * - Welcoming heading/subheading for Indian small business owners
 * - Indian vendor illustrations at sides / decorative placement
 * - 3 distinct feature cards (Track Daily Sales, Control Daily Expenses, Manage Microloans & Repayments)
 * - Prominent "Get Started" button
 * - Clear "Log In" and "Create an Account" actions
 * - Language selector removed from onboarding as requested
 */
export function LandingScreen({ onGetStarted, onLogin, onCreateAccount }) {

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2825] flex flex-col justify-between py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft Pastel Organic Aura Background Elements */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#EAF0E9] rounded-full blur-3xl opacity-60 pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 bg-[#F9EDE7] rounded-full blur-3xl opacity-50 pointer-events-none -z-10" />
      <div className="absolute -bottom-24 left-1/4 w-80 h-80 bg-[#F1EFF7] rounded-full blur-3xl opacity-60 pointer-events-none -z-10" />

      {/* Subtle Hand-Painted Background Artwork: Person reading newspaper at cafe table */}
      <HomeBackgroundArt />

      {/* 1. TOP HEADER & BRANDING */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#6B8569] text-white flex items-center justify-center font-serif font-bold text-lg shadow-pastel">
            TS
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-lg sm:text-xl text-[#2D2825] tracking-tight">
                TrackShack
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E9EFE8] text-[#425541] border border-[#D3DFD2]">
                Small Business
              </span>
            </div>
            <p className="text-[11px] text-[#7C746F] font-medium hidden sm:block">
              Financial Tracking for Indian Vendors
            </p>
          </div>
        </div>

        {/* Quick Top Login Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLogin}
            className="text-xs font-bold text-[#566E54] hover:text-[#314030] px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white border border-[#EBE3D7] shadow-soft transition touch-press"
          >
            Log In
          </button>
        </div>
      </header>

      {/* 2. MAIN HERO SECTION */}
      <main className="max-w-6xl mx-auto w-full my-auto py-6 sm:py-8 space-y-8 relative z-10">
        {/* Welcoming Hero Header with 2 Indian Vendor Illustrations at Sides */}
        <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-10 border border-[#EBE3D7] shadow-soft text-center overflow-hidden">
          {/* Left Side: Blank as requested */}

          {/* Right Side Decorative Illustration (Businessman at desk with computer) */}
          <div className="hidden lg:block absolute right-4 bottom-2 pointer-events-none opacity-95">
            <NaturalVendorImage 
              customSrc="/images/businessman-desk.jpg"
              size="lg" 
              backdrop="arch" 
              backdropColor="terracotta" 
              showBotanical={true}
              imgClassName="mix-blend-multiply"
              alt="Business Management" 
            />
          </div>

          {/* Center Text */}
          <div className="max-w-2xl mx-auto space-y-3 z-10 relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9EFE8] text-[#425541] border border-[#D3DFD2] text-xs font-semibold shadow-soft">
              <Sparkles className="w-3.5 h-3.5 text-[#6B8569]" />
              <span>Tailored for Street Vendors, Mandis & Small Shops</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-[#2D2825] leading-tight tracking-tight">
              Track Sales, Expenses & Microloans in One Place
            </h1>

            <p className="text-xs sm:text-base text-[#6E6763] font-medium leading-relaxed max-w-xl mx-auto">
              Empowering Indian small business owners to record daily earnings, control stock expenses, and stay stress-free with microloan repayments.
            </p>
          </div>
        </div>

        {/* 3. THREE FEATURE CARDS (All together on one single page) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Track Daily Sales */}
          <div className="bg-[#FAFBF9] hover:bg-white rounded-3xl p-5 sm:p-6 border border-[#DCE5DC] shadow-soft hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E9EFE8] text-[#425541] border border-[#D3DFD2]">
                  Daily Inflow
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#E9EFE8] text-[#566E54] flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>

              {/* Vendor Illustration */}
              <div className="flex justify-center py-2">
                <NaturalVendorImage 
                  type="cottoncandy" 
                  size="md" 
                  backdrop="blob" 
                  backdropColor="sage" 
                  alt="Track Daily Sales" 
                />
              </div>

              <div className="text-center space-y-1.5">
                <h2 className="font-serif font-bold text-lg sm:text-xl text-[#2D2825]">
                  Track Daily Sales
                </h2>
                <p className="text-xs text-[#7C746F] leading-relaxed">
                  Record cash and UPI payments instantly with voice or touch. See your daily total grow in real time.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EAE1D4] text-center">
              <span className="text-[11px] font-semibold text-[#566E54] bg-[#E9EFE8]/70 px-3 py-1 rounded-full inline-block">
                ₹ Record in 3 seconds
              </span>
            </div>
          </div>

          {/* Card 2: Control Daily Expenses */}
          <div className="bg-[#FCF9F7] hover:bg-white rounded-3xl p-5 sm:p-6 border border-[#F2DDD4] shadow-soft hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F8ECE6] text-[#874937] border border-[#F0D7CD]">
                  Daily Outflow
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#F8ECE6] text-[#BF745F] flex items-center justify-center font-bold">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>

              {/* Vendor Illustration */}
              <div className="flex justify-center py-2">
                <NaturalVendorImage 
                  type="flowers" 
                  size="md" 
                  backdrop="blob" 
                  backdropColor="terracotta" 
                  alt="Control Daily Expenses" 
                />
              </div>

              <div className="text-center space-y-1.5">
                <h2 className="font-serif font-bold text-lg sm:text-xl text-[#2D2825]">
                  Control Daily Expenses
                </h2>
                <p className="text-xs text-[#7C746F] leading-relaxed">
                  Log APMC mandi stock, tempo transport, shop rent, and chai. Always know your actual cash in hand.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F2DDD4] text-center">
              <span className="text-[11px] font-semibold text-[#BF745F] bg-[#F8ECE6]/70 px-3 py-1 rounded-full inline-block">
                ₹ Know your real take-home cash
              </span>
            </div>
          </div>

          {/* Card 3: Manage Microloans & Repayments */}
          <div className="bg-[#F9F8FC] hover:bg-white rounded-3xl p-5 sm:p-6 border border-[#E3DFEF] shadow-soft hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between group">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F2F0F8] text-[#554C78] border border-[#E3DFEF]">
                  Micro-Credit
                </span>
                <div className="w-8 h-8 rounded-xl bg-[#F2F0F8] text-[#877EB0] flex items-center justify-center font-bold">
                  <Landmark className="w-4 h-4" />
                </div>
              </div>

              {/* Vendor Illustration */}
              <div className="flex justify-center py-2">
                <NaturalVendorImage 
                  type="farmer" 
                  size="md" 
                  backdrop="blob" 
                  backdropColor="lavender" 
                  alt="Manage Microloans & Repayments" 
                />
              </div>

              <div className="text-center space-y-1.5">
                <h2 className="font-serif font-bold text-lg sm:text-xl text-[#2D2825]">
                  Manage Microloans & Repayments
                </h2>
                <p className="text-xs text-[#7C746F] leading-relaxed">
                  Clear tracking for PM SVANidhi, SHG loans, and local wholesale credit. Never miss a due date.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E3DFEF] text-center">
              <span className="text-[11px] font-semibold text-[#554C78] bg-[#F2F0F8]/70 px-3 py-1 rounded-full inline-block">
                ₹ Clear repayment schedule
              </span>
            </div>
          </div>
        </div>

        {/* 4. ACTIONS AREA: Get Started, Log In, Create Account */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE3D7] shadow-soft max-w-xl mx-auto text-center space-y-4">
          {/* Prominent "Get Started" Button */}
          <button
            onClick={onGetStarted}
            className="w-full py-4 px-8 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-serif font-bold text-base shadow-pastel hover:shadow-soft-lg active:scale-98 transition flex items-center justify-center gap-2.5 touch-press"
          >
            <span>Get Started with TrackShack</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Clear Account Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onCreateAccount}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[#566E54] text-[#566E54] hover:bg-[#E9EFE8] font-bold text-xs transition touch-press"
            >
              Create an Account
            </button>
            <span className="text-xs text-[#DACBB8] hidden sm:inline">•</span>
            <div className="text-xs text-[#7C746F]">
              <span>Already have an account? </span>
              <button
                onClick={onLogin}
                className="font-bold text-[#566E54] hover:underline underline-offset-2"
              >
                Log In
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3EDE3] flex items-center justify-center gap-2 text-[11px] text-[#7C746F]">
            <ShieldCheck className="w-4 h-4 text-[#566E54] shrink-0" />
            <span>Free for street vendors & small shops • 100% private & secure</span>
          </div>
        </div>
      </main>

      {/* 5. MINIMAL FOOTER */}
      <footer className="max-w-6xl mx-auto w-full text-center py-2 text-[11px] text-[#9A938E] relative z-10">
        <span>TrackShack • Digital Companion for Indian Small Businesses & Street Vendors</span>
      </footer>
    </div>
  );
}

/**
 * AuthScreen - Handles Login and Multi-Step Dynamic Account Creation.
 * - Login: Minimal email/phone + password + demo pre-fill.
 * - Create Account: Multi-step personalized flow:
 *     Step 1: Account Credentials (Email, Password, Confirm Password)
 *     Step 2: Personal Information (Full Name, Phone, User Type: Vendor vs Customer)
 *     Step 3A (Vendor): Business Details (Name, Category, Products/Services)
 *     Step 4A (Vendor): Location (Explicit GPS or Manual) & Preferred Language
 *     Step 3B (Customer): Location, Language & Shopping Interests
 *     Step Complete: Celebratory summary & direct entry to dashboard
 * - Security: Password is NEVER saved in localStorage, user metadata, or application state.
 */
export function AuthScreen({ onLoginSuccess, onBackToLanding, initialMode = 'login' }) {
  const { loginUser, registerUser, showToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');

  // --- Login State ---
  const [loginIdentifier, setLoginIdentifier] = useState('9876543210');
  const [loginPassword, setLoginPassword] = useState('vendor123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // --- Multi-Step Onboarding State ---
  // Step 1: Account | Step 2: About You | Step 3: Business/Preferences | Step 4: Location (Vendor) | Step 5/4: Complete
  const [step, setStep] = useState(1);

  // Step 1 Fields (Account)
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 Fields (Personal Info)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState('vendor'); // 'vendor' | 'customer'

  // Step 3A Fields (Vendor Business Details)
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Grocery / Fruits & Vegetables');
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [productsServices, setProductsServices] = useState('');

  // Location & Preferences Fields (Vendor Step 4 / Customer Step 3)
  const [locationMode, setLocationMode] = useState('manual'); // 'gps' | 'manual'
  const [location, setLocation] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);
  const [language, setLanguage] = useState('en');
  const [interests, setInterests] = useState([]);

  // Shared Form State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [stepErrors, setStepErrors] = useState({});

  // Business Category Options
  const BUSINESS_CATEGORIES = [
    'Grocery / Fruits & Vegetables',
    'Clothing & Textiles',
    'Food / Restaurant / Tea Stall',
    'Electronics & Mobile Repair',
    'Services (Barber, Tailor, Delivery)',
    'Other'
  ];

  // Customer Shopping Interest Options
  const CUSTOMER_INTERESTS = [
    'Fresh Fruits & Vegetables',
    'Street Food & Snacks',
    'Daily Kirana & Provisions',
    'Clothing & Footwear',
    'Electronics & Accessories',
    'Local Handcrafts & Flowers'
  ];

  // Total steps based on role
  const totalInputSteps = userType === 'vendor' ? 4 : 3;

  // --- Location Geolocation Handler (Explicit Permission, Non-Continuous) ---
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Geolocation is not supported by your browser. Please enter your location manually.');
      setLocationMode('manual');
      return;
    }

    setDetectingLocation(true);
    setLocationNotice(null);

    // Explicit one-shot location request. Never continuous.
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setDetectingLocation(false);
        const lat = position.coords.latitude.toFixed(4);
        const lon = position.coords.longitude.toFixed(4);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();
          const cityOrArea = 
            data.address?.suburb || 
            data.address?.neighbourhood || 
            data.address?.city || 
            data.address?.town || 
            data.address?.county || 
            'Local Market';
          const state = data.address?.state ? `, ${data.address.state}` : '';
          const detectedStr = `${cityOrArea}${state}`;
          setLocation(detectedStr);
          setLocationNotice(`✓ Location detected: ${detectedStr}`);
        } catch (e) {
          const fallbackStr = `Market Area (${lat}° N, ${lon}° E)`;
          setLocation(fallbackStr);
          setLocationNotice(`✓ Approximate coordinates captured: ${lat}, ${lon}`);
        }
      },
      (err) => {
        setDetectingLocation(false);
        let notice = 'Location permission was denied or unavailable. Please type your city/market below.';
        if (err.code === err.TIMEOUT) {
          notice = 'Location request timed out. Please enter your location manually.';
        }
        setLocationNotice(notice);
        setLocationMode('manual');
      },
      { timeout: 7000, maximumAge: 60000, enableHighAccuracy: false }
    );
  };

  // --- Step Validations ---
  const validateStep1 = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!accountEmail.trim()) {
      errors.accountEmail = 'Email address is required.';
    } else if (!emailRegex.test(accountEmail.trim())) {
      errors.accountEmail = 'Please enter a valid email format (e.g. name@example.com).';
    }

    if (!accountPassword) {
      errors.accountPassword = 'Password is required.';
    } else if (accountPassword.length < 6) {
      errors.accountPassword = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your password.';
    } else if (confirmPassword !== accountPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name.';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!userType) {
      errors.userType = 'Please select whether you are a Vendor or a Customer.';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3Vendor = () => {
    const errors = {};
    if (!businessName.trim() || businessName.trim().length < 2) {
      errors.businessName = 'Please enter your shop or business name.';
    }

    if (businessType === 'Other' && (!customBusinessType.trim() || customBusinessType.trim().length < 2)) {
      errors.customBusinessType = 'Please specify your business category.';
    }

    if (!productsServices.trim() || productsServices.trim().length < 2) {
      errors.productsServices = 'Please briefly describe the products or services you offer.';
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Final Account Creation Submit Handler ---
  const handleFinalRegister = async () => {
    setLoading(true);
    setErrorMsg(null);

    const effectiveBusinessType = businessType === 'Other' ? (customBusinessType.trim() || 'Other') : businessType;

    try {
      await registerUser({
        email: accountEmail.trim(),
        password: accountPassword, // NEVER saved in storage/state after this call
        fullName: fullName.trim(),
        phone: phone.replace(/\D/g, ''),
        userType,
        businessName: userType === 'vendor' ? businessName.trim() : 'Customer Profile',
        businessType: userType === 'vendor' ? effectiveBusinessType : 'Customer',
        productsServices: userType === 'vendor' ? productsServices.trim() : '',
        location: location.trim() || 'Local Market Area',
        language,
        interests: userType === 'customer' ? interests : []
      });

      // Security: Clear passwords from local component memory immediately
      setAccountPassword('');
      setConfirmPassword('');

      // Advance to celebratory complete step
      setStep(totalInputSteps + 1);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed. Please check your connection and try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- Login Submit Handler ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await loginUser(loginIdentifier.trim(), loginPassword);
      // Clear password from local state
      setLoginPassword('');
      onLoginSuccess();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed. Please check your credentials.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Demo Fast-Fill
  const handleFillDemoVendor = () => {
    setLoginIdentifier('9876543210');
    setLoginPassword('vendor123');
    showToast('Demo Vendor credentials filled!');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Pastel Circles */}
      <div className="absolute top-10 -left-20 w-80 h-80 bg-[#EAF0E9] rounded-full blur-3xl opacity-60 pointer-events-none -z-10" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-[#F9EDE7] rounded-full blur-3xl opacity-60 pointer-events-none -z-10" />

      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE3D7] shadow-soft-md space-y-5">
        
        {/* Top Header: Back Link & Branding */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#7C746F] hover:text-[#2D2825] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#6B8569] text-white flex items-center justify-center font-serif font-bold text-xs shadow-soft">
              TS
            </div>
            <span className="font-serif font-bold text-sm text-[#2D2825]">TrackShack</span>
          </div>
        </div>

        {/* Tab Switcher: Log In vs Create Account */}
        <div className="flex bg-[#FAF7F2] p-1 rounded-2xl border border-[#EBE3D7]">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              !isSignUp ? 'bg-white text-[#2D2825] shadow-soft' : 'text-[#7C746F] hover:text-[#2D2825]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              isSignUp ? 'bg-white text-[#2D2825] shadow-soft' : 'text-[#7C746F] hover:text-[#2D2825]'
            }`}
          >
            Create an Account
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODE A: LOGIN SCREEN (Simple, Fast: Email/Phone + Password) */}
        {/* ========================================================================= */}
        {!isSignUp ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Welcoming Illustration Card */}
            <div className="bg-[#FAF4ED] rounded-2xl p-3.5 flex items-center gap-3 border border-[#EAE1D4]">
              <div className="relative shrink-0">
                <NaturalVendorImage 
                  type="flowers"
                  size="sm"
                  backdrop="circle"
                  backdropColor="sand"
                  alt="Vendor Welcome"
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[#2D2825]">
                  Welcome Back to TrackShack
                </h3>
                <p className="text-[11px] text-[#7C746F] mt-0.5">
                  Sign in to view your daily sales, expenses & loans
                </p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Email or Mobile Number
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 absolute left-3.5 text-[#7C746F]" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. 9876543210 or name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 text-[#7C746F]" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 text-[#7C746F] hover:text-[#2D2825] transition"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-1.5 text-[#605955] cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#566E54] focus:ring-0" />
                  <span>Remember me</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => showToast('Password reset link will be sent to registered email/phone.')}
                  className="font-semibold text-[#566E54] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-[#FAEEF0] border border-[#F4DBDF] text-xs font-semibold text-[#8A3846] text-center animate-in fade-in">
                  {typeof errorMsg === 'object' ? (errorMsg.message || JSON.stringify(errorMsg)) : String(errorMsg)}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-semibold shadow-pastel active:scale-98 transition flex items-center justify-center gap-2 mt-2 touch-press disabled:opacity-60"
              >
                <span>{loading ? 'Signing In...' : 'Log In to TrackShack'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Demo Fast Login Banner */}
            <div 
              onClick={handleFillDemoVendor}
              className="pt-3 border-t border-[#F3EDE3] text-center space-y-1 cursor-pointer hover:bg-[#FAF7F2] p-2 rounded-2xl transition group"
            >
              <p className="text-[11px] text-[#7C746F] group-hover:text-[#566E54]">
                Tap here to pre-fill <strong>Ravi Kumar</strong> (Demo Vendor: 9876543210).
              </p>
              <p className="text-[10px] text-[#9A938E]">
                Instant exploration of daily sales, expenses & loans.
              </p>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* MODE B: MULTI-STEP ONBOARDING (Clean, Intuitive, Role-Adaptive) */
          /* ========================================================================= */
          <div className="space-y-4 animate-in fade-in duration-200">
            {step <= totalInputSteps && (
              <>
                {/* Stepper Progress Bar & Step Chips */}
                <div className="space-y-2 pb-1 border-b border-[#F3EDE3]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#566E54]">
                      Step {step} of {totalInputSteps}
                    </span>
                    <span className="text-[11px] text-[#7C746F] font-medium">
                      {step === 1 && 'Account Credentials'}
                      {step === 2 && 'Personal Information'}
                      {step === 3 && (userType === 'vendor' ? 'Business Details' : 'Preferences')}
                      {step === 4 && 'Location & Language'}
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-[#EFE9DF] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#566E54] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${(step / totalInputSteps) * 100}%` }}
                    />
                  </div>

                  {/* Step Pills */}
                  <div className="flex items-center justify-between gap-1 pt-1 text-[10px] font-bold">
                    <span className={`px-2 py-0.5 rounded-full transition ${step === 1 ? 'bg-[#566E54] text-white' : step > 1 ? 'bg-[#E9EFE8] text-[#425541]' : 'text-[#A09893]'}`}>
                      1. Account
                    </span>
                    <span className={`px-2 py-0.5 rounded-full transition ${step === 2 ? 'bg-[#566E54] text-white' : step > 2 ? 'bg-[#E9EFE8] text-[#425541]' : 'text-[#A09893]'}`}>
                      2. About You
                    </span>
                    <span className={`px-2 py-0.5 rounded-full transition ${step === 3 ? 'bg-[#566E54] text-white' : step > 3 ? 'bg-[#E9EFE8] text-[#425541]' : 'text-[#A09893]'}`}>
                      3. {userType === 'vendor' ? 'Business' : 'Preferences'}
                    </span>
                    {userType === 'vendor' && (
                      <span className={`px-2 py-0.5 rounded-full transition ${step === 4 ? 'bg-[#566E54] text-white' : 'text-[#A09893]'}`}>
                        4. Location
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Error Message Pill */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-[#FAEEF0] border border-[#F4DBDF] text-xs font-semibold text-[#8A3846] text-center animate-in fade-in">
                {typeof errorMsg === 'object' ? (errorMsg.message || JSON.stringify(errorMsg)) : String(errorMsg)}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 1: ACCOUNT (Email, Password, Confirm Password) */}
            {/* ------------------------------------------------------------- */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2D2825]">
                    Create Your Account
                  </h3>
                  <p className="text-xs text-[#7C746F] mt-0.5">
                    Set up your secure login email and password for Supabase Auth.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#48433F] mb-1">
                      Email Address <span className="text-[#BF745F]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 absolute left-3.5 text-[#7C746F]" />
                      <input
                        type="email"
                        value={accountEmail}
                        onChange={(e) => {
                          setAccountEmail(e.target.value);
                          if (stepErrors.accountEmail) setStepErrors(prev => ({ ...prev, accountEmail: null }));
                        }}
                        placeholder="you@example.com"
                        className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition ${
                          stepErrors.accountEmail ? 'border-[#D9534F] bg-[#FCF5F5]' : 'border-[#EBE3D7]'
                        }`}
                      />
                    </div>
                    {stepErrors.accountEmail && (
                      <p className="text-[11px] text-[#BF4F49] mt-1 font-medium">{stepErrors.accountEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48433F] mb-1">
                      Create Password <span className="text-[#BF745F]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 absolute left-3.5 text-[#7C746F]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={accountPassword}
                        onChange={(e) => {
                          setAccountPassword(e.target.value);
                          if (stepErrors.accountPassword) setStepErrors(prev => ({ ...prev, accountPassword: null }));
                        }}
                        placeholder="At least 6 characters"
                        className={`w-full pl-10 pr-10 py-2.5 bg-[#FAF7F2] border rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition ${
                          stepErrors.accountPassword ? 'border-[#D9534F] bg-[#FCF5F5]' : 'border-[#EBE3D7]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-[#7C746F] hover:text-[#2D2825]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {stepErrors.accountPassword && (
                      <p className="text-[11px] text-[#BF4F49] mt-1 font-medium">{stepErrors.accountPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48433F] mb-1">
                      Confirm Password <span className="text-[#BF745F]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <ShieldCheck className="w-4 h-4 absolute left-3.5 text-[#7C746F]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (stepErrors.confirmPassword) setStepErrors(prev => ({ ...prev, confirmPassword: null }));
                        }}
                        placeholder="Re-enter your password"
                        className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition ${
                          stepErrors.confirmPassword ? 'border-[#D9534F] bg-[#FCF5F5]' : 'border-[#EBE3D7]'
                        }`}
                      />
                    </div>
                    {stepErrors.confirmPassword && (
                      <p className="text-[11px] text-[#BF4F49] mt-1 font-medium">{stepErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setStep(2);
                  }}
                  className="w-full py-3.5 px-4 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-semibold shadow-pastel active:scale-98 transition flex items-center justify-center gap-2 mt-4 touch-press"
                >
                  <span>Continue to Personal Info</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: PERSONAL INFO (Name, Mobile, User Type) */}
            {/* ------------------------------------------------------------- */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2D2825]">
                    Tell Us About Yourself
                  </h3>
                  <p className="text-xs text-[#7C746F] mt-0.5">
                    We use this to personalize your dashboard and customer interactions.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#48433F] mb-1">
                      Full Name <span className="text-[#BF745F]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 absolute left-3.5 text-[#7C746F]" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (stepErrors.fullName) setStepErrors(prev => ({ ...prev, fullName: null }));
                        }}
                        placeholder="e.g. Ramesh Patel"
                        className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition ${
                          stepErrors.fullName ? 'border-[#D9534F] bg-[#FCF5F5]' : 'border-[#EBE3D7]'
                        }`}
                      />
                    </div>
                    {stepErrors.fullName && (
                      <p className="text-[11px] text-[#BF4F49] mt-1 font-medium">{stepErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48433F] mb-1">
                      Mobile Number <span className="text-[#BF745F]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-bold text-[#7C746F]">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (stepErrors.phone) setStepErrors(prev => ({ ...prev, phone: null }));
                        }}
                        placeholder="10 digit mobile number"
                        className={`w-full pl-12 pr-4 py-2.5 bg-[#FAF7F2] border rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition ${
                          stepErrors.phone ? 'border-[#D9534F] bg-[#FCF5F5]' : 'border-[#EBE3D7]'
                        }`}
                      />
                    </div>
                    {stepErrors.phone && (
                      <p className="text-[11px] text-[#BF4F49] mt-1 font-medium">{stepErrors.phone}</p>
                    )}
                  </div>

                  {/* User Type Selection Cards */}
                  <div>
                    <label className="block text-xs font-semibold text-[#48433F] mb-1.5">
                      I am joining TrackShack as: <span className="text-[#BF745F]">*</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Vendor Card */}
                      <div
                        onClick={() => setUserType('vendor')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 touch-press ${
                          userType === 'vendor'
                            ? 'bg-[#F2F6F1] border-[#6B8569] shadow-soft'
                            : 'bg-[#FAF7F2] border-[#EBE3D7] hover:bg-white'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          userType === 'vendor' ? 'bg-[#566E54] text-white' : 'bg-white text-[#7C746F] border border-[#EBE3D7]'
                        }`}>
                          <Store className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-xs text-[#2D2825]">
                              Vendor / Owner
                            </span>
                            {userType === 'vendor' && <Check className="w-3.5 h-3.5 text-[#566E54]" />}
                          </div>
                          <p className="text-[11px] text-[#7C746F] mt-0.5 leading-snug">
                            Manage sales, stock expenses & microloans
                          </p>
                        </div>
                      </div>

                      {/* Customer Card */}
                      <div
                        onClick={() => setUserType('customer')}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 touch-press ${
                          userType === 'customer'
                            ? 'bg-[#F2F6F1] border-[#6B8569] shadow-soft'
                            : 'bg-[#FAF7F2] border-[#EBE3D7] hover:bg-white'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          userType === 'customer' ? 'bg-[#566E54] text-white' : 'bg-white text-[#7C746F] border border-[#EBE3D7]'
                        }`}>
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-xs text-[#2D2825]">
                              Customer
                            </span>
                            {userType === 'customer' && <Check className="w-3.5 h-3.5 text-[#566E54]" />}
                          </div>
                          <p className="text-[11px] text-[#7C746F] mt-0.5 leading-snug">
                            Find local vendors, daily prices & offers
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3 rounded-full bg-[#FAF7F2] hover:bg-[#F3EDE3] border border-[#EBE3D7] text-[#605955] font-semibold text-xs transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) setStep(3);
                    }}
                    className="flex-1 py-3 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-semibold text-xs shadow-pastel transition flex items-center justify-center gap-1.5"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3A: VENDOR BUSINESS DETAILS */}
            {/* ------------------------------------------------------------- */}
            {step === 3 && userType === 'vendor' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2D2825]">
                    Your Business Details
                  </h3>
                  <p className="text-xs text-[#7C746F] mt-0.5">
                    Helps tailor your transaction categories, ledger, and cash reminders.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#48433F] mb-1">
                      Business / Shop Name <span className="text-[#BF745F]">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Store className="w-4 h-4 absolute left-3.5 text-[#7C746F]" />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => {
                          setBusinessName(e.target.value);
                          if (stepErrors.businessName) setStepErrors(prev => ({ ...prev, businessName: null }));
                        }}
                        placeholder="e.g., Patel Fresh Vegetables"
                        className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition ${
                          stepErrors.businessName ? 'border-[#D9534F] bg-[#FCF5F5]' : 'border-[#EBE3D7]'
                        }`}
                      />
                    </div>
                    {stepErrors.businessName && (
                      <p className="text-[11px] text-[#BF4F49] mt-1 font-medium">{stepErrors.businessName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#48433F] mb-1">
                      Business Category <span className="text-[#BF745F]">*</span>
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition"
                    >
                      {BUSINESS_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {businessType === 'Other' && (
                    <div className="animate-in fade-in">
                      <label className="block text-xs font-semibold text-[#48433F] mb-1">
                        Specify Your Category <span className="text-[#BF745F]">*</span>
                      </label>
                      <input
                        type="text"
                        value={customBusinessType}
                        onChange={(e) => setCustomBusinessType(e.target.value)}
                        placeholder="e.g. Flower vendor, Pottery, Dairy"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#48433F] mb-1">
                      What products or services do you sell? <span className="text-[#BF745F]">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        rows={2}
                        value={productsServices}
                        onChange={(e) => {
                          setProductsServices(e.target.value);
                          if (stepErrors.productsServices) setStepErrors(prev => ({ ...prev, productsServices: null }));
                        }}
                        placeholder="e.g., Onions, potatoes, leafy greens from APMC mandi, fresh coriander"
                        className={`w-full p-3 bg-[#FAF7F2] border rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition ${
                          stepErrors.productsServices ? 'border-[#D9534F] bg-[#FCF5F5]' : 'border-[#EBE3D7]'
                        }`}
                      />
                    </div>
                    {stepErrors.productsServices && (
                      <p className="text-[11px] text-[#BF4F49] mt-1 font-medium">{stepErrors.productsServices}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/3 py-3 rounded-full bg-[#FAF7F2] hover:bg-[#F3EDE3] border border-[#EBE3D7] text-[#605955] font-semibold text-xs transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep3Vendor()) setStep(4);
                    }}
                    className="flex-1 py-3 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-semibold text-xs shadow-pastel transition flex items-center justify-center gap-1.5"
                  >
                    <span>Continue to Location</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 4A: VENDOR LOCATION & PREFERRED LANGUAGE */}
            {/* ------------------------------------------------------------- */}
            {step === 4 && userType === 'vendor' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2D2825]">
                    Location & Language
                  </h3>
                  <p className="text-xs text-[#7C746F] mt-0.5">
                    Set your shop or stall area and your app language.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* Location Selection Mode */}
                  <div>
                    <label className="block text-xs font-semibold text-[#48433F] mb-1.5">
                      Business Location
                    </label>

                    {/* Geolocation Button */}
                    <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D7] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D2825]">
                          Automatic Detection
                        </span>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={detectingLocation}
                          className="px-3 py-1.5 rounded-full bg-white hover:bg-[#F3EDE3] border border-[#D5CDC1] text-xs font-semibold text-[#566E54] flex items-center gap-1.5 shadow-soft transition touch-press"
                        >
                          <NavigationIcon className="w-3.5 h-3.5 text-[#566E54]" />
                          <span>{detectingLocation ? 'Detecting...' : 'Detect My Location'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-[#7C746F] leading-relaxed">
                        We only check your approximate city/market area once. TrackShack never tracks your continuous location in the background.
                      </p>
                    </div>

                    {locationNotice && (
                      <div className="mt-1.5 p-2 rounded-xl bg-[#F0F5EF] border border-[#DCE8DC] text-[11px] font-medium text-[#3A5338]">
                        {locationNotice}
                      </div>
                    )}

                    {/* Manual Location Input */}
                    <div className="mt-2.5">
                      <label className="block text-[11px] font-medium text-[#7C746F] mb-1">
                        Or enter city, market or street manually:
                      </label>
                      <div className="relative flex items-center">
                        <MapPin className="w-4 h-4 absolute left-3.5 text-[#7C746F]" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. City Market, Cross 4, Bengaluru"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferred Language */}
                  <div>
                    <label className="block text-xs font-semibold text-[#48433F] mb-1.5">
                      Preferred Language
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { code: 'en', label: 'English' },
                        { code: 'kn', label: 'ಕನ್ನಡ' },
                        { code: 'hi', label: 'हिन्दी' },
                      ].map((lng) => (
                        <button
                          key={lng.code}
                          type="button"
                          onClick={() => setLanguage(lng.code)}
                          className={`py-2 text-center rounded-xl font-bold transition text-xs touch-press ${
                            language === lng.code
                              ? 'bg-[#566E54] text-white shadow-soft'
                              : 'bg-[#FAF7F2] text-[#605955] border border-[#EBE3D7] hover:bg-white'
                          }`}
                        >
                          {lng.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-1/3 py-3 rounded-full bg-[#FAF7F2] hover:bg-[#F3EDE3] border border-[#EBE3D7] text-[#605955] font-semibold text-xs transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleFinalRegister}
                    className="flex-1 py-3 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-semibold text-xs shadow-pastel transition flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    <span>{loading ? 'Creating Account...' : 'Complete Registration ✓'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3B: CUSTOMER PREFERENCES & LOCATION */}
            {/* ------------------------------------------------------------- */}
            {step === 3 && userType === 'customer' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2D2825]">
                    Customer Preferences & Area
                  </h3>
                  <p className="text-xs text-[#7C746F] mt-0.5">
                    Customize your local shopping discovery and language preferences.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* Location Area */}
                  <div>
                    <label className="block text-xs font-semibold text-[#48433F] mb-1.5">
                      Your City or Neighborhood
                    </label>

                    <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D7] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D2825]">
                          Detect Near Me
                        </span>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={detectingLocation}
                          className="px-3 py-1.5 rounded-full bg-white hover:bg-[#F3EDE3] border border-[#D5CDC1] text-xs font-semibold text-[#566E54] flex items-center gap-1.5 shadow-soft transition touch-press"
                        >
                          <NavigationIcon className="w-3.5 h-3.5 text-[#566E54]" />
                          <span>{detectingLocation ? 'Detecting...' : 'Detect Location'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-[#7C746F] leading-relaxed">
                        We only check your approximate city/market area once. TrackShack never tracks your continuous location in the background.
                      </p>
                    </div>

                    {locationNotice && (
                      <div className="mt-1.5 p-2 rounded-xl bg-[#F0F5EF] border border-[#DCE8DC] text-[11px] font-medium text-[#3A5338]">
                        {locationNotice}
                      </div>
                    )}

                    <div className="mt-2.5">
                      <div className="relative flex items-center">
                        <MapPin className="w-4 h-4 absolute left-3.5 text-[#7C746F]" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Indiranagar, Bengaluru"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shopping Interests Tags */}
                  <div>
                    <label className="block text-xs font-semibold text-[#48433F] mb-1.5">
                      Categories You Are Interested In (Optional)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CUSTOMER_INTERESTS.map((item) => {
                        const isSelected = interests.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setInterests(interests.filter(i => i !== item));
                              } else {
                                setInterests([...interests, item]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition touch-press ${
                              isSelected
                                ? 'bg-[#566E54] text-white shadow-soft font-bold'
                                : 'bg-[#FAF7F2] text-[#605955] border border-[#EBE3D7] hover:bg-white'
                            }`}
                          >
                            {isSelected ? `✓ ${item}` : `+ ${item}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-xs font-semibold text-[#48433F] mb-1.5">
                      Preferred Language
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { code: 'en', label: 'English' },
                        { code: 'kn', label: 'ಕನ್ನಡ' },
                        { code: 'hi', label: 'हिन्दी' },
                      ].map((lng) => (
                        <button
                          key={lng.code}
                          type="button"
                          onClick={() => setLanguage(lng.code)}
                          className={`py-2 text-center rounded-xl font-bold transition text-xs touch-press ${
                            language === lng.code
                              ? 'bg-[#566E54] text-white shadow-soft'
                              : 'bg-[#FAF7F2] text-[#605955] border border-[#EBE3D7] hover:bg-white'
                          }`}
                        >
                          {lng.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/3 py-3 rounded-full bg-[#FAF7F2] hover:bg-[#F3EDE3] border border-[#EBE3D7] text-[#605955] font-semibold text-xs transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleFinalRegister}
                    className="flex-1 py-3 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-semibold text-xs shadow-pastel transition flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    <span>{loading ? 'Creating Account...' : 'Complete Registration ✓'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP COMPLETE / WELCOME CELEBRATION */}
            {/* ------------------------------------------------------------- */}
            {step > totalInputSteps && (
              <div className="text-center space-y-4 py-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-[#E9EFE8] border border-[#C5D8C3] text-[#425541] flex items-center justify-center mx-auto shadow-pastel">
                  <CheckCircle2 className="w-8 h-8 text-[#566E54]" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-lg text-[#2D2825]">
                    Welcome to TrackShack, {fullName.split(' ')[0]}!
                  </h3>
                  <p className="text-xs text-[#7C746F]">
                    {userType === 'vendor' 
                      ? 'Your business tracking workspace is fully set up and ready.' 
                      : 'Your customer profile is active and personalized.'}
                  </p>
                </div>

                {/* Profile Summary Card */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D7] text-left text-xs space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D5]">
                    <span className="text-[#7C746F] font-medium">Account Role:</span>
                    <span className="font-bold text-[#425541] px-2.5 py-0.5 rounded-full bg-[#E9EFE8] border border-[#D3DFD2]">
                      {userType === 'vendor' ? 'Vendor / Business Owner' : 'Customer'}
                    </span>
                  </div>
                  {userType === 'vendor' && (
                    <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D5]">
                      <span className="text-[#7C746F] font-medium">Shop Name:</span>
                      <span className="font-bold text-[#2D2825]">{businessName}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[#7C746F] font-medium">Registered Email:</span>
                    <span className="font-bold text-[#2D2825] truncate max-w-[200px]">{accountEmail}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onLoginSuccess}
                  className="w-full py-3.5 px-6 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-semibold text-xs shadow-pastel transition flex items-center justify-center gap-2 touch-press"
                >
                  <span>{userType === 'vendor' ? 'Go to My Vendor Dashboard' : 'Start Exploring TrackShack'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

// Backward-compatibility wrappers in case imported elsewhere
export const SplashScreen = LandingScreen;
export const OnboardingFlow = LandingScreen;

export function BusinessProfileSetupModal({ isOpen, onClose }) {
  const { t, profile, setProfile, showToast } = useApp();
  const [formData, setFormData] = useState({
    ownerName: profile.ownerName || '',
    businessName: profile.businessName || '',
    businessType: profile.businessType || 'Vegetables & Fruits',
    phone: profile.phone || '',
    language: profile.language || 'en',
    location: profile.location || ''
  });

  if (!isOpen) return null;

  const businessTypes = [
    { label: 'Vegetables & Fruits', illustrationType: 'flowers', desc: 'Mandi & cart' },
    { label: 'Street Food & Tea', illustrationType: 'cottoncandy', desc: 'Stalls & snacks' },
    { label: 'Kirana & Grocery', illustrationType: 'flowers', desc: 'Daily provisions' },
    { label: 'Farmer & Agriculture', illustrationType: 'farmer', desc: 'Farming produce' },
    { label: 'Small Business / Shop', illustrationType: 'farmer', desc: 'Retail store' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authApi.updateProfile({
        fullName: formData.ownerName,
        businessName: formData.businessName,
        businessType: formData.businessType,
        language: formData.language,
        location: formData.location
      });
      setProfile(prev => ({ ...prev, ...formData }));
      showToast('Business profile updated!');
      onClose();
    } catch (_err) {
      showToast('Failed to update business profile in database');
    }

  };


  return (
    <div className="fixed inset-0 z-50 bg-[#2D2825]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-soft-lg border border-[#EBE3D7]">
        <div className="flex items-center justify-between pb-4 border-b border-[#F3EDE3]">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#566E54]" />
            <h2 className="font-serif font-bold text-lg text-[#2D2825]">
              {t.businessProfile}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#7C746F] hover:bg-[#F3EDE3] border border-[#EBE3D7] flex items-center justify-center text-xs font-bold transition touch-press"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              {t.ownerName}
            </label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-sm font-medium focus:bg-white focus:border-[#6B8569] outline-none text-[#2D2825]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              {t.businessName}
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-sm font-medium focus:bg-white focus:border-[#6B8569] outline-none text-[#2D2825]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-2">
              {t.businessType}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {businessTypes.map((type) => {
                const isSelected = formData.businessType === type.label;
                return (
                  <button
                    type="button"
                    key={type.label}
                    onClick={() => setFormData({ ...formData, businessType: type.label })}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition touch-press ${
                      isSelected 
                        ? 'border-[#6B8569] bg-[#E9EFE8] font-semibold' 
                        : 'border-[#EBE3D7] hover:border-[#DACBB8] bg-[#FAF7F2]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <NaturalVendorImage 
                        type={type.illustrationType} 
                        size="xs" 
                        backdrop="circle"
                        backdropColor={isSelected ? 'sage' : 'sand'}
                        alt={type.label} 
                      />
                    </div>
                    <div>
                      <div className="text-xs text-[#2D2825]">{type.label}</div>
                      <div className="text-[10px] text-[#7C746F]">{type.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              {t.preferredLanguage}
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-sm font-medium focus:bg-white focus:border-[#6B8569] outline-none text-[#2D2825]"
            >
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              Shop Location / Market Area (Optional)
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Near Bus Stand, APMC Yard"
              className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-xl text-sm font-medium focus:bg-white focus:border-[#6B8569] outline-none text-[#2D2825]"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-full border border-[#EBE3D7] font-semibold text-xs text-[#7C746F] hover:bg-[#FAF7F2] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-full bg-[#566E54] hover:bg-[#425541] font-semibold text-xs text-white shadow-pastel transition touch-press"
            >
              {t.saveProfile}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
