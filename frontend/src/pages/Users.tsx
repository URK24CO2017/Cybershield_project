import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  RefreshCw,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingId(userId);
    try {
      await api.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    setUpdatingId(userId);
    try {
      await api.toggleUserStatus(userId, !currentStatus);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.pseudonym.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">User Management</h2>
          <p className="text-xs text-slate-500">
            Authorized laboratory directory, Role-Based Access Control (RBAC), and pseudonymized identifiers
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 transition-colors"
          title="Refresh Users"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or pseudonym (U_XXXX)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium"
        >
          <option value="All">All Roles</option>
          <option value="Administrator">Administrator</option>
          <option value="Researcher">Researcher</option>
          <option value="Technician">Technician</option>
          <option value="Student">Student</option>
        </select>
      </div>

      {/* User Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Pseudonym (HMAC)</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                        {u.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.full_name}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    {u.pseudonym}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{u.department}</td>
                  <td className="py-3 px-4">
                    {currentUser?.role === 'Administrator' ? (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={updatingId === u.id || u.id === currentUser.id}
                        className="p-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white cursor-pointer"
                      >
                        <option value="Administrator">Administrator</option>
                        <option value="Researcher">Researcher</option>
                        <option value="Technician">Technician</option>
                        <option value="Student">Student</option>
                      </select>
                    ) : (
                      <span className="font-bold text-slate-800">{u.role}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                        u.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {currentUser?.role === 'Administrator' && u.id !== currentUser.id && (
                      <button
                        onClick={() => handleToggleStatus(u.id, u.is_active)}
                        disabled={updatingId === u.id}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors ${
                          u.is_active
                            ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                            : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
