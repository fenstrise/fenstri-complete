import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../lib/auth'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  User,
  Mail,
  Shield
} from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  last_sign_in_at: string | null
}

export function AdminUsers() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'customer',
    password: ''
  })

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('org_id', profile?.org_id)
        .order('created_at', { ascending: false })

      return data as UserProfile[]
    },
    enabled: !!profile?.org_id
  })

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // In a real app, this would use Supabase Auth Admin API
      // For demo purposes, we'll simulate user creation
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: data.role,
            org_id: profile?.org_id
          }
        }
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setIsModalOpen(false)
      resetForm()
    },
    onError: (error) => {
      console.error('Error creating user:', error)
      alert('Fehler beim Erstellen des Benutzers. In der Vollversion würde dies über die Supabase Auth Admin API funktionieren.')
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          role: data.role
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setIsModalOpen(false)
      setEditingUser(null)
      resetForm()
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      // In a real app, this would use Supabase Auth Admin API
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: (error) => {
      console.error('Error deleting user:', error)
      alert('Fehler beim Löschen des Benutzers. In der Vollversion würde dies über die Supabase Auth Admin API funktionieren.')
    }
  })

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      role: 'customer',
      password: ''
    })
  }

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      role: user.role,
      password: ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data: formData })
    } else {
      createUserMutation.mutate(formData)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?')) {
      deleteUserMutation.mutate(id)
    }
  }

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  }) || []

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-600" />
      case 'dispatcher':
        return <Users className="w-4 h-4 text-purple-600" />
      case 'technician':
        return <User className="w-4 h-4 text-green-600" />
      case 'customer':
        return <User className="w-4 h-4 text-blue-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator'
      case 'dispatcher': return 'Dispatcher'
      case 'technician': return 'Techniker'
      case 'customer': return 'Kunde'
      default: return role
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'dispatcher': return 'bg-purple-100 text-purple-800'
      case 'technician': return 'bg-green-100 text-green-800'
      case 'customer': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Benutzerverwaltung</h1>
          <p className="text-gray-600">Verwalten Sie Benutzer und deren Rollen</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingUser(null)
            setIsModalOpen(true)
          }}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Benutzer hinzufügen
        </button>
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
                placeholder="E-Mail oder Name..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Rolle</label>
            <select
              className="form-input"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Alle Rollen</option>
              <option value="admin">Administrator</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="technician">Techniker</option>
              <option value="customer">Kunde</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setRoleFilter('all')
              }}
              className="btn btn-secondary w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Benutzer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rolle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erstellt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Letzte Anmeldung
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || 'Kein Name'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {getRoleText(user.role)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.last_sign_in_at ? 
                        new Date(user.last_sign_in_at).toLocaleDateString('de-DE') : 
                        'Nie'
                      }
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Bearbeiten"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.id !== profile?.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {users?.length === 0 ? 'Keine Benutzer' : 'Keine Ergebnisse'}
          </h3>
          <p className="text-gray-600 mb-6">
            {users?.length === 0 
              ? 'Fügen Sie den ersten Benutzer hinzu.'
              : 'Versuchen Sie andere Suchkriterien.'
            }
          </p>
          {users?.length === 0 && (
            <button
              onClick={() => {
                resetForm()
                setEditingUser(null)
                setIsModalOpen(true)
              }}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ersten Benutzer hinzufügen
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingUser ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">E-Mail *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    disabled={!!editingUser}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="form-label">Vollständiger Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="form-label">Rolle *</label>
                  <select
                    required
                    className="form-input"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="customer">Kunde</option>
                    <option value="technician">Techniker</option>
                    <option value="dispatcher">Dispatcher</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {!editingUser && (
                  <div>
                    <label className="form-label">Passwort *</label>
                    <input
                      type="password"
                      required
                      className="form-input"
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Mindestens 6 Zeichen</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      setEditingUser(null)
                      resetForm()
                    }}
                    className="btn btn-secondary"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={createUserMutation.isPending || updateUserMutation.isPending}
                    className="btn btn-primary"
                  >
                    {createUserMutation.isPending || updateUserMutation.isPending ? 'Speichern...' : 'Speichern'}
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
