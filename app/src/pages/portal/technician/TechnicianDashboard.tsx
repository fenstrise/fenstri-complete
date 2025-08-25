import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import { 
  Calendar, 
  ClipboardList, 
  Clock, 
  CheckCircle,
  MapPin,
  Wrench,
  AlertTriangle,
  User
} from 'lucide-react'

export function TechnicianDashboard() {
  const { profile } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['technician-stats'],
    queryFn: async () => {
      const [assignedResult, completedResult] = await Promise.all([
        supabase
          .from('work_orders')
          .select('id, status, created_at')
          .eq('assigned_to', profile?.id),
        supabase
          .from('work_orders')
          .select('id, created_at')
          .eq('assigned_to', profile?.id)
          .eq('status', 'done')
      ])

      const assigned = assignedResult.data || []
      const completed = completedResult.data || []

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const thisWeek = new Date(today)
      thisWeek.setDate(today.getDate() - today.getDay())

      return {
        totalAssigned: assigned.length,
        activeJobs: assigned.filter(wo => !['done', 'cancelled'].includes(wo.status)).length,
        completedJobs: completed.length,
        todayJobs: assigned.filter(wo => {
          const woDate = new Date(wo.created_at)
          woDate.setHours(0, 0, 0, 0)
          return woDate.getTime() === today.getTime()
        }).length,
        thisWeekCompleted: completed.filter(wo => new Date(wo.created_at) >= thisWeek).length
      }
    },
    enabled: !!profile?.id
  })

  const { data: todayWorkOrders } = useQuery({
    queryKey: ['today-work-orders'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      
      const { data } = await supabase
        .from('work_orders')
        .select(`
          id,
          status,
          service,
          description,
          scheduled_at,
          properties (name, address_line1, city)
        `)
        .eq('assigned_to', profile?.id)
        .gte('scheduled_at', today)
        .lt('scheduled_at', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('scheduled_at')

      return data || []
    },
    enabled: !!profile?.id
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
        .eq('assigned_to', profile?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      return data || []
    },
    enabled: !!profile?.id
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
        <h1 className="text-3xl font-bold text-gray-900">Techniker Dashboard</h1>
        <p className="text-gray-600">Willkommen zurück! Hier ist eine Übersicht Ihrer Aufträge.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <ClipboardList className="w-8 h-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktive Aufträge</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeJobs || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Heute geplant</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.todayJobs || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Abgeschlossen</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.completedJobs || 0}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Wrench className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Diese Woche</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.thisWeekCompleted || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Heutiger Zeitplan</h2>
          <Link
            to="/portal/technician/schedule"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Vollständigen Zeitplan anzeigen
          </Link>
        </div>

        {todayWorkOrders && todayWorkOrders.length > 0 ? (
          <div className="space-y-4">
            {todayWorkOrders.map((workOrder: any) => (
              <div key={workOrder.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full status-${workOrder.status}`}>
                      {workOrder.status === 'scheduled' && 'Geplant'}
                      {workOrder.status === 'in_progress' && 'In Bearbeitung'}
                      {workOrder.status === 'done' && 'Abgeschlossen'}
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
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {workOrder.properties?.address_line1}, {workOrder.properties?.city}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2">
                    {workOrder.description}
                  </p>
                </div>

                <div className="ml-4 text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {workOrder.scheduled_at ? 
                      new Date(workOrder.scheduled_at).toLocaleTimeString('de-DE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : 
                      'Keine Zeit'
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Keine Termine für heute geplant</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/portal/technician/jobs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ClipboardList className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Meine Aufträge</p>
              <p className="text-sm text-gray-600">Alle zugewiesenen Jobs</p>
            </div>
          </Link>

          <Link
            to="/portal/technician/schedule"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Zeitplan</p>
              <p className="text-sm text-gray-600">Termine verwalten</p>
            </div>
          </Link>

          <Link
            to="/portal/technician/reports"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CheckCircle className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Berichte</p>
              <p className="text-sm text-gray-600">Arbeit dokumentieren</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Work Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Aktuelle Aufträge</h2>
          <Link
            to="/portal/technician/jobs"
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
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {workOrder.properties?.address_line1}, {workOrder.properties?.city}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2">
                    {workOrder.description}
                  </p>
                </div>

                <div className="ml-4">
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
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Noch keine Aufträge zugewiesen</p>
          </div>
        )}
      </div>

      {/* Performance Summary */}
      {stats && stats.completedJobs > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Leistungsübersicht</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{stats.completedJobs}</p>
              <p className="text-sm text-gray-600">Abgeschlossene Aufträge</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.thisWeekCompleted}</p>
              <p className="text-sm text-gray-600">Diese Woche abgeschlossen</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {stats.completedJobs > 0 ? Math.round((stats.completedJobs / stats.totalAssigned) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">Abschlussrate</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
