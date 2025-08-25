import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Clock, MapPin, AlertCircle } from 'lucide-react'

interface WorkOrder {
  id: string
  status: string
  service: string
  description: string
  scheduled_at: string
  properties: {
    name: string
    address_line1: string
    city: string
  }
}

export function TechnicianWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkOrders()
  }, [])

  const fetchWorkOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          id,
          status,
          service,
          description,
          scheduled_at,
          properties (
            name,
            address_line1,
            city
          )
        `)
        .eq('status', 'scheduled')

      if (error) throw error
      setWorkOrders(data || [])
    } catch (error) {
      console.error('Error fetching work orders:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading work orders...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Work Orders</h1>
      
      <div className="grid gap-4">
        {workOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg border p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{order.service}</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {order.status}
              </span>
            </div>
            
            <p className="text-gray-600 mb-3">{order.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{order.properties?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(order.scheduled_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
        
        {workOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No work orders assigned</p>
          </div>
        )}
      </div>
    </div>
  )
}
