import React from 'react';
import { PencilIcon, TrashIcon, MapPinIcon, CubeIcon } from '@heroicons/react/24/outline';

export default function StorageLocationCard({ location, onEdit, onDelete }) {
    const getTypeColor = (type) => {
        const colors = {
            warehouse: 'bg-blue-100 text-blue-800',
            yard: 'bg-green-100 text-green-800',
            processing: 'bg-yellow-100 text-yellow-800',
            shipping: 'bg-purple-100 text-purple-800',
            quarantine: 'bg-red-100 text-red-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    const getUtilizationColor = (percentage) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{location.code}</h3>
                    <p className="text-gray-600">{location.name}</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(location)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(location.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Type Badge */}
            <div className="mb-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(location.type)}`}>
                    {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                </span>
                {!location.is_active && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                    </span>
                )}
            </div>

            {/* Capacity Information */}
            {location.capacity_cubic_meters && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Capacity Usage</span>
                        <span className="text-sm font-medium text-gray-900">
                            {location.utilization_percentage}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${getUtilizationColor(location.utilization_percentage)}`}
                            style={{ width: `${Math.min(location.utilization_percentage, 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{location.current_usage?.toFixed(2)} m³ used</span>
                        <span>{location.capacity_cubic_meters?.toFixed(2)} m³ total</span>
                    </div>
                </div>
            )}

            {/* Location Details */}
            <div className="space-y-2">
                {location.zone && (
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        <span>Zone: {location.zone}</span>
                    </div>
                )}
                
                {location.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {location.description}
                    </p>
                )}

                {location.address && (
                    <p className="text-xs text-gray-500 line-clamp-1">
                        {location.address}
                    </p>
                )}
            </div>

            {/* Footer Stats */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-gray-600">
                        <CubeIcon className="w-4 h-4 mr-1" />
                        <span>Available: {location.available_capacity?.toFixed(2) || 'Unlimited'} m³</span>
                    </div>
                    <div className="text-gray-500">
                        ID: {location.id}
                    </div>
                </div>
            </div>
        </div>
    );
}
