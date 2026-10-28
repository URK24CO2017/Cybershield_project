import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Key,
  Bell,
  Lock,
  Cpu,
  Server,
  CheckCircle2,
  Save
} from 'lucide-react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'General' | 'Security' | 'Access Policies' | 'Notifications' | 'Privacy Settings' | 'Digital Twin' | 'System'
  >('General');

  // Form states matching screenshot 11
  const [labName, setLabName] = useState('AI Research Laboratory');
  const [timeZone, setTimeZone] = useState('(UTC+0) London');
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [mfaEnabled, setMfaEnabled] = useState(true);

  // Security thresholds
  const [riskLowCutoff, setRiskLowCutoff] = useState('29');
  const [riskHighCutoff, setRiskHighCutoff] = useState('70');
  const [autoIsolate, setAutoIsolate] = useState(true);

  // Privacy defaults
  const [defaultEpsilon, setDefaultEpsilon] = useState('1.0');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.getSettings();
        if (data.lab_name) setLabName(data.lab_name);
        if (data.timezone) setTimeZone(data.timezone);
        if (data.session_timeout_minutes) setSessionTimeout(data.session_timeout_minutes);
        if (data.mfa_enabled !== undefined) setMfaEnabled(data.mfa_enabled === 'true');
        if (data.risk_low_cutoff) setRiskLowCutoff(data.risk_low_cutoff);
        if (data.risk_high_cutoff) setRiskHighCutoff(data.risk_high_cutoff);
        if (data.privacy_default_epsilon) setDefaultEpsilon(data.privacy_default_epsilon);
      } catch {
        // fallback
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.saveSettings({
        lab_name: labName,
        timezone: timeZone,
        session_timeout_minutes: sessionTimeout,
        mfa_enabled: String(mfaEnabled),
        risk_low_cutoff: riskLowCutoff,
        risk_high_cutoff: riskHighCutoff,
        auto_isolate_critical: String(autoIsolate),
        privacy_default_epsilon: defaultEpsilon,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'General', label: 'General', icon: SettingsIcon },
    { id: 'Security', label: 'Security', icon: Shield },
    { id: 'Access Policies', label: 'Access Policies', icon: Key },
    { id: 'Notifications', label: 'Notifications', icon: Bell },
    { id: 'Privacy Settings', label: 'Privacy Settings', icon: Lock },
    { id: 'Digital Twin', label: 'Digital Twin', icon: Cpu },
    { id: 'System', label: 'System', icon: Server },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Settings</h2>
        <p className="text-xs text-slate-500">
          Configure smart laboratory parameters, risk thresholds, and security preferences
        </p>
      </div>

      {/* 2-Column Split: Sub-nav on Left, Form on Right (matching screenshot 11) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sub-nav (4 cols) */}
        <div className="md:col-span-4 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Form Card (8 cols) */}
        <div className="md:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{activeSubTab} Settings</h3>
                <p className="text-xs text-slate-500">Parameters persist to SQLite database</p>
              </div>

              {savedSuccess && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved Changes
                </span>
              )}
            </div>

            {/* General SubTab (matching screenshot 11) */}
            {activeSubTab === 'General' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Laboratory Name</label>
                  <input
                    type="text"
                    value={labName}
                    onChange={(e) => setLabName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Time Zone</label>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium"
                  >
                    <option value="(UTC+0) London">(UTC+0) London</option>
                    <option value="(UTC+1) Berlin">(UTC+1) Berlin</option>
                    <option value="(UTC-5) New York">(UTC-5) New York</option>
                    <option value="(UTC+8) Singapore">(UTC+8) Singapore</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">Enable Multi-Factor Authentication</span>
                    <span className="text-[11px] text-slate-500">Require step-up verification for medium & high risk access</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMfaEnabled(!mfaEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      mfaEnabled ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 left-1 ${
                        mfaEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Security SubTab */}
            {activeSubTab === 'Security' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Low-Risk Cutoff Score</label>
                    <input
                      type="number"
                      value={riskLowCutoff}
                      onChange={(e) => setRiskLowCutoff(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Scores below this are granted automatically</span>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">High-Risk Cutoff Score</label>
                    <input
                      type="number"
                      value={riskHighCutoff}
                      onChange={(e) => setRiskHighCutoff(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Scores above this trigger auto-denial & alerts</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">Auto-Quarantine Critical Devices</span>
                    <span className="text-[11px] text-slate-500">Instantly isolate nodes when compromise score exceeds 80</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoIsolate(!autoIsolate)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      autoIsolate ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 left-1 ${
                        autoIsolate ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Privacy SubTab */}
            {activeSubTab === 'Privacy Settings' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Default Differential Privacy Epsilon (ε)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={defaultEpsilon}
                    onChange={(e) => setDefaultEpsilon(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Calibrated for smart lab access control aggregation</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 leading-relaxed">
                  Cryptographic HMAC-SHA256 salt is securely stored server-side in the backend environment.
                </div>
              </div>
            )}

            {/* Other SubTabs */}
            {['Access Policies', 'Notifications', 'Digital Twin', 'System'].includes(activeSubTab) && (
              <div className="p-6 text-center text-slate-500 text-xs">
                {activeSubTab} parameters are active and managed via automated microservices.
              </div>
            )}

            {/* Save Button (matching screenshot 11 bottom right) */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
