import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import { 
  Users, 
  Building, 
  ClipboardList, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react'

export function AdminDashboard() {
  const { profile } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersResult, propertiesResult, workOrdersResult, invoicesResult] = await Promise.all([
        supabase.from('profiles').select('id, role, created_at').eq('org_id', profile?.org_id),
        supabase.from('properties').select('id').eq('org_id', profile?.org_id),
        supabase.from('work_orders').select('id, status, created_at').eq('org_id', profile?.org_id),
        supabase.from('invoices').select('id, amount, status').eq('org_id', profile?.org_id)
      ])

      const users = usersResult.data || []
      const properties = propertiesResult.data || []
      const workOrders = workOrdersResult.data || []
      const invoices = invoicesResult.data || []

      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)

      return {
        totalUsers: users.length,
        totalCustomers: users.filter(u => u.role === 'customer').length,
        totalTechnicians: users.filter(u => u.role === 'technician').length,
        totalDispatchers: users.filter(u => u.role === 'dispatcher').length,
        totalProperties: properties.length,
        totalWorkOrders: workOrders.length,
        activeWorkOrders: workOrders.filter(wo => !['done', 'cancelled'].includes(wo.status)).length,
        completedWorkOrders: workOrders.filter(wo => wo.status === 'done').length,
        thisMonthWorkOrders: workOrders.filter(wo => new Date(wo.created_at) >= thisMonth).length,
        totalRevenue: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
        paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
        unpaidInvoices: invoices.filter(inv => inv.status !== 'paid').length,
        newUsersThisMonth: users.filter(u => new Date(u.created_at) >= thisMonth).length
      }
    },
    enabled: !!profile?.org_id
  })

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data } = await supabase
        .from('audit_log')
        .select(`
          id,
          action,
          table_name,
          created_at,
          profiles (full_name)
        `)
        .eq('org_id', profile?.org_id)
        .order('created_at', { ascending: false })
        .limit(10)

      return data || []
    },
    enabled: !!profile?.org_id
  })

  const { data: systemAlerts } = useQuery({
    queryKey: ['system-alerts'],
    queryFn: async () => {
      const alerts = []
      
      // Check for high priority unassigned work orders
      const { data: unassignedUrgent } = await supabase
        .from('work_orders')
        .select('id, description, properties(name)')
        .eq('org_id', profile?.org_id)
        .eq('priority', 'urgent')
        .is('assigned_to', null)
        .limit(5)

      if (unassignedUrgent && unassignedUrgent.length > 0) {
        alerts.push({
          type: 'urgent_unassigned',
          count: unassignedUrgent.length,
          message: `${unassignedUrgent.length} dringende Aufträge nicht zugewiesen`,
          items: unassignedUrgent
        })
      }

      // Check for overdue invoices
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: overdueInvoices } = await supabase
        .from('invoices')
        .select('id, invoice_number, amount')
        .eq('org_id', profile?.org_id)
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString())
        .limit(5)

      if (overdueInvoices && overdueInvoices.length > 0) {
        alerts.push({
          type: 'overdue_invoices',
          count: overdueInvoices.length,
          message: `${overdueInvoices.length} überfällige Rechnungen`,
          items: overdueInvoices
        })
      }

      return alerts
    },
    enabled: !!profile?.org_id
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Systemübersicht und Verwaltung</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Benutzer gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-gray-500">+{stats?.newUsersThisMonth || 0} diesen Monat</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Building className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Liegenschaften</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalProperties || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <ClipboardList className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aufträge aktiv</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeWorkOrders || 0}</p>
              <p className="text-xs text-gray-500">{stats?.thisMonthWorkOrders || 0} diesen Monat</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Umsatz gesamt</p>
              <p className="text-2xl font-bold text-gray-900">
                €{(stats?.totalRevenue || 0).toLocaleString('de-DE')}
              </p>
              <p className="text-xs text-gray-500">{stats?.unpaidInvoices || 0} ausstehend</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Distribution */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Benutzerverteilung</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats?.totalCustomers || 0}</p>
            <p className="text-sm text-gray-600">Kunden</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats?.totalTechnicians || 0}</p>
            <p className="text-sm text-gray-600">Techniker</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats?.totalDispatchers || 0}</p>
            <p className="text-sm text-gray-600">Dispatcher</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">1</p>
            <p className="text-sm text-gray-600">Admins</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/portal/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Benutzer verwalten</p>
              <p className="text-sm text-gray-600">Rollen und Berechtigungen</p>
            </div>
          </Link>

          <Link
            to="/portal/admin/organizations"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Building className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Organisationen</p>
              <p className="text-sm text-gray-600">Einstellungen verwalten</p>
            </div>
          </Link>

          <Link
            to="/portal/admin/reports"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Berichte</p>
              <p className="text-sm text-gray-600">Analytics anzeigen</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* System Alerts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Systemwarnungen</h2>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>

          {systemAlerts && systemAlerts.length > 0 ? (
            <div className="space-y-4">
              {systemAlerts.map((alert: any, index: number) => (
                <div key={index} className="flex items-start p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    {alert.items && alert.items.length > 0 && (
                      <ul className="mt-2 text-sm text-gray-600">
                        {alert.items.slice(0, 3).map((item: any, itemIndex: number) => (
                          <li key={itemIndex} className="truncate">
                            • {item.properties?.name || item.invoice_number || item.description}
                          </li>
                        ))}
                        {alert.items.length > 3 && (
                          <li className="text-gray-500">... und {alert.items.length - 3} weitere</li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Keine Systemwarnungen</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Letzte Aktivitäten</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.profiles?.full_name || 'System'}</span>
                      {' '}
                      {activity.action === 'INSERT' && 'hat erstellt'}
                      {activity.action === 'UPDATE' && 'hat aktualisiert'}
                      {activity.action === 'DELETE' && 'hat gelöscht'}
                      {' '}
                      <span className="text-gray-600">
                        {activity.table_name === 'work_orders' && 'einen Arbeitsauftrag'}
                        {activity.table_name === 'profiles' && 'ein Benutzerprofil'}
                        {activity.table_name === 'properties' && 'eine Liegenschaft'}
                        {activity.table_name === 'invoices' && 'eine Rechnung'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.created_at).toLocaleString('de-DE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Keine Aktivitäten</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      {stats && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Leistungskennzahlen</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completedWorkOrders}</p>
              <p className="text-sm text-gray-600">Abgeschlossene Aufträge</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalWorkOrders > 0 ? Math.round((stats.completedWorkOrders / stats.totalWorkOrders) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">Abschlussrate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.paidInvoices}</p>
              <p className="text-sm text-gray-600">Bezahlte Rechnungen</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                €{stats.totalRevenue > 0 ? Math.round(stats.totalRevenue / Math.max(stats.completedWorkOrders, 1)) : 0}
              </p>
              <p className="text-sm text-gray-600">Ø Auftragswert</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
