import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import {
  Shield, Plus, Edit2, Trash2, Search, X, CheckCircle,
  AlertCircle, ChevronLeft, ChevronRight, Clock, LogIn,
  LogOut, Calendar, TrendingUp, Users, Filter
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Guard {
  id: number;
  app_user_id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  profile_image: string | null;
  created_at: string;
  today_status: string | null;
  today_in_time: string | null;
  today_out_time: string | null;
}

interface AttendanceRecord {
  id: number;
  guard_id: number;
  guard_name: string;
  guard_phone: string;
  date: string;
  in_time: string | null;
  out_time: string | null;
  status: 'present' | 'absent' | 'half_day' | 'off';
  notes?: string;
}

interface AttendanceSummary {
  total_records: number;
  present_count: number;
  absent_count: number;
  half_day_count: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    blocked: 'bg-red-100 text-red-800',
    pending_verification: 'bg-yellow-100 text-yellow-800',
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    half_day: 'bg-yellow-100 text-yellow-800',
    off: 'bg-gray-100 text-gray-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

const fmt = (dt: string | null) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const calcDuration = (a: string | null, b: string | null) => {
  if (!a || !b) return '—';
  const diff = new Date(b).getTime() - new Date(a).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
};

// ─── Notification bar ─────────────────────────────────────────────────────────

const Notification: React.FC<{ msg: string; type: 'error' | 'success'; onClose: () => void }> = ({ msg, type, onClose }) => (
  <div className={`mb-4 p-3 rounded-lg border flex items-center justify-between text-sm ${
    type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
  }`}>
    <div className="flex items-center space-x-2">
      {type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
      <span>{msg}</span>
    </div>
    <button onClick={onClose}><X className="w-4 h-4" /></button>
  </div>
);

// ─── Guard Form Modal ─────────────────────────────────────────────────────────

interface GuardModalProps {
  guard: Partial<Guard> | null;
  onClose: () => void;
  onSaved: () => void;
  setError: (m: string) => void;
  setSuccess: (m: string) => void;
}

const GuardModal: React.FC<GuardModalProps> = ({ guard, onClose, onSaved, setError, setSuccess }) => {
  const isEdit = !!guard?.id;
  const [form, setForm] = useState({
    name: guard?.name || '',
    phone: guard?.phone || '',
    email: guard?.email || '',
    status: guard?.status || 'active',
    password: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let res;
      if (isEdit) {
        // updateUser accepts name, email, status
        res = await apiClient.updateUser(String(guard!.id), {
          name: form.name,
          email: form.email,
          status: form.status,
        });
      } else {
        res = await apiClient.createUser({
          name: form.name,
          phone: form.phone,
          email: form.email,
          password: form.password,
          role: 'guard',
          status: form.status,
        });
      }
      if (res.success) {
        setSuccess(isEdit ? 'Guard updated successfully!' : 'Guard created successfully!');
        onSaved();
        onClose();
      } else {
        setError(res.message || 'Operation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Guard' : 'Add New Guard'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone {!isEdit && '*'}</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required={!isEdit}
              disabled={isEdit}
              className={`w-full px-3 py-2 border rounded-lg ${isEdit ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
            />
            {isEdit && <p className="text-xs text-gray-400 mt-0.5">Phone cannot be changed after creation</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Guard' : 'Create Guard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

const DeleteConfirm: React.FC<{ guard: Guard; onConfirm: () => void; onClose: () => void }> = ({ guard, onConfirm, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
      <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
      <h2 className="text-lg font-semibold mb-1">Remove Guard?</h2>
      <p className="text-gray-500 text-sm mb-4">
        This will deactivate <strong>{guard.name}</strong>'s account. Their historical records will be preserved.
      </p>
      <div className="flex space-x-3">
        <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">Remove</button>
      </div>
    </div>
  </div>
);

// ─── Guards Tab ───────────────────────────────────────────────────────────────

const GuardsTab: React.FC<{ setError: (m: string) => void; setSuccess: (m: string) => void }> = ({ setError, setSuccess }) => {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editGuard, setEditGuard] = useState<Guard | null>(null);
  const [deleteGuard, setDeleteGuard] = useState<Guard | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await apiClient.getAdminGuards(params);
      if (res.success) {
        setGuards(res.data as Guard[]);
        setTotal(res.pagination?.total || 0);
      } else {
        setError(res.message || 'Failed to load guards');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load guards');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDelete = async () => {
    if (!deleteGuard) return;
    try {
      const res = await apiClient.deleteUser(String(deleteGuard.id));
      if (res.success) {
        setSuccess(`${deleteGuard.name} removed successfully`);
        setDeleteGuard(null);
        load();
      } else {
        setError(res.message || 'Delete failed');
      }
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  const todayBadge = (g: Guard) => {
    if (!g.today_status) return <span className="text-xs text-gray-400">Not marked</span>;
    if (g.today_in_time && !g.today_out_time)
      return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">On duty {fmt(g.today_in_time)}</span>;
    if (g.today_in_time && g.today_out_time)
      return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Shift done</span>;
    return <span className="text-xs text-gray-400">—</span>;
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search guards..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm w-52 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <button
          onClick={() => { setEditGuard(null); setShowModal(true); }}
          className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Guard</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading guards...</div>
        ) : guards.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Shield className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No guards found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guard</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Today</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {guards.map((g) => (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            {g.profile_image
                              ? <img src={g.profile_image} alt="" className="w-9 h-9 rounded-full object-cover" />
                              : <Shield className="w-4 h-4 text-green-600" />
                            }
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{g.name}</div>
                            <div className="text-xs text-gray-400">{g.app_user_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-700">{g.phone}</div>
                        <div className="text-xs text-gray-400">{g.email || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusBadge(g.status)}`}>
                          {g.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">{todayBadge(g)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(g.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => { setEditGuard(g); setShowModal(true); }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteGuard(g)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > 20 && (
              <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-gray-600">
                <span>Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total}</span>
                <div className="flex space-x-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page * 20 >= total}
                    className="px-3 py-1 border rounded disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <GuardModal
          guard={editGuard}
          onClose={() => setShowModal(false)}
          onSaved={load}
          setError={setError}
          setSuccess={setSuccess}
        />
      )}
      {deleteGuard && (
        <DeleteConfirm
          guard={deleteGuard}
          onConfirm={handleDelete}
          onClose={() => setDeleteGuard(null)}
        />
      )}
    </>
  );
};

// ─── Attendance Tab ───────────────────────────────────────────────────────────

const AttendanceTab: React.FC<{ setError: (m: string) => void }> = ({ setError }) => {
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [guardFilter, setGuardFilter] = useState('');
  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo, setDateTo] = useState(today);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadGuardList();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [page, guardFilter, dateFrom, dateTo, statusFilter]);

  const loadGuardList = async () => {
    try {
      const res = await apiClient.getAdminGuards({ limit: 100 });
      if (res.success) setGuards(res.data as Guard[]);
    } catch { /* ignore */ }
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 30, date_from: dateFrom, date_to: dateTo };
      if (guardFilter) params.guard_id = Number(guardFilter);
      if (statusFilter) params.status = statusFilter;

      const res = await apiClient.getAdminGuardAttendance(params);
      if (res.success) {
        const data = res.data as any;
        // sendPaginatedResponse puts records in data.data and summary in data.summary
        const rawData = Array.isArray(data) ? data : (data?.data ?? []);
        setRecords(rawData);
        setTotal(res.pagination?.total || 0);
        setSummary((data as any)?.summary ?? null);
      } else {
        setError(res.message || 'Failed to load attendance');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const presentRate = summary && summary.total_records > 0
    ? Math.round((summary.present_count / summary.total_records) * 100)
    : 0;

  return (
    <>
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <div className="bg-white rounded-lg border p-4">
            <p className="text-xs text-gray-500 mb-1">Total Records</p>
            <p className="text-2xl font-bold text-gray-800">{summary.total_records}</p>
          </div>
          <div className="bg-green-50 rounded-lg border border-green-100 p-4">
            <p className="text-xs text-green-600 mb-1">Present</p>
            <p className="text-2xl font-bold text-green-700">{summary.present_count}</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-100 p-4">
            <p className="text-xs text-red-600 mb-1">Absent</p>
            <p className="text-2xl font-bold text-red-700">{summary.absent_count}</p>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-blue-600">Attendance Rate</p>
              <TrendingUp className="w-3 h-3 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-700">{presentRate}%</p>
            <div className="mt-1 h-1.5 bg-blue-100 rounded-full">
              <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${presentRate}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Guard</label>
            <select
              value={guardFilter}
              onChange={(e) => { setGuardFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">All Guards</option>
              {guards.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="half_day">Half Day</option>
              <option value="off">Off</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading attendance records...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No attendance records for the selected range</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guard</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-sm text-gray-800">{r.guard_name}</div>
                        <div className="text-xs text-gray-400">{r.guard_phone}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusBadge(r.status)}`}>
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{fmt(r.in_time)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{fmt(r.out_time)}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{calcDuration(r.in_time, r.out_time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > 30 && (
              <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-gray-600">
                <span>Showing {((page - 1) * 30) + 1}–{Math.min(page * 30, total)} of {total}</span>
                <div className="flex space-x-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page * 30 >= total}
                    className="px-3 py-1 border rounded disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

// ─── Page Shell ───────────────────────────────────────────────────────────────

const AdminGuardManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'guards' | 'attendance'>('guards');
  const [error, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccessMsg] = useState<string | null>(null);

  const setError = (m: string) => {
    setErrorMsg(m);
    setTimeout(() => setErrorMsg(null), 5000);
  };
  const setSuccess = (m: string) => {
    setSuccessMsg(m);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  if (!user?.society_id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-sm text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">No Society Linked</h2>
          <button onClick={() => navigate('/admin/dashboard')} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span>Guard Management</span>
            </h1>
            <p className="text-sm text-gray-500">{user?.society_name}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Dashboard
            </button>
            <button onClick={logout} className="bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-0">
            <button
              onClick={() => setActiveTab('guards')}
              className={`flex items-center space-x-2 px-5 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'guards'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Guards</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center space-x-2 px-5 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {error && <Notification msg={error} type="error" onClose={() => setErrorMsg(null)} />}
        {success && <Notification msg={success} type="success" onClose={() => setSuccessMsg(null)} />}

        {activeTab === 'guards' && <GuardsTab setError={setError} setSuccess={setSuccess} />}
        {activeTab === 'attendance' && <AttendanceTab setError={setError} />}
      </div>
    </div>
  );
};

export default AdminGuardManagement;
