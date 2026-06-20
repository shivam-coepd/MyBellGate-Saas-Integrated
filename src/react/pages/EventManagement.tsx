import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Calendar, Clock, MapPin, Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';

interface Event {
  id: number;
  title: string;
  category: string;
  event_date: string;
  event_time?: string;
  location?: string;
  organizer?: string;
  price?: string;
  tags?: string;
  cover_image?: string;
  attendees: number;
}

const EventManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Event',
    event_date: '',
    event_time: '',
    location: '',
    organizer: '',
    price: 'Free',
    tags: '',
    cover_image: '',
    description: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getEvents({ limit: 100 });
      if (response.success && response.data) {
        const dataArray = Array.isArray(response.data) ? response.data : (response.data as any).events || [];
        setEvents(dataArray);
      } else {
        throw new Error(response.message || 'Failed to load events');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      const response = await apiClient.deleteEvent(id);
      if (response.success) {
        setEvents(events.filter(e => e.id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete event');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        const response = await apiClient.updateEvent(editingEvent.id, formData);
        if (response.success) {
          fetchEvents();
          setIsModalOpen(false);
        } else {
          throw new Error(response.message);
        }
      } else {
        const response = await apiClient.createEvent(formData);
        if (response.success) {
          fetchEvents();
          setIsModalOpen(false);
        } else {
          throw new Error(response.message);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save event');
    }
  };

  const openModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title || '',
        category: event.category || 'Event',
        event_date: event.event_date || '',
        event_time: event.event_time || '',
        location: event.location || '',
        organizer: event.organizer || '',
        price: event.price || 'Free',
        tags: (event as any).tags || '',
        cover_image: (event as any).cover_image || '',
        description: (event as any).description || ''
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        category: 'Event',
        event_date: new Date().toISOString().split('T')[0],
        event_time: '',
        location: '',
        organizer: '',
        price: 'Free',
        tags: '',
        cover_image: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const [isUploading, setIsUploading] = useState(false);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "events");
      
      const token = localStorage.getItem('token') || (window as any).State?.token;
      const response = await fetch("https://app.mygatebell.com/backend/upload/file", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: fd
      });
      
      const result = await response.json();
      if (result.status && result.data?.url) {
        setFormData({ ...formData, cover_image: result.data.url });
      } else {
        alert("Upload failed: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <span>Event Management</span>
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
          <h2 className="text-xl font-bold text-gray-800">Events</h2>
          <div className="flex space-x-3">
            <button 
              onClick={fetchEvents}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-300"
            >
              Refresh
            </button>
            <button 
              onClick={() => openModal()}
              className="flex items-center space-x-1 bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
            >
              <Plus size={18} />
              <span>New Event</span>
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
          <div className="text-gray-500">Loading events...</div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white p-10 text-center rounded shadow">
          <div className="text-gray-500 text-lg">No events found.</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendees
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="text-xs text-gray-500">{event.category} • {event.price}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar size={14} className="mr-1 text-gray-400" />
                      {event.event_date}
                    </div>
                    {event.event_time && (
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock size={14} className="mr-1 text-gray-400" />
                        {event.event_time}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center">
                      <MapPin size={14} className="mr-1 text-gray-400" />
                      {event.location || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      By: {event.organizer || 'Society'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users size={16} className="mr-1 text-blue-500" /> 
                      <span className="font-medium text-gray-900">{event.attendees}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openModal(event)}
                      className="text-blue-600 hover:text-blue-900 mx-2"
                      title="Edit Event"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 hover:text-red-900 mx-2"
                      title="Delete Event"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
            </div>
            
            <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded p-2 focus:ring focus:ring-blue-200"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 focus:ring focus:ring-blue-200"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full border rounded p-2 focus:ring focus:ring-blue-200"
                    value={formData.event_date}
                    onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full border rounded p-2 focus:ring focus:ring-blue-200"
                    value={formData.event_time}
                    onChange={(e) => setFormData({...formData, event_time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 focus:ring focus:ring-blue-200"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 focus:ring focus:ring-blue-200"
                    value={formData.organizer}
                    onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 focus:ring focus:ring-blue-200"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    className="w-full border rounded p-2 focus:ring focus:ring-blue-200"
                    value={formData.tags}
                    placeholder="e.g. Festival, Community"
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 border rounded p-2 focus:ring focus:ring-blue-200"
                      value={formData.cover_image}
                      placeholder="Image URL or upload"
                      onChange={(e) => setFormData({...formData, cover_image: e.target.value})}
                    />
                    <label className={`flex items-center justify-center px-4 py-2 border rounded ${isUploading ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 cursor-pointer'}`}>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border rounded p-2 focus:ring focus:ring-blue-200"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;
