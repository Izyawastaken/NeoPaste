const SUPABASE_URL = window.SUPABASE_PROJECT_LINK;
const SUPABASE_KEY = window.SUPABASE_ANON_KEY;

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
