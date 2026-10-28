import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://syffviwyigelnrcwrcdh.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5ZmZ2aXd5aWdlbG5yY3dyY2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxOTUyMzIsImV4cCI6MjEwODc3MTIzMn0.GOVFIyU1PtgZC-XqLpWLon1MulGbmT1PBQCNOfLnIRM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
