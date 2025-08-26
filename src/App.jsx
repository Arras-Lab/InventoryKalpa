import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import WoodInventory from './pages/WoodInventory'
import WoodInventoryForm from './pages/WoodInventoryForm'
import Users from './pages/Users'
import Profile from './pages/Profile'
import LoadingSpinner from './components/LoadingSpinner'

// Protected Route Component
const ProtectedRoute = ({ children, permission }) => {
  const { user, loading, hasPermission } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 mb-4">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn-primary"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  return children
}

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route 
            path="inventory" 
            element={
              <ProtectedRoute permission="view_inventory">
                <WoodInventory />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="inventory/add" 
            element={
              <ProtectedRoute permission="manage_inventory">
                <WoodInventoryForm />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="inventory/edit/:noKontrak/:noKapling/:skshh/:urutanPengiriman" 
            element={
              <ProtectedRoute permission="manage_inventory">
                <WoodInventoryForm />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="users" 
            element={
              <ProtectedRoute permission="manage_users">
                <Users />
              </ProtectedRoute>
            } 
          />
          
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App
