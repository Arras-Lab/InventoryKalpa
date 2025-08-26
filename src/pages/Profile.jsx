import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react'

const Profile = () => {
  const { user, changePassword } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const result = await changePassword(data)
      if (result.success) {
        reset()
        setShowCurrentPassword(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)
      } else {
        if (result.errors) {
          Object.keys(result.errors).forEach(key => {
            setError(key, { message: result.errors[key][0] })
          })
        } else {
          setError('root', { message: result.message })
        }
      }
    } catch (error) {
      setError('root', { message: 'Terjadi kesalahan saat mengubah password' })
    } finally {
      setIsLoading(false)
    }
  }

  const roleLabels = {
    admin: 'Administrator',
    operator: 'Operator',
    manajer: 'Manajer',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Kelola informasi akun dan keamanan Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">{user?.name}</h3>
              <p className="text-gray-500">{user?.email}</p>
              <div className="mt-4">
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                  {roleLabels[user?.role]}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status Akun</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user?.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user?.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bergabung Sejak</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Terakhir Update</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user?.updated_at ? new Date(user.updated_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : '-'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Lock className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Ubah Password</h3>
                <p className="text-sm text-gray-500">
                  Pastikan akun Anda menggunakan password yang kuat untuk keamanan
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errors.root && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">
                    {errors.root.message}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Saat Ini *
                </label>
                <div className="relative">
                  <input
                    {...register('current_password', {
                      required: 'Password saat ini wajib diisi',
                    })}
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Masukkan password saat ini"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.current_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.current_password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru *
                </label>
                <div className="relative">
                  <input
                    {...register('new_password', {
                      required: 'Password baru wajib diisi',
                      minLength: {
                        value: 8,
                        message: 'Password minimal 8 karakter',
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password harus mengandung huruf besar, huruf kecil, dan angka',
                      },
                    })}
                    type={showNewPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Masukkan password baru"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.new_password.message}</p>
                )}
                <div className="mt-2">
                  <div className="text-xs text-gray-500">
                    Password harus memiliki:
                  </div>
                  <ul className="text-xs text-gray-500 list-disc list-inside mt-1 space-y-1">
                    <li>Minimal 8 karakter</li>
                    <li>Mengandung huruf besar (A-Z)</li>
                    <li>Mengandung huruf kecil (a-z)</li>
                    <li>Mengandung angka (0-9)</li>
                  </ul>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password Baru *
                </label>
                <div className="relative">
                  <input
                    {...register('new_password_confirmation', {
                      required: 'Konfirmasi password wajib diisi',
                      validate: (value, { new_password }) =>
                        value === new_password || 'Password tidak sama',
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Konfirmasi password baru"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.new_password_confirmation && (
                  <p className="mt-1 text-sm text-red-600">{errors.new_password_confirmation.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    reset()
                    setShowCurrentPassword(false)
                    setShowNewPassword(false)
                    setShowConfirmPassword(false)
                  }}
                  className="btn-secondary"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Mengubah...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      Ubah Password
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security Tips */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Tips Keamanan</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Gunakan password yang unik dan tidak mudah ditebak</li>
              <li>• Jangan gunakan informasi pribadi dalam password</li>
              <li>• Ubah password secara berkala</li>
              <li>• Jangan bagikan password kepada orang lain</li>
              <li>• Logout dari sistem setelah selesai menggunakan</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
