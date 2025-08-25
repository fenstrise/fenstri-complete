import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import { 
  Building, 
  ClipboardList, 
  FileText, 
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

export function CustomerDashboard() {
  const { profile } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: async () => {
      const [propertiesResult, workOrdersResult, invoicesResult] = await Promise.all([
        supabase.from('properties').select('id').eq('org_id', profile?.org_id),
        supabase.from('work_orders').select('id, status, created_at').eq('org_id', profile?.org_id),
        supabase.from('invoices').select('id, status, amount').eq('org_id', profile?.org_id)
      ])

      const properties = propertiesResult.data || []
      const workOrders = workOrdersResult.data || []
      const invoices = invoicesResult.data || []

      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)

      return {
        totalProperties: properties.length,
        totalWorkOrders: workOrders.length,
        activeWorkOrders: workOrders.filter(wo => !['done', 'cancelled'].includes(wo.status)).length,
        completedWorkOrders: workOrders.filter(wo => wo.status === 'done').length,
        thisMonthWorkOrders: workOrders.filter(wo => new Date(wo.created_at) >= thisMonth).length,
        totalInvoices: invoices.length,
        unpaidInvoices: invoices.filter(inv => inv.status !== 'paid').length,
        totalAmount: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0)
      }
    },
    enabled: !!profile?.org_id
  })

  const { data: recentWorkOrders } = useQuery({
    queryKey: ['recent-work-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('work_orders')
        .select(`
          id,
          status,
          service,
          description,
          scheduled_at,
          created_at,
          properties (name, address_line1, city)
        `)
        .eq('org_id', profile?.org_id)
        .order('created_at', { ascending: false })
        .limit(5)

      return data || []
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Willkommen zurück! Hier ist eine Übersicht Ihrer Aktivitäten.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <Building className="w-8 h-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Liegenschaften</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalProperties || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <ClipboardList className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktive Aufträge</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeWorkOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Abgeschlossen</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.completedWorkOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Offene Rechnungen</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.unpaidInvoices || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/portal/customer/requests"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Neue Serviceanfrage</p>
              <p className="text-sm text-gray-600">Service beauftragen</p>
            </div>
          </Link>

          <Link
            to="/portal/customer/properties"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Building className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Liegenschaften verwalten</p>
              <p className="text-sm text-gray-600">Objekte hinzufügen</p>
            </div>
          </Link>

          <Link
            to="/portal/customer/invoices"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Rechnungen einsehen</p>
              <p className="text-sm text-gray-600">PDF herunterladen</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Work Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Aktuelle Aufträge</h2>
          <Link
            to="/portal/customer/requests"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Alle anzeigen
          </Link>
        </div>

        {recentWorkOrders && recentWorkOrders.length > 0 ? (
          <div className="space-y-4">
            {recentWorkOrders.map((workOrder: any) => (
              <div key={workOrder.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full status-${workOrder.status}`}>
                      {workOrder.status === 'draft' && 'Entwurf'}
                      {workOrder.status === 'scheduled' && 'Geplant'}
                      {workOrder.status === 'in_progress' && 'In Bearbeitung'}
                      {workOrder.status === 'done' && 'Abgeschlossen'}
                      {workOrder.status === 'qa_hold' && 'QS-Prüfung'}
                      {workOrder.status === 'cancelled' && 'Storniert'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {workOrder.service === 'maintenance' && 'Wartung'}
                      {workOrder.service === 'repair' && 'Reparatur'}
                      {workOrder.service === 'inspection' && 'Inspektion'}
                    </span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900">
                    {workOrder.properties?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {workOrder.description}
                  </p>
                  
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {workOrder.scheduled_at ? 
                      `Geplant: ${new Date(workOrder.scheduled_at).toLocaleDateString('de-DE')}` :
                      `Erstellt: ${new Date(workOrder.created_at).toLocaleDateString('de-DE')}`
                    }
                  </div>
                </div>

                <div className="ml-4">
                  {workOrder.status === 'draft' && (
                    <Clock className="w-5 h-5 text-orange-500" />
                  )}
                  {workOrder.status === 'scheduled' && (
                    <Calendar className="w-5 h-5 text-blue-500" />
                  )}
                  {workOrder.status === 'in_progress' && (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                  {workOrder.status === 'done' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {workOrder.status === 'qa_hold' && (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Noch keine Aufträge vorhanden</p>
            <Link
              to="/portal/customer/requests"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Erste Serviceanfrage erstellen
            </Link>
          </div>
        )}
      </div>

      {/* Monthly Summary */}
      {stats && stats.thisMonthWorkOrders > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monatsübersicht</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{stats.thisMonthWorkOrders}</p>
              <p className="text-sm text-gray-600">Aufträge diesen Monat</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completedWorkOrders}</p>
              <p className="text-sm text-gray-600">Abgeschlossene Aufträge</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                €{(stats.totalAmount || 0).toLocaleString('de-DE')}
              </p>
              <p className="text-sm text-gray-600">Gesamtvolumen</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
