import React, { useState } from 'react';
import { 
  Bell, 
  Clock, 
  User, 
  Store, 
  Languages, 
  RotateCcw, 
  IndianRupee 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BusinessProfileSetupModal } from './OnboardingAndAuth';
import NaturalVendorImage from './NaturalVendorImage';

export function NotificationsDrawer() {
  const { 
    t, 
    notificationsOpen, 
    setNotificationsOpen, 
    setActiveTab, 
    setSelectedLoanId
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
      badgeColor: 'bg-[#F8ECE6] text-[#874937] border-[#F0D7CD]',
      actionLoanId: 'l1'
    },
    {
      id: 'n2',
      title: 'Stock Advance Payment Scheduled: ₹600',
      subtitle: 'Murthy Veggie Wholesalers (APMC Mandi)',
      time: 'In 3 days',
      type: 'info',
      badge: 'Upcoming',
      badgeColor: 'bg-[#F2F0F8] text-[#554C78] border-[#E3DFEF]',
      actionLoanId: 'l2'
    },
    {
      id: 'n3',
      title: 'Weekly Business Summary Ready',
      subtitle: 'Net money surplus is positive (+₹8,200). Tap to view report.',
      time: 'Yesterday',
      type: 'success',
      badge: 'Report',
      badgeColor: 'bg-[#E9EFE8] text-[#425541] border-[#D3DFD2]',
      actionTab: 'reports'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2825]/40 backdrop-blur-sm flex justify-end animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full p-5 sm:p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 border-l border-[#EBE3D7]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#F3EDE3]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E9EFE8] text-[#566E54] border border-[#D3DFD2] flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="font-serif font-bold text-lg text-[#2D2825]">
                {t.reminders}
              </h2>
            </div>
            <button
              onClick={() => setNotificationsOpen(false)}
              className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#7C746F] hover:bg-[#F3EDE3] border border-[#EBE3D7] flex items-center justify-center text-xs font-bold transition touch-press"
            >
              ✕
            </button>
          </div>

          {/* Reminders List */}
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
                className="p-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3EDE3] border border-[#EBE3D7] transition cursor-pointer space-y-2 touch-press"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-xs text-[#2D2825] leading-tight">
                    {item.title}
                  </h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#7C746F]">
                  {item.subtitle}
                </p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-[#8E8681] font-medium border-t border-[#EBE3D7]/60">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#BF745F]" />
                    {item.time}
                  </span>
                  <span className="text-[#566E54] font-bold hover:underline">
                    View Details →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setNotificationsOpen(false)}
          className="w-full py-3 rounded-full bg-[#FAF7F2] text-[#605955] hover:bg-[#F3EDE3] border border-[#EBE3D7] font-bold text-xs transition touch-press"
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
    setLanguage, 
    profileModalOpen, 
    setProfileModalOpen, 
    resetToDemo
  } = useApp();

  const [editProfileOpen, setEditProfileOpen] = useState(false);

  if (!profileModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2825]/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-soft-lg border border-[#EBE3D7] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F3EDE3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E9EFE8] text-[#566E54] border border-[#D3DFD2] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <h2 className="font-serif font-bold text-lg text-[#2D2825]">
              Profile & Settings
            </h2>
          </div>
          <button
            onClick={() => setProfileModalOpen(false)}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#7C746F] hover:bg-[#F3EDE3] border border-[#EBE3D7] flex items-center justify-center text-xs font-bold transition touch-press"
          >
            ✕
          </button>
        </div>

        {/* Vendor Header Card with 2D Illustration */}
        <div className="bg-[#FAF3EA] rounded-2xl p-4 border border-[#EAE1D4] flex items-center gap-3">
          <div className="relative shrink-0">
            <NaturalVendorImage 
              type="cottoncandy" 
              size="sm" 
              backdrop="circle" 
              backdropColor="sand"
              alt="Vendor Profile" 
            />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#2D2825]">
              {profile.ownerName}
            </h3>
            <p className="text-xs text-[#7C746F] font-medium">
              {profile.businessName}
            </p>
            <span className="inline-block mt-1 text-[10px] font-semibold text-[#425541] bg-[#E9EFE8] px-2.5 py-0.5 rounded-full border border-[#D3DFD2]">
              {profile.businessType}
            </span>
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-2.5 text-xs">
          {/* Business info trigger */}
          <button
            onClick={() => setEditProfileOpen(true)}
            className="w-full p-3.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3EDE3] border border-[#EBE3D7] flex items-center justify-between transition text-left touch-press"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4 text-[#7C746F]" />
              <div>
                <span className="font-semibold text-[#2D2825] block">Edit Business Information</span>
                <span className="text-[10px] text-[#8E8681]">{profile.location || 'Location not set'}</span>
              </div>
            </div>
            <span className="text-[#566E54] font-bold">Edit →</span>
          </button>

          {/* Language Switcher */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D7] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#2D2825] flex items-center gap-2">
                <Languages className="w-4 h-4 text-[#7C746F]" />
                <span>{t.preferredLanguage}</span>
              </span>
              <span className="text-[10px] text-[#8E8681]">Trilingual Support</span>
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
                  className={`py-2 text-center rounded-xl font-bold transition text-xs touch-press ${
                    profile.language === lng.code
                      ? 'bg-[#566E54] text-white shadow-soft'
                      : 'bg-white text-[#605955] border border-[#EBE3D7] hover:bg-[#F3EDE3]'
                  }`}
                >
                  {lng.label}
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D7] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <IndianRupee className="w-4 h-4 text-[#7C746F]" />
              <span className="font-semibold text-[#2D2825]">Currency</span>
            </div>
            <span className="font-bold text-[#48433F] bg-white px-3 py-1 rounded-full border border-[#EBE3D7]">
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
            className="w-full p-3.5 rounded-2xl bg-[#FCF7F4] hover:bg-[#F8ECE6] border border-[#F0D7CD] text-[#874937] flex items-center justify-between transition font-semibold touch-press"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#BF745F]" />
              <span>{t.resetDemo}</span>
            </div>
            <span className="text-[10px] text-[#874937] font-bold">Restore Sample</span>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#F3EDE3] flex items-center justify-between text-[11px] text-[#8E8681]">
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
