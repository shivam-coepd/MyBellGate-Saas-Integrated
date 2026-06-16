import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import NotificationBell from '../components/NotificationBell';
import { Users, Building2, TrendingUp, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface DashboardStats {
  totalSocieties: number;
  approved: number;
  pending: number;
  verified: number;
  newLeads: number;
  underReview: number;
  totalAdmins: number;
  totalResidents: number;
  trend: { month: string; count: number }[];
  planDist: { plan: string; count: number }[];
}

interface Registration {
  id: string;
  societyName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  towers: number;
  totalFlats: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  gst: string;
  pan: string;
  message: string;
  status: string;
  createdAt: string;
}

interface Society {
  id: string;
  name: string;
  city: string;
  state: string;
  contactEmail: string;
  contactPhone: string;
  plan: string;
  status: string;
  code: string;
  createdAt: string;
}

const SuperAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registrations' | 'societies'>('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, regsRes, socsRes] = await Promise.all([
        apiClient.getSuperAdminStats(),
        apiClient.getRegistrations(),
        apiClient.getSocieties(),
      ]);

      if (statsRes.success) setStats(statsRes.data as DashboardStats);
      if (regsRes.success) setRegistrations(regsRes.data as Registration[]);
      if (socsRes.success) setSocieties(socsRes.data as Society[]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRegistration = async (id: string) => {
    try {
      const response = await apiClient.approveRegistration(id);
      if (response.success) {
        alert('Registration approved successfully!');
        loadDashboardData();
      }
    } catch (error) {
      alert('Error approving registration');
    }
  };

  const handleUpdateRegistrationStatus = async (id: string, status: string) => {
    try {
      const response = await apiClient.updateRegistration(id, { status });
      if (response.success) {
        alert('Registration status updated!');
        loadDashboardData();
      }
    } catch (error) {
      alert('Error updating registration');
    }
  };

  const handleApproveSociety = async (id: string) => {
    try {
      const response = await apiClient.approveSociety(id, { approvedBy: user?.id });
      if (response.success) {
        alert('Society approved successfully!');
        loadDashboardData();
      }
    } catch (error) {
      alert('Error approving society');
    }
  };

  const handleSuspendSociety = async (id: string) => {
    try {
      const response = await apiClient.suspendSociety(id);
      if (response.success) {
        alert('Society suspended successfully!');
        loadDashboardData();
      }
    } catch (error) {
      alert('Error suspending society');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = 
    ({ title, value, icon, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">MyGate Super Admin</h1>
            <p className="text-gray-500">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'registrations'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Registrations ({registrations.length})
          </button>
          <button
            onClick={() => setActiveTab('societies')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'societies'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Societies ({societies.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && stats && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Societies"
                value={stats.totalSocieties}
                icon={<Building2 className="w-6 h-6 text-white" />}
                color="bg-blue-500"
              />
              <StatCard
                title="New Leads"
                value={stats.newLeads}
                icon={<AlertCircle className="w-6 h-6 text-white" />}
                color="bg-yellow-500"
              />
              <StatCard
                title="Total Admins"
                value={stats.totalAdmins}
                icon={<Users className="w-6 h-6 text-white" />}
                color="bg-green-500"
              />
              <StatCard
                title="Total Residents"
                value={stats.totalResidents}
                icon={<Users className="w-6 h-6 text-white" />}
                color="bg-purple-500"
              />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Approved"
                value={stats.approved}
                icon={<CheckCircle className="w-6 h-6 text-white" />}
                color="bg-green-600"
              />
              <StatCard
                title="Pending"
                value={stats.pending}
                icon={<Clock className="w-6 h-6 text-white" />}
                color="bg-yellow-600"
              />
              <StatCard
                title="Under Review"
                value={stats.underReview}
                icon={<AlertCircle className="w-6 h-6 text-white" />}
                color="bg-orange-500"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Signups</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {stats.trend.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div
                        className="bg-blue-500 rounded-t"
                        style={{ height: `${(item.count / Math.max(...stats.trend.map(t => t.count))) * 100}%` }}
                      />
                      <span className="text-xs mt-2">{item.month}</span>
                      <span className="text-sm font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Plan Distribution</h3>
                <div className="space-y-4">
                  {stats.planDist.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="capitalize">{item.plan}</span>
                      <div className="flex items-center space-x-4">
                        <div className="w-48 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(item.count / stats.totalSocieties) * 100}%` }}
                          />
                        </div>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Society Registrations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Society</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {registrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{reg.societyName}</div>
                          <div className="text-sm text-gray-500">{reg.towers} towers, {reg.totalFlats} flats</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{reg.city}, {reg.state}</div>
                        <div className="text-sm text-gray-500">{reg.pincode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{reg.contactName}</div>
                        <div className="text-sm text-gray-500">{reg.contactEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          reg.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          reg.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                          reg.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {reg.status === 'new' && (
                            <>
                              <button
                                onClick={() => handleUpdateRegistrationStatus(reg.id, 'under_review')}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Review
                              </button>
                              <button
                                onClick={() => handleApproveRegistration(reg.id)}
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                Approve
                              </button>
                            </>
                          )}
                          {reg.status === 'under_review' && (
                            <button
                              onClick={() => handleApproveRegistration(reg.id)}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'societies' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">All Societies</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Society</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {societies.map((soc) => (
                    <tr key={soc.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{soc.name}</div>
                          <div className="text-sm text-gray-500">{soc.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{soc.city}, {soc.state}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-sm text-gray-900">{soc.plan}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          soc.status === 'approved' ? 'bg-green-100 text-green-800' :
                          soc.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                          soc.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {soc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {soc.status === 'verified' && (
                            <button
                              onClick={() => handleApproveSociety(soc.id)}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              Approve
                            </button>
                          )}
                          {soc.status === 'approved' && (
                            <button
                              onClick={() => handleSuspendSociety(soc.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
