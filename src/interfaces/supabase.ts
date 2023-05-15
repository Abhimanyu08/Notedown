export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bloggers: {
        Row: {
          about: string | null
          avatar_url: string | null
          created_at: string | null
          github: string | null
          id: string
          name: string | null
          twitter: string | null
          web: string | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          created_at?: string | null
          github?: string | null
          id: string
          name?: string | null
          twitter?: string | null
          web?: string | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          created_at?: string | null
          github?: string | null
          id?: string
          name?: string | null
          twitter?: string | null
          web?: string | null
        }
      }
      posts: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          filename: string | null
          id: number
          image_folder: string | null
          language: string | null
          published: boolean
          published_on: string | null
          title: string
          upvote_count: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filename?: string | null
          id?: number
          image_folder?: string | null
          language?: string | null
          published?: boolean
          published_on?: string | null
          search_index_col?: unknown | null
          title: string
          upvote_count?: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filename?: string | null
          id?: number
          image_folder?: string | null
          language?: string | null
          published?: boolean
          published_on?: string | null
          search_index_col?: unknown | null
          title?: string
          upvote_count?: number
        }
      }
      upvotes: {
        Row: {
          created_at: string | null
          id: number
          post_id: number
          upvoter: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          post_id: number
          upvoter: string
        }
        Update: {
          created_at?: string | null
          id?: number
          post_id?: number
          upvoter?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ranked_search_private: {
        Args: {
          user_id: string
          search_term: string
          cursor: number
        }
        Returns: {
          id: number
          created_by: string
          title: string
          description: string
          published: boolean
          created_at: string
          published_on: string
          language: string
          upvote_count: number
          author: string
          search_rank: number
        }[]
      }
      ranked_search_public: {
        Args: {
          search_term: string
          cursor: number
        }
        Returns: {
          id: number
          created_by: string
          title: string
          description: string
          published: boolean
          created_at: string
          published_on: string
          language: string
          upvote_count: number
          author: string
          search_rank: number
        }[]
      }
      search_upvotes_of_user: {
        Args: {
          user_id: string
          search_term: string
          cursor: number
        }
        Returns: {
          id: number
          created_by: string
          title: string
          description: string
          published: boolean
          published_on: string
          language: string
          upvote_count: number
          author: string
          search_rank: number
        }[]
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
