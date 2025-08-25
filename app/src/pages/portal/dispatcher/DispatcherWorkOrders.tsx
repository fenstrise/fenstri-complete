import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import { 
  Search, 
  Filter, 
  User, 
  Calendar, 
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserPlus
} from 'lucide-react'

interface WorkOrder {
  id: string
  status: string
  service: string
  description: string
  priority: string
  scheduled_at: string | null
  created_at: string
  assigned_to: string | null
  properties: {
    name: string
    address_line1: string
    city: string
  }
  profiles: {
    full_name: string
  } | null
}

export function DispatcherWorkOrders() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assignmentModal, setAssignmentModal] = useState<{ workOrderId: string; isOpen: boolean }>({ workOrderId: '', isOpen: false })

  const { data: workOrders, isLoading } = useQuery({
    queryKey: ['dispatcher-work-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('work_orders')
        .select(`
          id,
          status,
          service,
          description,
          priority,
          scheduled_at,
          created_at,
          assigned_to,
          properties (name, address_line1, city),
          profiles (full_name)
        `)
        .eq('org_id', profile?.org_id)
        .order('created_at', { ascending: false })

      return data as WorkOrder[]
    },
    enabled: !!profile?.org_id
  })

  const { data: technicians } = useQuery({
    queryKey: ['available-technicians'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'technician')
        .eq('org_id', profile?.org_id)
        .order('full_name')

      return data || []
    },
    enabled: !!profile?.org_id
  })

  const assignTechnicianMutation = useMutation({
    mutationFn: async ({ workOrderId, technicianId }: { workOrderId: string; technicianId: string }) => {
      const { error } = await supabase
        .from('work_orders')
        .update({ 
          assigned_to: technicianId,
          status: 'scheduled'
        })
        .eq('id', workOrderId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatcher-work-orders'] })
      setAssignmentModal({ workOrderId: '', isOpen: false })
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ workOrderId, status }: { workOrderId: string; status: string }) => {
      const { error } = await supabase
        .from('work_orders')
        .update({ status })
        .eq('id', workOrderId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatcher-work-orders'] })
    }
  })

  const filteredWorkOrders = workOrders?.filter(wo => {
    const matchesSearch = wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.properties.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || wo.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  }) || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-5 h-5 text-orange-500" />
      case 'scheduled':
        return <Calendar className="w-5 h-5 text-blue-500" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'done':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'qa_hold':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Entwurf'
      case 'scheduled': return 'Geplant'
      case 'in_progress': return 'In Bearbeitung'
      case 'done': return 'Abgeschlossen'
      case 'qa_hold': return 'QS-Prüfung'
      case 'cancelled': return 'Storniert'
      default: return status
    }
  }

  const getServiceText = (service: string) => {
    switch (service) {
      case 'maintenance': return 'Wartung'
      case 'repair': return 'Reparatur'
      case 'inspection': return 'Inspektion'
      default: return service
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Dringend'
      case 'high': return 'Hoch'
      case 'medium': return 'Mittel'
      case 'low': return 'Niedrig'
      default: return priority
    }
  }

  const handleAssignTechnician = (technicianId: string) => {
    assignTechnicianMutation.mutate({
      workOrderId: assignmentModal.workOrderId,
      technicianId
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Arbeitsaufträge</h1>
        <p className="text-gray-600">Verwalten und zuweisen Sie Arbeitsaufträge an Techniker</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Suche</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Beschreibung, Liegenschaft oder Techniker..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Alle Status</option>
              <option value="draft">Entwurf</option>
              <option value="scheduled">Geplant</option>
              <option value="in_progress">In Bearbeitung</option>
              <option value="done">Abgeschlossen</option>
              <option value="qa_hold">QS-Prüfung</option>
            </select>
          </div>

          <div>
            <label className="form-label">Priorität</label>
            <select
              className="form-input"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">Alle Prioritäten</option>
              <option value="urgent">Dringend</option>
              <option value="high">Hoch</option>
              <option value="medium">Mittel</option>
              <option value="low">Niedrig</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setPriorityFilter('all')
              }}
              className="btn btn-secondary w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      {filteredWorkOrders.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auftrag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liegenschaft
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Techniker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priorität
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkOrders.map((workOrder) => (
                  <tr key={workOrder.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center mb-1">
                          {getStatusIcon(workOrder.status)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {getServiceText(workOrder.service)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {workOrder.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {workOrder.properties.name}
                        </p>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          {workOrder.properties.city}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {workOrder.profiles?.full_name ? (
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {workOrder.profiles.full_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Nicht zugewiesen</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full status-${workOrder.status}`}>
                        {getStatusText(workOrder.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(workOrder.priority)}`}>
                        {getPriorityText(workOrder.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(workOrder.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {!workOrder.assigned_to && (
                          <button
                            onClick={() => setAssignmentModal({ workOrderId: workOrder.id, isOpen: true })}
                            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                            title="Techniker zuweisen"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                        
                        {workOrder.status === 'qa_hold' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ workOrderId: workOrder.id, status: 'done' })}
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                            title="Freigeben"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {workOrders?.length === 0 ? 'Keine Arbeitsaufträge' : 'Keine Ergebnisse'}
          </h3>
          <p className="text-gray-600">
            {workOrders?.length === 0 
              ? 'Arbeitsaufträge werden von Kunden erstellt.'
              : 'Versuchen Sie andere Suchkriterien.'
            }
          </p>
        </div>
      )}

      {/* Assignment Modal */}
      {assignmentModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Techniker zuweisen
              </h2>

              <div className="space-y-4">
                {technicians && technicians.length > 0 ? (
                  technicians.map((technician: any) => (
                    <button
                      key={technician.id}
                      onClick={() => handleAssignTechnician(technician.id)}
                      disabled={assignTechnicianMutation.isPending}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{technician.full_name}</p>
                          <p className="text-sm text-gray-600">{technician.email}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Keine Techniker verfügbar</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 mt-6 border-t">
                <button
                  onClick={() => setAssignmentModal({ workOrderId: '', isOpen: false })}
                  className="btn btn-secondary"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
