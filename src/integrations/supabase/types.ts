export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          created_at: string | null
          data: Json | null
          description: string | null
          id: string
          lead_id: string | null
          opportunity_id: string | null
          organization_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          organization_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          description?: string | null
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          organization_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs_v2: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_v2_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          priority: number | null
          trigger_conditions: Json
          trigger_type: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          action_config: Json
          action_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          priority?: number | null
          trigger_conditions: Json
          trigger_type: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          priority?: number | null
          trigger_conditions?: Json
          trigger_type?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_logs: {
        Row: {
          completed_at: string | null
          error_message: string | null
          file_path: string | null
          file_size: number | null
          id: string
          organization_id: string | null
          started_at: string
          status: string
          type: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          organization_id?: string | null
          started_at: string
          status: string
          type: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          organization_id?: string | null
          started_at?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "backup_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_logs: {
        Row: {
          bot_id: string
          direction: string
          id: string
          message: string
          timestamp: string
          type: string | null
        }
        Insert: {
          bot_id: string
          direction: string
          id?: string
          message: string
          timestamp?: string
          type?: string | null
        }
        Update: {
          bot_id?: string
          direction?: string
          id?: string
          message?: string
          timestamp?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_logs_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_sessions: {
        Row: {
          created_at: string
          last_message: string | null
          qr_data: string | null
          session_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          last_message?: string | null
          qr_data?: string | null
          session_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          last_message?: string | null
          qr_data?: string | null
          session_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      bots: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string | null
          qrcode: string | null
          session_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id?: string | null
          qrcode?: string | null
          session_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string | null
          qrcode?: string | null
          session_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cache_entries: {
        Row: {
          cache_key: string
          cache_value: Json
          created_at: string | null
          expires_at: string
          id: string
          organization_id: string | null
        }
        Insert: {
          cache_key: string
          cache_value: Json
          created_at?: string | null
          expires_at: string
          id?: string
          organization_id?: string | null
        }
        Update: {
          cache_key?: string
          cache_value?: Json
          created_at?: string | null
          expires_at?: string
          id?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cache_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          applied_job_id: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          organization_id: string | null
          phone: string | null
          resume_url: string | null
          score: number | null
          stage: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applied_job_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          organization_id?: string | null
          phone?: string | null
          resume_url?: string | null
          score?: number | null
          stage?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applied_job_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          organization_id?: string | null
          phone?: string | null
          resume_url?: string | null
          score?: number | null
          stage?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_applied_job_id_fkey"
            columns: ["applied_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbots: {
        Row: {
          channel: string
          config: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          knowledge_base: Json | null
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          channel: string
          config: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          knowledge_base?: Json | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          channel?: string
          config?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          knowledge_base?: Json | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_policies: {
        Row: {
          acknowledged_by: number | null
          assigned_employees: number | null
          category: string | null
          compliance: number | null
          created_at: string | null
          description: string | null
          id: string
          last_update: string | null
          organization_id: string | null
          status: string | null
          title: string
          version: string | null
        }
        Insert: {
          acknowledged_by?: number | null
          assigned_employees?: number | null
          category?: string | null
          compliance?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_update?: string | null
          organization_id?: string | null
          status?: string | null
          title: string
          version?: string | null
        }
        Update: {
          acknowledged_by?: number | null
          assigned_employees?: number | null
          category?: string | null
          compliance?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          last_update?: string | null
          organization_id?: string | null
          status?: string | null
          title?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_agent: string | null
          channel: string
          created_at: string | null
          id: string
          last_message_at: string | null
          lead_id: string | null
          metadata: Json | null
          organization_id: string | null
          status: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          assigned_agent?: string | null
          channel?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string | null
          metadata?: Json | null
          organization_id?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          assigned_agent?: string | null
          channel?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string | null
          metadata?: Json | null
          organization_id?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      external_integrations: {
        Row: {
          config: Json
          created_at: string | null
          created_by: string | null
          credentials: Json | null
          error_message: string | null
          id: string
          is_active: boolean | null
          last_sync: string | null
          name: string
          organization_id: string | null
          sync_status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          created_by?: string | null
          credentials?: Json | null
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name: string
          organization_id?: string | null
          sync_status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          created_by?: string | null
          credentials?: Json | null
          error_message?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name?: string
          organization_id?: string | null
          sync_status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          last_sync: string | null
          name: string
          organization_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          config: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name: string
          organization_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name?: string
          organization_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          completed_at: string | null
          content: string | null
          created_at: string | null
          duration: number | null
          id: string
          lead_id: string | null
          metadata: Json | null
          next_action: string | null
          opportunity_id: string | null
          organization_id: string | null
          outcome: string | null
          scheduled_at: string | null
          subject: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          next_action?: string | null
          opportunity_id?: string | null
          organization_id?: string | null
          outcome?: string | null
          scheduled_at?: string | null
          subject?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          next_action?: string | null
          opportunity_id?: string | null
          organization_id?: string | null
          outcome?: string | null
          scheduled_at?: string | null
          subject?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string | null
          deadline: string | null
          department: string | null
          description: string | null
          id: string
          location: string | null
          organization_id: string | null
          requirements: string[] | null
          salary: string | null
          status: string | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          deadline?: string | null
          department?: string | null
          description?: string | null
          id?: string
          location?: string | null
          organization_id?: string | null
          requirements?: string[] | null
          salary?: string | null
          status?: string | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          deadline?: string | null
          department?: string | null
          description?: string | null
          id?: string
          location?: string | null
          organization_id?: string | null
          requirements?: string[] | null
          salary?: string | null
          status?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string | null
          created_by: string | null
          custom_fields: Json | null
          email: string | null
          id: string
          name: string
          organization_id: string | null
          phone: string | null
          source: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          email?: string | null
          id?: string
          name: string
          organization_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          email?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          phone?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          updated_at: string | null
          variables: string[] | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
          variables?: string[] | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates_v2: {
        Row: {
          category: string | null
          channel: string
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          language: string | null
          media_urls: string[] | null
          name: string
          organization_id: string | null
          subject: string | null
          updated_at: string | null
          usage_count: number | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          channel?: string
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          media_urls?: string[] | null
          name: string
          organization_id?: string | null
          subject?: string | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          channel?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          media_urls?: string[] | null
          name?: string
          organization_id?: string | null
          subject?: string | null
          updated_at?: string | null
          usage_count?: number | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_v2_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          metadata: Json | null
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      multisessions: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          organization_id: string | null
          phone_number: string | null
          platform: string
          session_name: string | null
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          organization_id?: string | null
          phone_number?: string | null
          platform: string
          session_name?: string | null
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string | null
          phone_number?: string | null
          platform?: string
          session_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "multisessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          notification_types: Json | null
          organization_id: string | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          notification_types?: Json | null
          organization_id?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          notification_types?: Json | null
          organization_id?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          organization_id: string | null
          pipeline_id: string | null
          probability: number | null
          stage: string
          title: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          organization_id?: string | null
          pipeline_id?: string | null
          probability?: number | null
          stage: string
          title: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          organization_id?: string | null
          pipeline_id?: string | null
          probability?: number | null
          stage?: string
          title?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "sales_pipeline"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          joined_at: string | null
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          name: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          organization_id: string | null
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          organization_id?: string | null
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          organization_id?: string | null
          recorded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          module: Database["public"]["Enums"]["system_module"]
          name: string
          permission_type: Database["public"]["Enums"]["permission_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          module: Database["public"]["Enums"]["system_module"]
          name: string
          permission_type: Database["public"]["Enums"]["permission_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          module?: Database["public"]["Enums"]["system_module"]
          name?: string
          permission_type?: Database["public"]["Enums"]["permission_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          phone: string | null
          position: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_notifications: {
        Row: {
          action_url: string | null
          category: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          organization_id: string | null
          read_at: string | null
          sent_at: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          category?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          organization_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          category?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          organization_id?: string | null
          read_at?: string | null
          sent_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          bot_id: string | null
          created_at: string | null
          id: string
          qr_code: string
          status: string | null
        }
        Insert: {
          bot_id?: string | null
          created_at?: string | null
          id?: string
          qr_code: string
          status?: string | null
        }
        Update: {
          bot_id?: string | null
          created_at?: string | null
          id?: string
          qr_code?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          education: string | null
          experience_years: number | null
          file_url: string
          id: string
          skills: string[] | null
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          education?: string | null
          experience_years?: number | null
          file_url: string
          id?: string
          skills?: string[] | null
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          education?: string | null
          experience_years?: number | null
          file_url?: string
          id?: string
          skills?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "resumes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          granted: boolean | null
          id: string
          permission_id: string | null
          role_id: string | null
        }
        Insert: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Update: {
          created_at?: string | null
          granted?: boolean | null
          id?: string
          permission_id?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system_role: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_role?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system_role?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sales_pipeline: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          stages: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          stages: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          stages?: Json
        }
        Relationships: [
          {
            foreignKeyName: "sales_pipeline_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_stages: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          pipeline_id: string | null
          position: number
          probability: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          pipeline_id?: string | null
          position: number
          probability?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          pipeline_id?: string | null
          position?: number
          probability?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_stages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "sales_pipeline"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          id: string
          key: string
          organization_id: string | null
          updated_at: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          key: string
          organization_id?: string | null
          updated_at?: string | null
          value: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          key?: string
          organization_id?: string | null
          updated_at?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ui_customizations: {
        Row: {
          component_name: string
          created_at: string | null
          customization_data: Json
          id: string
          is_global: boolean | null
          organization_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          component_name: string
          created_at?: string | null
          customization_data: Json
          id?: string
          is_global?: boolean | null
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          component_name?: string
          created_at?: string | null
          customization_data?: Json
          id?: string
          is_global?: boolean | null
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ui_customizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          custom_role_id: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_role_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_role_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          attempts: number | null
          created_at: string | null
          event_type: string
          id: string
          last_attempt: string | null
          organization_id: string | null
          payload: Json
          response_body: string | null
          response_status: number | null
          status: string | null
          webhook_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          event_type: string
          id?: string
          last_attempt?: string | null
          organization_id?: string | null
          payload: Json
          response_body?: string | null
          response_status?: number | null
          status?: string | null
          webhook_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          event_type?: string
          id?: string
          last_attempt?: string | null
          organization_id?: string | null
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          status?: string | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_events_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string | null
          events: string[]
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          secret: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          events: string[]
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          secret?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          events?: string[]
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          secret?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_logs: {
        Row: {
          bot_id: string | null
          created_at: string | null
          direction: string
          event_type: string | null
          id: string
          message: string | null
          number: string
        }
        Insert: {
          bot_id?: string | null
          created_at?: string | null
          direction: string
          event_type?: string | null
          id?: string
          message?: string | null
          number: string
        }
        Update: {
          bot_id?: string | null
          created_at?: string | null
          direction?: string
          event_type?: string | null
          id?: string
          message?: string | null
          number?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_logs_bot_id_fkey"
            columns: ["bot_id"]
            isOneToOne: false
            referencedRelation: "bots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_custom_role: {
        Args: { _user_id: string }
        Returns: {
          role_id: string
          role_name: string
          role_color: string
        }[]
      }
      get_user_organization: {
        Args: { _user_id: string }
        Returns: string
      }
      get_user_permissions: {
        Args: { _user_id: string }
        Returns: {
          permission_name: string
          module: Database["public"]["Enums"]["system_module"]
          permission_type: Database["public"]["Enums"]["permission_type"]
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_organization_id: string
          p_user_id: string
          p_action: string
          p_resource_type: string
          p_resource_id: string
          p_old_values?: Json
          p_new_values?: Json
          p_metadata?: Json
        }
        Returns: undefined
      }
      record_performance_metric: {
        Args: {
          p_organization_id: string
          p_metric_name: string
          p_metric_value: number
          p_metric_type: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      user_has_permission: {
        Args: { _user_id: string; _permission_name: string }
        Returns: boolean
      }
    }
    Enums: {
      permission_type:
        | "view"
        | "create"
        | "edit"
        | "delete"
        | "manage"
        | "export"
        | "import"
      system_module:
        | "dashboard"
        | "crm"
        | "leads"
        | "opportunities"
        | "whatsapp"
        | "bots"
        | "automations"
        | "reports"
        | "analytics"
        | "users"
        | "roles"
        | "settings"
        | "integrations"
        | "billing"
        | "support"
        | "audit_logs"
        | "security"
        | "backups"
        | "marketplace"
      user_role: "super_admin" | "admin" | "manager" | "user" | "viewer"
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
      permission_type: [
        "view",
        "create",
        "edit",
        "delete",
        "manage",
        "export",
        "import",
      ],
      system_module: [
        "dashboard",
        "crm",
        "leads",
        "opportunities",
        "whatsapp",
        "bots",
        "automations",
        "reports",
        "analytics",
        "users",
        "roles",
        "settings",
        "integrations",
        "billing",
        "support",
        "audit_logs",
        "security",
        "backups",
        "marketplace",
      ],
      user_role: ["super_admin", "admin", "manager", "user", "viewer"],
    },
  },
} as const
