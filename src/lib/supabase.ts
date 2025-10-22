import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Create a mock client if credentials are not provided (for development without Supabase)
const hasValidCredentials =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== "your_supabase_project_url_here" &&
  supabaseAnonKey !== "your_supabase_anon_key_here";

export const supabase = hasValidCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient("https://placeholder.supabase.co", "placeholder-key");

export const isSupabaseConfigured = hasValidCredentials;
