import React, { useState, useEffect } from 'react';
import { Menu, Bell, Shield, User as UserIcon, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageId } from './Sidebar';
import { api } from '../services/api';
import { NotificationModal } from './NotificationModal';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onOpenSidebar,
}) => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const fetchUnread = async () => {
    try {
      const data = await api.getNotifications();
      const unread = data.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = (page: PageId): { title: string; subtitle: string } => {
    switch (page) {
      case 'dashboard':
        return { title: 'Dashboard', subtitle: 'Real-time laboratory security overview & telemetry' };
      case 'access-control':
        return { title: 'Risk-Adaptive Access Control', subtitle: 'Dynamic context-aware zero-trust policy enforcement' };
      case 'digital-twin':
        return { title: 'Cybersecurity Digital Twin', subtitle: 'Interactive 2D/3D virtual laboratory representation' };
      case 'threat-detection':
        return { title: 'AI Threat Detection', subtitle: 'scikit-learn anomaly detection baseline & telemetry classification' };
      case 'attack-simulation':
        return { title: 'Attack Simulation', subtitle: 'Defensive kill-chain scenario execution & network containment' };
      case 'privacy-simulation':
        return { title: 'Privacy-Preserving Access Control Simulation', subtitle: 'Differential privacy Laplace mechanism & pseudonymization trade-off' };
      case 'devices':
        return { title: 'Device Management', subtitle: 'Hardware inventory, telemetry, and network isolation' };
      case 'users':
        return { title: 'User Management', subtitle: 'Authorized role administration & access directory' };
      case 'logs':
        return { title: 'Logs & Reports', subtitle: 'Audit trails, access history, and downloadable CSV exports' };
      case 'settings':
        return { title: 'Settings', subtitle: 'System configuration, risk thresholds & privacy parameters' };
      case 'profile':
        return { title: 'User Profile', subtitle: 'Account credentials & security permissions' };
      default:
        return { title: 'CyberShield', subtitle: 'Smart Laboratory Cyber-Physical System' };
    }
  };

  const { title, subtitle } = getPageTitle(currentPage);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between shadow-xs">
        {/* Left: Mobile hamburger + Page Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
            aria-label="Open Navigation"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Security Badge, Notification Bell, User Avatar */}
        <div className="flex items-center gap-4">
          {/* Active Shield Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Adaptive Shield Active</span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Open Notification Center"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 p-1.5 pr-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs border-2 border-white">
                {user?.full_name?.charAt(0) || 'D'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-snug">
                  {user?.full_name || 'Dr. Smith'}
                </p>
                <p className="text-[10px] font-medium text-slate-500">
                  {user?.role || 'Administrator'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.full_name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    onNavigate('profile');
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  Security Settings
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Notification Modal */}
      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onNotificationUpdate={fetchUnread}
      />
    </>
  );
};
