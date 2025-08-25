import React, { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { 
  Menu, 
  X, 
  Home, 
  Building, 
  ClipboardList, 
  FileText, 
  Calendar,
  Users,
  Settings,
  LogOut,
  Wrench
} from 'lucide-react'

export function Layout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const getNavigationItems = () => {
    if (!profile) return []

    const baseItems = [
      { name: 'Dashboard', href: `/portal/${profile.role}`, icon: Home },
    ]

    switch (profile.role) {
      case 'customer':
        return [
          ...baseItems,
          { name: 'Liegenschaften', href: '/portal/customer/properties', icon: Building },
          { name: 'Serviceanfragen', href: '/portal/customer/requests', icon: ClipboardList },
          { name: 'Rechnungen', href: '/portal/customer/invoices', icon: FileText },
        ]
      case 'technician':
        return [
          ...baseItems,
          { name: 'Arbeitsaufträge', href: '/portal/technician/workorders', icon: Wrench },
        ]
      case 'dispatcher':
        return [
          ...baseItems,
          { name: 'Aufträge', href: '/portal/dispatcher/workorders', icon: ClipboardList },
          { name: 'Kalender', href: '/portal/dispatcher/calendar', icon: Calendar },
        ]
      case 'admin':
        return [
          ...baseItems,
          { name: 'Benutzer', href: '/portal/admin/users', icon: Users },
          { name: 'Einstellungen', href: '/portal/admin/settings', icon: Settings },
        ]
      default:
        return baseItems
    }
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-primary-600">Fenstri</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <button
              onClick={handleSignOut}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Abmelden
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-primary-600">Fenstri</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.full_name || profile?.email}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {profile?.role}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="ml-3 flex-shrink-0 p-1 text-gray-400 hover:text-gray-500"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-2">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Fenstri</h1>
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-600"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-8 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
