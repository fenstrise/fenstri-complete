import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  Euro,
  Filter,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  status: string
  amount: number
  due_date: string
  created_at: string
  work_orders: {
    id: string
    service: string
    properties: {
      name: string
    }
  }
}

export function CustomerInvoices() {
  const { profile } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          status,
          amount,
          due_date,
          created_at,
          work_orders (
            id,
            service,
            properties (name)
          )
        `)
        .eq('org_id', profile?.org_id)
        .order('created_at', { ascending: false })

      return data as any
    },
    enabled: !!profile?.org_id
  })

  const filteredInvoices = invoices?.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.work_orders?.properties?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Bezahlt'
      case 'pending': return 'Ausstehend'
      case 'overdue': return 'Überfällig'
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

  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      // In a real app, this would call your PDF generation endpoint
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rechnung-${invoiceId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      // For demo purposes, show a message
      alert('PDF-Download wird in der Vollversion verfügbar sein.')
    }
  }

  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const unpaidAmount = filteredInvoices
    .filter(invoice => invoice.status !== 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0)

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
        <h1 className="text-3xl font-bold text-gray-900">Rechnungen</h1>
        <p className="text-gray-600">Übersicht über alle Rechnungen und Zahlungen</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <Euro className="w-8 h-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gesamtbetrag</p>
              <p className="text-2xl font-bold text-gray-900">
                €{totalAmount.toLocaleString('de-DE')}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ausstehend</p>
              <p className="text-2xl font-bold text-gray-900">
                €{unpaidAmount.toLocaleString('de-DE')}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Anzahl Rechnungen</p>
              <p className="text-2xl font-bold text-gray-900">{filteredInvoices.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Suche</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechnungsnummer oder Liegenschaft..."
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
              <option value="pending">Ausstehend</option>
              <option value="paid">Bezahlt</option>
              <option value="overdue">Überfällig</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
              }}
              className="btn btn-secondary w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      {filteredInvoices.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rechnung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liegenschaft
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Betrag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fällig am
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {invoice.invoice_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.work_orders?.properties?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getServiceText(invoice.work_orders?.service || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      €{invoice.amount.toLocaleString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(invoice.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full status-${invoice.status}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(invoice.due_date).toLocaleDateString('de-DE')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Details anzeigen"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(invoice.id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="PDF herunterladen"
                        >
                          <Download className="w-4 h-4" />
                        </button>
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
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {invoices?.length === 0 ? 'Keine Rechnungen' : 'Keine Ergebnisse'}
          </h3>
          <p className="text-gray-600">
            {invoices?.length === 0 
              ? 'Rechnungen werden nach abgeschlossenen Services erstellt.'
              : 'Versuchen Sie andere Suchkriterien.'
            }
          </p>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Rechnung {selectedInvoice.invoice_number}
                </h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(selectedInvoice.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full status-${selectedInvoice.status}`}>
                        {getStatusText(selectedInvoice.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Betrag</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      €{selectedInvoice.amount.toLocaleString('de-DE')}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Erstellt am</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedInvoice.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fällig am</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(selectedInvoice.due_date).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Liegenschaft</label>
                  <p className="text-gray-900 mt-1">
                    {selectedInvoice.work_orders?.properties?.name || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Service</label>
                  <p className="text-gray-900 mt-1">
                    {getServiceText(selectedInvoice.work_orders?.service || '')}
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleDownloadPDF(selectedInvoice.id)}
                    className="btn btn-primary flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF herunterladen
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
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
