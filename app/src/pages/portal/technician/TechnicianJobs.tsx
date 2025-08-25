import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import { 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Filter,
  Search,
  Play,
  Pause,
  Check,
  Camera,
  FileText
} from 'lucide-react'

interface WorkOrder {
  id: string
  status: string
  service: string
  description: string
  scheduled_at: string | null
  created_at: string
  priority: string
  properties: {
    name: string
    address_line1: string
    city: string
  }
}

export function TechnicianJobs() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [selectedJob, setSelectedJob] = useState<WorkOrder | null>(null)

  const { data: workOrders, isLoading } = useQuery({
    queryKey: ['technician-jobs'],
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
          priority,
          properties (name, address_line1, city)
        `)
        .eq('assigned_to', profile?.id)
        .order('scheduled_at', { ascending: true, nullsLast: true })

      return data as WorkOrder[]
    },
    enabled: !!profile?.id
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('work_orders')
        .update({ status })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-jobs'] })
    }
  })

  const filteredWorkOrders = workOrders?.filter(wo => {
    const matchesSearch = wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.properties.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter
    const matchesService = serviceFilter === 'all' || wo.service === serviceFilter
    
    return matchesSearch && matchesStatus && matchesService
  }) || []

  const getStatusIcon = (status: string) => {
    switch (status) {
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
      case 'scheduled': return 'Geplant'
      case 'in_progress': return 'In Bearbeitung'
      case 'done': return 'Abgeschlossen'
      case 'qa_hold': return 'QS-Prüfung'
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
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
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

  const handleStatusUpdate = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus })
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
        <h1 className="text-3xl font-bold text-gray-900">Meine Aufträge</h1>
        <p className="text-gray-600">Verwalten Sie Ihre zugewiesenen Arbeitsaufträge</p>
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
                placeholder="Beschreibung oder Liegenschaft..."
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
              <option value="scheduled">Geplant</option>
              <option value="in_progress">In Bearbeitung</option>
              <option value="done">Abgeschlossen</option>
              <option value="qa_hold">QS-Prüfung</option>
            </select>
          </div>

          <div>
            <label className="form-label">Service</label>
            <select
              className="form-input"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="all">Alle Services</option>
              <option value="maintenance">Wartung</option>
              <option value="repair">Reparatur</option>
              <option value="inspection">Inspektion</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setServiceFilter('all')
              }}
              className="btn btn-secondary w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {filteredWorkOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredWorkOrders.map((workOrder) => (
            <div key={workOrder.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(workOrder.status)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full status-${workOrder.status}`}>
                      {getStatusText(workOrder.status)}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                      {getServiceText(workOrder.service)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(workOrder.priority)}`}>
                      {getPriorityText(workOrder.priority)}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {workOrder.properties.name}
                  </h3>

                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {workOrder.properties.address_line1}, {workOrder.properties.city}
                  </div>

                  <p className="text-gray-700 mb-4">{workOrder.description}</p>

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Erstellt: {new Date(workOrder.created_at).toLocaleDateString('de-DE')}
                    </div>
                    {workOrder.scheduled_at && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Geplant: {new Date(workOrder.scheduled_at).toLocaleDateString('de-DE')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  {workOrder.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatusUpdate(workOrder.id, 'in_progress')}
                      className="btn btn-primary btn-sm flex items-center"
                      disabled={updateStatusMutation.isPending}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Starten
                    </button>
                  )}
                  
                  {workOrder.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(workOrder.id, 'done')}
                        className="btn btn-success btn-sm flex items-center"
                        disabled={updateStatusMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Abschließen
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(workOrder.id, 'qa_hold')}
                        className="btn btn-warning btn-sm flex items-center"
                        disabled={updateStatusMutation.isPending}
                      >
                        <Pause className="w-4 h-4 mr-1" />
                        QS-Halt
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setSelectedJob(workOrder)}
                    className="btn btn-secondary btn-sm flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {workOrders?.length === 0 ? 'Keine Aufträge zugewiesen' : 'Keine Ergebnisse'}
          </h3>
          <p className="text-gray-600">
            {workOrders?.length === 0 
              ? 'Warten Sie auf neue Auftragszuweisungen.'
              : 'Versuchen Sie andere Suchkriterien.'
            }
          </p>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Auftragsdetails
                </h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedJob.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full status-${selectedJob.status}`}>
                    {getStatusText(selectedJob.status)}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {getServiceText(selectedJob.service)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedJob.priority)}`}>
                    {getPriorityText(selectedJob.priority)}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Liegenschaft</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedJob.properties.name}
                  </p>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedJob.properties.address_line1}, {selectedJob.properties.city}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Beschreibung</label>
                  <p className="text-gray-900 mt-1">{selectedJob.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Erstellt am</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedJob.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  {selectedJob.scheduled_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Geplant für</label>
                      <p className="text-gray-900 mt-1">
                        {new Date(selectedJob.scheduled_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  {selectedJob.status === 'scheduled' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedJob.id, 'in_progress')
                        setSelectedJob(null)
                      }}
                      className="btn btn-primary flex items-center"
                      disabled={updateStatusMutation.isPending}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Starten
                    </button>
                  )}
                  
                  {selectedJob.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedJob.id, 'done')
                          setSelectedJob(null)
                        }}
                        className="btn btn-success flex items-center"
                        disabled={updateStatusMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Abschließen
                      </button>
                      <button
                        onClick={() => {
                          handleStatusUpdate(selectedJob.id, 'qa_hold')
                          setSelectedJob(null)
                        }}
                        className="btn btn-warning flex items-center"
                        disabled={updateStatusMutation.isPending}
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        QS-Halt
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="btn btn-secondary"
                  >
                    Schließen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
