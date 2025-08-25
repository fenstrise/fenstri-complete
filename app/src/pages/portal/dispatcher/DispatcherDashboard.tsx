import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import { 
  Users, 
  ClipboardList, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  User
} from 'lucide-react'

export function DispatcherDashboard() {
  const { profile } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dispatcher-stats'],
    queryFn: async () => {
      const [workOrdersResult, techniciansResult, alertsResult] = await Promise.all([
        supabase.from('work_orders').select('id, status, created_at').eq('org_id', profile?.org_id),
        supabase.from('profiles').select('id').eq('role', 'technician').eq('org_id', profile?.org_id),
        supabase.from('work_orders').select('id, priority').eq('org_id', profile?.org_id).in('status', ['draft', 'scheduled'])
      ])

      const workOrders = workOrdersResult.data || []
      const technicians = techniciansResult.data || []
      const alerts = alertsResult.data || []

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      return {
        totalWorkOrders: workOrders.length,
        activeWorkOrders: workOrders.filter(wo => !['done', 'cancelled'].includes(wo.status)).length,
        completedToday: workOrders.filter(wo => {
          const woDate = new Date(wo.created_at)
          woDate.setHours(0, 0, 0, 0)
          return woDate.getTime() === today.getTime() && wo.status === 'done'
        }).length,
        availableTechnicians: technicians.length,
        urgentAlerts: alerts.filter(wo => wo.priority === 'urgent').length,
        unassignedJobs: workOrders.filter(wo => wo.status === 'draft').length
      }
    },
    enabled: !!profile?.org_id
  })

  const { data: recentWorkOrders } = useQuery({
    queryKey: ['recent-work-orders-dispatcher'],
    queryFn: async () => {
      const { data } = await supabase
        .from('work_orders')
        .select(`
          id,
          status,
          service,
          description,
          priority,
          created_at,
          properties (name, address_line1, city),
          profiles (full_name)
        `)
        .eq('org_id', profile?.org_id)
        .order('created_at', { ascending: false })
        .limit(5)

      return data || []
    },
    enabled: !!profile?.org_id
  })

  const { data: alerts } = useQuery({
    queryKey: ['dispatcher-alerts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('work_orders')
        .select(`
          id,
          status,
          priority,
          description,
          properties (name)
        `)
        .eq('org_id', profile?.org_id)
        .in('priority', ['urgent', 'high'])
        .in('status', ['draft', 'scheduled'])
        .order('priority', { ascending: false })
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
        <h1 className="text-3xl font-bold text-gray-900">Dispatcher Dashboard</h1>
        <p className="text-gray-600">Übersicht über alle Arbeitsaufträge und Techniker</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <ClipboardList className="w-8 h-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktive Aufträge</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeWorkOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verfügbare Techniker</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.availableTechnicians || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dringende Aufträge</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.urgentAlerts || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Heute abgeschlossen</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.completedToday || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/portal/dispatcher/work-orders"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ClipboardList className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Aufträge verwalten</p>
              <p className="text-sm text-gray-600">Zuweisen und verfolgen</p>
            </div>
          </Link>

          <Link
            to="/portal/dispatcher/calendar"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Terminplanung</p>
              <p className="text-sm text-gray-600">Kalender anzeigen</p>
            </div>
          </Link>

          <Link
            to="/portal/dispatcher/technicians"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Techniker</p>
              <p className="text-sm text-gray-600">Verfügbarkeit prüfen</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Work Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Aktuelle Aufträge</h2>
            <Link
              to="/portal/dispatcher/work-orders"
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
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        workOrder.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        workOrder.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {workOrder.priority === 'urgent' ? 'Dringend' :
                         workOrder.priority === 'high' ? 'Hoch' :
                         workOrder.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900">
                      {workOrder.properties?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {workOrder.description}
                    </p>
                    
                    {workOrder.profiles?.full_name && (
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <User className="w-3 h-3 mr-1" />
                        {workOrder.profiles.full_name}
                      </div>
                    )}
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Keine aktuellen Aufträge</p>
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Warnungen</h2>
            <span className="text-sm text-gray-500">Dringende Aufmerksamkeit erforderlich</span>
          </div>

          {alerts && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert: any) => (
                <div key={alert.id} className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        alert.priority === 'urgent' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {alert.priority === 'urgent' ? 'DRINGEND' : 'HOCH'}
                      </span>
                      <span className="text-xs text-gray-600">
                        {alert.status === 'draft' ? 'Nicht zugewiesen' : 'Geplant'}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900">
                      {alert.properties?.name}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {alert.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Keine dringenden Warnungen</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tagesübersicht</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{stats.totalWorkOrders}</p>
              <p className="text-sm text-gray-600">Gesamt Aufträge</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.unassignedJobs}</p>
              <p className="text-sm text-gray-600">Nicht zugewiesen</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.activeWorkOrders}</p>
              <p className="text-sm text-gray-600">In Bearbeitung</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completedToday}</p>
              <p className="text-sm text-gray-600">Heute abgeschlossen</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
