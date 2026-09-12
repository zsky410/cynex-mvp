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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      app_admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string
          icon_key: string
          id: string
          image_public_id: string | null
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon_key: string
          id?: string
          image_public_id?: string | null
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon_key?: string
          id?: string
          image_public_id?: string | null
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      homepage_category_sections: {
        Row: {
          category_id: string
          created_at: string
          position: number
        }
        Insert: {
          category_id: string
          created_at?: string
          position: number
        }
        Update: {
          category_id?: string
          created_at?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "homepage_category_sections_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: true
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_featured_products: {
        Row: {
          created_at: string
          position: number
          product_id: string
        }
        Insert: {
          created_at?: string
          position: number
          product_id: string
        }
        Update: {
          created_at?: string
          position?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "homepage_featured_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          badge: string | null
          compare_at_price_vnd: number | null
          created_at: string
          duration_label: string
          id: string
          is_active: boolean
          is_in_stock: boolean
          name: string
          package_id: string
          price_vnd: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          badge?: string | null
          compare_at_price_vnd?: number | null
          created_at?: string
          duration_label: string
          id?: string
          is_active?: boolean
          is_in_stock?: boolean
          name: string
          package_id: string
          price_vnd: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          badge?: string | null
          compare_at_price_vnd?: number | null
          created_at?: string
          duration_label?: string
          id?: string
          is_active?: boolean
          is_in_stock?: boolean
          name?: string
          package_id?: string
          price_vnd?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          badge: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          product_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          product_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          product_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          alt_text: string
          asset_id: string
          created_at: string
          format: string
          height: number
          id: string
          product_id: string
          public_id: string
          role: Database["public"]["Enums"]["media_role"]
          secure_url: string
          sort_order: number
          updated_at: string
          width: number
        }
        Insert: {
          alt_text: string
          asset_id: string
          created_at?: string
          format: string
          height: number
          id?: string
          product_id: string
          public_id: string
          role: Database["public"]["Enums"]["media_role"]
          secure_url: string
          sort_order?: number
          updated_at?: string
          width: number
        }
        Update: {
          alt_text?: string
          asset_id?: string
          created_at?: string
          format?: string
          height?: number
          id?: string
          product_id?: string
          public_id?: string
          role?: Database["public"]["Enums"]["media_role"]
          secure_url?: string
          sort_order?: number
          updated_at?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          category_id: string
          created_at: string
          description_doc: Json
          id: string
          name: string
          published_at: string | null
          seo_description: string
          seo_title: string
          short_description: string
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          tags: string[]
          updated_at: string
        }
        Insert: {
          badge?: string | null
          category_id: string
          created_at?: string
          description_doc?: Json
          id?: string
          name: string
          published_at?: string | null
          seo_description?: string
          seo_title?: string
          short_description: string
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          tags?: string[]
          updated_at?: string
        }
        Update: {
          badge?: string | null
          category_id?: string
          created_at?: string
          description_doc?: Json
          id?: string
          name?: string
          published_at?: string | null
          seo_description?: string
          seo_title?: string
          short_description?: string
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          facebook_enabled: boolean
          facebook_url: string | null
          singleton: boolean
          updated_at: string
          zalo_enabled: boolean
          zalo_url: string | null
        }
        Insert: {
          created_at?: string
          facebook_enabled?: boolean
          facebook_url?: string | null
          singleton?: boolean
          updated_at?: string
          zalo_enabled?: boolean
          zalo_url?: string | null
        }
        Update: {
          created_at?: string
          facebook_enabled?: boolean
          facebook_url?: string | null
          singleton?: boolean
          updated_at?: string
          zalo_enabled?: boolean
          zalo_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      catalog_search: {
        Args: {
          category_slug?: string
          page_number?: number
          page_size?: number
          search_query?: string
          sort_by?: string
          stock_filter?: boolean
        }
        Returns: {
          badge: string
          category: string
          id: string
          in_stock: boolean
          min_price: number
          name: string
          published_at: string
          short_description: string
          slug: string
          tags: string[]
          total_count: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      is_product_public: {
        Args: { target_product_id: string }
        Returns: boolean
      }
    }
    Enums: {
      media_role: "thumbnail" | "cover" | "gallery"
      product_status: "draft" | "published" | "archived"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      media_role: ["thumbnail", "cover", "gallery"],
      product_status: ["draft", "published", "archived"],
    },
  },
} as const
