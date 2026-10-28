import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Key,
  Lock,
  Play,
  RotateCcw,
  Check,
  X,
  FileCheck
} from 'lucide-react';
import { api } from '../services/api';
import { AccessRequest, AccessPolicy, ActiveSession } from '../types';

export const AccessControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'tester' | 'sessions' | 'permissions' | 'policies'>('requests');
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [policies, setPolicies] = useState<AccessPolicy[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(false);

  // Live Access Tester State
  const [testRole, setTestRole] = useState('Student');
  const [testResource, setTestResource] = useState('Lab PC-01');
  const [testResourceType, setTestResourceType] = useState('Computer');
  const [testRiskModifier, setTestRiskModifier] = useState(0);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqData, polData, sessData] = await Promise.all([
        api.getAccessRequests(),
        api.getAccessPolicies(),
        api.getActiveSessions(),
      ]);
      setRequests(reqData);
      setPolicies(polData);
      setSessions(sessData);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (requestId: string, action: 'Approve' | 'Deny') => {
    try {
      await api.takeAccessAction(requestId, action);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    try {
      await api.revokeSession(sessionId);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEvaluateTest = async () => {
    setEvaluating(true);
    try {
      const res = await api.evaluateAccess({
        resource: testResource,
        resource_type: testResourceType,
        simulated_role: testRole,
        base_risk_modifier: testRiskModifier,
      });
      setTestResult(res);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs (matching screenshot 4) */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'requests'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Access Requests
        </button>
        <button
          onClick={() => setActiveTab('tester')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tester'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Decision Engine Simulator
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sessions'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Sessions
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'permissions'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Permissions Matrix
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'policies'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Access Policies
        </button>
      </div>

      {/* 3 Risk-Adaptive Decision Threshold Cards (matching screenshot 4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Low Risk */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-emerald-800">0 – 29</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                Low Risk
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 mt-0.5">Allow Access</p>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
              Allow only if user role has valid permission. High trust session.
            </p>
          </div>
        </div>

        {/* Medium Risk */}
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-amber-800">30 – 69</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                Medium Risk
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 mt-0.5">Extra Verification</p>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
              Requires MFA token, step-up challenge, or administrator approval.
            </p>
          </div>
        </div>

        {/* High Risk */}
        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-rose-800">70 – 100</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                High Risk
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 mt-0.5">Deny / Restrict</p>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
              Immediate denial, alert dispatch, and session quarantine.
            </p>
          </div>
        </div>
      </div>

      {/* Tab 1: Access Requests Table (matching screenshot 4) */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Access Requests</h3>
              <p className="text-xs text-slate-500">
                Zero-Trust evaluated resource access requests across laboratory components
              </p>
            </div>
            <button
              onClick={fetchData}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Refresh Table
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">#ID</th>
                  <th className="py-3 px-4">User (Pseudonym)</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">{req.request_id}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {req.user_pseudonym}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{req.resource}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          req.risk_score < 30
                            ? 'text-emerald-600'
                            : req.risk_score < 70
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {req.risk_score}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          req.decision === 'Allowed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.decision === 'Extra Verification'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {req.decision}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {req.decision === 'Extra Verification' ? (
                        <>
                          <button
                            onClick={() => handleAction(req.request_id, 'Approve')}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(req.request_id, 'Deny')}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors"
                          >
                            Deny
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => alert(`Request Details:\n\nID: ${req.request_id}\nUser: ${req.user_pseudonym}\nResource: ${req.resource}\nScore: ${req.risk_score}\nReason: ${req.reason || 'N/A'}`)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-md hover:bg-slate-200 transition-colors"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Decision Engine Simulator */}
      {activeTab === 'tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Adaptive Decision Simulator</h3>
              <p className="text-xs text-slate-500">
                Trigger real-time access evaluation against the Zero-Trust rule engine.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Simulated User Role</label>
                <select
                  value={testRole}
                  onChange={(e) => setTestRole(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Student">Student (Only authorized for Workstations & 3D Printers)</option>
                  <option value="Researcher">Researcher (Authorized for AI Servers & Workstations)</option>
                  <option value="Technician">Technician (Authorized for Sensors & Hardware)</option>
                  <option value="Administrator">Administrator (All resources authorized)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Resource</label>
                <select
                  value={testResource}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTestResource(val);
                    if (val.includes('PC')) setTestResourceType('Computer');
                    else if (val.includes('Server')) setTestResourceType('Server');
                    else if (val.includes('Printer')) setTestResourceType('3D Printer');
                    else if (val.includes('Database')) setTestResourceType('Database');
                    else setTestResourceType('Device');
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Lab PC-01">Lab PC-01 (Standard Workstation)</option>
                  <option value="Lab PC-03">Lab PC-03 (Flagged Workstation)</option>
                  <option value="Research Server">Research Server (High-Performance AI Cluster)</option>
                  <option value="Database">Database (Confidential Research Records)</option>
                  <option value="3D Printer">3D Printer (Industrial Fabrication)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Contextual Risk Modifier</label>
                  <span className="font-bold text-blue-600">{testRiskModifier > 0 ? `+${testRiskModifier}` : testRiskModifier}</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="60"
                  value={testRiskModifier}
                  onChange={(e) => setTestRiskModifier(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">Simulates abnormal geolocation, off-hours access, or endpoint hygiene decay.</p>
              </div>
            </div>

            <button
              onClick={handleEvaluateTest}
              disabled={evaluating}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {evaluating ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Evaluate Real-Time Decision
                </>
              )}
            </button>
          </div>

          {/* Test Result Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Engine Decision Outcome</h3>
              <p className="text-xs text-slate-500 mb-4">Live calculation from backend R-AAC service</p>

              {testResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border flex items-center justify-between bg-slate-50">
                    <div>
                      <p className="text-xs text-slate-500">Access Decision</p>
                      <h4 className="text-xl font-black mt-0.5">{testResult.decision}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Calculated Risk</p>
                      <span className="text-2xl font-black text-blue-600">{testResult.risk_score} / 100</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">User Pseudonym:</span>
                      <span className="font-mono font-bold text-slate-800">{testResult.user_pseudonym}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Target Resource:</span>
                      <span className="font-semibold text-slate-800">{testResult.resource}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Risk Tier:</span>
                      <span className="font-semibold text-slate-800">{testResult.tier}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-slate-500 block mb-1">Rule Engine Explanation:</span>
                      <p className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-blue-900 font-medium leading-relaxed">
                        {testResult.reason}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 text-xs">
                  Configure simulation parameters on the left and click "Evaluate Real-Time Decision" to run the Zero-Trust engine.
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 mt-4">
              <strong>Key Innovation Rule:</strong> Permission checks always take strict priority over risk scores. Even with risk score 0, an unauthorized role will be unconditionally rejected.
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Active Sessions */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Active Laboratory Sessions</h3>
            <p className="text-xs text-slate-500">Real-time authenticated sessions connected to lab devices</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Session ID</th>
                  <th className="py-3 px-4">User Pseudonym</th>
                  <th className="py-3 px-4">Device</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono text-slate-500">{sess.session_id}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{sess.user_pseudonym}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{sess.device_name}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{sess.ip_address}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {sess.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleRevoke(sess.session_id)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Permissions Matrix */}
      {activeTab === 'permissions' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Role-Based Access Control Matrix</h3>
            <p className="text-xs text-slate-500">Zero-Trust permission boundaries by role</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 border-b border-r border-slate-200">Role</th>
                  <th className="py-3 px-4 border-b border-r border-slate-200 text-center">Workstation Computers</th>
                  <th className="py-3 px-4 border-b border-r border-slate-200 text-center">HPC Servers</th>
                  <th className="py-3 px-4 border-b border-r border-slate-200 text-center">3D Printers</th>
                  <th className="py-3 px-4 border-b border-r border-slate-200 text-center">IoT Sensors</th>
                  <th className="py-3 px-4 border-b border-slate-200 text-center">Confidential Database</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-100">Administrator</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-emerald-600 font-bold">✓ Full</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-emerald-600 font-bold">✓ Full</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-emerald-600 font-bold">✓ Full</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-emerald-600 font-bold">✓ Full</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Full</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-100">Researcher</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-emerald-600 font-bold">✓ Authorized</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-emerald-600 font-bold">✓ Authorized</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-emerald-600 font-bold">✓ Authorized</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-emerald-600 font-bold">✓ Authorized</td>
                  <td className="py-3 px-4 text-center text-rose-500 font-bold">✕ Denied</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-100">Technician</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-emerald-600 font-bold">✓ Authorized</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-amber-500 font-bold">⚠ Approval Req</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-emerald-600 font-bold">✓ Authorized</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-emerald-600 font-bold">✓ Authorized</td>
                  <td className="py-3 px-4 text-center text-rose-500 font-bold">✕ Denied</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-100">Student</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-emerald-600 font-bold">✓ Authorized</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-rose-500 font-bold">✕ Denied</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-emerald-600 font-bold">✓ Authorized</td>
                  <td className="py-3 px-4 text-center border-r border-slate-100 text-rose-500 font-bold">✕ Denied</td>
                  <td className="py-3 px-4 text-center text-rose-500 font-bold">✕ Denied</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Access Policies */}
      {activeTab === 'policies' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Configured Access Policies</h3>
            <p className="text-xs text-slate-500">Fine-tune automated risk threshold boundaries</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((pol) => (
              <div key={pol.id} className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-slate-900">{pol.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {pol.resource_type}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{pol.description}</p>
                <div className="text-xs grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Required Role</span>
                    <span className="font-semibold text-slate-800">{pol.required_role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Auto Deny Above Risk</span>
                    <span className="font-bold text-rose-600">&gt;= {pol.auto_deny_above_risk}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
