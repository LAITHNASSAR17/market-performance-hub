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
      alerts: {
        Row: {
          created_at: string
          id: string
          message: string
          related_tag: string | null
          seen: boolean
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
          type: Database["public"]["Enums"]["alert_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          related_tag?: string | null
          seen?: boolean
          severity?: Database["public"]["Enums"]["alert_severity"]
          title: string
          type: Database["public"]["Enums"]["alert_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          related_tag?: string | null
          seen?: boolean
          severity?: Database["public"]["Enums"]["alert_severity"]
          title?: string
          type?: Database["public"]["Enums"]["alert_type"]
          user_id?: string
        }
        Relationships: []
      }
      mentor_notes: {
        Row: {
          content: string
          created_at: string
          folder: string | null
          id: string
          mentee_id: string
          mentor_id: string
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          folder?: string | null
          id?: string
          mentee_id: string
          mentor_id: string
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          folder?: string | null
          id?: string
          mentee_id?: string
          mentor_id?: string
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mentorships: {
        Row: {
          created_at: string
          id: string
          invite_code: string | null
          invite_email: string | null
          mentee_id: string | null
          mentor_id: string
          status: Database["public"]["Enums"]["mentorship_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code?: string | null
          invite_email?: string | null
          mentee_id?: string | null
          mentor_id: string
          status?: Database["public"]["Enums"]["mentorship_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string | null
          invite_email?: string | null
          mentee_id?: string | null
          mentor_id?: string
          status?: Database["public"]["Enums"]["mentorship_status"]
          updated_at?: string
        }
        Relationships: []
      }
      note_folders: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      note_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_default: boolean | null
          is_favorite: boolean | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          is_favorite?: boolean | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          is_favorite?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          folder_id: string | null
          id: string
          is_favorite: boolean | null
          tags: string[]
          template_id: string | null
          title: string
          trade_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          folder_id?: string | null
          id?: string
          is_favorite?: boolean | null
          tags?: string[]
          template_id?: string | null
          title: string
          trade_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          folder_id?: string | null
          id?: string
          is_favorite?: boolean | null
          tags?: string[]
          template_id?: string | null
          title?: string
          trade_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      playbooks: {
        Row: {
          average_profit: number | null
          avg_loser: number | null
          avg_winner: number | null
          category: string | null
          created_at: string
          description: string | null
          expected_value: number | null
          id: string
          is_private: boolean | null
          missed_trades: number | null
          name: string
          net_profit_loss: number | null
          profit_factor: number | null
          r_multiple: number | null
          rating: number | null
          rules: Json | null
          tags: string[] | null
          total_trades: number | null
          updated_at: string
          user_id: string | null
          win_rate: number | null
        }
        Insert: {
          average_profit?: number | null
          avg_loser?: number | null
          avg_winner?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          expected_value?: number | null
          id?: string
          is_private?: boolean | null
          missed_trades?: number | null
          name: string
          net_profit_loss?: number | null
          profit_factor?: number | null
          r_multiple?: number | null
          rating?: number | null
          rules?: Json | null
          tags?: string[] | null
          total_trades?: number | null
          updated_at?: string
          user_id?: string | null
          win_rate?: number | null
        }
        Update: {
          average_profit?: number | null
          avg_loser?: number | null
          avg_winner?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          expected_value?: number | null
          id?: string
          is_private?: boolean | null
          missed_trades?: number | null
          name?: string
          net_profit_loss?: number | null
          profit_factor?: number | null
          r_multiple?: number | null
          rating?: number | null
          rules?: Json | null
          tags?: string[] | null
          total_trades?: number | null
          updated_at?: string
          user_id?: string | null
          win_rate?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: Database["public"]["Enums"]["shared_item_type"]
          permission: Database["public"]["Enums"]["share_permission"]
          shared_by: string
          shared_with: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: Database["public"]["Enums"]["shared_item_type"]
          permission?: Database["public"]["Enums"]["share_permission"]
          shared_by: string
          shared_with: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: Database["public"]["Enums"]["shared_item_type"]
          permission?: Database["public"]["Enums"]["share_permission"]
          shared_by?: string
          shared_with?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_items_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_items_shared_with_fkey"
            columns: ["shared_with"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          company_email: string
          copyright_text: string | null
          site_name: string
          support_phone: string | null
          updated_at: string
        }
        Insert: {
          company_email: string
          copyright_text?: string | null
          site_name: string
          support_phone?: string | null
          updated_at?: string
        }
        Update: {
          company_email?: string
          copyright_text?: string | null
          site_name?: string
          support_phone?: string | null
          updated_at?: string
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
            foreignKeyName: "fk_trade_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_playbook_fkey"
            columns: ["playbook"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_accounts: {
        Row: {
          account_number: string | null
          account_type: string | null
          balance: number | null
          broker: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          broker?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          broker?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          language: string | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          language?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          language?: string | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          default_account_id: string | null
          email: string
          email_verified: boolean | null
          id: string
          is_blocked: boolean
          name: string
          password: string
          role: string
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_account_id?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          is_blocked?: boolean
          name: string
          password: string
          role?: string
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_account_id?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          is_blocked?: boolean
          name?: string
          password?: string
          role?: string
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_default_account"
            columns: ["default_account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_mentor_trade_access: {
        Args: { trade_id: string }
        Returns: boolean
      }
      has_playbook_access: {
        Args: {
          playbook_id: string
          required_permission?: Database["public"]["Enums"]["share_permission"]
        }
        Returns: boolean
      }
      has_trade_access: {
        Args: {
          trade_id: string
          required_permission?: Database["public"]["Enums"]["share_permission"]
        }
        Returns: boolean
      }
      is_mentor_of: {
        Args: { mentor_id: string; mentee_id: string }
        Returns: boolean
      }
      is_playbook_public: {
        Args: { playbook_id: string }
        Returns: boolean
      }
      is_trade_public: {
        Args: { trade_id: string }
        Returns: boolean
      }
    }
    Enums: {
      alert_severity: "info" | "warning" | "critical"
      alert_type: "mistake" | "success" | "drop" | "improvement"
      mentorship_status: "pending" | "accepted" | "rejected"
      share_permission: "view" | "note" | "edit"
      shared_item_type: "trade" | "playbook"
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
    Enums: {
      alert_severity: ["info", "warning", "critical"],
      alert_type: ["mistake", "success", "drop", "improvement"],
      mentorship_status: ["pending", "accepted", "rejected"],
      share_permission: ["view", "note", "edit"],
      shared_item_type: ["trade", "playbook"],
    },
  },
} as const
