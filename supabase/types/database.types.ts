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
      chat_attachments: {
        Row: {
          chat_id: string
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          message_id: string
          metadata: Json
          updated_at: string | null
        }
        Insert: {
          chat_id: string
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          message_id: string
          metadata?: Json
          updated_at?: string | null
        }
        Update: {
          chat_id?: string
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          message_id?: string
          metadata?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_attachments_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_history"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_history: {
        Row: {
          assistant_content: string | null
          assistant_role: string | null
          chat_id: string
          chat_topic: string | null
          created_at: string | null
          custom_prompt: string | null
          domination_field: string
          id: string
          image_url: string | null
          message_pair_id: string
          metadata: Json | null
          model: string | null
          status: string | null
          updated_at: string | null
          user_content: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          assistant_content?: string | null
          assistant_role?: string | null
          chat_id: string
          chat_topic?: string | null
          created_at?: string | null
          custom_prompt?: string | null
          domination_field: string
          id?: string
          image_url?: string | null
          message_pair_id: string
          metadata?: Json | null
          model?: string | null
          status?: string | null
          updated_at?: string | null
          user_content?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          assistant_content?: string | null
          assistant_role?: string | null
          chat_id?: string
          chat_topic?: string | null
          created_at?: string | null
          custom_prompt?: string | null
          domination_field?: string
          id?: string
          image_url?: string | null
          message_pair_id?: string
          metadata?: Json | null
          model?: string | null
          status?: string | null
          updated_at?: string | null
          user_content?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_chat_id"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string | null
          custom_prompt: string | null
          domination_field: string
          id: string
          metadata: Json | null
          model: string | null
          name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_prompt?: string | null
          domination_field?: string
          id?: string
          metadata?: Json | null
          model?: string | null
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_prompt?: string | null
          domination_field?: string
          id?: string
          metadata?: Json | null
          model?: string | null
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          author: string | null
          content: string
          content_vector: string | null
          created_at: string | null
          document_id: string | null
          domination_field: string | null
          fts: unknown | null
          id: string
          metadata: Json | null
          source: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          author?: string | null
          content: string
          content_vector?: string | null
          created_at?: string | null
          document_id?: string | null
          domination_field?: string | null
          fts?: unknown | null
          id?: string
          metadata?: Json | null
          source?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          author?: string | null
          content?: string
          content_vector?: string | null
          created_at?: string | null
          document_id?: string | null
          domination_field?: string | null
          fts?: unknown | null
          id?: string
          metadata?: Json | null
          source?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          author: string | null
          content: string | null
          content_type: string
          created_at: string | null
          domination_field: string | null
          fts: unknown | null
          id: string
          metadata: Json | null
          relevance_score: number | null
          source: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          url: string | null
          view_count: number | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          content_type: string
          created_at?: string | null
          domination_field?: string | null
          fts?: unknown | null
          id?: string
          metadata?: Json | null
          relevance_score?: number | null
          source?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
          view_count?: number | null
        }
        Update: {
          author?: string | null
          content?: string | null
          content_type?: string
          created_at?: string | null
          domination_field?: string | null
          fts?: unknown | null
          id?: string
          metadata?: Json | null
          relevance_score?: number | null
          source?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      embedding_cache: {
        Row: {
          access_count: number | null
          created_at: string | null
          embedding: string
          id: string
          input_text: string
          last_accessed: string | null
        }
        Insert: {
          access_count?: number | null
          created_at?: string | null
          embedding: string
          id?: string
          input_text: string
          last_accessed?: string | null
        }
        Update: {
          access_count?: number | null
          created_at?: string | null
          embedding?: string
          id?: string
          input_text?: string
          last_accessed?: string | null
        }
        Relationships: []
      }
      files: {
        Row: {
          chat_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          name: string
          path: string
          size: number
          type: string
          user_id: string | null
        }
        Insert: {
          chat_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          path: string
          size: number
          type: string
          user_id?: string | null
        }
        Update: {
          chat_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          path?: string
          size?: number
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      model_settings: {
        Row: {
          created_at: string | null
          frequency_penalty: number | null
          id: string
          max_tokens: number | null
          model: string
          presence_penalty: number | null
          temperature: number | null
          top_p: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          frequency_penalty?: number | null
          id?: string
          max_tokens?: number | null
          model: string
          presence_penalty?: number | null
          temperature?: number | null
          top_p?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          frequency_penalty?: number | null
          id?: string
          max_tokens?: number | null
          model?: string
          presence_penalty?: number | null
          temperature?: number | null
          top_p?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_config: {
        Row: {
          created_at: string | null
          domain_field: string
          id: string
          min_similarity: number | null
          popularity_weight: number | null
          recency_weight: number | null
          similarity_weight: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain_field: string
          id?: string
          min_similarity?: number | null
          popularity_weight?: number | null
          recency_weight?: number | null
          similarity_weight?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain_field?: string
          id?: string
          min_similarity?: number | null
          popularity_weight?: number | null
          recency_weight?: number | null
          similarity_weight?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize:
        | {
            Args: {
              "": string
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      bytea_to_text: {
        Args: {
          data: string
        }
        Returns: string
      }
      cancel_message_pair: {
        Args: {
          p_message_pair_id: string
          p_reason?: string
        }
        Returns: {
          assistant_content: string | null
          assistant_role: string | null
          chat_id: string
          chat_topic: string | null
          created_at: string | null
          custom_prompt: string | null
          domination_field: string
          id: string
          image_url: string | null
          message_pair_id: string
          metadata: Json | null
          model: string | null
          status: string | null
          updated_at: string | null
          user_content: string | null
          user_id: string | null
          user_role: string | null
        }[]
      }
      cleanup_embedding_cache: {
        Args: {
          max_age_days?: number
          min_access_count?: number
        }
        Returns: number
      }
      complete_message_pair: {
        Args: {
          p_message_pair_id: string
          p_assistant_content: string
          p_metadata?: Json
        }
        Returns: {
          assistant_content: string | null
          assistant_role: string | null
          chat_id: string
          chat_topic: string | null
          created_at: string | null
          custom_prompt: string | null
          domination_field: string
          id: string
          image_url: string | null
          message_pair_id: string
          metadata: Json | null
          model: string | null
          status: string | null
          updated_at: string | null
          user_content: string | null
          user_id: string | null
          user_role: string | null
        }[]
      }
      create_chat: {
        Args: {
          p_user_id: string
          p_name: string
          p_model: string
          p_domination_field: string
          p_custom_prompt: string
        }
        Returns: Json
      }
      create_message_pair: {
        Args: {
          p_message_pair_id: string
          p_content: string
          p_model: string
          p_chat_id: string
          p_domination_field?: string
          p_custom_prompt?: string
          p_chat_topic?: string
        }
        Returns: {
          assistant_content: string | null
          assistant_role: string | null
          chat_id: string
          chat_topic: string | null
          created_at: string | null
          custom_prompt: string | null
          domination_field: string
          id: string
          image_url: string | null
          message_pair_id: string
          metadata: Json | null
          model: string | null
          status: string | null
          updated_at: string | null
          user_content: string | null
          user_id: string | null
          user_role: string | null
        }[]
      }
      get_cached_embedding: {
        Args: {
          input_text: string
        }
        Returns: string
      }
      get_chat_messages: {
        Args: {
          p_chat_id: string
        }
        Returns: {
          assistant_content: string | null
          assistant_role: string | null
          chat_id: string
          chat_topic: string | null
          created_at: string | null
          custom_prompt: string | null
          domination_field: string
          id: string
          image_url: string | null
          message_pair_id: string
          metadata: Json | null
          model: string | null
          status: string | null
          updated_at: string | null
          user_content: string | null
          user_id: string | null
          user_role: string | null
        }[]
      }
      get_embedding: {
        Args: {
          input_text: string
        }
        Returns: string
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_avg: {
        Args: {
          "": number[]
        }
        Returns: unknown
      }
      halfvec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      halfvec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      hnsw_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      http: {
        Args: {
          request: Database["public"]["CompositeTypes"]["http_request"]
        }
        Returns: unknown
      }
      http_delete:
        | {
            Args: {
              uri: string
            }
            Returns: unknown
          }
        | {
            Args: {
              uri: string
              content: string
              content_type: string
            }
            Returns: unknown
          }
      http_get:
        | {
            Args: {
              uri: string
            }
            Returns: unknown
          }
        | {
            Args: {
              uri: string
              data: Json
            }
            Returns: unknown
          }
      http_head: {
        Args: {
          uri: string
        }
        Returns: unknown
      }
      http_header: {
        Args: {
          field: string
          value: string
        }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: {
          uri: string
          content: string
          content_type: string
        }
        Returns: unknown
      }
      http_post:
        | {
            Args: {
              uri: string
              content: string
              content_type: string
            }
            Returns: unknown
          }
        | {
            Args: {
              uri: string
              data: Json
            }
            Returns: unknown
          }
      http_put: {
        Args: {
          uri: string
          content: string
          content_type: string
        }
        Returns: unknown
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: {
          curlopt: string
          value: string
        }
        Returns: boolean
      }
      hybrid_search: {
        Args: {
          query_text: string
          query_embedding: string
          match_count: number
          full_text_weight?: number
          semantic_weight?: number
          rrf_k?: number
          in_domination_field?: string
        }
        Returns: {
          author: string | null
          content: string | null
          content_type: string
          created_at: string | null
          domination_field: string | null
          fts: unknown | null
          id: string
          metadata: Json | null
          relevance_score: number | null
          source: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          url: string | null
          view_count: number | null
        }[]
      }
      index_document_chunk: {
        Args: {
          p_content: string
          p_document_id: string
          p_metadata?: Json
        }
        Returns: string
      }
      ivfflat_bit_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      l2_norm:
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      l2_normalize:
        | {
            Args: {
              "": string
            }
            Returns: string
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
        | {
            Args: {
              "": unknown
            }
            Returns: unknown
          }
      match_documents: {
        Args: {
          p_query: string
          p_domain_field?: string
          p_match_limit?: number
          p_min_similarity?: number
        }
        Returns: {
          content: string
          score: number
          source: Json
        }[]
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
      sparsevec_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      sparsevec_send: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
      text_to_bytea: {
        Args: {
          data: string
        }
        Returns: string
      }
      update_message_pair_status: {
        Args: {
          p_message_pair_id: string
          p_status: string
          p_error_message?: string
        }
        Returns: {
          assistant_content: string | null
          assistant_role: string | null
          chat_id: string
          chat_topic: string | null
          created_at: string | null
          custom_prompt: string | null
          domination_field: string
          id: string
          image_url: string | null
          message_pair_id: string
          metadata: Json | null
          model: string | null
          status: string | null
          updated_at: string | null
          user_content: string | null
          user_id: string | null
          user_role: string | null
        }[]
      }
      update_scoring_config: {
        Args: {
          p_domain_field: string
          p_similarity_weight?: number
          p_recency_weight?: number
          p_popularity_weight?: number
          p_min_similarity?: number
        }
        Returns: {
          created_at: string | null
          domain_field: string
          id: string
          min_similarity: number | null
          popularity_weight: number | null
          recency_weight: number | null
          similarity_weight: number | null
          updated_at: string | null
        }
      }
      urlencode:
        | {
            Args: {
              data: Json
            }
            Returns: string
          }
        | {
            Args: {
              string: string
            }
            Returns: string
          }
        | {
            Args: {
              string: string
            }
            Returns: string
          }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims:
        | {
            Args: {
              "": string
            }
            Returns: number
          }
        | {
            Args: {
              "": unknown
            }
            Returns: number
          }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
          owner_id: string | null
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
          owner_id?: string | null
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
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
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
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
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
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
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
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
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
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

