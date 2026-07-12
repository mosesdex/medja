export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      client_sites: {
        Row: {
          access_note: string | null
          address: string | null
          client_id: string
          company_id: string
          created_at: string
          id: string
          label: string
        }
        Insert: {
          access_note?: string | null
          address?: string | null
          client_id: string
          company_id: string
          created_at?: string
          id?: string
          label: string
        }
        Update: {
          access_note?: string | null
          address?: string | null
          client_id?: string
          company_id?: string
          created_at?: string
          id?: string
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_sites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_sites_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company_id: string
          created_at: string
          id: string
          kind: string
          name: string
          phone: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          kind?: string
          name: string
          phone?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          kind?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
          plan: Database["public"]["Enums"]["plan_tier"]
          service_types: string[] | null
          slug: string | null
          trial_ends_on: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          service_types?: string[] | null
          slug?: string | null
          trial_ends_on?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          plan?: Database["public"]["Enums"]["plan_tier"]
          service_types?: string[] | null
          slug?: string | null
          trial_ends_on?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          active: boolean
          billing_day: number
          client_id: string
          company_id: string
          created_at: string
          id: string
          last_generated_on: string | null
          monthly_kobo: number
          site_id: string | null
          time_of_day: string
          title: string
          weekdays: number[]
        }
        Insert: {
          active?: boolean
          billing_day?: number
          client_id: string
          company_id: string
          created_at?: string
          id?: string
          last_generated_on?: string | null
          monthly_kobo?: number
          site_id?: string | null
          time_of_day?: string
          title: string
          weekdays?: number[]
        }
        Update: {
          active?: boolean
          billing_day?: number
          client_id?: string
          company_id?: string
          created_at?: string
          id?: string
          last_generated_on?: string | null
          monthly_kobo?: number
          site_id?: string | null
          time_of_day?: string
          title?: string
          weekdays?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount_kobo: number
          category: string
          company_id: string
          created_at: string
          id: string
          note: string | null
          spent_on: string
        }
        Insert: {
          amount_kobo: number
          category?: string
          company_id: string
          created_at?: string
          id?: string
          note?: string | null
          spent_on?: string
        }
        Update: {
          amount_kobo?: number
          category?: string
          company_id?: string
          created_at?: string
          id?: string
          note?: string | null
          spent_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_counters: {
        Row: { company_id: string; next_seq: number }
        Insert: { company_id: string; next_seq?: number }
        Update: { company_id?: string; next_seq?: number }
        Relationships: [
          {
            foreignKeyName: "invoice_counters_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          amount_kobo: number
          company_id: string
          id: string
          invoice_id: string
          label: string
        }
        Insert: {
          amount_kobo: number
          company_id: string
          id?: string
          invoice_id: string
          label: string
        }
        Update: {
          amount_kobo?: number
          company_id?: string
          id?: string
          invoice_id?: string
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string
          company_id: string
          created_at: string
          deposit_kobo: number
          due_at: string | null
          id: string
          job_id: string | null
          number: string
          status: string
          subtotal_kobo: number
          total_kobo: number
          vat_kobo: number
        }
        Insert: {
          client_id: string
          company_id: string
          created_at?: string
          deposit_kobo?: number
          due_at?: string | null
          id?: string
          job_id?: string | null
          number: string
          status?: string
          subtotal_kobo: number
          total_kobo: number
          vat_kobo?: number
        }
        Update: {
          client_id?: string
          company_id?: string
          created_at?: string
          deposit_kobo?: number
          due_at?: string | null
          id?: string
          job_id?: string | null
          number?: string
          status?: string
          subtotal_kobo?: number
          total_kobo?: number
          vat_kobo?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_assignments: {
        Row: { company_id: string; id: string; job_id: string; staff_id: string }
        Insert: { company_id: string; id?: string; job_id: string; staff_id: string }
        Update: { company_id?: string; id?: string; job_id?: string; staff_id?: string }
        Relationships: [
          {
            foreignKeyName: "job_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_checklist_items: {
        Row: {
          company_id: string
          done: boolean
          id: string
          job_id: string
          label: string
          position: number
        }
        Insert: {
          company_id: string
          done?: boolean
          id?: string
          job_id: string
          label: string
          position?: number
        }
        Update: {
          company_id?: string
          done?: boolean
          id?: string
          job_id?: string
          label?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_checklist_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_checklist_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_events: {
        Row: {
          at: string
          company_id: string
          id: string
          job_id: string
          lat: number | null
          lng: number | null
          located: boolean
          staff_id: string | null
          type: Database["public"]["Enums"]["job_event_type"]
        }
        Insert: {
          at?: string
          company_id: string
          id?: string
          job_id: string
          lat?: number | null
          lng?: number | null
          located?: boolean
          staff_id?: string | null
          type: Database["public"]["Enums"]["job_event_type"]
        }
        Update: {
          at?: string
          company_id?: string
          id?: string
          job_id?: string
          lat?: number | null
          lng?: number | null
          located?: boolean
          staff_id?: string | null
          type?: Database["public"]["Enums"]["job_event_type"]
        }
        Relationships: [
          {
            foreignKeyName: "job_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_events_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          company_id: string
          created_at: string
          id: string
          job_id: string
          kind: Database["public"]["Enums"]["photo_kind"]
          path: string
          staff_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          job_id: string
          kind: Database["public"]["Enums"]["photo_kind"]
          path: string
          staff_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          job_id?: string
          kind?: Database["public"]["Enums"]["photo_kind"]
          path?: string
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          client_id: string
          company_id: string
          contract_id: string | null
          created_at: string
          id: string
          notes: string | null
          scheduled_at: string
          site_id: string | null
          status: Database["public"]["Enums"]["job_status"]
          type: Database["public"]["Enums"]["job_type"]
          value_kobo: number | null
        }
        Insert: {
          client_id: string
          company_id: string
          contract_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_at: string
          site_id?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          type: Database["public"]["Enums"]["job_type"]
          value_kobo?: number | null
        }
        Update: {
          client_id?: string
          company_id?: string
          contract_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_at?: string
          site_id?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          type?: Database["public"]["Enums"]["job_type"]
          value_kobo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "client_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
          role: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["member_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_kobo: number
          collected_by: string | null
          company_id: string
          created_at: string
          id: string
          invoice_id: string | null
          job_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount_kobo: number
          collected_by?: string | null
          company_id: string
          created_at?: string
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          method: Database["public"]["Enums"]["payment_method"]
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount_kobo?: number
          collected_by?: string | null
          company_id?: string
          created_at?: string
          id?: string
          invoice_id?: string | null
          job_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_items: {
        Row: {
          amount_kobo: number
          company_id: string
          id: string
          jobs_count: number
          run_id: string
          staff_id: string
        }
        Insert: {
          amount_kobo?: number
          company_id: string
          id?: string
          jobs_count?: number
          run_id: string
          staff_id: string
        }
        Update: {
          amount_kobo?: number
          company_id?: string
          id?: string
          jobs_count?: number
          run_id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_items_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_items_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          company_id: string
          created_at: string
          id: string
          period_end: string
          period_start: string
          total_kobo: number
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          total_kobo?: number
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          total_kobo?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_lines: {
        Row: {
          amount_kobo: number
          company_id: string
          id: string
          label: string
          quote_id: string
        }
        Insert: {
          amount_kobo: number
          company_id: string
          id?: string
          label: string
          quote_id: string
        }
        Update: {
          amount_kobo?: number
          company_id?: string
          id?: string
          label?: string
          quote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_lines_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_lines_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_templates: {
        Row: {
          company_id: string
          floor_kobo: number
          id: string
          label: string
          position: number
        }
        Insert: {
          company_id: string
          floor_kobo: number
          id?: string
          label: string
          position?: number
        }
        Update: {
          company_id?: string
          floor_kobo?: number
          id?: string
          label?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string
          company_id: string
          created_at: string
          id: string
          status: string
          total_kobo: number
        }
        Insert: {
          client_id: string
          company_id: string
          created_at?: string
          id?: string
          status?: string
          total_kobo?: number
        }
        Update: {
          client_id?: string
          company_id?: string
          created_at?: string
          id?: string
          status?: string
          total_kobo?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          comment: string | null
          company_id: string
          created_at: string
          id: string
          job_id: string | null
          staff_id: string | null
          stars: number
        }
        Insert: {
          comment?: string | null
          company_id: string
          created_at?: string
          id?: string
          job_id?: string | null
          staff_id?: string | null
          stars: number
        }
        Update: {
          comment?: string | null
          company_id?: string
          created_at?: string
          id?: string
          job_id?: string | null
          staff_id?: string | null
          stars?: number
        }
        Relationships: [
          {
            foreignKeyName: "ratings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_profiles: {
        Row: {
          background_check: string | null
          company_id: string
          created_at: string
          guarantor_address: string | null
          guarantor_id_path: string | null
          guarantor_name: string | null
          guarantor_phone: string | null
          id: string
          name: string
          nin: string | null
          nin_doc_path: string | null
          pay_basis: string | null
          pay_kobo: number | null
          phone: string | null
          photo_path: string | null
          role_title: string | null
          user_id: string | null
          vetting_status: Database["public"]["Enums"]["vetting_status"]
        }
        Insert: {
          background_check?: string | null
          company_id: string
          created_at?: string
          guarantor_address?: string | null
          guarantor_id_path?: string | null
          guarantor_name?: string | null
          guarantor_phone?: string | null
          id?: string
          name: string
          nin?: string | null
          nin_doc_path?: string | null
          pay_basis?: string | null
          pay_kobo?: number | null
          phone?: string | null
          photo_path?: string | null
          role_title?: string | null
          user_id?: string | null
          vetting_status?: Database["public"]["Enums"]["vetting_status"]
        }
        Update: {
          background_check?: string | null
          company_id?: string
          created_at?: string
          guarantor_address?: string | null
          guarantor_id_path?: string | null
          guarantor_name?: string | null
          guarantor_phone?: string | null
          id?: string
          name?: string
          nin?: string | null
          nin_doc_path?: string | null
          pay_basis?: string | null
          pay_kobo?: number | null
          phone?: string | null
          photo_path?: string | null
          role_title?: string | null
          user_id?: string | null
          vetting_status?: Database["public"]["Enums"]["vetting_status"]
        }
        Relationships: [
          {
            foreignKeyName: "staff_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          company_id: string
          created_at: string
          current_period_end: string | null
          id: string
          paystack_ref: string | null
          plan: Database["public"]["Enums"]["plan_tier"]
        }
        Insert: {
          company_id: string
          created_at?: string
          current_period_end?: string | null
          id?: string
          paystack_ref?: string | null
          plan: Database["public"]["Enums"]["plan_tier"]
        }
        Update: {
          company_id?: string
          created_at?: string
          current_period_end?: string | null
          id?: string
          paystack_ref?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"]
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: { staff_id: string; team_id: string }
        Insert: { staff_id: string; team_id: string }
        Update: { staff_id?: string; team_id?: string }
        Relationships: [
          {
            foreignKeyName: "team_members_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: { company_id: string; id: string; name: string }
        Insert: { company_id: string; id?: string; name: string }
        Update: { company_id?: string; id?: string; name?: string }
        Relationships: [
          {
            foreignKeyName: "teams_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_company_id: { Args: never; Returns: string }
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["member_role"]
      }
      company_by_slug: {
        Args: { p_slug: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      create_company: {
        Args: {
          p_city: string
          p_name: string
          p_owner_name: string
          p_service_types: string[]
        }
        Returns: string
      }
      next_invoice_number: { Args: { p_company: string }; Returns: string }
      public_booking: {
        Args: {
          p_client_name: string
          p_note: string
          p_phone: string
          p_slug: string
          p_type: Database["public"]["Enums"]["job_type"]
          p_when: string
        }
        Returns: string
      }
      seed_default_templates: {
        Args: { p_company: string }
        Returns: undefined
      }
    }
    Enums: {
      job_event_type: "check_in" | "check_out"
      job_status:
        | "booked"
        | "en_route"
        | "in_progress"
        | "done"
        | "invoiced"
        | "paid"
      job_type: "residential" | "commercial" | "post_construction"
      member_role: "owner" | "supervisor" | "accountant" | "cleaner"
      payment_method: "paystack" | "cash" | "transfer"
      payment_status: "pending" | "confirmed"
      photo_kind: "before" | "after"
      plan_tier: "trial" | "starter" | "growth" | "pro"
      vetting_status: "pending" | "in_progress" | "vetted" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
