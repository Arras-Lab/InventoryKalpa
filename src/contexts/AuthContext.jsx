import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await api.get('/me')
      if (response.data.success) {
        setUser(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await api.post('/login', credentials)
      if (response.data.success) {
        const { user, token } = response.data.data
        setUser(user)
        setToken(token)
        localStorage.setItem('token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        toast.success('Login berhasil!')
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login gagal'
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/register', userData)
      if (response.data.success) {
        const { user, token } = response.data.data
        setUser(user)
        setToken(token)
        localStorage.setItem('token', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        toast.success('Registrasi berhasil!')
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registrasi gagal'
      toast.error(message)
      return { success: false, message, errors: error.response?.data?.errors }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    toast.success('Logout berhasil!')
  }

  const changePassword = async (passwordData) => {
    try {
      const response = await api.post('/change-password', passwordData)
      if (response.data.success) {
        toast.success('Password berhasil diubah!')
        return { success: true }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mengubah password'
      toast.error(message)
      return { success: false, message, errors: error.response?.data?.errors }
    }
  }

  const isAdmin = () => user?.role === 'admin'
  const isManajer = () => user?.role === 'manajer'
  const isOperator = () => user?.role === 'operator'

  const hasPermission = (permission) => {
    if (!user) return false
    
    switch (permission) {
      case 'manage_users':
        return isAdmin()
      case 'view_reports':
        return isAdmin() || isManajer()
      case 'manage_inventory':
        return isAdmin() || isOperator()
      case 'view_inventory':
        return true // All authenticated users can view
      default:
        return false
    }
  }

  const value = {
    user,
    loading,
    token,
    login,
    register,
    logout,
    changePassword,
    isAdmin,
    isManajer,
    isOperator,
    hasPermission,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
