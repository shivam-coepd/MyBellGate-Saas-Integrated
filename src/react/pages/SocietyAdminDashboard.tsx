import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { 
  Users, Building2, DollarSign, AlertCircle, CheckCircle, 
  Clock, FileText, Bell, Shield, Package, Wrench 
} from 'lucide-react';

interface SocietyData {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  plan: string;
  code: string;
  total_flats: number;
  towers: number;
  user_statistics: {
    total_users: number;
    residents: number;
    guards: number;
    staff: number;
    admins: number;
    active_users: number;
    inactive_users: number;
  };
  financial_summary: {
    total_invoices: number;
    total_revenue: number;
    paid_revenue: number;
    pending_revenue: number;
    overdue_revenue: number;
  };
  helpdesk_summary: {
    total_tickets: number;
    open_tickets: number;
    in_progress_tickets: number;
    resolved_tickets: number;
  };
  assets_summary: {
    total_assets: number;
    active_assets: number;
  };
  total_vehicles: number;
  total_pets: number;
}

const SocietyAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [societyData, setSocietyData] = useState<SocietyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'buildings' | 'finance' | 'helpdesk'>('overview');

  useEffect(() => {
    if (user?.society_id) {
      loadSocietyData();
    }
  }, [user]);

  const loadSocietyData = async () => {
    try {
      setLoading(true);
      
      if (!user?.society_id) {
        console.error('No society_id found in user data');
        console.log('No society_id found in user data');
        setSocietyData(null);
        return;
      }

      // Try to get complete society data first
      const response = await apiClient.getCompleteSociety(user.society_id.toString());
      
      if (response.success && response.data) {
        setSocietyData(response.data as SocietyData);
      } else {
        console.error('API returned error or no data:', response.message);
        // If the endpoint doesn't work, try to build data from individual endpoints
        await loadSocietyDataFromIndividualEndpoints();
      }
    } catch (error) {
      console.error('Error loading society data:', error);
      // Try fallback to individual endpoints
      await loadSocietyDataFromIndividualEndpoints();
    } finally {
      setLoading(false);
    }
  };

  const loadSocietyDataFromIndividualEndpoints = async () => {
    try {
      if (!user) return;
      const societyId = user.society_id?.toString();
      if (!societyId) return;

      // Make parallel API calls similar to SuperAdminDashboard
      const [usersRes, buildingsRes, invoicesRes, ticketsRes] = await Promise.all([
        apiClient.getUsers({ society_id: societyId, limit: 1000 }),
        apiClient.getBuildingsBySociety(societyId),
        apiClient.getInvoices({ limit: 1000 }),
        apiClient.getTickets({ limit: 1000 }),
      ]);

      // Calculate statistics from the responses
      const users = usersRes.success ? (usersRes.data as any[]) || [] : [];
      const buildings = buildingsRes.success ? (buildingsRes.data as any[]) || [] : [];
      const invoices = invoicesRes.success ? (invoicesRes.data as any[]) || [] : [];
      const tickets = ticketsRes.success ? (ticketsRes.data as any[]) || [] : [];

      const residents = users.filter((u: any) => u.role === 'resident');
      const guards = users.filter((u: any) => u.role === 'guard');
      const staff = users.filter((u: any) => u.role === 'staff');
      const admins = users.filter((u: any) => u.role === 'admin');

      const totalFlats = buildings.reduce((sum: number, b: any) => sum + (b.total_flats || 0), 0);
      const occupiedFlats = buildings.reduce((sum: number, b: any) => sum + (b.occupied_flats || 0), 0);

      const paidRevenue = invoices
        .filter((i: any) => i.status === 'paid')
        .reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);
      const pendingRevenue = invoices
        .filter((i: any) => i.status === 'sent' || i.status === 'draft')
        .reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);
      const overdueRevenue = invoices
        .filter((i: any) => i.status === 'overdue')
        .reduce((sum: number, i: any) => sum + (i.total_amount || 0), 0);

      const openTickets = tickets.filter((t: any) => t.status === 'open').length;
      const inProgressTickets = tickets.filter((t: any) => t.status === 'in_progress').length;
      const resolvedTickets = tickets.filter((t: any) => t.status === 'resolved').length;

      // Build society data object
      const societyData: SocietyData = {
        id: user.society_id || 0,
        name: user.society_name || 'My Society',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        contact_person: '',
        contact_phone: '',
        contact_email: '',
        plan: 'professional',
        code: user.society_code || '',
        total_flats: totalFlats,
        towers: buildings.length,
        user_statistics: {
          total_users: users.length,
          residents: residents.length,
          guards: guards.length,
          staff: staff.length,
          admins: admins.length,
          active_users: users.filter((u: any) => u.status === 'active').length,
          inactive_users: users.filter((u: any) => u.status !== 'active').length,
        },
        financial_summary: {
          total_invoices: invoices.length,
          total_revenue: paidRevenue + pendingRevenue,
          paid_revenue: paidRevenue,
          pending_revenue: pendingRevenue,
          overdue_revenue: overdueRevenue,
        },
        helpdesk_summary: {
          total_tickets: tickets.length,
          open_tickets: openTickets,
          in_progress_tickets: inProgressTickets,
          resolved_tickets: resolvedTickets,
        },
        assets_summary: {
          total_assets: 0,
          active_assets: 0,
        },
        total_vehicles: 0,
        total_pets: 0,
      };

      setSocietyData(societyData);
    } catch (error) {
      console.error('Error loading society data from individual endpoints:', error);
      setSocietyData(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Show error if user doesn't have society_id
  if (!user?.society_id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Society Linked</h2>
          <p className="text-gray-600 mb-6">
            Your account is not linked to any society. Please contact the administrator to link your account to a society.
          </p>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Show error if society data failed to load
  if (!societyData && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Society Data</h2>
          <p className="text-gray-600 mb-6">
            There was an error loading the society data. Please try refreshing the page or contact support if the issue persists.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={loadSocietyData}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Retry
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = 
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
            <h1 className="text-2xl font-bold text-gray-800">{societyData?.name}</h1>
            <p className="text-gray-500">Admin Dashboard - {societyData?.city}, {societyData?.state}</p>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex space-x-4 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('buildings')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'buildings'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Buildings & Flats
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'finance'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Finance
          </button>
          <button
            onClick={() => setActiveTab('helpdesk')}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              activeTab === 'helpdesk'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Helpdesk
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && societyData && (
          <div>
            {/* Society Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Society Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Society Code</p>
                  <p className="font-semibold">{societyData.code}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Plan</p>
                  <p className="font-semibold capitalize">{societyData.plan}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Towers</p>
                  <p className="font-semibold">{societyData.towers}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Flats</p>
                  <p className="font-semibold">{societyData.total_flats}</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                title="Total Users"
                value={societyData.user_statistics.total_users}
                icon={<Users className="w-6 h-6 text-white" />}
                color="bg-blue-500"
              />
              <StatCard
                title="Active Users"
                value={societyData.user_statistics.active_users}
                icon={<CheckCircle className="w-6 h-6 text-white" />}
                color="bg-green-500"
              />
              <StatCard
                title="Total Revenue"
                value={`₹${societyData.financial_summary.total_revenue.toLocaleString()}`}
                icon={<DollarSign className="w-6 h-6 text-white" />}
                color="bg-purple-500"
              />
              <StatCard
                title="Open Tickets"
                value={societyData.helpdesk_summary.open_tickets}
                icon={<AlertCircle className="w-6 h-6 text-white" />}
                color="bg-orange-500"
              />
            </div>

            {/* User Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{societyData.user_statistics.residents}</p>
                  <p className="text-sm text-gray-600">Residents</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{societyData.user_statistics.guards}</p>
                  <p className="text-sm text-gray-600">Guards</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{societyData.user_statistics.staff}</p>
                  <p className="text-sm text-gray-600">Staff</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{societyData.user_statistics.admins}</p>
                  <p className="text-sm text-gray-600">Admins</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{societyData.user_statistics.inactive_users}</p>
                  <p className="text-sm text-gray-600">Inactive</p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-xl font-bold text-green-600">₹{societyData.financial_summary.total_revenue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Paid Revenue</p>
                  <p className="text-xl font-bold text-blue-600">₹{societyData.financial_summary.paid_revenue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pending Revenue</p>
                  <p className="text-xl font-bold text-yellow-600">₹{societyData.financial_summary.pending_revenue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Overdue Revenue</p>
                  <p className="text-xl font-bold text-red-600">₹{societyData.financial_summary.overdue_revenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Assets</p>
                    <p className="text-2xl font-bold">{societyData.assets_summary.total_assets}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Wrench className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Active Assets</p>
                    <p className="text-2xl font-bold">{societyData.assets_summary.active_assets}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Vehicles</p>
                    <p className="text-2xl font-bold">{societyData.total_vehicles}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">User Management</h2>
              <button 
                onClick={() => navigate('/admin/users')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Manage Users
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Residents"
                value={societyData?.user_statistics.residents || 0}
                icon={<Users className="w-6 h-6 text-white" />}
                color="bg-blue-500"
              />
              <StatCard
                title="Guards"
                value={societyData?.user_statistics.guards || 0}
                icon={<Shield className="w-6 h-6 text-white" />}
                color="bg-green-500"
              />
              <StatCard
                title="Staff"
                value={societyData?.user_statistics.staff || 0}
                icon={<Wrench className="w-6 h-6 text-white" />}
                color="bg-purple-500"
              />
              <StatCard
                title="Admins"
                value={societyData?.user_statistics.admins || 0}
                icon={<CheckCircle className="w-6 h-6 text-white" />}
                color="bg-yellow-500"
              />
            </div>
            <div className="text-center py-8">
              <button 
                onClick={() => navigate('/admin/users')}
                className="text-blue-500 hover:text-blue-600 underline"
              >
                Click here to access full user management interface
              </button>
            </div>
          </div>
        )}

        {activeTab === 'buildings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Buildings & Flats</h2>
              <button 
                onClick={() => navigate('/admin/buildings')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Manage Buildings
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Towers</p>
                <p className="text-2xl font-bold text-blue-600">{societyData?.towers}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Flats</p>
                <p className="text-2xl font-bold text-green-600">{societyData?.total_flats}</p>
              </div>
            </div>
            <div className="text-center py-8">
              <button 
                onClick={() => navigate('/admin/buildings')}
                className="text-blue-500 hover:text-blue-600 underline"
              >
                Click here to access full building and flat management interface
              </button>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Finance Management</h2>
              <button 
                onClick={() => navigate('/admin/accounting')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Manage Accounting
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-green-600">₹{societyData?.financial_summary.total_revenue.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Paid Revenue</p>
                <p className="text-xl font-bold text-blue-600">₹{societyData?.financial_summary.paid_revenue.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Pending Revenue</p>
                <p className="text-xl font-bold text-yellow-600">₹{societyData?.financial_summary.pending_revenue.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Overdue Revenue</p>
                <p className="text-xl font-bold text-red-600">₹{societyData?.financial_summary.overdue_revenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-center py-8">
              <button 
                onClick={() => navigate('/admin/accounting')}
                className="text-blue-500 hover:text-blue-600 underline"
              >
                Click here to access full accounting management interface
              </button>
            </div>
          </div>
        )}

        {activeTab === 'helpdesk' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Helpdesk Management</h2>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                Create Ticket
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-xl font-bold text-blue-600">{societyData?.helpdesk_summary.total_tickets}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Open Tickets</p>
                <p className="text-xl font-bold text-yellow-600">{societyData?.helpdesk_summary.open_tickets}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-xl font-bold text-orange-600">{societyData?.helpdesk_summary.in_progress_tickets}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-xl font-bold text-green-600">{societyData?.helpdesk_summary.resolved_tickets}</p>
              </div>
            </div>
            <p className="text-gray-500 text-center py-8">Helpdesk management interface coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocietyAdminDashboard;
