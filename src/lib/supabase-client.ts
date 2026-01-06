import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client (browser/client-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          created_by: string;
          created_at?: string;
          deleted_at?: string | null;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          project_id: string | null;
          requester: string | null;
          pic: string | null;
          status: 'To Do' | 'In Progress' | 'Review' | 'Done' | 'Cancelled';
          type: 'Working' | 'Learning' | 'Other';
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          project_id?: string | null;
          requester?: string | null;
          pic?: string | null;
          status?: 'To Do' | 'In Progress' | 'Review' | 'Done' | 'Cancelled';
          type?: 'Working' | 'Learning' | 'Other';
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
    };
  };
};
