export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      homepage_content: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          primary_button_text: string | null
          primary_button_url: string | null
          secondary_button_text: string | null
          secondary_button_url: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          primary_button_text?: string | null
          primary_button_url?: string | null
          secondary_button_text?: string | null
          secondary_button_url?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          primary_button_text?: string | null
          primary_button_url?: string | null
          secondary_button_text?: string | null
          secondary_button_url?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string | null
          date: string
          id: string
          mood: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          date: string
          id?: string
          mood?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          date?: string
          id?: string
          mood?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          tags: string[] | null
          title: string
          trade_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title: string
          trade_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          trade_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          avg_loser: number | null
          avg_winner: number | null
          category: string | null
          created_at: string | null
          description: string
          expected_value: number | null
          id: string
          is_active: boolean | null
          is_private: boolean | null
          missed_trades: number | null
          name: string
          net_profit_loss: number | null
          order_number: number | null
          profit_factor: number | null
          r_multiple: number | null
          rating: number | null
          rules: Json | null
          setup: string | null
          tags: string[] | null
          total_trades: number | null
          trade_type: string | null
          updated_at: string | null
          user_id: string
          win_rate: number | null
        }
        Insert: {
          avg_loser?: number | null
          avg_winner?: number | null
          category?: string | null
          created_at?: string | null
          description: string
          expected_value?: number | null
          id?: string
          is_active?: boolean | null
          is_private?: boolean | null
          missed_trades?: number | null
          name: string
          net_profit_loss?: number | null
          order_number?: number | null
          profit_factor?: number | null
          r_multiple?: number | null
          rating?: number | null
          rules?: Json | null
          setup?: string | null
          tags?: string[] | null
          total_trades?: number | null
          trade_type?: string | null
          updated_at?: string | null
          user_id: string
          win_rate?: number | null
        }
        Update: {
          avg_loser?: number | null
          avg_winner?: number | null
          category?: string | null
          created_at?: string | null
          description?: string
          expected_value?: number | null
          id?: string
          is_active?: boolean | null
          is_private?: boolean | null
          missed_trades?: number | null
          name?: string
          net_profit_loss?: number | null
          order_number?: number | null
          profit_factor?: number | null
          r_multiple?: number | null
          rating?: number | null
          rules?: Json | null
          setup?: string | null
          tags?: string[] | null
          total_trades?: number | null
          trade_type?: string | null
          updated_at?: string | null
          user_id?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          allow_registrations: boolean | null
          company_email: string | null
          copyright_text: string | null
          created_at: string
          currency: string | null
          custom_domain: string | null
          default_user_role: string | null
          favicon_url: string | null
          google_analytics_id: string | null
          id: string
          language: string | null
          logo_url: string | null
          maintenance_mode: boolean | null
          privacy_url: string | null
          site_name: string
          subscription_plans_ids: string[] | null
          support_phone: string | null
          support_url: string | null
          terms_url: string | null
          theme: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          allow_registrations?: boolean | null
          company_email?: string | null
          copyright_text?: string | null
          created_at?: string
          currency?: string | null
          custom_domain?: string | null
          default_user_role?: string | null
          favicon_url?: string | null
          google_analytics_id?: string | null
          id?: string
          language?: string | null
          logo_url?: string | null
          maintenance_mode?: boolean | null
          privacy_url?: string | null
          site_name?: string
          subscription_plans_ids?: string[] | null
          support_phone?: string | null
          support_url?: string | null
          terms_url?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          allow_registrations?: boolean | null
          company_email?: string | null
          copyright_text?: string | null
          created_at?: string
          currency?: string | null
          custom_domain?: string | null
          default_user_role?: string | null
          favicon_url?: string | null
          google_analytics_id?: string | null
          id?: string
          language?: string | null
          logo_url?: string | null
          maintenance_mode?: boolean | null
          privacy_url?: string | null
          site_name?: string
          subscription_plans_ids?: string[] | null
          support_phone?: string | null
          support_url?: string | null
          terms_url?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          billing_period: string
          created_at: string | null
          description: string
          features: string[] | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          billing_period: string
          created_at?: string | null
          description: string
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          billing_period?: string
          created_at?: string | null
          description?: string
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          account_id: string | null
          after_image_url: string | null
          before_image_url: string | null
          created_at: string
          direction: string
          duration_minutes: number | null
          entry_date: string
          entry_price: number
          exit_date: string | null
          exit_price: number | null
          fees: number | null
          followed_rules: string[] | null
          id: string
          image_url: string | null
          market_session: string | null
          notes: string | null
          playbook: string | null
          profit_loss: number | null
          quantity: number
          rating: number | null
          stop_loss: number | null
          symbol: string
          tags: string[]
          take_profit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          after_image_url?: string | null
          before_image_url?: string | null
          created_at?: string
          direction: string
          duration_minutes?: number | null
          entry_date: string
          entry_price: number
          exit_date?: string | null
          exit_price?: number | null
          fees?: number | null
          followed_rules?: string[] | null
          id?: string
          image_url?: string | null
          market_session?: string | null
          notes?: string | null
          playbook?: string | null
          profit_loss?: number | null
          quantity: number
          rating?: number | null
          stop_loss?: number | null
          symbol: string
          tags?: string[]
          take_profit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          after_image_url?: string | null
          before_image_url?: string | null
          created_at?: string
          direction?: string
          duration_minutes?: number | null
          entry_date?: string
          entry_price?: number
          exit_date?: string | null
          exit_price?: number | null
          fees?: number | null
          followed_rules?: string[] | null
          id?: string
          image_url?: string | null
          market_session?: string | null
          notes?: string | null
          playbook?: string | null
          profit_loss?: number | null
          quantity?: number
          rating?: number | null
          stop_loss?: number | null
          symbol?: string
          tags?: string[]
          take_profit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_accounts: {
        Row: {
          balance: number | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: string
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string | null
          email: string | null
          email_verified: boolean | null
          id: string
          is_admin: boolean | null
          is_blocked: boolean | null
          name: string | null
          password: string | null
          role: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          id: string
          is_admin?: boolean | null
          is_blocked?: boolean | null
          name?: string | null
          password?: string | null
          role?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          id?: string
          is_admin?: boolean | null
          is_blocked?: boolean | null
          name?: string | null
          password?: string | null
          role?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_exists: {
        Args: { email_param: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
