import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pywievpwcedaareqkuxm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5d2lldnB3Y2VkYWFyZXFrdXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTA5MjMsImV4cCI6MjA2Nzg4NjkyM30.wHvcWCjkejn811z_ELF-9zvoR8_UjIYJd2e57A8QBIs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
