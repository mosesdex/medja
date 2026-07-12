/**
 * Supabase generated types.
 * Regenerate with: npm run gen:types  (after `supabase start` / linking a project)
 * This hand-written stub keeps the app type-checking before generation and is
 * overwritten by the generator. It mirrors the migrations in supabase/migrations/.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: { id: string; name: string; city: string | null; service_types: string[] | null; created_at: string };
        Insert: { id?: string; name: string; city?: string | null; service_types?: string[] | null };
        Update: Partial<{ name: string; city: string | null; service_types: string[] | null }>;
      };
      members: {
        Row: { id: string; user_id: string; company_id: string; role: string; name: string; created_at: string };
        Insert: { id?: string; user_id: string; company_id: string; role?: string; name: string };
        Update: Partial<{ role: string; name: string }>;
      };
      clients: {
        Row: { id: string; company_id: string; name: string; phone: string | null; kind: string; created_at: string };
        Insert: { id?: string; company_id: string; name: string; phone?: string | null; kind?: string };
        Update: Partial<{ name: string; phone: string | null; kind: string }>;
      };
      client_sites: {
        Row: { id: string; company_id: string; client_id: string; label: string; address: string | null; access_note: string | null };
        Insert: { id?: string; company_id: string; client_id: string; label: string; address?: string | null; access_note?: string | null };
        Update: Partial<{ label: string; address: string | null; access_note: string | null }>;
      };
      jobs: {
        Row: { id: string; company_id: string; client_id: string; site_id: string | null; type: string; status: string; scheduled_at: string; value_kobo: number | null; created_at: string };
        Insert: { id?: string; company_id: string; client_id: string; site_id?: string | null; type: string; status?: string; scheduled_at: string; value_kobo?: number | null };
        Update: Partial<{ type: string; status: string; scheduled_at: string; value_kobo: number | null; site_id: string | null }>;
      };
      job_checklist_items: {
        Row: { id: string; company_id: string; job_id: string; label: string; done: boolean; position: number };
        Insert: { id?: string; company_id: string; job_id: string; label: string; done?: boolean; position?: number };
        Update: Partial<{ label: string; done: boolean; position: number }>;
      };
      quote_templates: {
        Row: { id: string; company_id: string; label: string; floor_kobo: number; position: number };
        Insert: { id?: string; company_id: string; label: string; floor_kobo: number; position?: number };
        Update: Partial<{ label: string; floor_kobo: number; position: number }>;
      };
      quotes: {
        Row: { id: string; company_id: string; client_id: string; total_kobo: number; status: string; created_at: string };
        Insert: { id?: string; company_id: string; client_id: string; total_kobo?: number; status?: string };
        Update: Partial<{ total_kobo: number; status: string }>;
      };
      quote_lines: {
        Row: { id: string; company_id: string; quote_id: string; label: string; amount_kobo: number };
        Insert: { id?: string; company_id: string; quote_id: string; label: string; amount_kobo: number };
        Update: Partial<{ label: string; amount_kobo: number }>;
      };
      invoices: {
        Row: { id: string; company_id: string; client_id: string; job_id: string | null; number: string; subtotal_kobo: number; vat_kobo: number; deposit_kobo: number; total_kobo: number; status: string; created_at: string };
        Insert: { id?: string; company_id: string; client_id: string; job_id?: string | null; number: string; subtotal_kobo: number; vat_kobo?: number; deposit_kobo?: number; total_kobo: number; status?: string };
        Update: Partial<{ status: string; deposit_kobo: number }>;
      };
      invoice_lines: {
        Row: { id: string; company_id: string; invoice_id: string; label: string; amount_kobo: number };
        Insert: { id?: string; company_id: string; invoice_id: string; label: string; amount_kobo: number };
        Update: Partial<{ label: string; amount_kobo: number }>;
      };
    };
    Functions: {
      create_company: {
        Args: { p_name: string; p_city: string; p_service_types: string[]; p_owner_name: string };
        Returns: string;
      };
      auth_company_id: { Args: Record<string, never>; Returns: string };
      next_invoice_number: { Args: { p_company: string }; Returns: string };
      seed_default_templates: { Args: { p_company: string }; Returns: undefined };
    };
  };
}
