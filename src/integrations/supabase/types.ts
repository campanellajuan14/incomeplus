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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_actions: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_contact_access_log: {
        Row: {
          accessed_at: string
          accessed_by: string | null
          agent_email: string
          id: string
          ip_address: unknown | null
          property_id: string
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string
          accessed_by?: string | null
          agent_email: string
          id?: string
          ip_address?: unknown | null
          property_id: string
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string
          accessed_by?: string | null
          agent_email?: string
          id?: string
          ip_address?: unknown | null
          property_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      agent_verifications: {
        Row: {
          admin_notes: string | null
          brokerage_id: string | null
          created_at: string | null
          id: string
          license_document_url: string | null
          license_number: string
          updated_at: string | null
          user_id: string
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          brokerage_id?: string | null
          created_at?: string | null
          id?: string
          license_document_url?: string | null
          license_number: string
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          brokerage_id?: string | null
          created_at?: string | null
          id?: string
          license_document_url?: string | null
          license_number?: string
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_verifications_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
        ]
      }
      brokerages: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          license_number: string | null
          name: string
          phone: string | null
          postal_code: string | null
          province: string | null
          status: string | null
          tier: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          license_number?: string | null
          name: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          status?: string | null
          tier?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          license_number?: string | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          status?: string | null
          tier?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      email_change_requests: {
        Row: {
          created_at: string
          current_email: string
          expires_at: string
          id: string
          is_verified: boolean
          new_email: string
          updated_at: string
          user_id: string
          verification_code: string
        }
        Insert: {
          created_at?: string
          current_email: string
          expires_at: string
          id?: string
          is_verified?: boolean
          new_email: string
          updated_at?: string
          user_id: string
          verification_code: string
        }
        Update: {
          created_at?: string
          current_email?: string
          expires_at?: string
          id?: string
          is_verified?: boolean
          new_email?: string
          updated_at?: string
          user_id?: string
          verification_code?: string
        }
        Relationships: []
      }
      email_verification_codes: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          new_email: string
          user_id: string
          verification_code: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          new_email: string
          user_id: string
          verification_code: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          new_email?: string
          user_id?: string
          verification_code?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string | null
          id: string
          inquiry_id: string | null
          is_from_agent: boolean | null
          message: string
          read_at: string | null
          sender_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inquiry_id?: string | null
          is_from_agent?: boolean | null
          message: string
          read_at?: string | null
          sender_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inquiry_id?: string | null
          is_from_agent?: boolean | null
          message?: string
          read_at?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "property_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string | null
          email_inquiry_responses: boolean | null
          email_new_properties: boolean | null
          email_price_changes: boolean | null
          email_weekly_digest: boolean | null
          id: string
          sms_urgent_updates: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_inquiry_responses?: boolean | null
          email_new_properties?: boolean | null
          email_price_changes?: boolean | null
          email_weekly_digest?: boolean | null
          id?: string
          sms_urgent_updates?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_inquiry_responses?: boolean | null
          email_new_properties?: boolean | null
          email_price_changes?: boolean | null
          email_weekly_digest?: boolean | null
          id?: string
          sms_urgent_updates?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          admin_notes: string | null
          agent_email: string
          agent_name: string
          agent_phone: string
          amortization_period: number
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          city: string
          created_at: string
          down_payment_amount: number
          down_payment_type: string
          featured: boolean | null
          flagged: boolean | null
          gas: number | null
          hydro: number | null
          id: string
          images: Json | null
          income_type: string
          insurance: number | null
          latitude: number | null
          longitude: number | null
          maintenance: number | null
          management_fees: number | null
          miscellaneous: number | null
          mortgage_rate: number
          number_of_units: number
          postal_code: string
          property_description: string | null
          property_taxes: number | null
          property_title: string
          province: string
          purchase_price: number
          status: string | null
          tenancy_type: string
          units: Json
          updated_at: string
          user_id: string
          waste_management: number | null
          water: number | null
        }
        Insert: {
          address: string
          admin_notes?: string | null
          agent_email: string
          agent_name: string
          agent_phone: string
          amortization_period: number
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city: string
          created_at?: string
          down_payment_amount: number
          down_payment_type: string
          featured?: boolean | null
          flagged?: boolean | null
          gas?: number | null
          hydro?: number | null
          id?: string
          images?: Json | null
          income_type: string
          insurance?: number | null
          latitude?: number | null
          longitude?: number | null
          maintenance?: number | null
          management_fees?: number | null
          miscellaneous?: number | null
          mortgage_rate: number
          number_of_units: number
          postal_code: string
          property_description?: string | null
          property_taxes?: number | null
          property_title: string
          province: string
          purchase_price: number
          status?: string | null
          tenancy_type: string
          units?: Json
          updated_at?: string
          user_id: string
          waste_management?: number | null
          water?: number | null
        }
        Update: {
          address?: string
          admin_notes?: string | null
          agent_email?: string
          agent_name?: string
          agent_phone?: string
          amortization_period?: number
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string
          created_at?: string
          down_payment_amount?: number
          down_payment_type?: string
          featured?: boolean | null
          flagged?: boolean | null
          gas?: number | null
          hydro?: number | null
          id?: string
          images?: Json | null
          income_type?: string
          insurance?: number | null
          latitude?: number | null
          longitude?: number | null
          maintenance?: number | null
          management_fees?: number | null
          miscellaneous?: number | null
          mortgage_rate?: number
          number_of_units?: number
          postal_code?: string
          property_description?: string | null
          property_taxes?: number | null
          property_title?: string
          province?: string
          purchase_price?: number
          status?: string | null
          tenancy_type?: string
          units?: Json
          updated_at?: string
          user_id?: string
          waste_management?: number | null
          water?: number | null
        }
        Relationships: []
      }
      property_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          property_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          property_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          property_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_expenses_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_flags: {
        Row: {
          created_at: string | null
          description: string | null
          flagged_by: string
          id: string
          property_id: string
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          flagged_by: string
          id?: string
          property_id: string
          reason: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          flagged_by?: string
          id?: string
          property_id?: string
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      property_income: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          property_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          property_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          property_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_income_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_inquiries: {
        Row: {
          agent_email: string
          created_at: string | null
          id: string
          message: string
          property_id: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_email: string
          created_at?: string | null
          id?: string
          message: string
          property_id?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_email?: string
          created_at?: string | null
          id?: string
          message?: string
          property_id?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_properties: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          property_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          name: string
          search_criteria: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          name: string
          search_criteria: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          name?: string
          search_criteria?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          brokerage_id: string | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          status: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brokerage_id?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brokerage_id?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      todos: {
        Row: {
          id: number
          inserted_at: string
          is_complete: boolean | null
          task: string | null
          user_id: string
        }
        Insert: {
          id?: number
          inserted_at?: string
          is_complete?: boolean | null
          task?: string | null
          user_id: string
        }
        Update: {
          id?: number
          inserted_at?: string
          is_complete?: boolean | null
          task?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          participant_1_id: string
          participant_2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          participant_1_id: string
          participant_2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          participant_1_id?: string
          participant_2_id?: string
        }
        Relationships: []
      }
      user_flags: {
        Row: {
          created_at: string | null
          description: string | null
          flagged_by: string
          id: string
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          flagged_by: string
          id?: string
          reason: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          flagged_by?: string
          id?: string
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          read_at: string | null
          recipient_id: string
          related_property_id: string | null
          sender_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          conversation_id?: string
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          recipient_id: string
          related_property_id?: string | null
          sender_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          recipient_id?: string
          related_property_id?: string | null
          sender_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          account_status: string | null
          admin_notes: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          phone: string | null
          sms_notifications: boolean | null
          suspended_at: string | null
          suspended_by: string | null
          updated_at: string | null
          user_id: string | null
          user_type: string | null
          username: string
        }
        Insert: {
          account_status?: string | null
          admin_notes?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          phone?: string | null
          sms_notifications?: boolean | null
          suspended_at?: string | null
          suspended_by?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string | null
          username: string
        }
        Update: {
          account_status?: string | null
          admin_notes?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          phone?: string | null
          sms_notifications?: boolean | null
          suspended_at?: string | null
          suspended_by?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string | null
          username?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_user_profile_summary: {
        Args: { target_user_id: string }
        Returns: {
          account_status: string
          created_at: string
          last_login: string
          user_id: string
          user_type: string
          username: string
        }[]
      }
      am_i_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      bootstrap_needed: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_user_access_profile: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      check_admin_access: {
        Args: { user_id?: string }
        Returns: boolean
      }
      check_admin_privileges: {
        Args: Record<PropertyKey, never>
        Returns: {
          account_status: string
          admin_level: string
          has_admin_access: boolean
          security_clearance: string
          verification_time: string
        }[]
      }
      cleanup_expired_email_verification_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_admin_user: {
        Args: {
          admin_email: string
          admin_name: string
          target_user_id: string
        }
        Returns: boolean
      }
      emergency_admin_lockdown: {
        Args: { target_admin_id: string }
        Returns: boolean
      }
      emergency_admin_recovery: {
        Args: { recovery_code: string }
        Returns: boolean
      }
      ensure_user_profile_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_admin_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_admin_security_policy_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_agent_contact_info: {
        Args: { property_id: string }
        Returns: {
          agent_email: string
          agent_name: string
          agent_phone: string
        }[]
      }
      get_complete_property_listings: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          agent_email: string
          agent_name: string
          agent_phone: string
          amortization_period: number
          city: string
          created_at: string
          down_payment_amount: number
          down_payment_type: string
          featured: boolean
          gas: number
          hydro: number
          id: string
          images: Json
          income_type: string
          insurance: number
          latitude: number
          longitude: number
          maintenance: number
          management_fees: number
          miscellaneous: number
          mortgage_rate: number
          number_of_units: number
          postal_code: string
          property_description: string
          property_taxes: number
          property_title: string
          province: string
          purchase_price: number
          status: string
          tenancy_type: string
          units: Json
          updated_at: string
          user_id: string
          waste_management: number
          water: number
        }[]
      }
      get_limited_user_profile: {
        Args: { target_user_id: string }
        Returns: {
          account_status: string
          created_at: string
          user_id: string
          user_type: string
          username: string
        }[]
      }
      get_masked_admin_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          admin_id: string
          created_at: string
          masked_email: string
          masked_name: string
          masked_phone: string
          privacy_notice: string
          role: string
          status: string
        }[]
      }
      get_minimal_user_info_for_messaging: {
        Args: { target_user_id: string }
        Returns: {
          user_id: string
          user_type: string
          username: string
        }[]
      }
      get_my_admin_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }[]
      }
      get_non_admin_users_for_management: {
        Args: Record<PropertyKey, never>
        Returns: {
          account_status: string
          created_at: string
          email: string
          email_confirmed: boolean
          id: string
          phone: string
          user_type: string
          username: string
        }[]
      }
      get_or_create_user_profile: {
        Args: { target_user_id?: string }
        Returns: {
          account_status: string
          bio: string
          company: string
          created_at: string
          email_notifications: boolean
          phone: string
          sms_notifications: boolean
          updated_at: string
          user_id: string
          user_type: string
          username: string
        }[]
      }
      get_own_admin_info_masked: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email_masked: string
          id: string
          name_masked: string
          phone_masked: string
          role: string
          security_note: string
          status: string
          user_id: string
        }[]
      }
      get_own_admin_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }[]
      }
      get_property_listings_with_contact: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          agent_email: string
          agent_name: string
          agent_phone: string
          city: string
          created_at: string
          featured: boolean
          id: string
          images: Json
          income_type: string
          latitude: number
          longitude: number
          number_of_units: number
          postal_code: string
          property_description: string
          property_title: string
          province: string
          tenancy_type: string
          units: Json
          updated_at: string
        }[]
      }
      get_property_previews: {
        Args: Record<PropertyKey, never>
        Returns: {
          city: string
          featured: boolean
          id: string
          images: Json
          income_type: string
          number_of_units: number
          property_title: string
          province: string
          purchase_price: number
        }[]
      }
      get_public_brokerages: {
        Args: Record<PropertyKey, never>
        Returns: {
          city: string
          id: string
          name: string
          province: string
          status: string
          tier: string
        }[]
      }
      get_public_complete_property_listings: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          amortization_period: number
          city: string
          created_at: string
          down_payment_amount: number
          down_payment_type: string
          featured: boolean
          gas: number
          hydro: number
          id: string
          images: Json
          income_type: string
          insurance: number
          latitude: number
          longitude: number
          maintenance: number
          management_fees: number
          miscellaneous: number
          mortgage_rate: number
          number_of_units: number
          postal_code: string
          property_description: string
          property_taxes: number
          property_title: string
          province: string
          purchase_price: number
          status: string
          tenancy_type: string
          units: Json
          updated_at: string
          user_id: string
          waste_management: number
          water: number
        }[]
      }
      get_public_property_listings: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          city: string
          created_at: string
          featured: boolean
          id: string
          images: Json
          income_type: string
          insurance: number
          latitude: number
          longitude: number
          number_of_units: number
          postal_code: string
          property_description: string
          property_taxes: number
          property_title: string
          province: string
          purchase_price: number
          tenancy_type: string
          units: Json
          updated_at: string
        }[]
      }
      get_safe_inquirer_info: {
        Args: { property_id_param: string }
        Returns: {
          inquirer_username: string
          inquiry_date: string
          user_type: string
        }[]
      }
      get_safe_public_profile: {
        Args: { target_user_id: string }
        Returns: {
          member_since_month: string
          status_indicator: string
          user_id: string
          user_type: string
          username: string
        }[]
      }
      get_safe_public_profile_for_conversation: {
        Args: { target_user_id: string }
        Returns: {
          account_status: string
          member_since: string
          user_id: string
          user_type: string
          username: string
        }[]
      }
      get_safe_user_info_for_conversation: {
        Args: { target_user_id: string }
        Returns: {
          account_status: string
          user_type: string
          username: string
        }[]
      }
      get_secure_admin_count: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_timestamp: string
          system_status: string
          total_active_admins: number
        }[]
      }
      get_user_email_change_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          current_email: string
          expires_at: string
          id: string
          is_verified: boolean
          new_email: string
          updated_at: string
        }[]
      }
      get_user_role: {
        Args: { user_id?: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_statistics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_other_admins: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_agent: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_authenticated_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_income_plus_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_verified_active_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_verified_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_admin_action: {
        Args: { action_details?: Json; action_type: string; target_id?: string }
        Returns: undefined
      }
      log_agent_contact_access: {
        Args: { agent_email: string; property_id: string }
        Returns: undefined
      }
      log_security_access_attempt: {
        Args: { access_type: string; table_name: string }
        Returns: undefined
      }
      log_security_event: {
        Args: { event_details?: string; event_type: string }
        Returns: undefined
      }
      update_agent_verification_metadata: {
        Args: { new_brokerage_id?: string; verification_id: string }
        Returns: boolean
      }
      validate_admin_access_strict: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_units_structure: {
        Args: Record<PropertyKey, never> | { units_json: Json }
        Returns: undefined
      }
      verify_admin_identity: {
        Args: Record<PropertyKey, never>
        Returns: {
          admin_email: string
          admin_id: string
          is_admin: boolean
        }[]
      }
      verify_admin_security_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          policies_count: number
          public_access_blocked: boolean
          rls_enabled: boolean
          security_status: string
        }[]
      }
      verify_admin_status: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      verify_admin_status_only: {
        Args: Record<PropertyKey, never>
        Returns: {
          account_active: boolean
          admin_role: string
          is_admin: boolean
          verification_timestamp: string
        }[]
      }
      verify_admin_table_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          anonymous_blocked: boolean
          authenticated_restricted: boolean
          public_blocked: boolean
          rls_enabled: boolean
          security_status: string
        }[]
      }
      verify_email_change: {
        Args: { user_id_input: string; verification_code_input: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "agent" | "investor"
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
    Enums: {
      app_role: ["admin", "agent", "investor"],
    },
  },
} as const
