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
      buyers: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          materials_of_interest: string[] | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          materials_of_interest?: string[] | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          materials_of_interest?: string[] | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          active: boolean
          address: string | null
          created_at: string
          id: string
          name: string
          order_in_route: number | null
          phone: string | null
          route_id: string | null
          type: Database["public"]["Enums"]["origin_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          created_at?: string
          id?: string
          name: string
          order_in_route?: number | null
          phone?: string | null
          route_id?: string | null
          type?: Database["public"]["Enums"]["origin_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          order_in_route?: number | null
          phone?: string | null
          route_id?: string | null
          type?: Database["public"]["Enums"]["origin_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_point_status: {
        Row: {
          client_id: string
          collected_at: string | null
          created_at: string
          id: string
          observation: string | null
          route_collection_id: string
          status: Database["public"]["Enums"]["collection_status"]
          updated_at: string
        }
        Insert: {
          client_id: string
          collected_at?: string | null
          created_at?: string
          id?: string
          observation?: string | null
          route_collection_id: string
          status?: Database["public"]["Enums"]["collection_status"]
          updated_at?: string
        }
        Update: {
          client_id?: string
          collected_at?: string | null
          created_at?: string
          id?: string
          observation?: string | null
          route_collection_id?: string
          status?: Database["public"]["Enums"]["collection_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_point_status_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_point_status_route_collection_id_fkey"
            columns: ["route_collection_id"]
            isOneToOne: false
            referencedRelation: "route_collections"
            referencedColumns: ["id"]
          },
        ]
      }
      entries: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          material_id: string
          observation: string | null
          origin_type: Database["public"]["Enums"]["origin_type"]
          route_id: string | null
          subclassification_id: string | null
          user_id: string
          weight: number
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          material_id: string
          observation?: string | null
          origin_type?: Database["public"]["Enums"]["origin_type"]
          route_id?: string | null
          subclassification_id?: string | null
          user_id: string
          weight: number
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          material_id?: string
          observation?: string | null
          origin_type?: Database["public"]["Enums"]["origin_type"]
          route_id?: string | null
          subclassification_id?: string | null
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_subclassification_id_fkey"
            columns: ["subclassification_id"]
            isOneToOne: false
            referencedRelation: "material_subclassifications"
            referencedColumns: ["id"]
          },
        ]
      }
      material_subclassifications: {
        Row: {
          active: boolean
          created_at: string
          id: string
          material_id: string
          name: string
          price_modifier: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          material_id: string
          name: string
          price_modifier?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          material_id?: string
          name?: string
          price_modifier?: number
        }
        Relationships: [
          {
            foreignKeyName: "material_subclassifications_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          active: boolean
          category: Database["public"]["Enums"]["material_category"]
          color: string
          created_at: string
          icon: string
          id: string
          name: string
          price_per_kg: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: Database["public"]["Enums"]["material_category"]
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name: string
          price_per_kg?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: Database["public"]["Enums"]["material_category"]
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
          price_per_kg?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      route_collections: {
        Row: {
          collection_date: string
          created_at: string
          finished_at: string | null
          id: string
          route_id: string
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          collection_date?: string
          created_at?: string
          finished_at?: string | null
          id?: string
          route_id: string
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          collection_date?: string
          created_at?: string
          finished_at?: string | null
          id?: string
          route_id?: string
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "route_collections_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          active: boolean
          created_at: string
          day_of_week: number
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          day_of_week: number
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          day_of_week?: number
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          material_id: string
          observation: string | null
          price_per_kg: number
          subclassification_id: string | null
          total_value: number
          user_id: string
          weight: number
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          material_id: string
          observation?: string | null
          price_per_kg: number
          subclassification_id?: string | null
          total_value: number
          user_id: string
          weight: number
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          material_id?: string
          observation?: string | null
          price_per_kg?: number
          subclassification_id?: string | null
          total_value?: number
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_subclassification_id_fkey"
            columns: ["subclassification_id"]
            isOneToOne: false
            referencedRelation: "material_subclassifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_authenticated_user: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role:
        | "administrador"
        | "motorista"
        | "operador_balanca"
        | "gestor_vendas"
      collection_status: "pendente" | "realizado" | "nao_coletado"
      material_category: "papel" | "plastico" | "metal" | "vidro"
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
      app_role: [
        "administrador",
        "motorista",
        "operador_balanca",
        "gestor_vendas",
      ],
      collection_status: ["pendente", "realizado", "nao_coletado"],
      material_category: ["papel", "plastico", "metal", "vidro"],
      origin_type: ["cliente", "catador_avulso"],
    },
  },
} as const
