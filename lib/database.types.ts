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
      products: {
        Row: {
          id: string
          name: string
          price: number
          image_urls: string[]
          category_id: string | null
          brand_id: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          image_urls: string[]
          category_id?: string | null
          brand_id?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          image_urls?: string[]
          category_id?: string | null
          brand_id?: string | null
          description?: string | null
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          contact_phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contact_phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          contact_phone?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      variables: {
        Row: {
          id: string
          product_id: string
          name: string
          value: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          value: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          value?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 