import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopHeader, BottomNav } from './components/Navigation';
import { LandingScreen, AuthScreen } from './components/OnboardingAndAuth';
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
    toastMessage
  } = useApp();

  // App phase navigation: 'landing' | 'auth' | 'main'
  const [appPhase, setAppPhase] = useState(() => localStorage.getItem('trackshack_token') ? 'main' : 'landing');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

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

  if (appPhase === 'landing') {
    return (
      <div className="relative">
        <LandingScreen
          onGetStarted={() => {
            if (localStorage.getItem('trackshack_token')) {
              setAppPhase('main');
            } else {
              setAuthMode('login');
              setAppPhase('auth');
            }
          }}
          onLogin={() => {
            setAuthMode('login');
            setAppPhase('auth');
          }}
          onCreateAccount={() => {
            setAuthMode('signup');
            setAppPhase('auth');
          }}
        />

        {/* Quick Reviewer Helper Bar */}
        <div className="hidden lg:flex fixed bottom-3 left-4 z-50 items-center gap-2 text-xs bg-white/95 backdrop-blur border border-[#EBE3D7] px-3.5 py-1.5 rounded-full shadow-soft">
          <span className="text-[11px] font-bold text-[#7C746F]">Flow Quick-Jump:</span>
          <button
            onClick={() => setAppPhase('main')}
            className="text-[11px] font-bold text-[#566E54] hover:underline"
          >
            Direct to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  if (appPhase === 'auth') {
    return (
      <AuthScreen
        initialMode={authMode}
        onLoginSuccess={() => setAppPhase('main')}
        onBackToLanding={() => setAppPhase('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2825] flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#2D2825]/90 backdrop-blur-md text-[#FAF7F2] text-xs font-semibold px-4 py-2.5 rounded-full shadow-soft-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-[#EBE3D7]/30">
          <CheckCircle2 className="w-4 h-4 text-[#8EAA8C] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Discrete Reviewer helper pill to re-visit Landing or Auth */}
      <div className="hidden xl:flex fixed bottom-3 left-4 z-40 items-center gap-2 text-xs bg-white/90 backdrop-blur border border-[#EBE3D7] px-3.5 py-1.5 rounded-full shadow-soft">
        <span className="text-[11px] font-bold text-[#7C746F]">Test Views:</span>
        <button
          onClick={() => setAppPhase('landing')}
          className="text-[11px] font-semibold text-[#566E54] hover:underline"
        >
          Landing Page
        </button>
        <span className="text-[#DACBB8]">•</span>
        <button
          onClick={() => {
            setAuthMode('login');
            setAppPhase('auth');
          }}
          className="text-[11px] font-semibold text-[#566E54] hover:underline"
        >
          Login / Signup
        </button>
      </div>

      {/* Full Responsive App Shell (Mobile, Tablet, Desktop) */}
      <div className="w-full flex-1 flex flex-col">
        <TopHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-10">
          {renderCurrentTab()}
        </main>
        <BottomNav />
      </div>

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
