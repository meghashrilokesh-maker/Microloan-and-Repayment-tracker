import React, { useState } from 'react';
import { 
  ArrowRight, 
  Lock, 
  Store, 
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import NaturalVendorImage from './NaturalVendorImage';

export function SplashScreen({ onFinish }) {
  const { t } = useApp();

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF7F2] flex flex-col items-center justify-between p-6 animate-in fade-in duration-500">
      <div className="w-full flex justify-end">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E9EFE8] text-[#425541] border border-[#D3DFD2]">
          Indian Vendor Fintech
        </span>
      </div>

      <div className="flex flex-col items-center text-center max-w-sm my-auto">
        {/* Seamless 2D Indian Vendor Illustration */}
        <div className="mb-6 relative">
          <NaturalVendorImage 
            type="cottoncandy" 
            size="hero" 
            backdrop="arch" 
            backdropColor="sage" 
            showBotanical={true}
            alt="Track Shack Mascot" 
          />
          <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1.5 rounded-full shadow-soft border border-[#EBE3D7] flex items-center gap-1.5 animate-bounce">
            <span className="w-2 h-2 bg-[#6B8569] rounded-full" />
            <span className="text-xs font-bold text-[#2D2825]">Track Shack</span>
          </div>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2825] tracking-tight">
          Track Shack
        </h1>
        <p className="text-sm sm:text-base text-[#7C746F] mt-2 font-medium">
          {t.appTagline}
        </p>

        <div className="mt-7 flex items-center gap-2 text-xs text-[#605955] bg-white/80 backdrop-blur px-4 py-2 rounded-full border border-[#EBE3D7] shadow-soft">
          <ShieldCheck className="w-4 h-4 text-[#566E54]" />
          <span>Simple, trustworthy & vernacular for everyday vendors</span>
        </div>
      </div>

      <div className="w-full max-w-xs pb-4">
        <button
          onClick={onFinish}
          className="w-full py-3.5 px-6 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-semibold flex items-center justify-center gap-2 shadow-pastel active:scale-98 transition touch-press"
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
      illustrationType: 'cottoncandy',
      backdropColor: 'sage',
      badge: 'Sales & Quick Entry',
      badgeColor: 'bg-[#E9EFE8] text-[#425541] border-[#D3DFD2]',
      highlight: '₹ Record with touch or voice in 3 seconds'
    },
    {
      title: t.onboardTitle2,
      desc: t.onboardDesc2,
      illustrationType: 'flowers',
      backdropColor: 'terracotta',
      badge: 'Daily Expenses',
      badgeColor: 'bg-[#F8ECE6] text-[#874937] border-[#F0D7CD]',
      highlight: '₹ Track stock, transport & daily tea'
    },
    {
      title: t.onboardTitle3,
      desc: t.onboardDesc3,
      illustrationType: 'farmer',
      backdropColor: 'lavender',
      badge: 'Microloans & Surplus',
      badgeColor: 'bg-[#F2F0F8] text-[#554C78] border-[#E3DFEF]',
      highlight: '₹ Never miss a repayment & know cash in hand'
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
    <div className="fixed inset-0 z-50 bg-[#FAF7F2] flex flex-col justify-between p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {['en', 'kn', 'hi'].map((lng) => (
            <button
              key={lng}
              onClick={() => setLanguage(lng)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition touch-press ${
                profile.language === lng 
                  ? 'bg-[#566E54] text-white shadow-soft font-semibold' 
                  : 'bg-white text-[#7C746F] border border-[#EBE3D7]'
              }`}
            >
              {lng === 'en' ? 'English' : lng === 'kn' ? 'ಕನ್ನಡ' : 'हिन्दी'}
            </button>
          ))}
        </div>
        <button
          onClick={onComplete}
          className="text-xs font-semibold text-[#7C746F] hover:text-[#2D2825] px-3 py-1.5"
        >
          {t.skip}
        </button>
      </div>

      {/* Main Slide Card */}
      <div className="flex flex-col items-center text-center my-auto max-w-sm mx-auto">
        <div className="relative mb-6">
          <NaturalVendorImage 
            type={current.illustrationType}
            size="hero"
            backdrop="arch"
            backdropColor={current.backdropColor}
            showBotanical={true}
            alt={current.title}
          />
          <div className="absolute top-2 right-2">
            <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border shadow-soft ${current.badgeColor}`}>
              {current.badge}
            </span>
          </div>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2825] leading-tight">
          {current.title}
        </h2>
        <p className="text-sm text-[#7C746F] mt-2.5 font-medium px-4 leading-relaxed">
          {current.desc}
        </p>

        <div className="mt-4 px-4 py-1.5 rounded-full bg-white border border-[#EBE3D7] text-xs font-semibold text-[#605955] shadow-soft">
          {current.highlight}
        </div>

        {/* Dots */}
        <div className="flex items-center gap-2 mt-6">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                slide === idx ? 'w-6 bg-[#566E54]' : 'w-2 bg-[#D8CCA] bg-[#DACBB8]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="w-full max-w-sm mx-auto">
        <button
          onClick={handleNext}
          className="w-full py-3.5 px-6 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-semibold flex items-center justify-center gap-2 shadow-pastel active:scale-98 transition touch-press"
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
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#EBE3D7] shadow-soft-md">
        {/* Top Branding */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#6B8569] text-white flex items-center justify-center font-serif font-bold text-base shadow-pastel">
              TS
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-[#2D2825]">Track Shack</h2>
              <p className="text-[11px] text-[#7C746F]">{t.appTagline}</p>
            </div>
          </div>
          {/* Language selector */}
          <select
            value={profile.language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs font-semibold bg-[#FAF7F2] text-[#48433F] rounded-full px-3 py-1 outline-none border border-[#EBE3D7]"
          >
            <option value="en">English</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>

        {/* Welcoming 2D Illustration Card */}
        <div className="bg-[#FAF4ED] rounded-2xl p-3.5 mb-6 flex items-center gap-3 border border-[#EAE1D4]">
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
              {isSignUp ? t.signup : t.login}
            </h3>
            <p className="text-xs text-[#7C746F] mt-0.5">
              Made specially for Indian street vendors & small business owners
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1.5">
              {t.mobileNumber}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-bold text-[#7C746F]">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 digit number"
                className="w-full pl-12 pr-4 py-3 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl text-sm font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#48433F] mb-1.5">
              {t.password}
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 text-[#7C746F]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#FAF7F2] border border-[#EBE3D7] rounded-2xl text-sm font-medium text-[#2D2825] focus:bg-white focus:border-[#6B8569] outline-none transition"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 text-[#605955] cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#566E54] focus:ring-0" />
              <span>Remember me</span>
            </label>
            <button type="button" className="font-semibold text-[#566E54] hover:underline">
              {t.forgotPassword}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-full bg-[#566E54] hover:bg-[#425541] text-white font-semibold shadow-pastel active:scale-98 transition flex items-center justify-center gap-2 mt-2 touch-press"
          >
            <span>{isSignUp ? t.signup : t.login}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#7C746F]">
          <span>{isSignUp ? "Already have an account?" : "New to Track Shack?"} </span>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-[#566E54] hover:underline ml-1"
          >
            {isSignUp ? t.login : t.signup}
          </button>
        </div>

        {/* Demo Fast Login Banner */}
        <div className="mt-6 pt-4 border-t border-[#F3EDE3] text-center">
          <p className="text-[11px] text-[#9A938E]">
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
    { label: 'Vegetables & Fruits', illustrationType: 'flowers', desc: 'Mandi & cart' },
    { label: 'Street Food & Tea', illustrationType: 'cottoncandy', desc: 'Stalls & snacks' },
    { label: 'Kirana & Grocery', illustrationType: 'flowers', desc: 'Daily provisions' },
    { label: 'Farmer & Agriculture', illustrationType: 'farmer', desc: 'Farming produce' },
    { label: 'Small Business / Shop', illustrationType: 'farmer', desc: 'Retail store' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setProfile(prev => ({ ...prev, ...formData }));
    showToast('Business profile updated!');
    onClose();
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
