import React from 'react';
import { 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Landmark, 
  PieChart, 
  Bell, 
  Globe, 
  Smartphone, 
  Monitor, 
  User,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function TopHeader() {
  const { 
    t, 
    profile, 
    setLanguage, 
    isMobileFrameView, 
    setIsMobileFrameView, 
    setNotificationsOpen, 
    setProfileModalOpen 
  } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: App Logo & Shop Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-soft font-display font-extrabold text-lg">
            TS
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
                Track Shack
              </h1>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Vendor
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[140px] sm:max-w-xs">
              {profile.businessName}
            </p>
          </div>
        </div>

        {/* Right: Actions (Language, Laptop/Mobile Preview, Notifications, Profile) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative flex items-center bg-slate-50 hover:bg-slate-100 rounded-xl p-1 border border-slate-200 transition">
            <Globe className="w-3.5 h-3.5 text-slate-500 ml-1 mr-0.5" />
            <select
              value={profile.language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 py-1 pr-1 outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>

          {/* Device Frame View Toggle (Mobile Frame vs Laptop Canvas) */}
          <button
            onClick={() => setIsMobileFrameView(!isMobileFrameView)}
            title={isMobileFrameView ? "Switch to Full Laptop View" : "Simulate Mobile Screen"}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
          >
            {isMobileFrameView ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-emerald-600" />
                <span>Laptop View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mobile Frame</span>
              </>
            )}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
          </button>

          {/* Profile Avatar */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-1.5 p-1 sm:px-2 rounded-xl hover:bg-slate-100 transition active:scale-95 border border-transparent hover:border-slate-200"
            aria-label="Profile Settings"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 overflow-hidden flex items-center justify-center font-bold text-xs border border-amber-200">
              <img 
                src="/images/vendor-tea.jpg" 
                alt="Avatar" 
                className="w-full h-full object-cover vendor-photo-blend"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { activeTab, setActiveTab, t } = useApp();

  const navItems = [
    { id: 'home', label: t.navHome, icon: Home, color: 'text-emerald-700', activeBg: 'bg-emerald-100' },
    { id: 'sales', label: t.navSales, icon: TrendingUp, color: 'text-emerald-700', activeBg: 'bg-emerald-100' },
    { id: 'expenses', label: t.navExpenses, icon: TrendingDown, color: 'text-rose-700', activeBg: 'bg-rose-100' },
    { id: 'loans', label: t.navLoans, icon: Landmark, color: 'text-indigo-700', activeBg: 'bg-indigo-100' },
    { id: 'reports', label: t.navReports, icon: PieChart, color: 'text-amber-700', activeBg: 'bg-amber-100' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-soft pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 touch-press ${
                isActive ? `${item.activeBg} font-semibold scale-105` : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? item.color : 'text-slate-500'}`} />
              <span className={`text-[11px] tracking-tight ${isActive ? item.color : 'text-slate-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
