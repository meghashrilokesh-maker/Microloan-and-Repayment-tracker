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
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NaturalVendorImage from './NaturalVendorImage';
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

      {/* 1. TOP HEADER & BRANDING */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
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
      <main className="max-w-6xl mx-auto w-full my-auto py-6 sm:py-8 space-y-8">
        {/* Welcoming Hero Header with 2 Indian Vendor Illustrations at Sides */}
        <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-10 border border-[#EBE3D7] shadow-soft text-center overflow-hidden">
          {/* Left Side Decorative Illustration (Cotton Candy / Street Vendor) */}
          <div className="hidden lg:block absolute left-4 bottom-2 pointer-events-none opacity-90">
            <NaturalVendorImage 
              type="cottoncandy" 
              size="lg" 
              backdrop="arch" 
              backdropColor="sage" 
              showBotanical={true}
              alt="Indian Street Vendor" 
            />
          </div>

          {/* Right Side Decorative Illustration (Flower Seller / Farmer) */}
          <div className="hidden lg:block absolute right-4 bottom-2 pointer-events-none opacity-90">
            <NaturalVendorImage 
              type="flowers" 
              size="lg" 
              backdrop="arch" 
              backdropColor="terracotta" 
              showBotanical={true}
              alt="Indian Vendor Woman" 
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
      <footer className="max-w-6xl mx-auto w-full text-center py-2 text-[11px] text-[#9A938E]">
        <span>TrackShack • Digital Companion for Indian Small Businesses & Street Vendors</span>
      </footer>
    </div>
  );
}

/**
 * AuthScreen - Handles Login and Account Creation.
 * Presentation modernized to soft pastel theme with easy tab toggle.
 * Retains exact phone + password + demo authentication logic.
 * Language picker removed from onboarding as requested.
 */
export function AuthScreen({ onLoginSuccess, onBackToLanding, initialMode = 'login' }) {
  const { loginUser, registerUser } = useApp();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('vendor123');
  const [ownerName, setOwnerName] = useState('Ravi Kumar');
  const [businessName, setBusinessName] = useState('Ravi Fresh Fruits & Vegetables');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      if (isSignUp) {
        await registerUser({
          phone,
          password,
          fullName: ownerName,
          businessName,
        });
      } else {
        await loginUser(phone, password);
      }
      onLoginSuccess();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Authentication failed';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Pastel Circles */}
      <div className="absolute top-10 -left-20 w-72 h-72 bg-[#EAF0E9] rounded-full blur-3xl opacity-60 pointer-events-none -z-10" />
      <div className="absolute bottom-10 -right-20 w-72 h-72 bg-[#F9EDE7] rounded-full blur-3xl opacity-60 pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE3D7] shadow-soft-md space-y-5">
        {/* Back Link & Branding */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1 text-xs font-semibold text-[#7C746F] hover:text-[#2D2825] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing Page</span>
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
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              !isSignUp ? 'bg-white text-[#2D2825] shadow-soft' : 'text-[#7C746F] hover:text-[#2D2825]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              isSignUp ? 'bg-white text-[#2D2825] shadow-soft' : 'text-[#7C746F] hover:text-[#2D2825]'
            }`}
          >
            Create an Account
          </button>
        </div>

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
              {isSignUp ? 'Open Your Free Account' : 'Welcome Back to TrackShack'}
            </h3>
            <p className="text-[11px] text-[#7C746F] mt-0.5">
              Empowering Indian street vendors & small business owners
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Your Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 absolute left-3.5 text-[#7C746F]" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g., Ramesh Patel"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48433F] mb-1">
                  Business / Shop Name
                </label>
                <div className="relative flex items-center">
                  <Store className="w-4 h-4 absolute left-3.5 text-[#7C746F]" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., Patel Fresh Vegetables"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-bold text-[#7C746F]">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 digit mobile number"
                className="w-full pl-12 pr-4 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition"
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl text-xs font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-1.5 text-[#605955] cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#566E54] focus:ring-0" />
              <span>Remember me</span>
            </label>
            {!isSignUp && (
              <button type="button" className="font-semibold text-[#566E54] hover:underline">
                Forgot password?
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-[#FAEEF0] border border-[#F4DBDF] text-xs font-semibold text-[#8A3846] text-center animate-in fade-in">
              {typeof errorMsg === 'object' ? (errorMsg.message || JSON.stringify(errorMsg)) : String(errorMsg)}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-semibold shadow-pastel active:scale-98 transition flex items-center justify-center gap-2 mt-2 touch-press disabled:opacity-60"
          >
            <span>{loading ? 'Please wait...' : (isSignUp ? 'Create Account & Enter' : 'Log In to TrackShack')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Demo Fast Login Banner */}
        <div className="pt-3 border-t border-[#F3EDE3] text-center space-y-1">
          <p className="text-[11px] text-[#7C746F]">
            Pre-filled with <strong>Ravi Kumar</strong> (Vegetable & Fruit Vendor demo account).
          </p>
          <p className="text-[10px] text-[#9A938E]">
            Tap the button above to instantly explore live sales, expenses & loans.
          </p>
        </div>
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
