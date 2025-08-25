import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          country_code: string
          address_line1: string | null
          address_line2: string | null
          city: string | null
          postal_code: string | null
          country: string | null
          phone: string | null
          email: string | null
          tax_id: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          country_code?: string
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          tax_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          country_code?: string
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          tax_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'admin' | 'dispatcher' | 'technician' | 'customer'
          org_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'admin' | 'dispatcher' | 'technician' | 'customer'
          org_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'admin' | 'dispatcher' | 'technician' | 'customer'
          org_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          org_id: string
          name: string
          address_line1: string
          address_line2: string | null
          city: string
          postal_code: string
          country: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          address_line1: string
          address_line2?: string | null
          city: string
          postal_code: string
          country?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          postal_code?: string
          country?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      work_orders: {
        Row: {
          id: string
          org_id: string
          property_id: string
          service: 'maintenance' | 'repair' | 'inspection'
          description: string
          status: 'draft' | 'scheduled' | 'in_progress' | 'done' | 'qa_hold' | 'cancelled'
          assigned_to: string | null
          scheduled_at: string | null
          preferred_start: string | null
          preferred_end: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          property_id: string
          service: 'maintenance' | 'repair' | 'inspection'
          description: string
          status?: 'draft' | 'scheduled' | 'in_progress' | 'done' | 'qa_hold' | 'cancelled'
          assigned_to?: string | null
          scheduled_at?: string | null
          preferred_start?: string | null
          preferred_end?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          property_id?: string
          service?: 'maintenance' | 'repair' | 'inspection'
          description?: string
          status?: 'draft' | 'scheduled' | 'in_progress' | 'done' | 'qa_hold' | 'cancelled'
          assigned_to?: string | null
          scheduled_at?: string | null
          preferred_start?: string | null
          preferred_end?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          org_id: string
          work_order_id: string
          invoice_number: string
          amount: number
          status: 'draft' | 'sent' | 'paid' | 'void'
          due_date: string | null
          paid_at: string | null
          stripe_invoice_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_id: string
          work_order_id: string
          invoice_number: string
          amount: number
          status?: 'draft' | 'sent' | 'paid' | 'void'
          due_date?: string | null
          paid_at?: string | null
          stripe_invoice_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          work_order_id?: string
          invoice_number?: string
          amount?: number
          status?: 'draft' | 'sent' | 'paid' | 'void'
          due_date?: string | null
          paid_at?: string | null
          stripe_invoice_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
