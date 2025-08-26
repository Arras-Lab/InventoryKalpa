import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { storageLocationService } from '../services/api';

export default function StorageLocationSelector({ 
    value, 
    onChange, 
    requiredVolume = 0, 
    error, 
    disabled = false,
    placeholder = "Select storage location..."
}) {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLocations();
    }, [requiredVolume]);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const params = {
                active: true,
                sort_by: 'code',
                sort_order: 'asc'
            };
            
            if (requiredVolume > 0) {
                params.available_capacity = requiredVolume;
            }
            
            const response = await storageLocationService.getAll(params);
            setLocations(response.data || []);
        } catch (error) {
            console.error('Error fetching storage locations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLocations = locations.filter(location =>
        location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.zone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedLocation = locations.find(loc => loc.code === value);

    const handleSelect = (location) => {
        onChange(location.code);
        setIsOpen(false);
        setSearchTerm('');
    };

    const getTypeColor = (type) => {
        const colors = {
            warehouse: 'text-blue-600',
            yard: 'text-green-600',
            processing: 'text-yellow-600',
            shipping: 'text-purple-600',
            quarantine: 'text-red-600'
        };
        return colors[type] || 'text-gray-600';
    };

    const canAccommodate = (location) => {
        if (requiredVolume === 0) return true;
        if (!location.capacity_cubic_meters) return true;
        return location.available_capacity >= requiredVolume;
    };

    return (
        <div className="relative">
            <div className={`relative border rounded-lg ${error ? 'border-red-500' : 'border-gray-300'} ${disabled ? 'bg-gray-50' : 'bg-white'}`}>
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer'}`}
                >
                    <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        {selectedLocation ? (
                            <div>
                                <span className="font-medium">{selectedLocation.code}</span>
                                <span className="text-gray-500 ml-2">{selectedLocation.name}</span>
                                {selectedLocation.zone && (
                                    <span className="text-xs text-gray-400 ml-1">({selectedLocation.zone})</span>
                                )}
                            </div>
                        ) : (
                            <span className="text-gray-500">{placeholder}</span>
                        )}
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                        {/* Search */}
                        <div className="p-2 border-b border-gray-200">
                            <input
                                type="text"
                                placeholder="Search locations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Options */}
                        <div className="max-h-40 overflow-y-auto">
                            {loading ? (
                                <div className="p-3 text-center text-gray-500">Loading...</div>
                            ) : filteredLocations.length === 0 ? (
                                <div className="p-3 text-center text-gray-500">No locations found</div>
                            ) : (
                                filteredLocations.map((location) => {
                                    const canFit = canAccommodate(location);
                                    return (
                                        <button
                                            key={location.id}
                                            type="button"
                                            onClick={() => canFit && handleSelect(location)}
                                            disabled={!canFit}
                                            className={`w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none ${
                                                !canFit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                            } ${value === location.code ? 'bg-blue-50 border-r-2 border-blue-500' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-medium">{location.code}</span>
                                                        <span className={`text-xs px-1.5 py-0.5 rounded ${getTypeColor(location.type)} bg-opacity-10`}>
                                                            {location.type}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-600">{location.name}</div>
                                                    {location.zone && (
                                                        <div className="text-xs text-gray-500">Zone: {location.zone}</div>
                                                    )}
                                                </div>
                                                <div className="text-right text-xs text-gray-500">
                                                    {location.capacity_cubic_meters ? (
                                                        <div>
                                                            <div>Available: {location.available_capacity?.toFixed(2)} m³</div>
                                                            <div>Usage: {location.utilization_percentage}%</div>
                                                        </div>
                                                    ) : (
                                                        <div>Unlimited</div>
                                                    )}
                                                </div>
                                            </div>
                                            {!canFit && requiredVolume > 0 && (
                                                <div className="text-xs text-red-500 mt-1">
                                                    Insufficient capacity for {requiredVolume.toFixed(2)} m³
                                                </div>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            
            {selectedLocation && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    <div className="flex justify-between items-center">
                        <span>Selected: {selectedLocation.name}</span>
                        {selectedLocation.capacity_cubic_meters && (
                            <span>
                                {selectedLocation.utilization_percentage}% utilized 
                                ({selectedLocation.available_capacity?.toFixed(2)} m³ available)
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-0" 
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
