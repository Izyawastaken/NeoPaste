// config.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pywievpwcedaareqkuxm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5d2lldnB3Y2VkYWFyZXFrdXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMTA5MjMsImV4cCI6MjA2Nzg4NjkyM30.wHvcWCjkejn811z_ELF-9zvoR8_UjIYJd2e57A8QBIs';

export const supabaseClient: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
