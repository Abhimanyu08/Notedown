export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bloggers: {
        Row: {
          about: string | null
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string | null
          notebook_title: string | null
          username: string | null
        }
        Insert: {
          about?: string | null
          avatar_url?: string | null
          created_at?: string | null
          id: string
          name?: string | null
          notebook_title?: string | null
          username?: string | null
        }
        Update: {
          about?: string | null
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string | null
          notebook_title?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bloggers_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      blogtag: {
        Row: {
          blog_id: number
          tag_id: number
        }
        Insert: {
          blog_id: number
          tag_id: number
        }
        Update: {
          blog_id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "blogtag_blog_id_fkey"
            columns: ["blog_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blogtag_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
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
          search_index_col: unknown | null
          slug: string | null
          timestamp: string | null
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
          slug?: string | null
          timestamp?: string | null
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
          slug?: string | null
          timestamp?: string | null
          title?: string
          upvote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "bloggers"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          created_by: string | null
          id: number
          tag_name: string | null
        }
        Insert: {
          created_by?: string | null
          id?: never
          tag_name?: string | null
        }
        Update: {
          created_by?: string | null
          id?: never
          tag_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tags_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "bloggers"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "upvotes_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upvotes_upvoter_fkey"
            columns: ["upvoter"]
            referencedRelation: "bloggers"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      private_search: {
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
      public_search: {
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
      search:
        | {
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
              timestamp: string
            }[]
          }
        | {
            Args: {
              user_id: string
              search_term: string
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
              timestamp: string
            }[]
          }
      search_upvotes: {
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

