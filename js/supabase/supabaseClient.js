import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://hvpiiivizknbmxfhlbjo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cGlpaXZpemtuYm14ZmhsYmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3ODI2OTAsImV4cCI6MjA4ODM1ODY5MH0.jAw-_DnhAKyRQNAnISJzG3lT3MnYBxE6U-80jVf1QfE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
