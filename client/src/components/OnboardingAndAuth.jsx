import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Phone, 
  Lock, 
  Store, 
  User, 
  Languages, 
  MapPin, 
  ChevronRight,
  ShieldCheck,
  Zap,
  IndianRupee
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NaturalVendorImage from './NaturalVendorImage';

export function SplashScreen({ onFinish }) {
  const { t } = useApp();

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F5] flex flex-col items-center justify-between p-6 animate-in fade-in duration-500">
      <div className="w-full flex justify-end">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
          Indian Vendor Fintech
        </span>
      </div>

      <div className="flex flex-col items-center text-center max-w-sm my-auto">
        {/* Natural Vendor Illustration blend */}
        <div className="mb-4 relative">
          <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-amber-100/80 via-emerald-100/60 to-rose-100/80 flex items-center justify-center p-3 shadow-pastel border border-white">
            <img 
              src="/images/vendor-tea.jpg" 
              alt="Tea Vendor" 
              className="w-full h-full object-contain vendor-photo-blend"
            />
          </div>
          <div className="absolute -bottom-2 -right-1 bg-white p-2.5 rounded-2xl shadow-soft border border-slate-100 flex items-center gap-1.5 animate-bounce">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            <span className="text-xs font-bold text-slate-800">Track Shack</span>
          </div>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Track Shack
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 font-medium">
          {t.appTagline}
        </p>

        <div className="mt-8 flex items-center gap-2 text-xs text-slate-600 bg-white/80 backdrop-blur px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Simple, Trustworthy & vernacular for everyday vendors</span>
        </div>
      </div>

      <div className="w-full max-w-xs pb-4">
        <button
          onClick={onFinish}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 shadow-pastel active:scale-98 transition"
        >
          <span>{t.getStarted}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function OnboardingFlow({ onComplete }) {
  const { t, setLanguage, profile } = useApp();
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: t.onboardTitle1,
      desc: t.onboardDesc1,
      imageType: 'tea',
      imageSrc: '/images/vendor-tea.jpg',
      badge: 'Sales & Voice Entry',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      highlight: '₹ Record with voice in 3 seconds'
    },
    {
      title: t.onboardTitle2,
      desc: t.onboardDesc2,
      imageType: 'flowers',
      imageSrc: '/images/vendor-flowers.jpg',
      badge: 'Daily Expenses',
      badgeColor: 'bg-rose-100 text-rose-800',
      highlight: '₹ Track stock, transport & chai'
    },
    {
      title: t.onboardTitle3,
      desc: t.onboardDesc3,
      imageType: 'couple',
      imageSrc: '/images/vendor-couple.jpg',
      badge: 'Microloans & Surplus',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      highlight: '₹ Never miss a repayment'
    }
  ];

  const current = slides[slide];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F5] flex flex-col justify-between p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {['en', 'kn', 'hi'].map((lng) => (
            <button
              key={lng}
              onClick={() => setLanguage(lng)}
              className={`px-2.5 py-1 text-xs rounded-xl font-medium transition ${
                profile.language === lng 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {lng === 'en' ? 'English' : lng === 'kn' ? 'ಕನ್ನಡ' : 'हिन्दी'}
            </button>
          ))}
        </div>
        <button
          onClick={onComplete}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-3 py-1.5"
        >
          {t.skip}
        </button>
      </div>

      {/* Main Slide Card */}
      <div className="flex flex-col items-center text-center my-auto max-w-sm mx-auto">
        <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl bg-gradient-to-b from-white to-amber-50/50 p-4 border border-amber-100 shadow-soft flex items-center justify-center relative overflow-hidden mb-6">
          <img 
            src={current.imageSrc} 
            alt={current.title} 
            className="w-full h-full object-contain vendor-photo-blend"
          />
          <div className="absolute top-3 right-3">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${current.badgeColor}`}>
              {current.badge}
            </span>
          </div>
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
          {current.title}
        </h2>
        <p className="text-sm text-slate-600 mt-2.5 font-medium px-4">
          {current.desc}
        </p>

        <div className="mt-4 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
          {current.highlight}
        </div>

        {/* Dots */}
        <div className="flex items-center gap-2 mt-6">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                slide === idx ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="w-full max-w-sm mx-auto">
        <button
          onClick={handleNext}
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 shadow-pastel active:scale-98 transition"
        >
          <span>{slide === slides.length - 1 ? t.getStarted : t.next}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function AuthScreen({ onLoginSuccess }) {
  const { t, setLanguage, profile } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('vendor123');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft">
        {/* Top Branding & Image Blend */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-display font-extrabold text-base shadow-soft">
              TS
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">Track Shack</h2>
              <p className="text-[11px] text-slate-500">{t.appTagline}</p>
            </div>
          </div>
          {/* Language selector */}
          <select
            value={profile.language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl px-2 py-1 outline-none border border-slate-200"
          >
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>

        {/* Welcoming Illustration */}
        <div className="bg-pastel-sand rounded-2xl p-3 mb-6 flex items-center gap-3 border border-amber-100">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/80 shrink-0 p-1 flex items-center justify-center">
            <img 
              src="/images/vendor-business.jpg" 
              alt="Vendor Profile" 
              className="w-full h-full object-contain vendor-photo-blend"
            />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900">
              {isSignUp ? t.signup : t.login}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Made specially for Indian street vendors & small business owners
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.mobileNumber}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-bold text-slate-500">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 digit number"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.password}
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-0" />
              <span>Remember me</span>
            </label>
            <button type="button" className="font-semibold text-emerald-700 hover:underline">
              {t.forgotPassword}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-pastel active:scale-98 transition flex items-center justify-center gap-2 mt-2"
          >
            <span>{isSignUp ? t.signup : t.login}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <span>{isSignUp ? "Already have an account?" : "New to Track Shack?"} </span>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-emerald-700 hover:underline ml-1"
          >
            {isSignUp ? t.login : t.signup}
          </button>
        </div>

        {/* Demo Fast Login Banner */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            {t.demoDataNotice}
          </p>
        </div>
      </div>
    </div>
  );
}

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
    { label: 'Vegetables & Fruits', image: '/images/vendor-flowers.jpg', desc: 'Mandi & cart' },
    { label: 'Street Food & Tea', image: '/images/vendor-tea.jpg', desc: 'Stalls & snacks' },
    { label: 'Kirana & Grocery', image: '/images/vendor-couple.jpg', desc: 'Daily provisions' },
    { label: 'Farmer & Agriculture', image: '/images/vendor-farmer.jpg', desc: 'Farming produce' },
    { label: 'Small Business / Shop', image: '/images/vendor-business.jpg', desc: 'Retail store' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setProfile(prev => ({ ...prev, ...formData }));
    showToast('Business profile updated!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-soft-lg">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-emerald-600" />
            <h2 className="font-display font-bold text-lg text-slate-900">
              {t.businessProfile}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.ownerName}
            </label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.businessName}
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
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
                    className={`flex items-center gap-2.5 p-2 rounded-2xl border text-left transition ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-50/70 font-semibold' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/90 p-0.5 shrink-0 border border-slate-100">
                      <img 
                        src={type.image} 
                        alt={type.label} 
                        className="w-full h-full object-contain vendor-photo-blend"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-slate-800">{type.label}</div>
                      <div className="text-[10px] text-slate-500">{type.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.preferredLanguage}
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-emerald-500 outline-none"
            >
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shop Location / Market Area (Optional)
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Near Bus Stand, APMC Yard"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-semibold text-xs text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold text-xs text-white shadow-soft"
            >
              {t.saveProfile}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
