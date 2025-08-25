import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Filter,
  Search
} from 'lucide-react'

interface WorkOrder {
  id: string
  status: string
  service: string
  description: string
  scheduled_at: string | null
  created_at: string
  properties: {
    name: string
    address_line1: string
    city: string
  }
}

export function CustomerRequests() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [formData, setFormData] = useState({
    property_id: '',
    service: 'maintenance',
    description: '',
    priority: 'medium',
    preferred_date: ''
  })

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('id, name, address_line1, city')
        .eq('org_id', profile?.org_id)
        .order('name')

      return data || []
    },
    enabled: !!profile?.org_id
  })

  const { data: workOrders, isLoading } = useQuery({
    queryKey: ['work-orders'],
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

      return data as any
    },
    enabled: !!profile?.org_id
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('work_orders')
        .insert([{
          ...data,
          org_id: profile?.org_id,
          status: 'draft',
          scheduled_at: data.preferred_date || null
        }])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] })
      setIsModalOpen(false)
      resetForm()
    }
  })

  const resetForm = () => {
    setFormData({
      property_id: '',
      service: 'maintenance',
      description: '',
      priority: 'medium',
      preferred_date: ''
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const filteredWorkOrders = workOrders?.filter(wo => {
    const matchesSearch = wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         wo.properties.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter
    const matchesService = serviceFilter === 'all' || wo.service === serviceFilter
    
    return matchesSearch && matchesStatus && matchesService
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Serviceanfragen</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Wartungs- und Reparaturanfragen</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setIsModalOpen(true)
          }}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Neue Anfrage
        </button>
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
              <option value="draft">Entwurf</option>
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

      {/* Work Orders List */}
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {workOrders?.length === 0 ? 'Keine Serviceanfragen' : 'Keine Ergebnisse'}
          </h3>
          <p className="text-gray-600 mb-6">
            {workOrders?.length === 0 
              ? 'Erstellen Sie Ihre erste Serviceanfrage.'
              : 'Versuchen Sie andere Suchkriterien.'
            }
          </p>
          {workOrders?.length === 0 && (
            <button
              onClick={() => {
                resetForm()
                setIsModalOpen(true)
              }}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Erste Anfrage erstellen
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Neue Serviceanfrage
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Liegenschaft *</label>
                  <select
                    required
                    className="form-input"
                    value={formData.property_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, property_id: e.target.value }))}
                  >
                    <option value="">Bitte wählen...</option>
                    {properties?.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name} - {property.address_line1}, {property.city}
                      </option>
                    ))}
                  </select>
                  {!properties?.length && (
                    <p className="text-sm text-gray-500 mt-1">
                      Keine Liegenschaften verfügbar. Bitte fügen Sie zuerst eine Liegenschaft hinzu.
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Service *</label>
                    <select
                      className="form-input"
                      value={formData.service}
                      onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                    >
                      <option value="maintenance">Wartung</option>
                      <option value="repair">Reparatur</option>
                      <option value="inspection">Inspektion</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Priorität</label>
                    <select
                      className="form-input"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Niedrig</option>
                      <option value="medium">Mittel</option>
                      <option value="high">Hoch</option>
                      <option value="urgent">Dringend</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Beschreibung *</label>
                  <textarea
                    required
                    rows={4}
                    className="form-input"
                    placeholder="Beschreiben Sie das Problem oder den gewünschten Service..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="form-label">Wunschtermin</label>
                  <input
                    type="date"
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.preferred_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferred_date: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      resetForm()
                    }}
                    className="btn btn-secondary"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !properties?.length}
                    className="btn btn-primary"
                  >
                    {createMutation.isPending ? 'Erstellen...' : 'Anfrage erstellen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
