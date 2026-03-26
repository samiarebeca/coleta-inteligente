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
      associations: {
        Row: {
          cnpj: string
          created_at: string | null
          id: string
          label: string | null
          logo: string | null
          name: string
          owner_email: string | null
        }
        Insert: {
          cnpj: string
          created_at?: string | null
          id?: string
          label?: string | null
          logo?: string | null
          name: string
          owner_email?: string | null
        }
        Update: {
          cnpj?: string
          created_at?: string | null
          id?: string
          label?: string | null
          logo?: string | null
          name?: string
          owner_email?: string | null
        }
        Relationships: []
      }
      buyer_materials: {
        Row: {
          active: boolean | null
          buyer_id: string
          created_at: string | null
          id: string
          material_name: string
          price: number | null
        }
        Insert: {
          active?: boolean | null
          buyer_id: string
          created_at?: string | null
          id?: string
          material_name: string
          price?: number | null
        }
        Update: {
          active?: boolean | null
          buyer_id?: string
          created_at?: string | null
          id?: string
          material_name?: string
          price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_materials_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      buyers: {
        Row: {
          active: boolean | null
          contact: string
          created_at: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          active?: boolean | null
          contact: string
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          active?: boolean | null
          contact?: string
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      entries: {
        Row: {
          association_id: string | null
          avulso_document: string | null
          avulso_name: string | null
          created_at: string | null
          id: string
          material_id: string | null
          material_name: string | null
          observation: string | null
          source_type: string
          subclass: string | null
          weight: number
        }
        Insert: {
          association_id?: string | null
          avulso_document?: string | null
          avulso_name?: string | null
          created_at?: string | null
          id?: string
          material_id?: string | null
          material_name?: string | null
          observation?: string | null
          source_type: string
          subclass?: string | null
          weight?: number
        }
        Update: {
          association_id?: string | null
          avulso_document?: string | null
          avulso_name?: string | null
          created_at?: string | null
          id?: string
          material_id?: string | null
          material_name?: string | null
          observation?: string | null
          source_type?: string
          subclass?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "entries_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          association_id: string
          created_at: string | null
          id: string
          material_name: string
          month: number
          target_weight: number
          year: number
        }
        Insert: {
          association_id: string
          created_at?: string | null
          id?: string
          material_name: string
          month: number
          target_weight: number
          year: number
        }
        Update: {
          association_id?: string
          created_at?: string | null
          id?: string
          material_name?: string
          month?: number
          target_weight?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "goals_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          association_id: string | null
          created_at: string | null
          id: string
          name: string
          price_per_kg: number | null
          subclass: string | null
          subclasses: string[] | null
        }
        Insert: {
          association_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          price_per_kg?: number | null
          subclass?: string | null
          subclasses?: string[] | null
        }
        Update: {
          association_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          price_per_kg?: number | null
          subclass?: string | null
          subclasses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          association_id: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string | null
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          association_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string | null
          name: string
          phone?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          association_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string | null
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          association_id: string | null
          buyer_id: string | null
          created_at: string | null
          id: string
          material: string
          price_per_kg: number
          subclass: string | null
          total_value: number
          weight: number
        }
        Insert: {
          association_id?: string | null
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          material: string
          price_per_kg: number
          subclass?: string | null
          total_value: number
          weight: number
        }
        Update: {
          association_id?: string | null
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          material?: string
          price_per_kg?: number
          subclass?: string | null
          total_value?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_association_id_fkey"
            columns: ["association_id"]
            isOneToOne: false
            referencedRelation: "associations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_authenticated_user: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "associate" | "driver"
      collection_status: "pendente" | "realizado" | "nao_coletado"
      material_category: "papel" | "plastico" | "metal" | "vidro" | "outro"
      origin_type: "cliente" | "catador_avulso"
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
      app_role: ["admin", "associate", "driver"],
      collection_status: ["pendente", "realizado", "nao_coletado"],
      material_category: ["papel", "plastico", "metal", "vidro", "outro"],
      origin_type: ["cliente", "catador_avulso"],
    },
  },
} as const
