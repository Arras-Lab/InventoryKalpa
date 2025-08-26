import React from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { woodInventoryApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import {
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  FileText,
  Users,
  BarChart3,
} from 'lucide-react'

const Dashboard = () => {
  const { user, hasPermission } = useAuth()

  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    () => woodInventoryApi.getDashboard(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  )

  const stats = dashboardData?.data?.data

  const statusColors = {
    ready: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    'in-process': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
    rusak: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    reject: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertTriangle },
  }

  const quickActions = [
    {
      name: 'Tambah Inventory',
      href: '/inventory/add',
      icon: Plus,
      color: 'bg-primary-600 hover:bg-primary-700',
      permission: 'manage_inventory',
    },
    {
      name: 'Lihat Inventory',
      href: '/inventory',
      icon: Package,
      color: 'bg-wood-600 hover:bg-wood-700',
      permission: 'view_inventory',
    },
    {
      name: 'Laporan',
      href: '/reports',
      icon: FileText,
      color: 'bg-green-600 hover:bg-green-700',
      permission: 'view_reports',
    },
    {
      name: 'Manajemen User',
      href: '/users',
      icon: Users,
      color: 'bg-purple-600 hover:bg-purple-700',
      permission: 'manage_users',
    },
  ]

  const filteredActions = quickActions.filter(
    (action) => !action.permission || hasPermission(action.permission)
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-wood-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Selamat datang, {user?.name}!
            </h1>
            <p className="text-primary-100 mt-1">
              Kelola inventory pengolahan kayu dengan mudah dan efisien
            </p>
          </div>
          <div className="hidden md:block">
            <Package className="h-16 w-16 text-primary-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className={`${action.color} text-white rounded-lg p-4 text-center hover:shadow-md transition-all duration-200 transform hover:scale-105`}
            >
              <action.icon className="h-8 w-8 mx-auto mb-2" />
              <span className="text-sm font-medium">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Statistik Inventory</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Item</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.total_items?.toLocaleString('id-ID') || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-wood-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.total_volume?.toFixed(2) || '0.00'} m³
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Nilai</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rp {stats?.total_value?.toLocaleString('id-ID') || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Ready Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.by_status?.find(s => s.status === 'ready')?.count || '0'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribusi Status</h3>
          <div className="space-y-3">
            {stats?.by_status?.map((item) => {
              const statusConfig = statusColors[item.status] || statusColors.ready
              const StatusIcon = statusConfig.icon
              const percentage = stats.total_items > 0 ? (item.count / stats.total_items * 100).toFixed(1) : 0

              return (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${statusConfig.bg}`}>
                      <StatusIcon className={`h-4 w-4 ${statusConfig.text}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {item.status === 'in-process' ? 'In Process' : item.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{percentage}%</span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.count.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Wood Types */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Jenis Kayu Terpopuler</h3>
          <div className="space-y-3">
            {stats?.by_jenis_kayu?.slice(0, 5).map((item, index) => (
              <div key={item.jenis_kayu} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 text-center">
                    <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {item.jenis_kayu}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {item.count.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Additions */}
      {stats?.recent_additions?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Tambahan Terbaru</h3>
            <Link
              to="/inventory"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No Kontrak
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
                    Ditambahkan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recent_additions.map((item) => {
                  const statusConfig = statusColors[item.status] || statusColors.ready
                  return (
                    <tr key={`${item.no_kontrak}-${item.no_kapling}-${item.skshh}-${item.urutan_pengiriman}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.no_kontrak}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.jenis_kayu}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.volume} m³
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                          {item.status === 'in-process' ? 'In Process' : item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
