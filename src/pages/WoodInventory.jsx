import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Link, useNavigate } from 'react-router-dom'
import { woodInventoryApi, handleExport } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

const WoodInventory = () => {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    jenis_kayu: '',
    lokasi: '',
    tahun: '',
    proses: '',
    mutu: '',
    tgl_pembelian_from: '',
    tgl_pembelian_to: '',
    sort_by: 'tgl_pembelian',
    sort_order: 'desc',
    per_page: 15,
    page: 1,
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, refetch } = useQuery(
    ['wood-inventory', filters],
    () => woodInventoryApi.getAll(filters),
    {
      keepPreviousData: true,
    }
  )

  const inventories = data?.data?.data?.data || []
  const pagination = data?.data?.data || {}
  const summary = data?.data?.summary || {}

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }))
  }

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleDelete = async (noKontrak, noKapling, skshh, urutanPengiriman) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return
    }

    try {
      const response = await woodInventoryApi.delete(noKontrak, noKapling, skshh, urutanPengiriman)
      if (response.data.success) {
        toast.success('Data berhasil dihapus!')
        refetch()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus data')
    }
  }

  const handleExportExcel = () => {
    handleExport(
      woodInventoryApi.exportExcel,
      `wood_inventory_${new Date().toISOString().split('T')[0]}.xlsx`,
      filters
    )
  }

  const handleExportPdf = () => {
    handleExport(
      woodInventoryApi.exportPdf,
      `wood_inventory_${new Date().toISOString().split('T')[0]}.pdf`,
      filters
    )
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      jenis_kayu: '',
      lokasi: '',
      tahun: '',
      proses: '',
      mutu: '',
      tgl_pembelian_from: '',
      tgl_pembelian_to: '',
      sort_by: 'tgl_pembelian',
      sort_order: 'desc',
      per_page: 15,
      page: 1,
    })
  }

  const statusColors = {
    ready: 'bg-green-100 text-green-800',
    'in-process': 'bg-yellow-100 text-yellow-800',
    rusak: 'bg-red-100 text-red-800',
    reject: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Kayu</h1>
          <p className="text-gray-600">Kelola data inventory pengolahan kayu</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasPermission('view_reports') && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportExcel}
                className="btn-secondary btn-sm flex items-center space-x-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Excel</span>
              </button>
              <button
                onClick={handleExportPdf}
                className="btn-secondary btn-sm flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </button>
            </div>
          )}
          {hasPermission('manage_inventory') && (
            <Link to="/inventory/add" className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Tambah Data</span>
            </Link>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total Item</div>
          <div className="text-2xl font-bold text-gray-900">
            {summary.total_items?.toLocaleString('id-ID') || '0'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total Volume</div>
          <div className="text-2xl font-bold text-gray-900">
            {summary.total_volume?.toFixed(2) || '0.00'} m³
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total Nilai</div>
          <div className="text-2xl font-bold text-gray-900">
            Rp {summary.total_value?.toLocaleString('id-ID') || '0'}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan kontrak, kapling, TRS, atau SKSHH..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input pl-10"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <button
              onClick={() => refetch()}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="select"
                >
                  <option value="">Semua Status</option>
                  <option value="ready">Ready</option>
                  <option value="in-process">In Process</option>
                  <option value="rusak">Rusak</option>
                  <option value="reject">Reject</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kayu</label>
                <input
                  type="text"
                  value={filters.jenis_kayu}
                  onChange={(e) => handleFilterChange('jenis_kayu', e.target.value)}
                  className="input"
                  placeholder="Cari jenis kayu..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <input
                  type="text"
                  value={filters.lokasi}
                  onChange={(e) => handleFilterChange('lokasi', e.target.value)}
                  className="input"
                  placeholder="Cari lokasi..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                <input
                  type="number"
                  value={filters.tahun}
                  onChange={(e) => handleFilterChange('tahun', e.target.value)}
                  className="input"
                  placeholder="Tahun pembelian..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proses</label>
                <input
                  type="text"
                  value={filters.proses}
                  onChange={(e) => handleFilterChange('proses', e.target.value)}
                  className="input"
                  placeholder="Cari proses..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mutu</label>
                <input
                  type="text"
                  value={filters.mutu}
                  onChange={(e) => handleFilterChange('mutu', e.target.value)}
                  className="input"
                  placeholder="Cari mutu..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Dari</label>
                <input
                  type="date"
                  value={filters.tgl_pembelian_from}
                  onChange={(e) => handleFilterChange('tgl_pembelian_from', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Sampai</label>
                <input
                  type="date"
                  value={filters.tgl_pembelian_to}
                  onChange={(e) => handleFilterChange('tgl_pembelian_to', e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urutkan</label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                    className="select"
                  >
                    <option value="tgl_pembelian">Tanggal Pembelian</option>
                    <option value="no_kontrak">No Kontrak</option>
                    <option value="jenis_kayu">Jenis Kayu</option>
                    <option value="volume">Volume</option>
                    <option value="harga">Harga</option>
                    <option value="created_at">Tanggal Dibuat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arah</label>
                  <select
                    value={filters.sort_order}
                    onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                    className="select"
                  >
                    <option value="desc">Terbaru</option>
                    <option value="asc">Terlama</option>
                  </select>
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="btn-secondary"
              >
                Reset Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
          </div>
        ) : inventories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data</h3>
            <p className="text-gray-500 mb-4">
              Belum ada data inventory yang sesuai dengan filter Anda.
            </p>
            {hasPermission('manage_inventory') && (
              <Link to="/inventory/add" className="btn-primary">
                Tambah Data Pertama
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kontrak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis Kayu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tgl Beli
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Nilai
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventories.map((item) => (
                    <tr key={`${item.no_kontrak}-${item.no_kapling}-${item.skshh}-${item.urutan_pengiriman}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.no_kontrak}</div>
                        <div className="text-sm text-gray-500">{item.no_kapling}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.jenis_kayu}</div>
                        <div className="text-sm text-gray-500">{item.sort}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.volume} m³
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[item.status] || statusColors.ready}`}>
                          {item.status === 'in-process' ? 'In Process' : item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.lokasi_saat_ini}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.tgl_pembelian).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rp {item.total_value?.toLocaleString('id-ID') || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/inventory/view/${encodeURIComponent(item.no_kontrak)}/${encodeURIComponent(item.no_kapling)}/${encodeURIComponent(item.skshh)}/${item.urutan_pengiriman}`)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {hasPermission('manage_inventory') && (
                            <>
                              <button
                                onClick={() => navigate(`/inventory/edit/${encodeURIComponent(item.no_kontrak)}/${encodeURIComponent(item.no_kapling)}/${encodeURIComponent(item.skshh)}/${item.urutan_pengiriman}`)}
                                className="text-primary-600 hover:text-primary-900"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.no_kontrak, item.no_kapling, item.skshh, item.urutan_pengiriman)}
                                className="text-red-600 hover:text-red-900"
                                title="Hapus"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan{' '}
                    <span className="font-medium">{pagination.from || 0}</span>
                    {' '}sampai{' '}
                    <span className="font-medium">{pagination.to || 0}</span>
                    {' '}dari{' '}
                    <span className="font-medium">{pagination.total || 0}</span>
                    {' '}hasil
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, pagination.last_page || 1) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.current_page
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page >= pagination.last_page}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default WoodInventory
