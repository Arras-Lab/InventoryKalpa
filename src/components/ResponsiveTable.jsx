import React, { useState } from 'react';
import { 
    ChevronDownIcon, 
    ChevronUpIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';

export default function ResponsiveTable({ 
    data, 
    columns, 
    loading, 
    onView, 
    onEdit, 
    onDelete,
    selectedItems = [],
    onSelectItem,
    onSelectAll
}) {
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleRowExpansion = (itemId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedRows(newExpanded);
    };

    const getItemId = (item) => {
        return `${item.no_kontrak}-${item.no_kapling}-${item.skshh}-${item.urutan_pengiriman}`;
    };

    const formatValue = (value, column) => {
        if (!value && value !== 0) return '-';
        
        switch (column.type) {
            case 'currency':
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                }).format(value);
            case 'date':
                return new Date(value).toLocaleDateString('id-ID');
            case 'number':
                return parseFloat(value).toFixed(column.decimals || 2);
            case 'status':
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                        {value}
                    </span>
                );
            default:
                return value;
        }
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

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    // Mobile Card View
    if (isMobile) {
        return (
            <div className="space-y-4">
                {data?.map((item) => {
                    const itemId = getItemId(item);
                    const isExpanded = expandedRows.has(itemId);
                    const isSelected = selectedItems.some(selected => getItemId(selected) === itemId);

                    return (
                        <div
                            key={itemId}
                            className={`bg-white rounded-lg shadow border ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                        >
                            {/* Card Header */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => onSelectItem(item, e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <h3 className="font-medium text-gray-900 truncate">
                                            {item.no_kontrak}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => toggleRowExpansion(itemId)}
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        {isExpanded ? (
                                            <ChevronUpIcon className="w-5 h-5" />
                                        ) : (
                                            <ChevronDownIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                {/* Primary Info */}
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600">{item.jenis_kayu}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {parseFloat(item.volume).toFixed(2)} m³
                                        </span>
                                        {formatValue(item.status, { type: 'status' })}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                                    <span className="text-xs text-gray-500">
                                        {item.lokasi_saat_ini || 'No location'}
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => onView(item)}
                                            className="p-1 text-blue-600 hover:text-blue-900"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(item)}
                                            className="p-1 text-green-600 hover:text-green-900"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item)}
                                            className="p-1 text-red-600 hover:text-red-900"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="px-4 pb-4 border-t border-gray-200">
                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                        {columns.filter(col => col.key !== 'actions' && !col.primary).map((column) => (
                                            <div key={column.key} className="text-sm">
                                                <span className="text-gray-500 block">{column.label}:</span>
                                                <span className="text-gray-900 font-medium">
                                                    {formatValue(item[column.key], column)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    // Desktop Table View
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
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data?.map((item) => {
                            const itemId = getItemId(item);
                            const isSelected = selectedItems.some(selected => getItemId(selected) === itemId);

                            return (
                                <tr
                                    key={itemId}
                                    className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => onSelectItem(item, e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </td>
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={`px-6 py-4 whitespace-nowrap text-sm ${
                                                column.align === 'right' ? 'text-right' : 
                                                column.align === 'center' ? 'text-center' : 'text-left'
                                            } ${column.key === 'actions' ? '' : 'text-gray-900'}`}
                                        >
                                            {column.key === 'actions' ? (
                                                <div className="flex items-center justify-center space-x-2">
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
                                            ) : (
                                                formatValue(item[column.key], column)
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {!loading && (!data || data.length === 0) && (
                <div className="text-center py-12">
                    <Bars3Icon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No data found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search criteria or add new records.
                    </p>
                </div>
            )}
        </div>
    );
}
