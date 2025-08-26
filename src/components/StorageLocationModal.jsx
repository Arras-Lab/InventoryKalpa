import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { storageLocationService } from '../services/api';

export default function StorageLocationModal({ location, onClose }) {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: 'warehouse',
        description: '',
        is_active: true,
        capacity_cubic_meters: '',
        zone: '',
        address: '',
        coordinates: { lat: '', lng: '' }
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (location) {
            setFormData({
                code: location.code || '',
                name: location.name || '',
                type: location.type || 'warehouse',
                description: location.description || '',
                is_active: location.is_active ?? true,
                capacity_cubic_meters: location.capacity_cubic_meters || '',
                zone: location.zone || '',
                address: location.address || '',
                coordinates: location.coordinates || { lat: '', lng: '' }
            });
        }
    }, [location]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith('coordinates.')) {
            const coordField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                coordinates: {
                    ...prev.coordinates,
                    [coordField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.code.trim()) {
            newErrors.code = 'Location code is required';
        }
        
        if (!formData.name.trim()) {
            newErrors.name = 'Location name is required';
        }
        
        if (formData.capacity_cubic_meters && formData.capacity_cubic_meters < 0) {
            newErrors.capacity_cubic_meters = 'Capacity must be positive';
        }
        
        if (formData.coordinates.lat && (formData.coordinates.lat < -90 || formData.coordinates.lat > 90)) {
            newErrors['coordinates.lat'] = 'Latitude must be between -90 and 90';
        }
        
        if (formData.coordinates.lng && (formData.coordinates.lng < -180 || formData.coordinates.lng > 180)) {
            newErrors['coordinates.lng'] = 'Longitude must be between -180 and 180';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        try {
            const submitData = {
                ...formData,
                capacity_cubic_meters: formData.capacity_cubic_meters ? parseFloat(formData.capacity_cubic_meters) : null,
                coordinates: (formData.coordinates.lat && formData.coordinates.lng) ? {
                    lat: parseFloat(formData.coordinates.lat),
                    lng: parseFloat(formData.coordinates.lng)
                } : null
            };
            
            if (location) {
                await storageLocationService.update(location.id, submitData);
            } else {
                await storageLocationService.create(submitData);
            }
            
            onClose();
        } catch (error) {
            console.error('Error saving storage location:', error);
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ general: 'An error occurred while saving the location' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {location ? 'Edit Storage Location' : 'Create Storage Location'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {errors.general}
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location Code *
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.code ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="e.g., WH-A1, YRD-B2"
                            />
                            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="e.g., Main Warehouse A1"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="warehouse">Warehouse</option>
                                <option value="yard">Yard</option>
                                <option value="processing">Processing Area</option>
                                <option value="shipping">Shipping Area</option>
                                <option value="quarantine">Quarantine</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Zone
                            </label>
                            <input
                                type="text"
                                name="zone"
                                value={formData.zone}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., North, South, A, B"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Optional description of the storage location"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Capacity (cubic meters)
                        </label>
                        <input
                            type="number"
                            name="capacity_cubic_meters"
                            value={formData.capacity_cubic_meters}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.capacity_cubic_meters ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Leave empty for unlimited capacity"
                        />
                        {errors.capacity_cubic_meters && (
                            <p className="text-red-500 text-sm mt-1">{errors.capacity_cubic_meters}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Physical address"
                        />
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Latitude
                            </label>
                            <input
                                type="number"
                                name="coordinates.lat"
                                value={formData.coordinates.lat}
                                onChange={handleChange}
                                step="any"
                                min="-90"
                                max="90"
                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors['coordinates.lat'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="e.g., -8.6705"
                            />
                            {errors['coordinates.lat'] && (
                                <p className="text-red-500 text-sm mt-1">{errors['coordinates.lat']}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Longitude
                            </label>
                            <input
                                type="number"
                                name="coordinates.lng"
                                value={formData.coordinates.lng}
                                onChange={handleChange}
                                step="any"
                                min="-180"
                                max="180"
                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors['coordinates.lng'] ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="e.g., 115.2126"
                            />
                            {errors['coordinates.lng'] && (
                                <p className="text-red-500 text-sm mt-1">{errors['coordinates.lng']}</p>
                            )}
                        </div>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                            Active location
                        </label>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (location ? 'Update Location' : 'Create Location')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
