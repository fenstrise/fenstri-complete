import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import { Building, Plus, Edit, Trash2, MapPin, Phone, Mail } from 'lucide-react'

interface Property {
  id: string
  name: string
  address_line1: string
  address_line2?: string
  city: string
  postal_code: string
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  notes?: string
  created_at: string
}

export function CustomerProperties() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    notes: ''
  })

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('org_id', profile?.org_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Property[]
    },
    enabled: !!profile?.org_id
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('properties')
        .insert([{ ...data, org_id: profile?.org_id }])

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      setIsModalOpen(false)
      resetForm()
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('properties')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      setIsModalOpen(false)
      setEditingProperty(null)
      resetForm()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      postal_code: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      notes: ''
    })
  }

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setFormData({
      name: property.name,
      address_line1: property.address_line1,
      address_line2: property.address_line2 || '',
      city: property.city,
      postal_code: property.postal_code,
      contact_name: property.contact_name || '',
      contact_phone: property.contact_phone || '',
      contact_email: property.contact_email || '',
      notes: property.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingProperty) {
      updateMutation.mutate({ id: editingProperty.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Sind Sie sicher, dass Sie diese Liegenschaft löschen möchten?')) {
      deleteMutation.mutate(id)
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
          <h1 className="text-3xl font-bold text-gray-900">Liegenschaften</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Immobilien und Standorte</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingProperty(null)
            setIsModalOpen(true)
          }}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Liegenschaft hinzufügen
        </button>
      </div>

      {properties && properties.length > 0 ? (
        <div className="grid gap-6">
          {properties.map((property) => (
            <div key={property.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Building className="w-5 h-5 text-primary-600 mr-2" />
                    <h3 className="text-xl font-semibold text-gray-900">{property.name}</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-start mb-3">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                        <div>
                          <p className="text-gray-900">{property.address_line1}</p>
                          {property.address_line2 && (
                            <p className="text-gray-600">{property.address_line2}</p>
                          )}
                          <p className="text-gray-600">
                            {property.postal_code} {property.city}
                          </p>
                        </div>
                      </div>
                    </div>

                    {(property.contact_name || property.contact_phone || property.contact_email) && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Kontakt vor Ort</h4>
                        {property.contact_name && (
                          <p className="text-gray-600 mb-1">{property.contact_name}</p>
                        )}
                        {property.contact_phone && (
                          <div className="flex items-center mb-1">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">{property.contact_phone}</span>
                          </div>
                        )}
                        {property.contact_email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">{property.contact_email}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {property.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{property.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(property)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Liegenschaften</h3>
          <p className="text-gray-600 mb-6">
            Fügen Sie Ihre erste Liegenschaft hinzu, um Services zu beauftragen.
          </p>
          <button
            onClick={() => {
              resetForm()
              setEditingProperty(null)
              setIsModalOpen(true)
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Erste Liegenschaft hinzufügen
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingProperty ? 'Liegenschaft bearbeiten' : 'Neue Liegenschaft'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Straße und Hausnummer *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.address_line1}
                      onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Adresszusatz</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.address_line2}
                      onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">PLZ *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.postal_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Stadt *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Kontakt vor Ort (optional)</h3>
                  
                  <div>
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.contact_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="form-label">Telefon</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="form-label">E-Mail</label>
                      <input
                        type="email"
                        className="form-input"
                        value={formData.contact_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label">Notizen</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      setEditingProperty(null)
                      resetForm()
                    }}
                    className="btn btn-secondary"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="btn btn-primary"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Speichern...' : 'Speichern'}
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
