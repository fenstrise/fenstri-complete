import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'
import { MapPin, Clock, User } from 'lucide-react'

interface WorkOrderDetail {
  id: string
  status: string
  service: string
  description: string
  scheduled_at: string
  work_performed?: string
  properties: {
    name: string
    address_line1: string
    city: string
  }
}

export function TechnicianWorkOrderDetail() {
  const { id } = useParams()
  const [workOrder, setWorkOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchWorkOrder(id)
    }
  }, [id])

  const fetchWorkOrder = async (workOrderId: string) => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          id,
          status,
          service,
          description,
          scheduled_at,
          work_performed,
          properties (
            name,
            address_line1,
            city
          )
        `)
        .eq('id', workOrderId)
        .single()

      if (error) throw error
      setWorkOrder(data)
    } catch (error) {
      console.error('Error fetching work order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading work order...</div>
  }

  if (!workOrder) {
    return <div className="p-6">Work order not found</div>
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold">{workOrder.service}</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
            {workOrder.status}
          </span>
        </div>

        <div className="grid gap-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{workOrder.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Location</h3>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{workOrder.properties.name}</span>
            </div>
            <p className="text-gray-600 ml-6">{workOrder.properties.address_line1}</p>
            <p className="text-gray-600 ml-6">{workOrder.properties.city}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Scheduled</h3>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{new Date(workOrder.scheduled_at).toLocaleString()}</span>
            </div>
          </div>

          {workOrder.work_performed && (
            <div>
              <h3 className="font-semibold mb-2">Work Performed</h3>
              <p className="text-gray-600 whitespace-pre-line">{workOrder.work_performed}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
