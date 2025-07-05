// config.js
const SUPABASE_URL = 'https://pzswzyxixfkeowjgrlvw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6c3d6eXhpeGZrZW93amdybHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjE0MDcsImV4cCI6MjA2NzI5NzQwN30.i4JQPHdM9ostv9iWLk57NMGMQ7zaX5woZOIKCbQVtHM';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
