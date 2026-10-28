import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Filter,
  Search,
  Calendar,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { AuditLog } from '../types';

export const LogsReports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Access' | 'Security' | 'System' | 'Reports'>('Access');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [deviceFilter, setDeviceFilter] = useState('All');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getLogs({
        log_type: activeTab === 'Reports' ? undefined : activeTab,
        event_type: eventTypeFilter === 'All' ? undefined : eventTypeFilter,
        user_pseudonym: userFilter === 'All' ? undefined : userFilter,
        device: deviceFilter === 'All' ? undefined : deviceFilter,
      });
      setLogs(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  const handleExportCSV = () => {
    window.open(`/api/logs/export-csv?log_type=${activeTab === 'Reports' ? 'All' : activeTab}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header and Tabs (matching screenshot 10) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Logs & Reports</h2>
          <p className="text-xs text-slate-500">
            Immutable audit trails, security event telemetry, and downloadable compliance reports
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {(['Access', 'Security', 'System', 'Reports'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'Reports' ? 'Reports' : `${tab} Logs`}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar (matching screenshot 10) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Date Pickers */}
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span>From</span>
            <input
              type="date"
              defaultValue="2026-06-01"
              className="p-1.5 rounded-lg border border-slate-200 bg-white"
            />
            <span>To</span>
            <input
              type="date"
              defaultValue="2026-06-30"
              className="p-1.5 rounded-lg border border-slate-200 bg-white"
            />
          </div>

          {/* Event Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Event Type:</span>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="All">All Events</option>
              <option value="Access granted">Access granted</option>
              <option value="Access denied">Access denied</option>
              <option value="Device connected">Device connected</option>
              <option value="Suspicious login">Suspicious login</option>
              <option value="Policy updated">Policy updated</option>
            </select>
          </div>

          {/* User Pseudonym Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">User:</span>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="All">All</option>
              <option value="U_A7F5E2">U_A7F5E2</option>
              <option value="U_B9C1D4">U_B9C1D4</option>
              <option value="U_C3F601">U_C3F601</option>
              <option value="System">System</option>
            </select>
          </div>

          {/* Device Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Device:</span>
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="All">All</option>
              <option value="Lab PC-01">Lab PC-01</option>
              <option value="Lab PC-03">Lab PC-03</option>
              <option value="Server">Server</option>
              <option value="Research Server">Research Server</option>
              <option value="3D Printer">3D Printer</option>
            </select>
          </div>
        </div>

        {/* Filter and Export Buttons (matching screenshot 10) */}
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xs"
          >
            Filter
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Main Content: Table or Reports */}
      {activeTab !== 'Reports' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">User (Pseudonym)</th>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '10:24:12'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.event_type}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{log.user_pseudonym}</td>
                    <td className="py-3 px-4 text-slate-700">{log.device_name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          log.risk_score < 30
                            ? 'text-emerald-600'
                            : log.risk_score < 70
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {log.risk_score}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          log.outcome === 'Allowed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.outcome === 'Denied'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : log.outcome === 'Investigating'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {log.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Reports Summary Tab */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Monthly Audit Volume</span>
            <h3 className="text-3xl font-black text-slate-900">1,482</h3>
            <p className="text-xs text-slate-500">Total access decisions recorded</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">High Risk Denials</span>
            <h3 className="text-3xl font-black text-rose-600">38</h3>
            <p className="text-xs text-slate-500">Automated threat containment blocks</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Privacy Compliance Index</span>
            <h3 className="text-3xl font-black text-emerald-600">99.4%</h3>
            <p className="text-xs text-slate-500">Strict pseudonymization verification</p>
          </div>
        </div>
      )}
    </div>
  );
};
