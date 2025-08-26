import React, { useState } from 'react';
import { 
    ChevronUpDownIcon, 
    ChevronUpIcon, 
    ChevronDownIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

export default function SearchResultsTable({ 
    data, 
    loading, 
    sortBy, 
    sortOrder, 
    onSort, 
    onView, 
    onEdit, 
    onDelete,
    selectedItems,
    onSelectItem,
    onSelectAll
}) {
    const [hoveredRow, setHoveredRow] = useState(null);

    const columns = [
        { key: 'no_kontrak', label: 'No. Kontrak', sortable: true },
        { key: 'no_kapling', label: 'No. Kapling', sortable: true },
        { key: 'jenis_kayu', label: 'Jenis Kayu', sortable: true },
        { key: 'volume', label: 'Volume (m³)', sortable: true, align: 'right' },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'lokasi_saat_ini', label: 'Location', sortable: true },
        { key: 'tgl_pembelian', label: 'Purchase Date', sortable: true },
        { key: 'harga', label: 'Price', sortable: true, align: 'right' },
        { key: 'actions', label: 'Actions', sortable: false, align: 'center' }
    ];

    const handleSort = (columnKey) => {
        if (columnKey === sortBy) {
            onSort(columnKey, sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            onSort(columnKey, 'asc');
        }
    };

    const getSortIcon = (columnKey) => {
        if (columnKey !== sortBy) {
            return <ChevronUpDownIcon className="w-4 h-4" />;
        }
        return sortOrder === 'asc' ? 
            <ChevronUpIcon className="w-4 h-4" /> : 
            <ChevronDownIcon className="w-4 h-4" />;
    };

    const getStatusColor = (status) => {
        const colors = {
            'ready': 'bg-green-100 text-green-800',
            'in-process': 'bg-yellow-100 text-yellow-800',
            'rusak': 'bg-red-100 text-red-800',
            'reject': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="animate-pulse">
                    <div className="h-12 bg-gray-200"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-100 border-t border-gray-200"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input
                                    type="checkbox"
                                    checked={data?.length > 0 && selectedItems.length === data.length}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </th>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                        column.align === 'right' ? 'text-right' : 
                                        column.align === 'center' ? 'text-center' : 'text-left'
                                    }`}
                                >
                                    {column.sortable ? (
                                        <button
                                            onClick={() => handleSort(column.key)}
                                            className="group inline-flex items-center space-x-1 hover:text-gray-700"
                                        >
                                            <span>{column.label}</span>
                                            {getSortIcon(column.key)}
                                        </button>
                                    ) : (
                                        column.label
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data?.map((item, index) => (
                            <tr
                                key={`${item.no_kontrak}-${item.no_kapling}-${item.skshh}-${item.urutan_pengiriman}`}
                                className={`hover:bg-gray-50 transition-colors ${
                                    selectedItems.includes(item) ? 'bg-blue-50' : ''
                                }`}
                                onMouseEnter={() => setHoveredRow(index)}
                                onMouseLeave={() => setHoveredRow(null)}
                            >
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(item)}
                                        onChange={(e) => onSelectItem(item, e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.no_kontrak}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.no_kapling}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.jenis_kayu}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                    {parseFloat(item.volume).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {item.lokasi_saat_ini || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(item.tgl_pembelian)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                    {item.harga ? formatCurrency(item.harga) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className={`flex items-center justify-center space-x-2 transition-opacity ${
                                        hoveredRow === index ? 'opacity-100' : 'opacity-0'
                                    }`}>
                                        <button
                                            onClick={() => onView(item)}
                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                            title="View Details"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(item)}
                                            className="text-green-600 hover:text-green-900 transition-colors"
                                            title="Edit"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item)}
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                            title="Delete"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {!loading && (!data || data.length === 0) && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">No results found</div>
                    <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                </div>
            )}
        </div>
    );
}
