import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import { 
  FileText, 
  Camera, 
  Upload, 
  Save, 
  CheckCircle,
  AlertTriangle,
  X,
  Plus
} from 'lucide-react'

interface WorkOrderItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  completed: boolean
}

export function TechnicianReports() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string>('')
  const [reportData, setReportData] = useState({
    work_performed: '',
    materials_used: '',
    time_spent: '',
    issues_found: '',
    recommendations: '',
    customer_signature: false
  })
  const [workOrderItems, setWorkOrderItems] = useState<WorkOrderItem[]>([])
  const [photos, setPhotos] = useState<File[]>([])

  const { data: availableWorkOrders } = useQuery({
    queryKey: ['technician-available-reports'],
    queryFn: async () => {
      const { data } = await supabase
        .from('work_orders')
        .select(`
          id,
          service,
          description,
          properties (name, address_line1, city)
        `)
        .eq('assigned_to', profile?.id)
        .in('status', ['in_progress', 'done'])
        .order('created_at', { ascending: false })

      return data || []
    },
    enabled: !!profile?.id
  })

  const { data: existingItems } = useQuery({
    queryKey: ['work-order-items', selectedWorkOrder],
    queryFn: async () => {
      if (!selectedWorkOrder) return []
      
      const { data } = await supabase
        .from('work_order_items')
        .select('*')
        .eq('work_order_id', selectedWorkOrder)
        .order('created_at')

      return data || []
    },
    enabled: !!selectedWorkOrder
  })

  const saveReportMutation = useMutation({
    mutationFn: async (data: any) => {
      // Update work order with report data
      const { error: woError } = await supabase
        .from('work_orders')
        .update({
          work_performed: data.work_performed,
          materials_used: data.materials_used,
          time_spent: data.time_spent,
          issues_found: data.issues_found,
          recommendations: data.recommendations,
          customer_signature: data.customer_signature,
          status: 'done'
        })
        .eq('id', selectedWorkOrder)

      if (woError) throw woError

      // Save work order items
      if (workOrderItems.length > 0) {
        // Delete existing items
        await supabase
          .from('work_order_items')
          .delete()
          .eq('work_order_id', selectedWorkOrder)

        // Insert new items
        const { error: itemsError } = await supabase
          .from('work_order_items')
          .insert(
            workOrderItems.map(item => ({
              work_order_id: selectedWorkOrder,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              completed: item.completed
            }))
          )

        if (itemsError) throw itemsError
      }

      // Upload photos if any
      if (photos.length > 0) {
        for (const photo of photos) {
          const fileName = `${selectedWorkOrder}/${Date.now()}-${photo.name}`
          
          const { error: uploadError } = await supabase.storage
            .from('workorder-photos')
            .upload(fileName, photo)

          if (uploadError) throw uploadError

          // Save photo record
          await supabase
            .from('photos')
            .insert({
              work_order_id: selectedWorkOrder,
              file_path: fileName,
              description: `Arbeitsbericht Foto - ${photo.name}`
            })
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technician-available-reports'] })
      resetForm()
      alert('Bericht erfolgreich gespeichert!')
    },
    onError: (error) => {
      console.error('Error saving report:', error)
      alert('Fehler beim Speichern des Berichts.')
    }
  })

  const resetForm = () => {
    setSelectedWorkOrder('')
    setReportData({
      work_performed: '',
      materials_used: '',
      time_spent: '',
      issues_found: '',
      recommendations: '',
      customer_signature: false
    })
    setWorkOrderItems([])
    setPhotos([])
  }

  const addWorkOrderItem = () => {
    setWorkOrderItems(prev => [...prev, {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unit_price: 0,
      completed: true
    }])
  }

  const updateWorkOrderItem = (id: string, field: keyof WorkOrderItem, value: any) => {
    setWorkOrderItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const removeWorkOrderItem = (id: string) => {
    setWorkOrderItems(prev => prev.filter(item => item.id !== id))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWorkOrder) return

    saveReportMutation.mutate(reportData)
  }

  // Load existing items when work order is selected
  React.useEffect(() => {
    if (existingItems) {
      setWorkOrderItems(existingItems.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        completed: item.completed
      })))
    }
  }, [existingItems])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Arbeitsberichte</h1>
        <p className="text-gray-600">Dokumentieren Sie durchgeführte Arbeiten und Ergebnisse</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Work Order Selection */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Auftrag auswählen</h2>
          
          <div>
            <label className="form-label">Arbeitsauftrag *</label>
            <select
              required
              className="form-input"
              value={selectedWorkOrder}
              onChange={(e) => setSelectedWorkOrder(e.target.value)}
            >
              <option value="">Bitte wählen...</option>
              {availableWorkOrders?.map((wo: any) => (
                <option key={wo.id} value={wo.id}>
                  {wo.properties.name} - {wo.service === 'maintenance' ? 'Wartung' : wo.service === 'repair' ? 'Reparatur' : 'Inspektion'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedWorkOrder && (
          <>
            {/* Report Details */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Arbeitsbericht</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">Durchgeführte Arbeiten *</label>
                  <textarea
                    required
                    rows={4}
                    className="form-input"
                    placeholder="Beschreiben Sie detailliert die durchgeführten Arbeiten..."
                    value={reportData.work_performed}
                    onChange={(e) => setReportData(prev => ({ ...prev, work_performed: e.target.value }))}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Verwendete Materialien</label>
                    <textarea
                      rows={3}
                      className="form-input"
                      placeholder="Liste der verwendeten Materialien..."
                      value={reportData.materials_used}
                      onChange={(e) => setReportData(prev => ({ ...prev, materials_used: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Arbeitszeit (Stunden)</label>
                    <input
                      type="number"
                      step="0.5"
                      className="form-input"
                      placeholder="z.B. 2.5"
                      value={reportData.time_spent}
                      onChange={(e) => setReportData(prev => ({ ...prev, time_spent: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Festgestellte Probleme</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="Beschreiben Sie eventuelle Probleme oder Auffälligkeiten..."
                    value={reportData.issues_found}
                    onChange={(e) => setReportData(prev => ({ ...prev, issues_found: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="form-label">Empfehlungen</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="Empfehlungen für zukünftige Wartungen oder Reparaturen..."
                    value={reportData.recommendations}
                    onChange={(e) => setReportData(prev => ({ ...prev, recommendations: e.target.value }))}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="customer_signature"
                    className="form-checkbox"
                    checked={reportData.customer_signature}
                    onChange={(e) => setReportData(prev => ({ ...prev, customer_signature: e.target.checked }))}
                  />
                  <label htmlFor="customer_signature" className="ml-2 text-sm text-gray-700">
                    Kunde hat Arbeiten abgenommen
                  </label>
                </div>
              </div>
            </div>

            {/* Work Order Items */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Arbeitsposten</h2>
                <button
                  type="button"
                  onClick={addWorkOrderItem}
                  className="btn btn-secondary btn-sm flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Position hinzufügen
                </button>
              </div>

              {workOrderItems.length > 0 ? (
                <div className="space-y-4">
                  {workOrderItems.map((item, index) => (
                    <div key={item.id} className="grid md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="md:col-span-2">
                        <label className="form-label">Beschreibung</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="z.B. Dichtung erneuert"
                          value={item.description}
                          onChange={(e) => updateWorkOrderItem(item.id, 'description', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label">Menge</label>
                        <input
                          type="number"
                          min="1"
                          className="form-input"
                          value={item.quantity}
                          onChange={(e) => updateWorkOrderItem(item.id, 'quantity', parseInt(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Einzelpreis (€)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-input"
                          value={item.unit_price}
                          onChange={(e) => updateWorkOrderItem(item.id, 'unit_price', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox"
                            checked={item.completed}
                            onChange={(e) => updateWorkOrderItem(item.id, 'completed', e.target.checked)}
                          />
                          <span className="ml-2 text-sm">Erledigt</span>
                        </label>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeWorkOrderItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      Gesamtsumme: €{workOrderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Keine Arbeitsposten hinzugefügt</p>
                </div>
              )}
            </div>

            {/* Photo Upload */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Fotos</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">Fotos hochladen</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="form-input"
                    />
                    <Camera className="w-5 h-5 text-gray-400" />
                  </div>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <p className="text-xs text-gray-600 mt-1 truncate">{photo.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
              >
                Zurücksetzen
              </button>
              <button
                type="submit"
                disabled={saveReportMutation.isPending}
                className="btn btn-primary flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveReportMutation.isPending ? 'Speichern...' : 'Bericht speichern'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
