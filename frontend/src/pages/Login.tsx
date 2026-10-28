import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onNavigateToSignUp: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToSignUp }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@lab.edu');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoRole = async (role: 'Admin' | 'Student' | 'Researcher' | 'Technician') => {
    setError(null);
    let targetEmail = 'admin@lab.edu';
    let targetPassword = 'Admin@123456';
    if (role === 'Researcher') {
      targetEmail = 'researcher@lab.edu';
      targetPassword = 'Research@123456';
    } else if (role === 'Technician') {
      targetEmail = 'technician@lab.edu';
      targetPassword = 'Tech@123456';
    } else if (role === 'Student') {
      targetEmail = 'student@lab.edu';
      targetPassword = 'Student@123456';
    }
    setEmail(targetEmail);
    setPassword(targetPassword);
    setLoading(true);
    try {
      await login(targetEmail, targetPassword);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-900 overflow-hidden font-sans">
      {/* Left Hero Panel (matching screenshot 1) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#070D1E] items-center justify-center p-12 overflow-hidden border-r border-slate-800">
        {/* Background Image with dark blue gradient overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105"
          style={{ backgroundImage: `url('/assets/cyber_lab_hero.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#050B1A]/95 via-[#091530]/80 to-[#102A6B]/50" />

        {/* Ambient glow effects */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-lg space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>MSc Applied AI & Cybersecurity System</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight">
              CyberShield
            </h1>
            <p className="text-xl text-blue-200/90 font-medium">
              Adaptive Secure Smart Laboratory
            </p>
          </div>

          <p className="text-sm text-slate-300/80 leading-relaxed">
            Protecting cyber-physical laboratory infrastructure with an AI digital twin,
            risk-adaptive zero-trust access control, and privacy-preserving simulation.
          </p>

          {/* Core Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 text-xs text-slate-200">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Digital Twin Topology</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Risk-Adaptive Access</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Differential Privacy (ε)</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Isolation Forest AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Login Form Panel (matching screenshot 1) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center sm:text-left space-y-2">
            <div className="lg:hidden inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-2">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Login to CyberShield
            </h2>
            <p className="text-sm text-slate-500">
              Enter authorized laboratory credentials to access the security environment.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => alert('Development notice: Use demo buttons below for instant role-based access.')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/30 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials (matching screenshot 1) */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Login as (Development Demo)
            </p>
            <div className="grid grid-cols-4 gap-2">
              {(['Admin', 'Student', 'Researcher', 'Technician'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setDemoRole(role)}
                  className="py-1.5 px-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all text-center"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onNavigateToSignUp}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
