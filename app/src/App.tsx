import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth'

// Layout Components
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'

// Public Pages
import { HomePage } from './pages/public/HomePage'
import { ServicesPage } from './pages/public/ServicesPage'
import { IndustryPage } from './pages/public/IndustryPage'
import { LocationPage } from './pages/public/LocationPage'
import { ContactPage } from './pages/public/ContactPage'

// Customer Portal
import { CustomerDashboard } from './pages/portal/customer/CustomerDashboard'
import { CustomerProperties } from './pages/portal/customer/CustomerProperties'
import { CustomerRequests } from './pages/portal/customer/CustomerRequests'
import { CustomerInvoices } from './pages/portal/customer/CustomerInvoices'

// Technician Portal
import { TechnicianDashboard } from './pages/portal/technician/TechnicianDashboard'
import { TechnicianWorkOrders } from './pages/portal/technician/TechnicianWorkOrders'
import { TechnicianWorkOrderDetail } from './pages/portal/technician/TechnicianWorkOrderDetail'

// Dispatcher Portal
import { DispatcherDashboard } from './pages/portal/dispatcher/DispatcherDashboard'
import { DispatcherWorkOrders } from './pages/portal/dispatcher/DispatcherWorkOrders'
import { DispatcherCalendar } from './pages/portal/dispatcher/DispatcherCalendar'

// Admin Portal
import { AdminDashboard } from './pages/portal/admin/AdminDashboard'
import { AdminUsers } from './pages/portal/admin/AdminUsers'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/industry/:industry" element={<IndustryPage />} />
          <Route path="/location/:location" element={<LocationPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Portal Routes */}
          <Route path="/portal" element={<Layout />}>
            {/* Customer Portal */}
            <Route path="customer" element={<ProtectedRoute allowedRoles={['customer']} />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="properties" element={<CustomerProperties />} />
              <Route path="requests" element={<CustomerRequests />} />
              <Route path="invoices" element={<CustomerInvoices />} />
            </Route>

            {/* Technician Portal */}
            <Route path="technician" element={<ProtectedRoute allowedRoles={['technician']} />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<TechnicianDashboard />} />
              <Route path="workorders" element={<TechnicianWorkOrders />} />
              <Route path="workorders/:id" element={<TechnicianWorkOrderDetail />} />
            </Route>

            {/* Dispatcher Portal */}
            <Route path="dispatcher" element={<ProtectedRoute allowedRoles={['dispatcher', 'admin']} />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DispatcherDashboard />} />
              <Route path="workorders" element={<DispatcherWorkOrders />} />
              <Route path="calendar" element={<DispatcherCalendar />} />
            </Route>

            {/* Admin Portal */}
            <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>

            {/* Default redirect based on role */}
            <Route index element={<ProtectedRoute />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
