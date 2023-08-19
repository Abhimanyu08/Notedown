export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      note_search: {
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buckets_owner_fkey"
            columns: ["owner"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objects_owner_fkey"
            columns: ["owner"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
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

