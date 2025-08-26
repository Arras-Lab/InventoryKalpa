import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { storageLocationService } from '../services/api';

export default function AdvancedSearchModal({ isOpen, onClose, onApplyFilters, currentFilters }) {
    const [filters, setFilters] = useState({
        search: '',
        jenis_kayu: '',
        status: '',
        mutu: '',
        lokasi_saat_ini: '',
        proses: '',
        tahun_pembelian: '',
        volume_min: '',
        volume_max: '',
        harga_min: '',
        harga_max: '',
        tgl_pembelian_start: '',
        tgl_pembelian_end: '',
        sort_by: 'created_at',
        sort_order: 'desc'
    });
    
    const [storageLocations, setStorageLocations] = useState([]);

    useEffect(() => {
        if (currentFilters) {
            setFilters({ ...filters, ...currentFilters });
        }
        fetchStorageLocations();
    }, [currentFilters]);

    const fetchStorageLocations = async () => {
        try {
            const response = await storageLocationService.getAll({ active: true });
            setStorageLocations(response.data || []);
        } catch (error) {
            console.error('Error fetching storage locations:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        const cleanFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
        );
        onApplyFilters(cleanFilters);
        onClose();
    };

    const handleReset = () => {
        setFilters({
            search: '',
            jenis_kayu: '',
            status: '',
            mutu: '',
            lokasi_saat_ini: '',
            proses: '',
            tahun_pembelian: '',
            volume_min: '',
            volume_max: '',
            harga_min: '',
            harga_max: '',
            tgl_pembelian_start: '',
            tgl_pembelian_end: '',
            sort_by: 'created_at',
            sort_order: 'desc'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Advanced Search & Filter</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* General Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            General Search
                        </label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                placeholder="Search across all fields..."
                                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Wood Properties */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Wood Properties</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jenis Kayu
                                </label>
                                <input
                                    type="text"
                                    value={filters.jenis_kayu}
                                    onChange={(e) => handleFilterChange('jenis_kayu', e.target.value)}
                                    placeholder="e.g., Jati, Mahoni"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="ready">Ready</option>
                                    <option value="in-process">In Process</option>
                                    <option value="rusak">Rusak</option>
                                    <option value="reject">Reject</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mutu
                                </label>
                                <input
                                    type="text"
                                    value={filters.mutu}
                                    onChange={(e) => handleFilterChange('mutu', e.target.value)}
                                    placeholder="e.g., A, B, C"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location & Process */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Location & Process</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Storage Location
                                </label>
                                <select
                                    value={filters.lokasi_saat_ini}
                                    onChange={(e) => handleFilterChange('lokasi_saat_ini', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Locations</option>
                                    {storageLocations.map(location => (
                                        <option key={location.id} value={location.code}>
                                            {location.code} - {location.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Process
                                </label>
                                <input
                                    type="text"
                                    value={filters.proses}
                                    onChange={(e) => handleFilterChange('proses', e.target.value)}
                                    placeholder="Current process"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Volume Range */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Volume Range (m³)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minimum Volume
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={filters.volume_min}
                                    onChange={(e) => handleFilterChange('volume_min', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Volume
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={filters.volume_max}
                                    onChange={(e) => handleFilterChange('volume_max', e.target.value)}
                                    placeholder="999.99"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Price Range</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Minimum Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={filters.harga_min}
                                    onChange={(e) => handleFilterChange('harga_min', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={filters.harga_max}
                                    onChange={(e) => handleFilterChange('harga_max', e.target.value)}
                                    placeholder="999999.99"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase Date Range</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.tgl_pembelian_start}
                                    onChange={(e) => handleFilterChange('tgl_pembelian_start', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.tgl_pembelian_end}
                                    onChange={(e) => handleFilterChange('tgl_pembelian_end', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Year
                                </label>
                                <input
                                    type="number"
                                    value={filters.tahun_pembelian}
                                    onChange={(e) => handleFilterChange('tahun_pembelian', e.target.value)}
                                    placeholder="2024"
                                    min="2000"
                                    max="2030"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sorting */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Sorting</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort By
                                </label>
                                <select
                                    value={filters.sort_by}
                                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="created_at">Date Created</option>
                                    <option value="tgl_pembelian">Purchase Date</option>
                                    <option value="jenis_kayu">Wood Type</option>
                                    <option value="volume">Volume</option>
                                    <option value="harga">Price</option>
                                    <option value="status">Status</option>
                                    <option value="lokasi_saat_ini">Location</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort Order
                                </label>
                                <select
                                    value={filters.sort_order}
                                    onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center p-6 border-t border-gray-200">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Reset All
                    </button>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
