import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { woodInventoryApi } from '../services/api'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const WoodInventoryForm = () => {
  const navigate = useNavigate()
  const { noKontrak, noKapling, skshh, urutanPengiriman } = useParams()
  const isEdit = Boolean(noKontrak && noKapling && skshh && urutanPengiriman)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      status: 'ready',
      delivery_dari_perhutani: false,
      tahun_pembelian: new Date().getFullYear(),
    },
  })

  // Fetch existing data for edit mode
  const { data: existingData, isLoading: isLoadingData } = useQuery(
    ['wood-inventory', noKontrak, noKapling, skshh, urutanPengiriman],
    () => woodInventoryApi.getById(noKontrak, noKapling, skshh, urutanPengiriman),
    {
      enabled: isEdit,
      onSuccess: (response) => {
        if (response.data.success) {
          const data = response.data.data
          // Reset form with existing data
          reset({
            ...data,
            tgl_pembelian: data.tgl_pembelian ? new Date(data.tgl_pembelian).toISOString().split('T')[0] : '',
            tanggal_sampai_bali: data.tanggal_sampai_bali ? new Date(data.tanggal_sampai_bali).toISOString().split('T')[0] : '',
            tgl_dibelah: data.tgl_dibelah ? new Date(data.tgl_dibelah).toISOString().split('T')[0] : '',
            tgl_diambil_dari_tempat_belah: data.tgl_diambil_dari_tempat_belah ? new Date(data.tgl_diambil_dari_tempat_belah).toISOString().split('T')[0] : '',
          })
        }
      },
    }
  )

  // Watch for volume and kubik_price changes to calculate total value
  const volume = watch('volume')
  const kubikPrice = watch('kubik_price')
  const totalValue = volume && kubikPrice ? (parseFloat(volume) * parseFloat(kubikPrice)) : 0

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      let response
      if (isEdit) {
        response = await woodInventoryApi.update(noKontrak, noKapling, skshh, urutanPengiriman, data)
      } else {
        response = await woodInventoryApi.create(data)
      }

      if (response.data.success) {
        toast.success(isEdit ? 'Data berhasil diupdate!' : 'Data berhasil disimpan!')
        navigate('/inventory')
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error('Data dengan kombinasi kunci yang sama sudah ada. Silakan gunakan data yang berbeda atau update data yang sudah ada.')
      } else {
        toast.error(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isEdit && isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Kembali ke Inventory</span>
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Data Inventory' : 'Tambah Data Inventory'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Ubah data inventory kayu yang sudah ada' : 'Tambahkan data inventory kayu baru ke sistem'}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Primary Key Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              Identifikasi Utama (Primary Key)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No Kontrak *
                </label>
                <input
                  {...register('no_kontrak', { required: 'No Kontrak wajib diisi' })}
                  type="text"
                  className="input"
                  placeholder="Masukkan nomor kontrak"
                  disabled={isEdit}
                />
                {errors.no_kontrak && (
                  <p className="mt-1 text-sm text-red-600">{errors.no_kontrak.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No Kapling *
                </label>
                <input
                  {...register('no_kapling', { required: 'No Kapling wajib diisi' })}
                  type="text"
                  className="input"
                  placeholder="Masukkan nomor kapling"
                  disabled={isEdit}
                />
                {errors.no_kapling && (
                  <p className="mt-1 text-sm text-red-600">{errors.no_kapling.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKSHH *
                </label>
                <input
                  {...register('skshh', { required: 'SKSHH wajib diisi' })}
                  type="text"
                  className="input"
                  placeholder="Masukkan SKSHH"
                  disabled={isEdit}
                />
                {errors.skshh && (
                  <p className="mt-1 text-sm text-red-600">{errors.skshh.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urutan Pengiriman *
                </label>
                <input
                  {...register('urutan_pengiriman', { 
                    required: 'Urutan Pengiriman wajib diisi',
                    min: { value: 1, message: 'Urutan pengiriman minimal 1' }
                  })}
                  type="number"
                  min="1"
                  className="input"
                  placeholder="Masukkan urutan pengiriman"
                  disabled={isEdit}
                />
                {errors.urutan_pengiriman && (
                  <p className="mt-1 text-sm text-red-600">{errors.urutan_pengiriman.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kontrak *
                </label>
                <input
                  {...register('kontrak', { required: 'Kontrak wajib diisi' })}
                  type="text"
                  className="input"
                  placeholder="Masukkan nama kontrak"
                />
                {errors.kontrak && (
                  <p className="mt-1 text-sm text-red-600">{errors.kontrak.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kayu *
                </label>
                <input
                  {...register('jenis_kayu', { required: 'Jenis Kayu wajib diisi' })}
                  type="text"
                  className="input"
                  placeholder="Masukkan jenis kayu"
                />
                {errors.jenis_kayu && (
                  <p className="mt-1 text-sm text-red-600">{errors.jenis_kayu.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort *
                </label>
                <input
                  {...register('sort', { required: 'Sort wajib diisi' })}
                  type="text"
                  className="input"
                  placeholder="Masukkan sort"
                />
                {errors.sort && (
                  <p className="mt-1 text-sm text-red-600">{errors.sort.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mutu *
                </label>
                <input
                  {...register('mutu', { required: 'Mutu wajib diisi' })}
                  type="text"
                  className="input"
                  placeholder="Masukkan mutu kayu"
                />
                {errors.mutu && (
                  <p className="mt-1 text-sm text-red-600">{errors.mutu.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  {...register('status', { required: 'Status wajib dipilih' })}
                  className="select"
                >
                  <option value="ready">Ready</option>
                  <option value="in-process">In Process</option>
                  <option value="rusak">Rusak</option>
                  <option value="reject">Reject</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TRS (Kode Transaksi) *
                </label>
                <input
                  {...register('trs', { required: 'TRS wajib diisi' })}
                  type="text"
                  className="input"
                  placeholder="Masukkan kode transaksi"
                />
                {errors.trs && (
                  <p className="mt-1 text-sm text-red-600">{errors.trs.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pengukuran</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Panjang (m) *
                </label>
                <input
                  {...register('panjang', { 
                    required: 'Panjang wajib diisi',
                    min: { value: 0.01, message: 'Panjang harus lebih dari 0' }
                  })}
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input"
                  placeholder="0.00"
                />
                {errors.panjang && (
                  <p className="mt-1 text-sm text-red-600">{errors.panjang.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diameter (cm) *
                </label>
                <input
                  {...register('diameter', { 
                    required: 'Diameter wajib diisi',
                    min: { value: 0.01, message: 'Diameter harus lebih dari 0' }
                  })}
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input"
                  placeholder="0.00"
                />
                {errors.diameter && (
                  <p className="mt-1 text-sm text-red-600">{errors.diameter.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  {...register('qty', { 
                    required: 'Quantity wajib diisi',
                    min: { value: 1, message: 'Quantity minimal 1' }
                  })}
                  type="number"
                  min="1"
                  className="input"
                  placeholder="1"
                />
                {errors.qty && (
                  <p className="mt-1 text-sm text-red-600">{errors.qty.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume (m³) *
                </label>
                <input
                  {...register('volume', { 
                    required: 'Volume wajib diisi',
                    min: { value: 0.0001, message: 'Volume harus lebih dari 0' }
                  })}
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  className="input"
                  placeholder="0.0000"
                />
                {errors.volume && (
                  <p className="mt-1 text-sm text-red-600">{errors.volume.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kubik Price (Rp) *
                </label>
                <input
                  {...register('kubik_price', { 
                    required: 'Kubik Price wajib diisi',
                    min: { value: 0, message: 'Harga tidak boleh negatif' }
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  placeholder="0.00"
                />
                {errors.kubik_price && (
                  <p className="mt-1 text-sm text-red-600">{errors.kubik_price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Value (Rp)
                </label>
                <input
                  type="text"
                  value={totalValue.toLocaleString('id-ID')}
                  className="input bg-gray-50"
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">Otomatis dihitung: Volume × Kubik Price</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Keuangan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harga (Rp) *
                </label>
                <input
                  {...register('harga', { 
                    required: 'Harga wajib diisi',
                    min: { value: 0, message: 'Harga tidak boleh negatif' }
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  placeholder="0.00"
                />
                {errors.harga && (
                  <p className="mt-1 text-sm text-red-600">{errors.harga.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Pembelian *
                </label>
                <input
                  {...register('tgl_pembelian', { required: 'Tanggal Pembelian wajib diisi' })}
                  type="date"
                  className="input"
                />
                {errors.tgl_pembelian && (
                  <p className="mt-1 text-sm text-red-600">{errors.tgl_pembelian.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tahun Pembelian *
                </label>
                <input
                  {...register('tahun_pembelian', { 
                    required: 'Tahun Pembelian wajib diisi',
                    min: { value: 1900, message: 'Tahun tidak valid' },
                    max: { value: new Date().getFullYear(), message: 'Tahun tidak boleh melebihi tahun ini' }
                  })}
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="input"
                />
                {errors.tahun_pembelian && (
                  <p className="mt-1 text-sm text-red-600">{errors.tahun_pembelian.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location and Source */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Lokasi dan Sumber</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asal TPK *
                </label>
                <input
                  {...register('asal_tpk', { required: 'Asal TPK wajib diisi' })}
                  type="text"
                  className="input"
                  placeholder="Masukkan asal TPK"
                />
                {errors.asal_tpk && (
                  <p className="mt-1 text-sm text-red-600">{errors.asal_tpk.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi Saat Ini *
                </label>
                <input
                  {...register('lokasi_saat_ini', { required: 'Lokasi Saat Ini wajib diisi' })}
                  type="text"
                  className="input"
                  placeholder="Masukkan lokasi saat ini"
                />
                {errors.lokasi_saat_ini && (
                  <p className="mt-1 text-sm text-red-600">{errors.lokasi_saat_ini.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <input
                    {...register('delivery_dari_perhutani')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Delivery dari Perhutani
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Sampai Bali
                </label>
                <input
                  {...register('tanggal_sampai_bali')}
                  type="date"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Processing Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Proses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proses
                </label>
                <input
                  {...register('proses')}
                  type="text"
                  className="input"
                  placeholder="Masukkan jenis proses (pemotongan, pengeringan, dll.)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rencana Alokasi
                </label>
                <input
                  {...register('rencana_alokasi')}
                  type="text"
                  className="input"
                  placeholder="Masukkan rencana alokasi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Dibelah
                </label>
                <input
                  {...register('tgl_dibelah')}
                  type="date"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Diambil dari Tempat Belah
                </label>
                <input
                  {...register('tgl_diambil_dari_tempat_belah')}
                  type="date"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="btn-secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {isEdit ? 'Mengupdate...' : 'Menyimpan...'}
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Update Data' : 'Simpan Data'}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WoodInventoryForm
