import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Calendar, Users, Target, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';

interface Poll {
  id: number;
  question: string;
  poll_type: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  created_at: string;
  created_by_name: string;
  totalVotes?: number;
}

const CommunicationsManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddPollModal, setShowAddPollModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    ends_at: '',
    poll_type: 'public'
  });

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getPolls({ limit: 100 });
      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data) ? response.data : (response.data as any).data || [];
        setPolls(dataArray);
      } else {
        throw new Error(response.message || 'Failed to load polls');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching polls');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoll.question || newPoll.options.filter(o => o.trim()).length < 2 || !newPoll.ends_at) {
      alert('Please fill out question, ends_at, and at least 2 options.');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.createPoll({
        question: newPoll.question,
        options: newPoll.options.filter(o => o.trim()),
        ends_at: newPoll.ends_at,
        poll_type: newPoll.poll_type
      });

      if (response.success) {
        setShowAddPollModal(false);
        setNewPoll({ question: '', options: ['', ''], ends_at: '', poll_type: 'public' });
        fetchPolls();
      } else {
        throw new Error(response.message || 'Failed to create poll');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  const addOptionField = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  const handleUpdatePollStatus = async (pollId: number, isActive: boolean) => {
    if (!window.confirm('Are you sure you want to change the status of this poll?')) return;
    try {
      setLoading(true);
      const response = await apiClient.updatePoll(pollId, { is_active: isActive });
      if (response.success) {
        fetchPolls();
      } else {
        throw new Error(response.message || 'Failed to update poll');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred while updating the poll');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = async (pollId: number) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) return;
    try {
      setLoading(true);
      const response = await apiClient.deletePoll(pollId);
      if (response.success) {
        fetchPolls();
      } else {
        throw new Error(response.message || 'Failed to delete poll');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred while deleting the poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <span>Communications & Polls</span>
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

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Active Polls</h2>
          <div className="space-x-3">
            <button 
              onClick={fetchPolls}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-200 transition"
            >
              Refresh
            </button>
            <button 
              onClick={() => setShowAddPollModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition flex items-center"
            >
              <Plus size={18} className="mr-1" /> Create Poll
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-10">
            <div className="text-gray-500">Loading polls...</div>
          </div>
        ) : polls.length === 0 ? (
          <div className="bg-white p-10 text-center rounded shadow">
            <div className="text-gray-500 text-lg">No polls found. Create one to gather feedback!</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => (
              <div key={poll.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      poll.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {poll.is_active ? 'Active' : 'Closed'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Target size={12} className="mr-1" /> {poll.poll_type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{poll.question}</h3>
                  <div className="text-sm text-gray-600 mb-4 space-y-1">
                    <div className="flex items-center"><Users size={14} className="mr-2" /> Created By: {poll.created_by_name}</div>
                    <div className="flex items-center"><Calendar size={14} className="mr-2" /> Ends: {new Date(poll.ends_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 flex justify-between items-center border-t">
                  <div className="space-x-2">
                    {poll.is_active ? (
                      <button onClick={() => handleUpdatePollStatus(poll.id, false)} className="text-sm font-medium text-orange-600 hover:underline">
                        Close Poll
                      </button>
                    ) : (
                      <button onClick={() => handleUpdatePollStatus(poll.id, true)} className="text-sm font-medium text-green-600 hover:underline">
                        Reopen Poll
                      </button>
                    )}
                  </div>
                  <button onClick={() => handleDeletePoll(poll.id)} className="text-sm font-medium text-red-600 hover:underline flex items-center">
                    <Trash2 size={14} className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddPollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New Poll</h2>
            <form onSubmit={handleCreatePoll}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                  <input
                    type="text"
                    required
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="E.g., What time should the gym open?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                  {newPoll.options.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      required={idx < 2}
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2"
                      placeholder={`Option ${idx + 1}`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addOptionField}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    + Add Option
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    required
                    value={newPoll.ends_at}
                    onChange={(e) => setNewPoll({ ...newPoll, ends_at: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poll Type</label>
                  <select
                    value={newPoll.poll_type}
                    onChange={(e) => setNewPoll({ ...newPoll, poll_type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="public">Public</option>
                    <option value="secret">Secret</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddPollModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationsManagement;
