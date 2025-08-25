import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  User,
  Clock
} from 'lucide-react'

export function DispatcherCalendar() {
  const { profile } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())

  const { data: workOrders, isLoading } = useQuery({
    queryKey: ['dispatcher-calendar', currentDate.getMonth(), currentDate.getFullYear()],
    queryFn: async () => {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data } = await supabase
        .from('work_orders')
        .select(`
          id,
          status,
          service,
          description,
          scheduled_at,
          properties (name, address_line1, city),
          profiles (full_name)
        `)
        .eq('org_id', profile?.org_id)
        .gte('scheduled_at', startOfMonth.toISOString())
        .lte('scheduled_at', endOfMonth.toISOString())
        .order('scheduled_at')

      return data || []
    },
    enabled: !!profile?.org_id
  })

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getWorkOrdersForDate = (date: Date) => {
    if (!workOrders) return []
    
    return workOrders.filter(wo => {
      if (!wo.scheduled_at) return false
      const woDate = new Date(wo.scheduled_at)
      return woDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'done': return 'bg-green-100 text-green-800'
      case 'qa_hold': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const days = getDaysInMonth(currentDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

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
        <h1 className="text-3xl font-bold text-gray-900">Terminkalender</h1>
        <p className="text-gray-600">Übersicht über alle geplanten Arbeitsaufträge</p>
      </div>

      {/* Calendar Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors"
            >
              Heute
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {/* Day Headers */}
          {['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'].map((day) => (
            <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="bg-white p-3 min-h-[140px]"></div>
            }

            const dayWorkOrders = getWorkOrdersForDate(day)
            const isToday = day.getTime() === today.getTime()
            const isPast = day < today

            return (
              <div
                key={day.toISOString()}
                className={`bg-white p-3 min-h-[140px] ${
                  isToday ? 'ring-2 ring-primary-500' : ''
                } ${isPast ? 'bg-gray-50' : ''}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isToday ? 'text-primary-600' : isPast ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {day.getDate()}
                </div>

                <div className="space-y-1">
                  {dayWorkOrders.slice(0, 3).map((wo: any) => (
                    <div
                      key={wo.id}
                      className={`text-xs p-1 rounded ${getStatusColor(wo.status)}`}
                      title={`${wo.properties.name} - ${getServiceText(wo.service)} - ${wo.profiles?.full_name || 'Nicht zugewiesen'}`}
                    >
                      <div className="truncate font-medium">
                        {wo.properties.name}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="truncate">
                          {getServiceText(wo.service)}
                        </span>
                        {wo.profiles?.full_name && (
                          <User className="w-3 h-3 ml-1" />
                        )}
                      </div>
                    </div>
                  ))}
                  {dayWorkOrders.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayWorkOrders.length - 3} weitere
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Today's Schedule Detail */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Heutiger Zeitplan</h2>
        
        {(() => {
          const todayWorkOrders = getWorkOrdersForDate(today)
          
          if (todayWorkOrders.length === 0) {
            return (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Keine Termine für heute geplant</p>
              </div>
            )
          }

          return (
            <div className="space-y-4">
              {todayWorkOrders.map((wo: any) => (
                <div key={wo.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(wo.status)}`}>
                        {wo.status === 'scheduled' && 'Geplant'}
                        {wo.status === 'in_progress' && 'In Bearbeitung'}
                        {wo.status === 'done' && 'Abgeschlossen'}
                        {wo.status === 'qa_hold' && 'QS-Prüfung'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {getServiceText(wo.service)}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-1">
                      {wo.properties.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {wo.properties.address_line1}, {wo.properties.city}
                    </div>
                    <p className="text-sm text-gray-600">
                      {wo.description}
                    </p>
                    
                    {wo.profiles?.full_name && (
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <User className="w-4 h-4 mr-1" />
                        {wo.profiles.full_name}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 text-right">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(wo.scheduled_at).toLocaleTimeString('de-DE', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
      </div>

      {/* Legend */}
      <div className="card p-4">
        <h3 className="font-medium text-gray-900 mb-3">Legende</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded mr-2"></div>
            <span className="text-gray-600">Geplant</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
            <span className="text-gray-600">In Bearbeitung</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded mr-2"></div>
            <span className="text-gray-600">Abgeschlossen</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded mr-2"></div>
            <span className="text-gray-600">QS-Prüfung</span>
          </div>
        </div>
      </div>
    </div>
  )
}
