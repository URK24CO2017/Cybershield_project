import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, PageId } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { AccessControl } from './pages/AccessControl';
import { DigitalTwin } from './pages/DigitalTwin';
import { ThreatDetection } from './pages/ThreatDetection';
import { AttackSimulation } from './pages/AttackSimulation';
import { PrivacySimulation } from './pages/PrivacySimulation';
import { Devices } from './pages/Devices';
import { Users } from './pages/Users';
import { LogsReports } from './pages/LogsReports';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center animate-pulse">
            <span className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Initializing CyberShield Secure Environment...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated: Login or Sign Up
  if (!user) {
    return authView === 'login' ? (
      <Login onNavigateToSignUp={() => setAuthView('signup')} />
    ) : (
      <SignUp onNavigateToLogin={() => setAuthView('login')} />
    );
  }

  // Authenticated Dashboard Layout
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased flex">
      {/* Dark Navy Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Header
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'access-control' && <AccessControl />}
          {currentPage === 'digital-twin' && <DigitalTwin />}
          {currentPage === 'threat-detection' && <ThreatDetection />}
          {currentPage === 'attack-simulation' && <AttackSimulation />}
          {currentPage === 'privacy-simulation' && <PrivacySimulation />}
          {currentPage === 'devices' && <Devices />}
          {currentPage === 'users' && <Users />}
          {currentPage === 'logs' && <LogsReports />}
          {currentPage === 'settings' && <Settings />}
          {currentPage === 'profile' && <Profile />}
        </main>

        {/* Global Footer */}
        <footer className="px-6 py-4 border-t border-slate-200/80 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CyberShield: Adaptive Secure Smart Laboratory • MSc Applied AI Project</span>
          <span className="font-mono text-[11px] text-slate-400">Zero-Trust R-AAC & Laplace DP Active</span>
        </footer>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
