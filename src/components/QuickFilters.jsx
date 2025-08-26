import React from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function QuickFilters({ filters, onFilterChange, onClearFilters, onAdvancedSearch }) {
    const quickFilterOptions = [
        { key: 'status', label: 'Status', options: [
            { value: 'ready', label: 'Ready' },
            { value: 'in-process', label: 'In Process' },
            { value: 'rusak', label: 'Rusak' },
            { value: 'reject', label: 'Reject' }
        ]},
        { key: 'tahun_pembelian', label: 'Year', options: [
            { value: '2024', label: '2024' },
            { value: '2023', label: '2023' },
            { value: '2022', label: '2022' },
            { value: '2021', label: '2021' }
        ]},
    ];

    const activeFiltersCount = Object.values(filters).filter(value => 
        value !== '' && value !== null && value !== undefined
    ).length;

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
                {/* Quick Filter Dropdowns */}
                {quickFilterOptions.map(filterGroup => (
                    <div key={filterGroup.key} className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">
                            {filterGroup.label}:
                        </label>
                        <select
                            value={filters[filterGroup.key] || ''}
                            onChange={(e) => onFilterChange(filterGroup.key, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All</option>
                            {filterGroup.options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}

                {/* Volume Range Quick Filter */}
                <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">Volume:</label>
                    <input
                        type="number"
                        placeholder="Min"
                        value={filters.volume_min || ''}
                        onChange={(e) => onFilterChange('volume_min', e.target.value)}
                        className="w-20 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        step="0.01"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={filters.volume_max || ''}
                        onChange={(e) => onFilterChange('volume_max', e.target.value)}
                        className="w-20 text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        step="0.01"
                    />
                    <span className="text-xs text-gray-500">m³</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-auto">
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={onClearFilters}
                            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                        >
                            <XMarkIcon className="w-4 h-4" />
                            <span>Clear ({activeFiltersCount})</span>
                        </button>
                    )}
                    
                    <button
                        onClick={onAdvancedSearch}
                        className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                        <FunnelIcon className="w-4 h-4" />
                        <span>Advanced</span>
                    </button>
                </div>
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-medium text-gray-500">Active filters:</span>
                        {Object.entries(filters).map(([key, value]) => {
                            if (!value || value === '') return null;
                            
                            let displayValue = value;
                            if (key === 'volume_min') displayValue = `Vol ≥ ${value}m³`;
                            else if (key === 'volume_max') displayValue = `Vol ≤ ${value}m³`;
                            else if (key === 'harga_min') displayValue = `Price ≥ ${value}`;
                            else if (key === 'harga_max') displayValue = `Price ≤ ${value}`;
                            else if (key === 'tgl_pembelian_start') displayValue = `From ${value}`;
                            else if (key === 'tgl_pembelian_end') displayValue = `To ${value}`;
                            else if (key === 'search') displayValue = `"${value}"`;
                            
                            return (
                                <span
                                    key={key}
                                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                    {displayValue}
                                    <button
                                        onClick={() => onFilterChange(key, '')}
                                        className="ml-1 hover:text-blue-600"
                                    >
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
