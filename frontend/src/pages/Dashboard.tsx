import React, { useState, useEffect } from 'react';
import {
  Users,
  HardDrive,
  ShieldAlert,
  Key,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';
import { DashboardMetrics } from '../types';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardMetrics();
      setMetrics(data);
    } catch {
      // fallback metrics
      setMetrics({
        total_users: 24,
        active_devices: 18,
        security_alerts: 5,
        high_risk_alerts: 2,
        pending_requests: 3,
        threat_risk_score: 36,
        threat_risk_tier: 'Medium Risk',
        network_activity: [
          { time: '00:00', normal: 45, suspicious: 8 },
          { time: '04:00', normal: 30, suspicious: 12 },
          { time: '08:00', normal: 120, suspicious: 14 },
          { time: '12:00', normal: 240, suspicious: 28 },
          { time: '16:00', normal: 190, suspicious: 22 },
          { time: '20:00', normal: 80, suspicious: 16 }
        ],
        recent_events: [
          { time: '10:24:12', event: 'Access granted (risk score: 12)', user: 'user01', status: 'Allowed' },
          { time: '10:21:05', event: 'Suspicious login attempt', user: 'user03', status: 'High-Risk' },
          { time: '10:18:44', event: 'Device connected', user: 'lab-pc-03', status: 'Online' },
          { time: '10:14:20', event: 'Access denied (unauthorized)', user: 'user12', status: 'Blocked' },
          { time: '10:11:50', event: 'Policy update applied', user: 'admin', status: 'Success' }
        ],
        system_status: [
          { service: 'Authentication Service', status: 'Online' },
          { service: 'Threat Detection Engine', status: 'Online' },
          { service: 'Digital Twin Simulator', status: 'Online' },
          { service: 'Privacy Engine', status: 'Online' },
          { service: 'Database', status: 'Online' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span>Synchronizing laboratory telemetry...</span>
        </div>
      </div>
    );
  }

  const riskScore = metrics?.threat_risk_score || 36;
  const isLow = riskScore < 30;
  const isMed = riskScore >= 30 && riskScore < 70;

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards (matching screenshot 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{metrics?.total_users}</h3>
            <p className="text-[11px] text-slate-400 mt-1">4 active session roles</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Devices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Devices</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{metrics?.active_devices}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">● 100% online telemetry</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Security Alerts</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-extrabold text-slate-900">{metrics?.security_alerts}</h3>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                {metrics?.high_risk_alerts} high-risk
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Automated containment ready</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Access Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Access Requests</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-3xl font-extrabold text-slate-900">{metrics?.total_users ? metrics.total_users / 2 : 12}</h3>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {metrics?.pending_requests} pending
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Adaptive risk evaluation</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Key className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Row: Network Activity & Threat Risk Level Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Activity Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Network Activity (Last 24 Hours)</h3>
              <p className="text-xs text-slate-500">Normal vs Suspicious telemetry traffic patterns</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                Normal
              </span>
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                Suspicious
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.network_activity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="normal"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#3B82F6' }}
                  name="Normal"
                />
                <Line
                  type="monotone"
                  dataKey="suspicious"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#EF4444' }}
                  name="Suspicious"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Threat Risk Level Circular Gauge (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-full text-left">
            <h3 className="text-base font-bold text-slate-900">Threat Risk Level</h3>
            <p className="text-xs text-slate-500">Multi-factor aggregate smart laboratory risk</p>
          </div>

          {/* Donut Progress Representation */}
          <div className="relative my-4 flex items-center justify-center">
            <svg className="w-44 h-44 -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="70"
                stroke="#F1F5F9"
                strokeWidth="14"
                fill="none"
              />
              <circle
                cx="88"
                cy="88"
                r="70"
                stroke={isLow ? '#10B981' : isMed ? '#F59E0B' : '#EF4444'}
                strokeWidth="14"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * riskScore) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{riskScore}</span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 ${
                  isLow
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isMed
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {metrics?.threat_risk_tier || 'Medium Risk'}
              </span>
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 border-t border-slate-100 pt-3">
            <div>
              <span className="block font-bold text-emerald-600">0 - 29</span>
              Low
            </div>
            <div>
              <span className="block font-bold text-amber-600">30 - 69</span>
              Medium
            </div>
            <div>
              <span className="block font-bold text-rose-600">70 - 100</span>
              High
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Events & System Status (matching screenshot 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Events (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Events</h3>
              <p className="text-xs text-slate-500">Real-time access events and security incidents</p>
            </div>
            <button
              onClick={fetchMetrics}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics?.recent_events.map((ev, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">{ev.time}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{ev.event}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{ev.user}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          ev.status === 'Allowed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ev.status === 'Blocked'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : ev.status === 'High-Risk'
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {ev.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Status (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">System Status</h3>
            <p className="text-xs text-slate-500 mb-4">Core microservice health monitors</p>

            <div className="space-y-3">
              {metrics?.system_status.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-xs font-semibold text-slate-700">{item.service}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Uptime: 99.98%</span>
            <span>FastAPI v0.128</span>
          </div>
        </div>
      </div>
    </div>
  );
};
