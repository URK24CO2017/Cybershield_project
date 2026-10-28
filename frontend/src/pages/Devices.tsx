import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Plus,
  Search,
  Filter,
  Monitor,
  Server,
  Printer,
  Radio,
  DoorClosed,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  X,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Device } from '../types';

export const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Add Device Form State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Computer');
  const [newLocation, setNewLocation] = useState('Lab Room A');
  const [newIp, setNewIp] = useState('');
  const [newMac, setNewMac] = useState('');
  const [newSpecs, setNewSpecs] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const data = await api.getDevices();
      setDevices(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createDevice({
        name: newName,
        device_type: newType,
        location: newLocation,
        ip_address: newIp || `192.168.1.${100 + devices.length}`,
        mac_address: newMac || `00:1A:2B:3C:4D:${(devices.length + 10).toString(16).toUpperCase()}`,
        specs: newSpecs || 'Ubuntu 22.04 LTS standard workstation',
      });
      setIsAddOpen(false);
      setNewName('');
      setNewSpecs('');
      fetchDevices();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this laboratory device?')) return;
    try {
      await api.deleteDevice(deviceId);
      fetchDevices();
      setSelectedDevice(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleQuarantine = async (device: Device) => {
    try {
      await api.toggleQuarantine(device.device_id, !device.is_isolated);
      fetchDevices();
      setSelectedDevice(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = devices.filter((dev) => {
    const matchesSearch =
      dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.device_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.ip_address.includes(searchQuery);
    const matchesLoc = filterLocation === 'All' || dev.location.includes(filterLocation);
    const matchesStat = filterStatus === 'All' || dev.status === filterStatus;
    return matchesSearch && matchesLoc && matchesStat;
  });

  return (
    <div className="space-y-6">
      {/* Header and Add Device button (matching screenshot 9) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Device Management</h2>
          <p className="text-xs text-slate-500">
            Registered cyber-physical lab hardware, network telemetry, and isolation controls
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by device name, ID, or IP..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="All">All Locations</option>
            <option value="Lab Room A">Lab Room A</option>
            <option value="Lab Room B">Lab Room B</option>
            <option value="Server Room">Server Room</option>
            <option value="Entrance">Lab Entrance</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Online">Online</option>
            <option value="Warning">Warning</option>
            <option value="High Risk">High Risk</option>
            <option value="Offline">Offline</option>
          </select>

          <button
            onClick={fetchDevices}
            className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 border border-slate-200"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Device Management Table (matching screenshot 9) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Device Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((dev) => (
                <tr key={dev.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">{dev.device_id}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{dev.name}</td>
                  <td className="py-3 px-4 text-slate-600">{dev.device_type}</td>
                  <td className="py-3 px-4 text-slate-600">{dev.location}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        dev.status === 'Online'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : dev.status === 'Warning'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : dev.status === 'High Risk'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {dev.is_isolated ? 'Quarantined' : dev.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {dev.status === 'High Risk' ? '1 min ago' : dev.status === 'Warning' ? '5 mins ago' : 'Live'}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => setSelectedDevice(dev)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleToggleQuarantine(dev)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                        dev.is_isolated
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100'
                          : 'text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {dev.is_isolated ? 'Reconnect' : 'Quarantine'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Device Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-base font-bold text-slate-900">Register New Laboratory Device</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDevice} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Device Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Lab PC-04"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Device Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Computer">Computer</option>
                    <option value="Server">Server</option>
                    <option value="3D Printer">3D Printer</option>
                    <option value="IoT Device">IoT Sensor</option>
                    <option value="Access Door">Access Door</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Laboratory Location</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Lab Room A">Lab Room A</option>
                    <option value="Lab Room B">Lab Room B</option>
                    <option value="Server Room">Server Room</option>
                    <option value="Lab Entrance">Lab Entrance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hardware / OS Specs</label>
                <input
                  type="text"
                  value={newSpecs}
                  onChange={(e) => setNewSpecs(e.target.value)}
                  placeholder="e.g. Ubuntu 22.04 LTS, 32GB RAM"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Registering...' : 'Add Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Device Details Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-base font-bold text-slate-900">{selectedDevice.name} Details</h3>
              <button
                onClick={() => setSelectedDevice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-500 block">Device ID</span>
                  <span className="font-bold font-mono text-slate-800">{selectedDevice.device_id}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-500 block">IP Address</span>
                  <span className="font-bold font-mono text-slate-800">{selectedDevice.ip_address}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-500 block">MAC Address</span>
                  <span className="font-bold font-mono text-slate-800">{selectedDevice.mac_address}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-500 block">Risk Score</span>
                  <span className="font-bold text-blue-600">{selectedDevice.risk_score} / 100</span>
                </div>
              </div>

              {selectedDevice.specs && (
                <div className="p-3 rounded-lg bg-slate-50">
                  <span className="text-slate-500 block font-semibold mb-0.5">Hardware Specs</span>
                  <p className="text-slate-700">{selectedDevice.specs}</p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(selectedDevice.device_id)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Device
                </button>
                <button
                  onClick={() => handleToggleQuarantine(selectedDevice)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    selectedDevice.is_isolated
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}
                >
                  {selectedDevice.is_isolated ? 'Reconnect' : 'Quarantine'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
