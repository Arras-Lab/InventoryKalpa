import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import StorageLocationModal from '../components/StorageLocationModal';
import StorageLocationCard from '../components/StorageLocationCard';
import { storageLocationService } from '../services/api';

export default function StorageLocations() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        zone: '',
        active: true
    });
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        fetchLocations();
        fetchStatistics();
    }, [filters]);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const response = await storageLocationService.getAll(filters);
            setLocations(response.data);
        } catch (error) {
            console.error('Error fetching storage locations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await storageLocationService.getStatistics();
            setStatistics(response);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const handleCreateLocation = () => {
        setSelectedLocation(null);
        setShowModal(true);
    };

    const handleEditLocation = (location) => {
        setSelectedLocation(location);
        setShowModal(true);
    };

    const handleDeleteLocation = async (locationId) => {
        if (window.confirm('Are you sure you want to delete this storage location?')) {
            try {
                await storageLocationService.delete(locationId);
                fetchLocations();
                fetchStatistics();
            } catch (error) {
                console.error('Error deleting location:', error);
                alert('Error deleting location. It may contain inventory items.');
            }
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedLocation(null);
        fetchLocations();
        fetchStatistics();
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const updateUsage = async () => {
        try {
            await storageLocationService.updateUsage();
            fetchLocations();
            fetchStatistics();
        } catch (error) {
            console.error('Error updating usage:', error);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Storage Locations</h1>
                    <p className="text-gray-600">Manage warehouse and storage locations</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={updateUsage}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Update Usage
                    </button>
                    <button
                        onClick={handleCreateLocation}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Location</span>
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Total Locations</h3>
                        <p className="text-2xl font-bold text-gray-900">{statistics.total_locations}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Active Locations</h3>
                        <p className="text-2xl font-bold text-green-600">{statistics.active_locations}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Total Capacity</h3>
                        <p className="text-2xl font-bold text-blue-600">
                            {statistics.total_capacity ? `${statistics.total_capacity.toFixed(2)} m³` : 'Unlimited'}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-sm font-medium text-gray-500">Current Usage</h3>
                        <p className="text-2xl font-bold text-orange-600">
                            {statistics.total_usage ? `${statistics.total_usage.toFixed(2)} m³` : '0 m³'}
                        </p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search locations..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Types</option>
                        <option value="warehouse">Warehouse</option>
                        <option value="yard">Yard</option>
                        <option value="processing">Processing Area</option>
                        <option value="shipping">Shipping Area</option>
                        <option value="quarantine">Quarantine</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Zone..."
                        value={filters.zone}
                        onChange={(e) => handleFilterChange('zone', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                        value={filters.active}
                        onChange={(e) => handleFilterChange('active', e.target.value === 'true')}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value={true}>Active Only</option>
                        <option value={false}>Inactive Only</option>
                        <option value="">All Status</option>
                    </select>
                </div>
            </div>

            {/* Storage Locations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.data?.map((location) => (
                    <StorageLocationCard
                        key={location.id}
                        location={location}
                        onEdit={handleEditLocation}
                        onDelete={handleDeleteLocation}
                    />
                ))}
            </div>

            {/* Empty State */}
            {locations.data?.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-lg">No storage locations found</div>
                    <button
                        onClick={handleCreateLocation}
                        className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Create First Location
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <StorageLocationModal
                    location={selectedLocation}
                    onClose={handleModalClose}
                />
            )}
        </div>
    );
}
