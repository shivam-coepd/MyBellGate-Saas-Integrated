import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { Building2, Plus, Edit, Trash2, Layers, Home } from 'lucide-react';

interface Building {
  id: string;
  name: string;
  society_id: number;
  total_floors: number;
  description: string;
  created_at: string;
}

interface Flat {
  id: string;
  flat_number: string;
  flat_type: '1RK' | '1BHK' | '2BHK' | '3BHK' | '4BHK' | '4BHK+';
  floor_number: string | null;
  area_sqft: number | null;
  building_id: string;
  owner_id: string | null;
  tenant_id: string | null;
  society_id: number;
  is_occupied: boolean;
}

const BuildingManagement: React.FC = () => {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buildings' | 'flats'>('buildings');
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [showAddFlatsModal, setShowAddFlatsModal] = useState(false);

  useEffect(() => {
    if (user?.society_id) {
      loadBuildings();
    }
  }, [user]);

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
          <Building2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
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

  useEffect(() => {
    if (selectedBuilding) {
      loadFlats(selectedBuilding.id);
    }
  }, [selectedBuilding]);

  const loadBuildings = async () => {
    try {
      setLoading(true);
      
      if (!user?.society_id) {
        console.error('No society_id found in user data');
        setBuildings([]);
        return;
      }
      
      const response = await apiClient.getBuildingsBySociety(user.society_id.toString());
      if (response.success) {
        setBuildings(response.data as Building[]);
      } else {
        console.error('API returned error:', response.message);
        setBuildings([]);
      }
    } catch (error) {
      console.error('Error loading buildings:', error);
      setBuildings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFlats = async (buildingId: string) => {
    try {
      const response = await apiClient.getFlatsByBuilding(buildingId);
      if (response.success) {
        setFlats((response.data as any).flats as Flat[]);
      } else {
        console.error('API returned error:', response.message);
        setFlats([]);
      }
    } catch (error) {
      console.error('Error loading flats:', error);
      setFlats([]);
    }
  };

  const handleCreateBuilding = async (data: any) => {
    try {
      const response = await apiClient.createBuilding({
        ...data,
        society_id: user?.society_id,
      });
      if (response.success) {
        alert('Building created successfully');
        setShowAddBuildingModal(false);
        loadBuildings();
      }
    } catch (error) {
      alert('Error creating building');
    }
  };

  const handleCreateFlats = async (data: any) => {
    try {
      const response = await apiClient.createSingleFlatWithOwner({
        building_id: selectedBuilding!.id,
        flat_number: data.flat_number,
        flat_type:  data.flat_type,
        floor_number: data.floor_number || '',
        area_sqft: data.area_sqft ? parseFloat(data.area_sqft) : null,
        society_id: user?.society_id || 0,
        user_role: data.user_role || 'owner',
        occupancy_status: data.occupancy_status || 'residing',
        owner: {
          name: data.owner_name,
          email: data.owner_email || null,
          phone: data.owner_phone,
          password: data.owner_password,
          role: 'resident',
          society_id: user?.society_id || 0,
          resident_type: 'owner',
          bio: null,
          profession: null,
          hometown: null,
          cover_image_url: null,
          profile_image: null,
        },
      });
      if (response.success) {
        alert('Flat and owner added successfully');
        setShowAddFlatsModal(false);
        if (selectedBuilding) {
          loadFlats(selectedBuilding.id);
        }
      }
    } catch (error) {
      alert('Error creating flat: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Building & Flat Management</h1>
            <p className="text-gray-500">Manage buildings and flats in your society</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setShowAddBuildingModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
            >
              <Building2 className="w-5 h-5" />
              <span>Add Building</span>
            </button>
            {selectedBuilding && (
              <button
                onClick={() => setShowAddFlatsModal(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Add Flats</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Buildings List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Buildings</span>
                </h2>
              </div>
              <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : buildings.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No buildings found</div>
                ) : (
                  buildings.map((building) => (
                    <div
                      key={building.id}
                      onClick={() => setSelectedBuilding(building)}
                      className={`p-4 rounded-lg cursor-pointer transition ${
                        selectedBuilding?.id === building.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{building.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {building.total_floors} floors
                      </div>
                      {building.description && (
                        <div className="text-xs text-gray-400 mt-1">{building.description}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Flats List */}
          <div className="lg:col-span-2">
            {selectedBuilding ? (
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold flex items-center space-x-2">
                    <Home className="w-5 h-5" />
                    <span>Flats - {selectedBuilding.name}</span>
                  </h2>
                  <div className="text-sm text-gray-600">
                    Total: {flats.length} flats
                  </div>
                </div>
                <div className="p-4">
                  {flats.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No flats in this building. Click "Add Flats" to create flats.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {flats.map((flat) => (
                        <div key={flat.id} className={`p-4 rounded-lg border-2 ${
                          flat.is_occupied
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold text-gray-900">{flat.flat_number}</div>
                              <div className="text-sm text-gray-500">
                                {flat.flat_type} · Floor: {flat.floor_number || '—'}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                flat.is_occupied
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {flat.is_occupied ? 'Occupied' : 'Vacant'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Area: {flat.area_sqft ?? '—'} sqft
                          </div>
                          {flat.is_occupied && (
                            <div className="text-sm text-gray-500 mt-1">
                              Owner ID: {flat.owner_id}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Building</h3>
                <p className="text-gray-500">Choose a building from the list to view its flats</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Building Modal */}
      {showAddBuildingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Building</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateBuilding({
                  name: formData.get('name'),
                  total_floors: parseInt(formData.get('total_floors') as string),
                  description: formData.get('description'),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
                <input
                  type="number"
                  name="total_floors"
                  defaultValue="1"
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddBuildingModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Flats Modal */}
      {showAddFlatsModal && selectedBuilding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add Flat to {selectedBuilding.name}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateFlats({
                  flat_number:      formData.get('flat_number'),
                  flat_type:        formData.get('flat_type'),
                  floor_number:     formData.get('floor_number'),
                  area_sqft:        formData.get('area_sqft'),
                  user_role:        formData.get('user_role'),
                  occupancy_status: formData.get('occupancy_status'),
                  owner_name:       formData.get('owner_name'),
                  owner_email:      formData.get('owner_email'),
                  owner_phone:      formData.get('owner_phone'),
                  owner_password:   formData.get('owner_password'),
                });
              }}
              className="space-y-6"
            >
              {/* ── Flat Details ── */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b pb-1">
                  Flat Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Flat Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="flat_number"
                      placeholder="e.g. 101"
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Flat Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="flat_type"
                      className="w-full px-4 py-2 border rounded-lg"
                      defaultValue="2BHK"
                      required
                    >
                      <option value="1RK">1 RK</option>
                      <option value="1BHK">1 BHK</option>
                      <option value="2BHK">2 BHK</option>
                      <option value="3BHK">3 BHK</option>
                      <option value="4BHK">4 BHK</option>
                      <option value="4BHK+">4 BHK+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor Number</label>
                    <input
                      type="text"
                      name="floor_number"
                      placeholder="e.g. 1"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft)</label>
                    <input
                      type="number"
                      name="area_sqft"
                      placeholder="e.g. 735"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* ── Occupancy Details ── */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b pb-1">
                  Occupancy Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="user_role"
                      className="w-full px-4 py-2 border rounded-lg"
                      defaultValue="owner"
                      required
                    >
                      <option value="owner">Owner</option>
                      <option value="renting_family">Renting – Family</option>
                      <option value="renting_flatmates">Renting – Flatmates</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupancy Status
                    </label>
                    <select
                      name="occupancy_status"
                      className="w-full px-4 py-2 border rounded-lg"
                      defaultValue="residing"
                    >
                      <option value="residing">Residing</option>
                      <option value="let_out">Let Out</option>
                      <option value="empty">Empty</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Owner Details ── */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 border-b pb-1">
                  Flat Owner Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Owner Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="owner_name"
                      placeholder="Full name of the flat owner"
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="owner_email"
                      placeholder="owner@example.com"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="owner_phone"
                      placeholder="10-digit phone number"
                      pattern="[0-9]{10}"
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="owner_password"
                      placeholder="Set owner login password"
                      minLength={6}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Owner will be created as a <strong>resident</strong> user in the users table.
                  All users table fields are captured; a default login & password will be provided.
                </p>
              </div>

              <div className="flex space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddFlatsModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Add Flat &amp; Owner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingManagement;
