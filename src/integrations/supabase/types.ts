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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_credentials: {
        Row: {
          created_at: string
          email: string
          id: string
          password_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      login_settings: {
        Row: {
          created_at: string
          id: number
          show_warning: boolean | null
          updated_at: string
          warning_message: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          show_warning?: boolean | null
          updated_at?: string
          warning_message?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          show_warning?: boolean | null
          updated_at?: string
          warning_message?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          archived: boolean | null
          authorization_number: string | null
          created_at: string
          current_page: number
          error_message: string | null
          error_page: number | null
          has_error: boolean | null
          id: string
          ip_address: string | null
          is_waiting: boolean | null
          last_activity: string
          session_data: Json | null
          session_id: string
          status: Database["public"]["Enums"]["session_status"]
          updated_at: string
          user_data: Json | null
        }
        Insert: {
          archived?: boolean | null
          authorization_number?: string | null
          created_at?: string
          current_page?: number
          error_message?: string | null
          error_page?: number | null
          has_error?: boolean | null
          id?: string
          ip_address?: string | null
          is_waiting?: boolean | null
          last_activity?: string
          session_data?: Json | null
          session_id: string
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
          user_data?: Json | null
        }
        Update: {
          archived?: boolean | null
          authorization_number?: string | null
          created_at?: string
          current_page?: number
          error_message?: string | null
          error_page?: number | null
          has_error?: boolean | null
          id?: string
          ip_address?: string | null
          is_waiting?: boolean | null
          last_activity?: string
          session_data?: Json | null
          session_id?: string
          status?: Database["public"]["Enums"]["session_status"]
          updated_at?: string
          user_data?: Json | null
        }
        Relationships: []
      }
      visitors: {
        Row: {
          city: string | null
          country: string | null
          id: string
          ip_address: string
          isp_name: string | null
          updated_at: string
          user_agent: string | null
          visited_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          id?: string
          ip_address: string
          isp_name?: string | null
          updated_at?: string
          user_agent?: string | null
          visited_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          id?: string
          ip_address?: string
          isp_name?: string | null
          updated_at?: string
          user_agent?: string | null
          visited_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_login_settings: {
        Args: { p_show_warning?: boolean; p_warning_message?: string }
        Returns: undefined
      }
      verify_admin_password: {
        Args: { admin_email: string; admin_password: string }
        Returns: boolean
      }
    }
    Enums: {
      session_status: "Active" | "Waiting" | "Completed" | "Redirected"
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
      session_status: ["Active", "Waiting", "Completed", "Redirected"],
    },
  },
} as const
