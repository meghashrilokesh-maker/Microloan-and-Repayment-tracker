import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopHeader, BottomNav } from './components/Navigation';
import { SplashScreen, OnboardingFlow, AuthScreen } from './components/OnboardingAndAuth';
import DashboardScreen from './screens/DashboardScreen';
import SalesScreen from './screens/SalesScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import LoansScreen from './screens/LoansScreen';
import ReportsScreen from './screens/ReportsScreen';
import { NotificationsDrawer, ProfileSettingsModal } from './components/SettingsAndNotifs';
import { CheckCircle2 } from 'lucide-react';

function AppContent() {
  const { 
    activeTab, 
    isMobileFrameView, 
    toastMessage
  } = useApp();

  // App phase navigation
  const [appPhase, setAppPhase] = useState('main'); // 'splash' | 'onboarding' | 'auth' | 'main'

  // Render current tab
  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'sales':
        return <SalesScreen />;
      case 'expenses':
        return <ExpensesScreen />;
      case 'loans':
        return <LoansScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'home':
      default:
        return <DashboardScreen />;
    }
  };

  if (appPhase === 'splash') {
    return <SplashScreen onFinish={() => setAppPhase('onboarding')} />;
  }

  if (appPhase === 'onboarding') {
    return <OnboardingFlow onComplete={() => setAppPhase('auth')} />;
  }

  if (appPhase === 'auth') {
    return <AuthScreen onLoginSuccess={() => setAppPhase('main')} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2825] flex flex-col items-center">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#2D2825]/90 backdrop-blur-md text-[#FAF7F2] text-xs font-semibold px-4 py-2.5 rounded-full shadow-soft-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-[#EBE3D7]/30">
          <CheckCircle2 className="w-4 h-4 text-[#8EAA8C] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mode helper pill for desktop reviewers to re-launch splash / onboarding */}
      <div className="hidden lg:flex fixed top-3 left-4 z-40 items-center gap-2 text-xs bg-white/90 backdrop-blur border border-[#EBE3D7] px-3.5 py-1.5 rounded-full shadow-soft">
        <span className="text-[11px] font-bold text-[#7C746F]">Flow Test:</span>
        <button
          onClick={() => setAppPhase('splash')}
          className="text-[11px] font-semibold text-[#566E54] hover:underline"
        >
          Splash
        </button>
        <span className="text-[#DACBB8]">•</span>
        <button
          onClick={() => setAppPhase('onboarding')}
          className="text-[11px] font-semibold text-[#566E54] hover:underline"
        >
          Onboarding
        </button>
        <span className="text-[#DACBB8]">•</span>
        <button
          onClick={() => setAppPhase('auth')}
          className="text-[11px] font-semibold text-[#566E54] hover:underline"
        >
          Login
        </button>
      </div>

      {/* Main Container: Can toggle between Laptop Full View and Simulated Mobile Phone Frame */}
      {isMobileFrameView ? (
        <div className="my-6 w-full max-w-sm rounded-[44px] p-3 bg-[#2D2825] shadow-2xl border-[6px] border-[#383330] relative">
          {/* Speaker notch */}
          <div className="w-28 h-4 bg-[#383330] rounded-full mx-auto mb-2" />
          
          {/* Simulated Mobile Screen Canvas */}
          <div className="bg-[#FAF7F2] rounded-[36px] overflow-hidden flex flex-col h-[780px] relative">
            <TopHeader />
            <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
              {renderCurrentTab()}
            </main>
            <BottomNav />
          </div>
        </div>
      ) : (
        /* Full Responsive View (Optimized for Mobile first, elegant on Tablet and Laptop) */
        <div className="w-full max-w-lg min-h-screen flex flex-col bg-[#FAF7F2] shadow-sm relative">
          <TopHeader />
          <main className="flex-1 px-4 py-4 pb-28 space-y-4">
            {renderCurrentTab()}
          </main>
          <BottomNav />
        </div>
      )}

      {/* Global Modals & Drawers */}
      <NotificationsDrawer />
      <ProfileSettingsModal />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
