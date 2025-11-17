import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://azywaclcehoycbqpqpzp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6eXdhY2xjZWhveWNicXBxcHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDIzNDQsImV4cCI6MjA3ODY3ODM0NH0.OzwWXKwVNWbyWdc6A4CwD4JZJ-FHNgPmLRMiAd2wlAQ";

export const supabase = createClient(supabaseUrl, supabaseKey);
