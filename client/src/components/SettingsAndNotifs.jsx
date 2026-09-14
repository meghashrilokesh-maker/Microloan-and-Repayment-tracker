import React, { useState } from 'react';
import { 
  Bell, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Store, 
  Languages, 
  ShieldCheck, 
  HelpCircle, 
  LogOut, 
  RotateCcw,
  Smartphone,
  Check,
  IndianRupee
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BusinessProfileSetupModal } from './OnboardingAndAuth';

export function NotificationsDrawer() {
  const { 
    t, 
    notificationsOpen, 
    setNotificationsOpen, 
    setActiveTab, 
    setSelectedLoanId,
    loans 
  } = useApp();

  if (!notificationsOpen) return null;

  const remindersList = [
    {
      id: 'n1',
      title: 'Repayment Due Tomorrow: ₹1,000',
      subtitle: 'PM SVANidhi Street Vendor Microloan (SBI Bank)',
      time: 'Tomorrow, 10:00 AM',
      type: 'warning',
      badge: 'Due Soon',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      actionLoanId: 'l1'
    },
    {
      id: 'n2',
      title: 'Stock Advance Payment Scheduled: ₹600',
      subtitle: 'Murthy Veggie Wholesalers (APMC Mandi)',
      time: 'In 3 days',
      type: 'info',
      badge: 'Upcoming',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      actionLoanId: 'l2'
    },
    {
      id: 'n3',
      title: 'Weekly Business Summary Ready',
      subtitle: 'Net money surplus is positive (+₹8,200). Tap to view report.',
      time: 'Yesterday',
      type: 'success',
      badge: 'Report',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      actionTab: 'reports'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              <h2 className="font-display font-bold text-lg text-slate-900">
                {t.reminders}
              </h2>
            </div>
            <button
              onClick={() => setNotificationsOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>
          </div>

          {/* Reminders List using clean cards as requested */}
          <div className="space-y-3 mt-4 overflow-y-auto max-h-[75vh] pr-1">
            {remindersList.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.actionLoanId) {
                    setSelectedLoanId(item.actionLoanId);
                    setActiveTab('loans');
                  } else if (item.actionTab) {
                    setActiveTab(item.actionTab);
                  }
                  setNotificationsOpen(false);
                }}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition cursor-pointer space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-xs text-slate-900 leading-tight">
                    {item.title}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {item.subtitle}
                </p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-medium border-t border-slate-200/50">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.time}
                  </span>
                  <span className="text-emerald-700 font-bold hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setNotificationsOpen(false)}
          className="w-full py-3 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition"
        >
          Close Reminders
        </button>
      </div>
    </div>
  );
}

export function ProfileSettingsModal() {
  const { 
    t, 
    profile, 
    setProfile, 
    setLanguage, 
    profileModalOpen, 
    setProfileModalOpen, 
    resetToDemo,
    showToast 
  } = useApp();

  const [editProfileOpen, setEditProfileOpen] = useState(false);

  if (!profileModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-soft-lg space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <h2 className="font-display font-bold text-lg text-slate-900">
              Profile & Settings
            </h2>
          </div>
          <button
            onClick={() => setProfileModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Vendor Header Card with Couple / Family picture blend */}
        <div className="bg-gradient-to-r from-amber-50 via-white to-emerald-50 rounded-2xl p-4 border border-amber-100 flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/90 p-1 shrink-0 flex items-center justify-center border border-amber-100">
            <img 
              src="/images/vendor-couple.jpg" 
              alt="Vendor Profile" 
              className="w-full h-full object-contain vendor-photo-blend"
            />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">
              {profile.ownerName}
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              {profile.businessName}
            </p>
            <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              {profile.businessType}
            </span>
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-2 text-xs">
          {/* Business info trigger */}
          <button
            onClick={() => setEditProfileOpen(true)}
            className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between transition text-left"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4 text-slate-600" />
              <div>
                <span className="font-semibold text-slate-800 block">Edit Business Information</span>
                <span className="text-[10px] text-slate-400">{profile.location || 'Location not set'}</span>
              </div>
            </div>
            <span className="text-slate-400 font-bold">Edit →</span>
          </button>

          {/* Language Switcher */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-2">
                <Languages className="w-4 h-4 text-slate-600" />
                <span>{t.preferredLanguage}</span>
              </span>
              <span className="text-[10px] text-slate-400">Trilingual Support</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { code: 'en', label: 'English' },
                { code: 'kn', label: 'ಕನ್ನಡ' },
                { code: 'hi', label: 'हिन्दी' },
              ].map((lng) => (
                <button
                  key={lng.code}
                  onClick={() => setLanguage(lng.code)}
                  className={`py-2 text-center rounded-xl font-bold transition text-xs ${
                    profile.language === lng.code
                      ? 'bg-emerald-600 text-white shadow-soft'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lng.label}
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <IndianRupee className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-slate-800">Currency</span>
            </div>
            <span className="font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              ₹ Indian Rupee (INR)
            </span>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm('Restore original demo vendor data?')) {
                resetToDemo();
                setProfileModalOpen(false);
              }
            }}
            className="w-full p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200 text-amber-900 flex items-center justify-between transition font-semibold"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-700" />
              <span>{t.resetDemo}</span>
            </div>
            <span className="text-[10px] text-amber-800">Restore Sample</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Track Shack v1.0.0</span>
          <span>Societal Fintech for Indian Vendors</span>
        </div>
      </div>

      <BusinessProfileSetupModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
      />
    </div>
  );
}
