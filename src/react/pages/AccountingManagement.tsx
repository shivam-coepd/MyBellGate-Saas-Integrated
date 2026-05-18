import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { DollarSign, FileText, Plus, Receipt, CreditCard, Clock } from 'lucide-react';

interface ChargeHead {
  id: string;
  name: string;
  description: string;
  charge_type: string;
  amount: number;
  gst_rate: number;
  is_active: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  flat_number: string;
  resident_name: string;
  total_amount: number;
  total_gst: number;
  status: string;
  invoice_date: string;
  due_date: string;
}

const AccountingManagement: React.FC = () => {
  const { user } = useAuth();
  const [chargeHeads, setChargeHeads] = useState<ChargeHead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'charge-heads' | 'invoices'>('overview');
  const [showAddChargeHeadModal, setShowAddChargeHeadModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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
          <DollarSign className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Society Linked</h2>
          <p className="text-gray-600 mb-6">
            Your account is not linked to any society. Please contact the administrator to link your account to a society.
          </p>
          <button
            onClick={() => window.location.href = '/admin/dashboard'}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const [chargeHeadsRes, invoicesRes] = await Promise.all([
        apiClient.getChargeHeads({ is_active: 1 }),
        apiClient.getInvoices(),
      ]);

      if (chargeHeadsRes.success) {
        setChargeHeads(chargeHeadsRes.data as ChargeHead[]);
      } else {
        console.error('Charge heads API error:', chargeHeadsRes.message);
        setChargeHeads([]);
      }
      
      if (invoicesRes.success) {
        setInvoices(invoicesRes.data as Invoice[]);
      } else {
        console.error('Invoices API error:', invoicesRes.message);
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error loading accounting data:', error);
      setChargeHeads([]);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChargeHead = async (data: any) => {
    try {
      const response = await apiClient.createChargeHead(data);
      if (response.success) {
        alert('Charge head created successfully');
        setShowAddChargeHeadModal(false);
        loadData();
      }
    } catch (error) {
      alert('Error creating charge head');
    }
  };

  const handleCreateInvoice = async (data: any) => {
    try {
      const response = await apiClient.createInvoice(data);
      if (response.success) {
        alert('Invoice created successfully');
        setShowCreateInvoiceModal(false);
        loadData();
      }
    } catch (error) {
      alert('Error creating invoice');
    }
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const paidRevenue = invoices
    .filter(inv => inv.status === 'paid' || inv.status === 'partially_paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);
  const pendingRevenue = invoices
    .filter(inv => inv.status === 'draft' || inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

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
            <h1 className="text-2xl font-bold text-gray-800">Accounting Management</h1>
            <p className="text-gray-500">Manage invoices, payments, and charge heads</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setShowAddChargeHeadModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Charge Head</span>
            </button>
            <button
              onClick={() => setShowCreateInvoiceModal(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
            >
              <FileText className="w-5 h-5" />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('charge-heads')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'charge-heads'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Charge Heads ({chargeHeads.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'invoices'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Invoices ({invoices.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                title="Total Revenue"
                value={`₹${totalRevenue.toLocaleString()}`}
                icon={<DollarSign className="w-6 h-6 text-white" />}
                color="bg-blue-500"
              />
              <StatCard
                title="Paid Revenue"
                value={`₹${paidRevenue.toLocaleString()}`}
                icon={<Receipt className="w-6 h-6 text-white" />}
                color="bg-green-500"
              />
              <StatCard
                title="Pending Revenue"
                value={`₹${pendingRevenue.toLocaleString()}`}
                icon={<Clock className="w-6 h-6 text-white" />}
                color="bg-yellow-500"
              />
              <StatCard
                title="Total Invoices"
                value={invoices.length}
                icon={<FileText className="w-6 h-6 text-white" />}
                color="bg-purple-500"
              />
            </div>

            {/* Recent Invoices */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Invoices</h2>
              {invoices.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No invoices yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resident</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoices.slice(0, 10).map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="px-6 py-4 font-medium">{invoice.invoice_number}</td>
                          <td className="px-6 py-4">{invoice.resident_name}</td>
                          <td className="px-6 py-4">₹{invoice.total_amount.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{invoice.invoice_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'charge-heads' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Charge Heads</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {chargeHeads.map((charge) => (
                    <tr key={charge.id}>
                      <td className="px-6 py-4">
                        <div className="font-medium">{charge.name}</div>
                        {charge.description && (
                          <div className="text-sm text-gray-500">{charge.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 capitalize">{charge.charge_type}</td>
                      <td className="px-6 py-4">₹{charge.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">{charge.gst_rate}%</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          charge.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {charge.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">All Invoices</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resident</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 font-medium">{invoice.invoice_number}</td>
                      <td className="px-6 py-4">{invoice.flat_number}</td>
                      <td className="px-6 py-4">{invoice.resident_name}</td>
                      <td className="px-6 py-4">₹{invoice.total_amount.toLocaleString()}</td>
                      <td className="px-6 py-4">₹{invoice.total_gst.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{invoice.due_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Charge Head Modal */}
      {showAddChargeHeadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add Charge Head</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateChargeHead({
                  name: formData.get('name'),
                  description: formData.get('description'),
                  charge_type: formData.get('charge_type'),
                  amount: parseFloat(formData.get('amount') as string),
                  gst_rate: parseFloat(formData.get('gst_rate') as string),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" name="name" className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" className="w-full px-4 py-2 border rounded-lg" rows={2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Charge Type</label>
                <select name="charge_type" className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="fixed">Fixed</option>
                  <option value="per_area">Per Area</option>
                  <option value="per_person">Per Person</option>
                  <option value="slab">Slab</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" name="amount" step="0.01" className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                <input type="number" name="gst_rate" step="0.01" defaultValue="18" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddChargeHeadModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Create Invoice</h2>
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded mb-4">
              For invoice creation, please use the detailed invoice form. This is a simplified interface.
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Flat ID</label>
                <input type="number" className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input type="date" className="w-full px-4 py-2 border rounded-lg" required />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingManagement;
