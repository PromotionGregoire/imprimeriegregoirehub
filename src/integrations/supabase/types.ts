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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_type: string
          client_id: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action_type: string
          client_id: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action_type?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          assigned_user_id: string | null
          billing_city: string | null
          billing_postal_code: string | null
          billing_province: string | null
          billing_street: string | null
          business_name: string
          client_number: string
          client_type: string | null
          contact_name: string
          created_at: string
          default_payment_terms: string | null
          email: string
          general_notes: string | null
          id: string
          industry: string | null
          lead_source: string | null
          main_contact_position: string | null
          phone_number: string
          secondary_contact_info: string | null
          shipping_city: string | null
          shipping_postal_code: string | null
          shipping_province: string | null
          shipping_street: string | null
          status: string | null
          tax_numbers: string | null
          updated_at: string
        }
        Insert: {
          assigned_user_id?: string | null
          billing_city?: string | null
          billing_postal_code?: string | null
          billing_province?: string | null
          billing_street?: string | null
          business_name: string
          client_number?: string
          client_type?: string | null
          contact_name: string
          created_at?: string
          default_payment_terms?: string | null
          email: string
          general_notes?: string | null
          id?: string
          industry?: string | null
          lead_source?: string | null
          main_contact_position?: string | null
          phone_number: string
          secondary_contact_info?: string | null
          shipping_city?: string | null
          shipping_postal_code?: string | null
          shipping_province?: string | null
          shipping_street?: string | null
          status?: string | null
          tax_numbers?: string | null
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string | null
          billing_city?: string | null
          billing_postal_code?: string | null
          billing_province?: string | null
          billing_street?: string | null
          business_name?: string
          client_number?: string
          client_type?: string | null
          contact_name?: string
          created_at?: string
          default_payment_terms?: string | null
          email?: string
          general_notes?: string | null
          id?: string
          industry?: string | null
          lead_source?: string | null
          main_contact_position?: string | null
          phone_number?: string
          secondary_contact_info?: string | null
          shipping_city?: string | null
          shipping_postal_code?: string | null
          shipping_province?: string | null
          shipping_street?: string | null
          status?: string | null
          tax_numbers?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notifications: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          proof_id: string | null
          recipient_email: string
          sent_at: string
          success: boolean
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          proof_id?: string | null
          recipient_email: string
          sent_at?: string
          success?: boolean
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          proof_id?: string | null
          recipient_email?: string
          sent_at?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      epreuve_commentaires: {
        Row: {
          client_name: string | null
          comment_text: string
          created_at: string
          created_by_client: boolean | null
          created_by_email: string | null
          created_by_name: string | null
          id: string
          is_modification_request: boolean | null
          order_id: string
          proof_id: string
        }
        Insert: {
          client_name?: string | null
          comment_text: string
          created_at?: string
          created_by_client?: boolean | null
          created_by_email?: string | null
          created_by_name?: string | null
          id?: string
          is_modification_request?: boolean | null
          order_id: string
          proof_id: string
        }
        Update: {
          client_name?: string | null
          comment_text?: string
          created_at?: string
          created_by_client?: boolean | null
          created_by_email?: string | null
          created_by_name?: string | null
          id?: string
          is_modification_request?: boolean | null
          order_id?: string
          proof_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "epreuve_commentaires_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epreuve_commentaires_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      monitoring_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          client_id: string
          created_at: string
          id: string
          order_number: string
          status: string
          submission_id: string
          total_price: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          order_number?: string
          status?: string
          submission_id: string
          total_price: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          order_number?: string
          status?: string
          submission_id?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      ordre_historique: {
        Row: {
          action_description: string
          action_type: string
          client_action: boolean | null
          created_at: string
          created_by: string | null
          id: string
          metadata: Json | null
          order_id: string
          proof_id: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          client_action?: boolean | null
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          proof_id?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          client_action?: boolean | null
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          proof_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordre_historique_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordre_historique_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      product_suppliers: {
        Row: {
          created_at: string
          id: string
          product_id: string
          supplier_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          supplier_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_suppliers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attribute_name: string
          attribute_value: string
          cost_price: number | null
          created_at: string
          id: string
          price: number | null
          product_id: string
          sku_variant: string | null
          updated_at: string
        }
        Insert: {
          attribute_name: string
          attribute_value: string
          cost_price?: number | null
          created_at?: string
          id?: string
          price?: number | null
          product_id: string
          sku_variant?: string | null
          updated_at?: string
        }
        Update: {
          attribute_name?: string
          attribute_value?: string
          cost_price?: number | null
          created_at?: string
          id?: string
          price?: number | null
          product_id?: string
          sku_variant?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          default_price: number | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          product_code: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          default_price?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          product_code: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          default_price?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          product_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employment_status: string | null
          full_name: string
          hire_date: string | null
          id: string
          job_title: string | null
          password_reset_required: boolean | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employment_status?: string | null
          full_name: string
          hire_date?: string | null
          id: string
          job_title?: string | null
          password_reset_required?: boolean | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employment_status?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          job_title?: string | null
          password_reset_required?: boolean | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      proofs: {
        Row: {
          approval_token: string | null
          approved_at: string | null
          approved_by_name: string | null
          client_comments: string | null
          created_at: string
          file_url: string | null
          id: string
          is_active: boolean | null
          order_id: string
          status: string
          updated_at: string
          uploaded_at: string | null
          uploaded_by: string | null
          validation_token: string | null
          version: number
        }
        Insert: {
          approval_token?: string | null
          approved_at?: string | null
          approved_by_name?: string | null
          client_comments?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          order_id: string
          status?: string
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          validation_token?: string | null
          version?: number
        }
        Update: {
          approval_token?: string | null
          approved_at?: string | null
          approved_by_name?: string | null
          client_comments?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          order_id?: string
          status?: string
          updated_at?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          validation_token?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_proofs_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          product_name: string
          quantity: number
          submission_id: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          product_name: string
          quantity?: number
          submission_id: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          product_name?: string
          quantity?: number
          submission_id?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_items_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          acceptance_token: string
          approval_token: string | null
          approved_by: string | null
          client_id: string
          created_at: string
          deadline: string | null
          id: string
          modification_request_notes: string | null
          sent_at: string | null
          status: string
          submission_number: string
          total_price: number | null
          updated_at: string
          valid_until: string
        }
        Insert: {
          acceptance_token?: string
          approval_token?: string | null
          approved_by?: string | null
          client_id: string
          created_at?: string
          deadline?: string | null
          id?: string
          modification_request_notes?: string | null
          sent_at?: string | null
          status?: string
          submission_number?: string
          total_price?: number | null
          updated_at?: string
          valid_until?: string
        }
        Update: {
          acceptance_token?: string
          approval_token?: string | null
          approved_by?: string | null
          client_id?: string
          created_at?: string
          deadline?: string | null
          id?: string
          modification_request_notes?: string | null
          sent_at?: string | null
          status?: string
          submission_number?: string
          total_price?: number | null
          updated_at?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_categories: {
        Row: {
          category_name: string
          category_type: string
          created_at: string
          id: string
          supplier_id: string
        }
        Insert: {
          category_name: string
          category_type?: string
          created_at?: string
          id?: string
          supplier_id: string
        }
        Update: {
          category_name?: string
          category_type?: string
          created_at?: string
          id?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_categories_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_goods_supplier: boolean | null
          is_service_supplier: boolean | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          website_1: string | null
          website_2: string | null
        }
        Insert: {
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_goods_supplier?: boolean | null
          is_service_supplier?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website_1?: string | null
          website_2?: string | null
        }
        Update: {
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_goods_supplier?: boolean | null
          is_service_supplier?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          website_1?: string | null
          website_2?: string | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          level: string
          message: string
          metadata: Json | null
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          level: string
          message: string
          metadata?: Json | null
          type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_order_history_details: {
        Row: {
          action_description: string | null
          action_type: string | null
          author_name: string | null
          client_action: boolean | null
          created_at: string | null
          employee_full_name: string | null
          employee_job_title: string | null
          id: string | null
          metadata: Json | null
          order_id: string | null
          proof_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordre_historique_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordre_historique_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "proofs"
            referencedColumns: ["id"]
          },
        ]
      }
      v_ordre_historique: {
        Row: {
          action_description: string | null
          action_type: string | null
          business_name: string | null
          client_action: boolean | null
          client_id: string | null
          contact_name: string | null
          created_at: string | null
          created_by_email: string | null
          created_by_name: string | null
          formatted_date: string | null
          id: string | null
          metadata: Json | null
          order_id: string | null
          order_number: string | null
          proof_id: string | null
          proof_status: string | null
          proof_version: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordre_historique_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordre_historique_proof_id_fkey"
            columns: ["proof_id"]
            isOneToOne: false
            referencedRelation: "proofs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_ordre_history: {
        Args:
          | {
              p_action_description: string
              p_action_type: string
              p_client_action?: boolean
              p_created_by?: string
              p_metadata?: Json
              p_order_id: string
              p_proof_id?: string
            }
          | {
              p_action_description: string
              p_action_type: string
              p_client_action?: boolean
              p_metadata?: Json
              p_order_id: string
              p_proof_id?: string
            }
        Returns: string
      }
      generate_client_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_product_code: {
        Args: { product_category: string; product_name: string }
        Returns: string
      }
      generate_submission_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_latest_proofs_by_order: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          order_id: string
          orders: Json
          status: string
          version: number
        }[]
      }
      get_next_proof_version: {
        Args: { p_order_id: string }
        Returns: number
      }
      get_order_history: {
        Args: { p_order_id: string }
        Returns: {
          action_description: string
          action_type: string
          client_action: boolean
          created_by_name: string
          formatted_date: string
          id: string
          metadata: Json
          proof_version: number
        }[]
      }
      get_proof_file_url: {
        Args: { p_approval_token: string }
        Returns: {
          file_url: string
        }[]
      }
      get_proof_for_approval: {
        Args: { p_approval_token: string }
        Returns: {
          approved_at: string
          approved_by_name: string
          business_name: string
          client_comments: string
          contact_name: string
          created_at: string
          id: string
          order_id: string
          order_number: string
          status: string
          submission_number: string
          updated_at: string
          version: number
        }[]
      }
      get_proof_for_validation: {
        Args: { p_validation_token: string }
        Returns: {
          file_url: string
          id: string
          order_id: string
          status: string
          version: number
        }[]
      }
      get_submission_for_approval: {
        Args: { p_token: string; p_token_type?: string }
        Returns: {
          approved_by: string
          business_name: string
          client_id: string
          contact_name: string
          created_at: string
          deadline: string
          id: string
          modification_request_notes: string
          sent_at: string
          status: string
          submission_number: string
          updated_at: string
          valid_until: string
        }[]
      }
      get_submission_items_for_approval: {
        Args: { p_token: string; p_token_type?: string }
        Returns: {
          created_at: string
          description: string
          id: string
          product_name: string
          quantity: number
          submission_id: string
          updated_at: string
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      test_history_triggers: {
        Args: Record<PropertyKey, never>
        Returns: {
          test_message: string
          test_name: string
          test_result: boolean
        }[]
      }
      update_proof_status_enum: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
