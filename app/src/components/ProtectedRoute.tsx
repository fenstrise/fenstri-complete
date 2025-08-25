import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'

interface ProtectedRouteProps {
  allowedRoles?: string[]
  children?: React.ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profil wird eingerichtet...</h2>
          <p className="text-gray-600">Bitte warten Sie einen Moment.</p>
        </div>
      </div>
    )
  }

  // If no specific roles are required, redirect based on user role
  if (!allowedRoles) {
    switch (profile.role) {
      case 'customer':
        return <Navigate to="/portal/customer" replace />
      case 'technician':
        return <Navigate to="/portal/technician" replace />
      case 'dispatcher':
        return <Navigate to="/portal/dispatcher" replace />
      case 'admin':
        return <Navigate to="/portal/admin" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  // Check if user has required role
  if (!allowedRoles.includes(profile.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Zugriff verweigert</h2>
          <p className="text-gray-600">Sie haben keine Berechtigung für diesen Bereich.</p>
        </div>
      </div>
    )
  }

  return children ? <>{children}</> : <Outlet />
}
