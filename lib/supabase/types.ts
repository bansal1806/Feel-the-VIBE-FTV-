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
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          email_verified: string | null
          alias: string
          name: string | null
          avatar_url: string | null
          bio: string | null
          major: string | null
          year: string | null
          interests: string[]
          skill_creds: number
          onboarding_at: string | null
          profile_completed_at: string | null
          dual_identity_mode: boolean
          discoverable: boolean
          recruiter_opt_in: boolean
          share_analytics: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          email_verified?: string | null
          alias: string
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          major?: string | null
          year?: string | null
          interests?: string[]
          skill_creds?: number
          onboarding_at?: string | null
          profile_completed_at?: string | null
          dual_identity_mode?: boolean
          discoverable?: boolean
          recruiter_opt_in?: boolean
          share_analytics?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          email_verified?: string | null
          alias?: string
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          major?: string | null
          year?: string | null
          interests?: string[]
          skill_creds?: number
          onboarding_at?: string | null
          profile_completed_at?: string | null
          dual_identity_mode?: boolean
          discoverable?: boolean
          recruiter_opt_in?: boolean
          share_analytics?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          id: string
          name: string
          description: string | null
          location: string
          latitude: number
          longitude: number
          type: 'STUDY' | 'EVENT' | 'SOCIAL'
          active: boolean
          expires_at: string
          creator_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          location: string
          latitude: number
          longitude: number
          type: 'STUDY' | 'EVENT' | 'SOCIAL'
          active?: boolean
          expires_at: string
          creator_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          location?: string
          latitude?: number
          longitude?: number
          type?: 'STUDY' | 'EVENT' | 'SOCIAL'
          active?: boolean
          expires_at?: string
          creator_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'rooms_creator_id_fkey'
            columns: ['creator_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      room_members: {
        Row: {
          id: string
          room_id: string
          user_id: string
          joined_at: string
          left_at: string | null
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          joined_at?: string
          left_at?: string | null
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          joined_at?: string
          left_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'room_members_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'rooms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'room_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      room_messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          content: string
          media_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          content: string
          media_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          sender_id?: string
          content?: string
          media_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'room_messages_room_id_fkey'
            columns: ['room_id']
            isOneToOne: false
            referencedRelation: 'rooms'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'room_messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      conversations: {
        Row: {
          id: string
          type: 'DIRECT' | 'ROOM'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'DIRECT' | 'ROOM'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'DIRECT' | 'ROOM'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'conversation_participants_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'conversation_participants_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          media_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          media_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          media_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      timecapsules: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          media_url: string | null
          unlock_at: string
          audience: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          media_url?: string | null
          unlock_at: string
          audience: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          media_url?: string | null
          unlock_at?: string
          audience?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'timecapsules_creator_id_fkey'
            columns: ['creator_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

