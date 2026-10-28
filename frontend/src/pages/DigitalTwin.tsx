import React, { useState, useEffect } from 'react';
import {
  Layers,
  Box,
  Monitor,
  Server,
  Printer,
  Radio,
  DoorClosed,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  X,
  Sliders,
  Cpu,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import { Device } from '../types';

export const DigitalTwin: React.FC = () => {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [quarantining, setQuarantining] = useState(false);

  const fetchTopology = async () => {
    try {
      setLoading(true);
      const data = await api.getTopology();
      setDevices(data.devices);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopology();
    const interval = setInterval(fetchTopology, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleQuarantine = async (device: Device) => {
    setQuarantining(true);
    try {
      const newIsolated = !device.is_isolated;
      await api.toggleQuarantine(device.device_id, newIsolated);
      await fetchTopology();
      setSelectedDevice((prev) => (prev ? { ...prev, is_isolated: newIsolated, status: newIsolated ? 'Offline' : 'Online' } : null));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setQuarantining(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Online':
        return { bg: 'bg-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-400', label: 'Online' };
      case 'Warning':
        return { bg: 'bg-amber-500', text: 'text-amber-700', ring: 'ring-amber-400', label: 'Warning' };
      case 'High Risk':
        return { bg: 'bg-rose-500', text: 'text-rose-700', ring: 'ring-rose-400', label: 'High Risk' };
      default:
        return { bg: 'bg-slate-400', text: 'text-slate-600', ring: 'ring-slate-300', label: 'Offline' };
    }
  };

  // Coords for 3D View pins (percentage based over isometric model)
  const pinCoordinates: Record<string, { top: string; left: string }> = {
    'Lab PC-01': { top: '48%', left: '18%' },
    'Lab PC-02': { top: '38%', left: '38%' },
    'Lab PC-03': { top: '64%', left: '44%' },
    '3D Printer': { top: '24%', left: '50%' },
    'Server': { top: '42%', left: '76%' },
    'Research Server': { top: '56%', left: '84%' },
    'IoT Sensor': { top: '70%', left: '20%' },
    'Access Door': { top: '74%', left: '70%' },
  };

  return (
    <div className="space-y-6">
      {/* Header bar with 3D / 2D View Switch and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Laboratory Digital Twin
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Live State Sync
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time virtual representation of laboratory smart nodes, sensors, and risk status
          </p>
        </div>

        {/* 3D / 2D View Toggle (matching screenshot 5 top-right button) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('3D')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === '3D'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              3D View
            </button>
            <button
              onClick={() => setViewMode('2D')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === '2D'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              2D View
            </button>
          </div>

          <button
            onClick={fetchTopology}
            className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 transition-colors"
            title="Refresh Digital Twin Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Digital Twin Canvas */}
      <div className="relative bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden min-h-[540px] flex items-center justify-center">
        {/* 3D Isometric View (matching screenshot 5) */}
        {viewMode === '3D' ? (
          <div className="relative w-full h-[580px] overflow-hidden flex items-center justify-center select-none">
            {/* Background 3D Render Image */}
            <img
              src="/assets/lab_isometric_twin.jpg"
              alt="Laboratory 3D Isometric Digital Twin"
              className="w-full h-full object-cover object-center filter brightness-95"
            />
            {/* Subtle high-tech grid overlay */}
            <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />

            {/* Interactive Floating Hotspots for devices (matching screenshot 5) */}
            {devices.map((dev) => {
              const coords = pinCoordinates[dev.name] || { top: '50%', left: '50%' };
              const badge = getStatusBadge(dev.status);

              return (
                <div
                  key={dev.id}
                  style={{ top: coords.top, left: coords.left }}
                  onClick={() => setSelectedDevice(dev)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20 transition-transform duration-200 hover:scale-110"
                >
                  {/* Floating Device Card Pill (matching screenshot 5) */}
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/95 border border-slate-200/90 shadow-lg backdrop-blur-md text-xs font-bold text-slate-900">
                    <span className="relative flex h-2.5 w-2.5">
                      {dev.status !== 'Offline' && (
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${badge.bg}`}
                        />
                      )}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${badge.bg}`} />
                    </span>
                    <span className="truncate max-w-[95px]">{dev.name}</span>
                    <span className={`text-[10px] font-bold ${badge.text}`}>
                      {dev.is_isolated ? 'Quarantined' : badge.label}
                    </span>
                  </div>

                  {/* Pulsing Target Dot */}
                  <div className="w-3 h-3 mx-auto mt-1 rounded-full bg-blue-500/50 border border-white animate-pulse shadow-md" />
                </div>
              );
            })}
          </div>
        ) : (
          /* 2D Topological View */
          <div className="w-full h-[580px] p-6 bg-slate-900 text-white flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Room A */}
              <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/30 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-300">Room A: Workstations Subnet (192.168.1.100/24)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">Workstation Zone</span>
                </div>
                <div className="grid grid-cols-2 gap-3 my-4">
                  {devices.filter((d) => (d.location || '').includes('Room A') || (d.location || '').includes('Room 301')).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDevice(d)}
                      className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-blue-400 text-left transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{d.name}</span>
                        <span className={`w-2 h-2 rounded-full ${getStatusBadge(d.status).bg}`} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">{d.ip_address}</span>
                      <span className="text-[10px] font-semibold text-slate-300 mt-1 block">Risk: {d.risk_score}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">Heuristic endpoint monitoring active</p>
              </div>

              {/* Server Room */}
              <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/30 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-300">Server Room: HPC & Database (Restricted)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">Zero-Trust Zone</span>
                </div>
                <div className="grid grid-cols-2 gap-3 my-4">
                  {devices.filter((d) => (d.location || '').includes('Server')).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDevice(d)}
                      className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-purple-400 text-left transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{d.name}</span>
                        <span className={`w-2 h-2 rounded-full ${getStatusBadge(d.status).bg}`} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">{d.ip_address}</span>
                      <span className="text-[10px] font-semibold text-slate-300 mt-1 block">Risk: {d.risk_score}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">Encrypted internal bus telemetry</p>
              </div>

              {/* Room B */}
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/30 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-300">Room B: 3D Printing & Additive Fabrication</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">Prototyping Zone</span>
                </div>
                <div className="grid grid-cols-2 gap-3 my-4">
                  {devices.filter((d) => (d.location || '').includes('Room B') || (d.location || '').includes('Fabrication')).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDevice(d)}
                      className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-amber-400 text-left transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{d.name}</span>
                        <span className={`w-2 h-2 rounded-full ${getStatusBadge(d.status).bg}`} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">{d.ip_address}</span>
                      <span className="text-[10px] font-semibold text-slate-300 mt-1 block">Risk: {d.risk_score}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">Micro-controller API monitoring</p>
              </div>

              {/* Lab Entrance & Physical IoT Gate */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-300">Entrance & Environmental Gateway</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Physical Security</span>
                </div>
                <div className="grid grid-cols-2 gap-3 my-4">
                  {devices.filter((d) => d.device_type === 'Access Door' || d.device_type === 'IoT Device' || (d.device_type || '').includes('IoT') || (d.device_type || '').includes('Access')).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDevice(d)}
                      className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-emerald-400 text-left transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{d.name}</span>
                        <span className={`w-2 h-2 rounded-full ${getStatusBadge(d.status).bg}`} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">{d.ip_address}</span>
                      <span className="text-[10px] font-semibold text-slate-300 mt-1 block">Risk: {d.risk_score}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">RFID & Biometric door telemetry</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Legend Overlay (matching screenshot 5 bottom center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-white/95 border border-slate-200/90 shadow-xl backdrop-blur-md flex items-center gap-6 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Offline</span>
          </div>
        </div>
      </div>

      {/* Device Details Telemetry Modal / Drawer */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedDevice.name}</h3>
                  <p className="text-xs text-slate-500">{selectedDevice.location} • {selectedDevice.device_id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDevice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Telemetry Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">IP Address</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{selectedDevice.ip_address}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">MAC Address</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{selectedDevice.mac_address}</span>
                </div>
              </div>

              {/* Risk Level Gauge */}
              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Device Risk Assessment</span>
                  <span className="font-black text-sm text-blue-600">{selectedDevice.risk_score} / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      selectedDevice.risk_score < 30
                        ? 'bg-emerald-500'
                        : selectedDevice.risk_score < 70
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${selectedDevice.risk_score}%` }}
                  />
                </div>
              </div>

              {/* Hardware Specs */}
              {selectedDevice.specs && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-semibold block mb-0.5">Hardware & Telemetry OS</span>
                  <p className="text-slate-700 font-medium">{selectedDevice.specs}</p>
                </div>
              )}

              {/* Live Virtual Telemetry */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">CPU Load</span>
                  <span className="font-bold text-slate-800 text-sm">24%</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Memory</span>
                  <span className="font-bold text-slate-800 text-sm">4.2 GB</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Network RX</span>
                  <span className="font-bold text-slate-800 text-sm">1.8 MB/s</span>
                </div>
              </div>
            </div>

            {/* Footer with Quarantine Action */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Quarantine Isolation</span>
                <span className="text-[10px] text-slate-500">Sever network communication immediately</span>
              </div>
              <button
                onClick={() => handleToggleQuarantine(selectedDevice)}
                disabled={quarantining}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedDevice.is_isolated
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                }`}
              >
                {quarantining ? 'Executing...' : selectedDevice.is_isolated ? 'Reconnect Device' : 'Quarantine Device'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
