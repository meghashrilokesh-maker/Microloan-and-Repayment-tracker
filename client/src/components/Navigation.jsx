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
  Monitor 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function TopHeader() {
  const { 
    profile, 
    setLanguage, 
    isMobileFrameView, 
    setIsMobileFrameView, 
    setNotificationsOpen, 
    setProfileModalOpen 
  } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EBE3D7] shadow-soft px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Left: App Logo & Shop Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#6B8569] text-white flex items-center justify-center shadow-pastel font-serif font-bold text-lg">
            TS
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif font-bold text-base sm:text-lg text-[#2D2825] tracking-tight leading-none">
                Track Shack
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E9EFE8] text-[#425541] border border-[#D3DFD2]">
                Vendor
              </span>
            </div>
            <p className="text-xs text-[#7C746F] font-medium truncate max-w-[140px] sm:max-w-xs">
              {profile.businessName}
            </p>
          </div>
        </div>

        {/* Right: Actions (Language, Laptop/Mobile Preview, Notifications, Profile) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative flex items-center bg-white/80 hover:bg-white rounded-full px-2 py-1 border border-[#EBE3D7] shadow-soft transition">
            <Globe className="w-3.5 h-3.5 text-[#7C746F] mr-1" />
            <select
              value={profile.language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#48433F] outline-none cursor-pointer"
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
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#48433F] bg-white/80 hover:bg-white border border-[#EBE3D7] shadow-soft transition"
          >
            {isMobileFrameView ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-[#566E54]" />
                <span>Laptop View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#877EB0]" />
                <span>Mobile Frame</span>
              </>
            )}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-full text-[#605955] bg-white/80 hover:bg-white border border-[#EBE3D7] shadow-soft transition touch-press"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#BF745F] rounded-full ring-2 ring-[#FAF7F2]" />
          </button>

          {/* Profile Avatar with 2D Illustration */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/80 transition touch-press border border-[#EBE3D7]"
            aria-label="Profile Settings"
          >
            <div className="w-8 h-8 rounded-full bg-[#E9EFE8] overflow-hidden flex items-center justify-center border border-[#D3DFD2]">
              <img 
                src="/images/vendor-cottoncandy.png" 
                alt="Profile Avatar" 
                className="w-7 h-7 object-contain drop-shadow-sm"
                onError={(e) => { e.target.src = '/images/vendor-flowers.png'; }}
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
    { id: 'home', label: t.navHome, icon: Home, color: 'text-[#425541]', activeBg: 'bg-[#E9EFE8] text-[#314030] shadow-sm' },
    { id: 'sales', label: t.navSales, icon: TrendingUp, color: 'text-[#425541]', activeBg: 'bg-[#E9EFE8] text-[#314030] shadow-sm' },
    { id: 'expenses', label: t.navExpenses, icon: TrendingDown, color: 'text-[#874937]', activeBg: 'bg-[#F8ECE6] text-[#673627] shadow-sm' },
    { id: 'loans', label: t.navLoans, icon: Landmark, color: 'text-[#554C78]', activeBg: 'bg-[#F2F0F8] text-[#3F3760] shadow-sm' },
    { id: 'reports', label: t.navReports, icon: PieChart, color: 'text-[#6E5638]', activeBg: 'bg-[#F3EDE3] text-[#4E3B24] shadow-sm' },
  ];

  return (
    <nav className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:left-1/2 z-40 bg-white/95 backdrop-blur-md rounded-3xl border border-[#EBE3D7] shadow-soft-lg pb-safe">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 touch-press ${
                isActive ? `${item.activeBg} font-semibold scale-102` : 'text-[#7C746F] hover:text-[#2D2825]'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? item.color : 'text-[#8E8681]'}`} />
              <span className={`text-[11px] tracking-tight ${isActive ? item.color : 'text-[#7C746F]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
